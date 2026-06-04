// services/tokenService.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT containing shopId and phone.
 * Valid for 90 days — shopkeeper stays logged in.
 */
const generateToken = (shop) => {
  return jwt.sign(
    { shopId: shop._id, phone: shop.phone },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
  );
};

/**
 * Verify JWT — throws if invalid or expired.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };