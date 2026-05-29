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