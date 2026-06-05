// src/database/db.js
// expo-sqlite v12+ uses an async API.
// We open the DB once and cache the promise so every caller
// awaits the same connection — never opens twice.

import * as SQLite from 'expo-sqlite';

let dbPromise = null;

/**
 * Returns a promise that resolves to the open database.
 * Call this at the top of any function that needs the DB.
 *
 * Usage:
 *   const db = await getDatabase();
 *   await db.runAsync('INSERT INTO ...');
 */
export const getDatabase = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('dokanmate.db');
  }
  return dbPromise;
};

/**
 * Clear all table data while keeping the SQLite schema intact.
 * This is useful for a full app reset without dropping tables.
 */
export const clearDatabaseData = async () => {
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync(`
      DELETE FROM sale_items;
      DELETE FROM transactions;
      DELETE FROM expenses;
      DELETE FROM customers;
      DELETE FROM sales;
      DELETE FROM products;
      DELETE FROM shop;
      DELETE FROM sync_queue;
      DELETE FROM sqlite_sequence WHERE name = 'sync_queue';
    `);
  });

  console.log('SQLite data cleared, schema preserved ✓');
};