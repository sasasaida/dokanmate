// src/database/queries/sales.js
// All SQLite operations for sales and sale_items tables.
// A sale has one header row (sales) and N item rows (sale_items).

import { getDatabase } from '../db';
import { requireShopId, getActiveShopId } from '../shopScope';
import uuid from 'react-native-uuid';
import { deductStock } from './products';
import { enqueue } from './syncQueue';  // ADDED: queue for background sync

// ---------- CREATE ----------

/**
 * Save a completed sale with all its items.
 * Also deducts stock for every product in the cart.
 * This is the most critical write operation in the app.
 */
export const createSale = async ({ cartItems, paymentMethod, customerId, note }) => {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const saleId = uuid.v4();
  const saleItems = [];
  const shopId = await requireShopId();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Save the sale header
  await db.runAsync(
    `INSERT INTO sales
      (id, shopId, customerId, totalAmount, paymentMethod, note, createdAt, updatedAt, isSynced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      saleId,
      shopId,
      customerId ?? null,
      totalAmount,
      paymentMethod,
      note ?? null,
      now,
      now,
    ]
  );

  // Save each item and deduct stock
  for (const item of cartItems) {
    const itemId = uuid.v4();
    saleItems.push({
      _id: itemId,
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      createdAt: now,
      shopId,
    });

    await db.runAsync(
      `INSERT INTO sale_items
        (id, saleId, shopId, productId, productName, quantity, unitPrice, totalPrice, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itemId,
        saleId,
        shopId,
        item.id,
        item.name,
        item.quantity,
        item.price,
        item.price * item.quantity,
        now,
      ]
    );

    // Deduct stock immediately after each item is saved
    await deductStock(item.id, item.quantity);
  }

  // Queue the sale header
  enqueue('sales', saleId, 'INSERT', {
    id: saleId,
    shopId,
    customerId,
    totalAmount,
    paymentMethod,
    note,
    createdAt: now,
    updatedAt: now,
    items: saleItems,
  }).catch(() => {});

  return { saleId, totalAmount };
};

// ---------- READ ----------

/**
 * Get all sales, most recent first.
 * Used on the dashboard and future sales history screen.
 */
export const getAllSales = async () => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return [];
  return await db.getAllAsync(
    `SELECT * FROM sales WHERE shopId = ? ORDER BY createdAt DESC`,
    [shopId]
  );
};

/**
 * Get sales created today only.
 */
export const getTodaySales = async () => {
  const db = await getDatabase();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const shopId = await getActiveShopId();
  if (!shopId) return [];

  return await db.getAllAsync(
    `SELECT * FROM sales
     WHERE shopId = ? AND createdAt >= ?
     ORDER BY createdAt DESC`,
    [shopId, todayStart.toISOString()]
  );
};

/**
 * Get all items for a specific sale.
 * Used to show sale details.
 */
export const getSaleItems = async (saleId) => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return [];
  return await db.getAllAsync(
    `SELECT * FROM sale_items WHERE saleId = ? AND shopId = ?`,
    [saleId, shopId]
  );
};

/**
 * Get total revenue for today.
 */
export const getTodayRevenue = async () => {
  const db = await getDatabase();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const shopId = await getActiveShopId();
  if (!shopId) return 0;

  const result = await db.getFirstAsync(
    `SELECT COALESCE(SUM(totalAmount), 0) as total
     FROM sales
     WHERE shopId = ? AND createdAt >= ?`,
    [shopId, todayStart.toISOString()]
  );
  return result?.total ?? 0;
};