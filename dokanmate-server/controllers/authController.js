// controllers/authController.js
// Two endpoints: register and recover.
// PIN is always hashed with bcrypt before storage.

const bcrypt               = require('bcryptjs');
const Shop                 = require('../models/Shop');
const { generateToken }    = require('../services/tokenService');

// ── Register ───────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { shopId, phone, shopName, address, pin }
 *
 * Called once when the shop first registers.
 * Creates shop on backend, returns JWT.
 */
exports.register = async (req, res) => {
  try {
    const { shopId, phone, shopName, address, pin } = req.body;

    // Validate required fields
    if (!shopId || !phone || !shopName || !pin) {
      return res.status(400).json({
        success: false,
        error: 'shopId, phone, shopName, and PIN are required',
      });
    }

    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be exactly 4 digits',
      });
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);

    // Check if phone already registered
    const existing = await Shop.findOne({ phone: normalizedPhone });
    if (existing) {
      return res.status(409).json({
        success: false,
        error:  'Phone already registered. Use recovery to restore your data.',
        code:   'PHONE_EXISTS',
      });
    }

    // Hash PIN with bcrypt — cost factor 10 is secure and fast
    const pinHash = await bcrypt.hash(pin, 10);

    // Create shop
    const shop = await Shop.findByIdAndUpdate(
      shopId,
      {
        _id:      shopId,
        phone:    normalizedPhone,
        name:     shopName.trim(),
        address:  address?.trim() ?? null,
        pinHash,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Issue JWT
    const token = generateToken(shop);

    res.status(201).json({
      success: true,
      token,
      shop: {
        id:      shop._id,
        name:    shop.name,
        phone:   shop.phone,
        address: shop.address,
      },
    });

  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed.' });
  }
};

// ── Recover ────────────────────────────────────────────────

/**
 * POST /api/auth/recover
 * Body: { phone, pin }
 *
 * Called when user reinstalls or gets a new phone.
 * Verifies phone + PIN, returns JWT + shopId.
 * Device uses shopId to re-tag local data correctly.
 */
exports.recover = async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Phone and PIN are required',
      });
    }

    const normalizedPhone = normalizePhone(phone);

    // Find shop by phone
    const shop = await Shop.findOne({ phone: normalizedPhone });

    if (!shop) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this phone number.',
      });
    }

    if (!shop.isActive) {
      return res.status(403).json({
        success: false,
        error: 'This account has been deactivated.',
      });
    }

    // Verify PIN against stored hash
    const pinMatch = await bcrypt.compare(pin, shop.pinHash);

    if (!pinMatch) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect PIN. Please try again.',
      });
    }

    // Issue fresh JWT
    const token = generateToken(shop);

    res.json({
      success: true,
      token,
      shop: {
        id:      shop._id,  // ← critical: device uses this to restore shopId
        name:    shop.name,
        phone:   shop.phone,
        address: shop.address,
      },
    });

  } catch (err) {
    console.error('[Auth] Recover error:', err);
    res.status(500).json({ success: false, error: 'Recovery failed.' });
  }
};

// ── Change PIN ─────────────────────────────────────────────

/**
 * POST /api/auth/change-pin
 * Body: { phone, currentPin, newPin }
 * Header: Authorization: Bearer <token>
 *
 * Allows shopkeeper to update their PIN.
 */
exports.changePin = async (req, res) => {
  try {
    const { phone, currentPin, newPin } = req.body;

    if (!phone || !currentPin || !newPin) {
      return res.status(400).json({
        success: false,
        error: 'phone, currentPin, and newPin are required',
      });
    }

    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        error: 'New PIN must be exactly 4 digits',
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const shop = await Shop.findOne({ phone: normalizedPhone });

    if (!shop) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }

    const pinMatch = await bcrypt.compare(currentPin, shop.pinHash);
    if (!pinMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current PIN is incorrect',
      });
    }

    shop.pinHash = await bcrypt.hash(newPin, 10);
    await shop.save();

    res.json({ success: true, message: 'PIN updated successfully' });

  } catch (err) {
    console.error('[Auth] Change PIN error:', err);
    res.status(500).json({ success: false, error: 'Failed to update PIN' });
  }
};

// ── Helper ─────────────────────────────────────────────────

const normalizePhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+'))   return cleaned;
  if (cleaned.startsWith('880')) return `+${cleaned}`;
  if (cleaned.startsWith('0'))   return `+880${cleaned.slice(1)}`;
  return `+880${cleaned}`;
};