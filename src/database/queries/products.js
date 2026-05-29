// src/database/queries/products.js
// All SQLite operations for the products table live here.
// No business logic — just clean data access functions.
// Every function is async and returns plain JS objects.

import { getDatabase } from '../db';
import uuid from 'react-native-uuid';
import { enqueue } from './syncQueue';  // ADDED: queue for background sync

// ---------- CREATE ----------

/**
 * Insert a new product into the local database.
 * Generates a UUID locally — no server needed.
 */
export const createProduct = async (productData) => {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = uuid.v4();

  await db.runAsync(
    `INSERT INTO products
      (id, name, price, stock, category, expiryDate, isDeleted, createdAt, updatedAt, isSynced)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 0)`,
    [
      id,
      productData.name.trim(),
      productData.price,
      productData.stock ?? 0,
      productData.category ?? null,
      productData.expiryDate ?? null,
      now,
      now,
    ]
  );

  const newProduct = { 
    id, 
    ...productData, 
    isDeleted: 0, 
    createdAt: now, 
    updatedAt: now, 
    isSynced: 0 
  };

  // Queue for background sync — non-blocking
  enqueue('products', id, 'INSERT', newProduct).catch(() => {});

  // Return the full product so the UI can update immediately
  return newProduct;
};

// ---------- READ ----------

/**
 * Get all active (non-deleted) products.
 * Sorted by name for easy scanning.
 */
export const getAllProducts = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM products
     WHERE isDeleted = 0
     ORDER BY name ASC`
  );
};

/**
 * Search products by name (partial match).
 * This powers the search bar on the inventory and sales screens.
 */
export const searchProducts = async (query) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM products
     WHERE isDeleted = 0
       AND name LIKE ?
     ORDER BY name ASC`,
    [`%${query}%`]
  );
};

/**
 * Get a single product by ID.
 */
export const getProductById = async (id) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    `SELECT * FROM products WHERE id = ?`,
    [id]
  );
};

/**
 * Get products with stock <= threshold.
 * Used for low stock alerts on the dashboard.
 */
export const getLowStockProducts = async (threshold = 5) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM products
     WHERE isDeleted = 0
       AND stock <= ?
     ORDER BY stock ASC`,
    [threshold]
  );
};

// ---------- UPDATE ----------

/**
 * Update an existing product.
 * Always sets updatedAt and clears isSynced so it gets re-synced.
 */
export const updateProduct = async (id, productData) => {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE products SET
       name       = ?,
       price      = ?,
       stock      = ?,
       category   = ?,
       expiryDate = ?,
       updatedAt  = ?,
       isSynced   = 0
     WHERE id = ?`,
    [
      productData.name.trim(),
      productData.price,
      productData.stock,
      productData.category ?? null,
      productData.expiryDate ?? null,
      now,
      id,
    ]
  );

  // Queue for background sync — non-blocking
  enqueue('products', id, 'UPDATE', { id, ...productData, updatedAt: now })
    .catch(() => {});
};

/**
 * Deduct stock after a sale.
 * Called automatically when a sale is confirmed — never manually.
 */
export const deductStock = async (productId, quantity) => {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE products SET
       stock     = MAX(0, stock - ?),
       updatedAt = ?,
       isSynced  = 0
     WHERE id = ?`,
    [quantity, now, productId]
  );
  
  // Queue stock deduction for sync
  enqueue('products', productId, 'UPDATE', { 
    id: productId, 
    stockDeduction: quantity, 
    updatedAt: now 
  }).catch(() => {});
};

// ---------- DELETE ----------

/**
 * Soft delete — sets isDeleted = 1 instead of removing the row.
 * This preserves historical sales data that reference this product.
 */
export const deleteProduct = async (id) => {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE products SET
       isDeleted = 1,
       updatedAt = ?,
       isSynced  = 0
     WHERE id = ?`,
    [now, id]
  );

  // Queue for background sync — non-blocking
  enqueue('products', id, 'DELETE', { id, deletedAt: now }).catch(() => {});
};