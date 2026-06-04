// src/services/shopService.js
// Manages shop identity — the unique ID that ties all data to one shop.
// shopId is generated once on first launch and never changes.
// It's stored in both AsyncStorage (fast access) and SQLite (backup).

import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { getDatabase } from '../database/db';

const SHOP_ID_KEY   = '@dokanmate_shop_id';
const SHOP_DATA_KEY = '@dokanmate_shop_data';

/**
 * Get the current shopId.
 * Returns null if the shop hasn't been registered yet.
 */
export const getShopId = async () => {
  try {
    return await AsyncStorage.getItem(SHOP_ID_KEY);
  } catch {
    return null;
  }
};

/**
 * Get full shop data (name, phone, address).
 */
export const getShopData = async () => {
  try {
    const raw = await AsyncStorage.getItem(SHOP_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Register a new shop on first launch.
 * Generates a UUID, saves to AsyncStorage + SQLite.
 *
 * @param {string} name    - Shop name (required)
 * @param {string} phone   - Owner phone (optional)
 * @param {string} address - Shop address (optional)
 * @param {string} pin     - 4-digit PIN for future auth (optional)
 */
export const registerShop = async ({ name, phone, address, pin }) => {
  const db      = await getDatabase();
  const shopId  = uuid.v4();
  const now     = new Date().toISOString();

  // Save to SQLite
  await db.runAsync(
    `INSERT INTO shop (id, name, phone, address, pin, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      shopId,
      name.trim(),
      phone?.trim()   ?? null,
      address?.trim() ?? null,
      pin             ?? null,
      now,
      now,
    ]
  );

  const shopData = { id: shopId, name: name.trim(), phone, address, pin, createdAt: now };

  // Save to AsyncStorage for quick access without DB query
  await AsyncStorage.setItem(SHOP_ID_KEY,   shopId);
  await AsyncStorage.setItem(SHOP_DATA_KEY, JSON.stringify(shopData));

  return shopData;
};

/**
 * Update shop details.
 */
export const updateShop = async (shopId, { name, phone, address }) => {
  const db  = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE shop SET name = ?, phone = ?, address = ?, updatedAt = ?
     WHERE id = ?`,
    [name.trim(), phone?.trim() ?? null, address?.trim() ?? null, now, shopId]
  );

  const current  = await getShopData();
  const updated  = { ...current, name: name.trim(), phone, address };
  await AsyncStorage.setItem(SHOP_DATA_KEY, JSON.stringify(updated));
};

/**
 * Check if PIN matches (for future lock screen).
 */
export const verifyPin = async (enteredPin) => {
  const shop = await getShopData();
  if (!shop?.pin) return true; // No PIN set — always pass
  return shop.pin === enteredPin;
};

/**
 * Clear all shop data — used for reset/logout.
 * Also clears AsyncStorage keys.
 */
export const clearShopData = async () => {
  await AsyncStorage.multiRemove([SHOP_ID_KEY, SHOP_DATA_KEY]);
};