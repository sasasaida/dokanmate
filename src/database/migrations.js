// src/database/migrations.js
// All table creation is now async/await with the new expo-sqlite API.
// execAsync runs multiple SQL statements separated by semicolons.

import { getDatabase } from './db';
import { getActiveShopId } from './shopScope';

let migrationsPromise = null;

const ensureColumn = async (db, tableName, columnName, columnDefinition) => {
  const columns = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`);
  }
};

export const runMigrations = async () => {
  if (!migrationsPromise) {
    migrationsPromise = (async () => {
      const db = await getDatabase();

      await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS shop (
          id          TEXT PRIMARY KEY,
          name        TEXT NOT NULL,
          phone       TEXT,
          address     TEXT,
          pin         TEXT,
          createdAt   TEXT NOT NULL,
          updatedAt   TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          shopId TEXT NOT NULL,
          name TEXT NOT NULL,
          price REAL NOT NULL DEFAULT 0,
          stock INTEGER NOT NULL DEFAULT 0,
          category TEXT,
          expiryDate TEXT,
          isDeleted INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          isSynced INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS sales (
          id TEXT PRIMARY KEY,
          shopId TEXT NOT NULL,
          customerId TEXT,
          totalAmount REAL NOT NULL DEFAULT 0,
          paymentMethod TEXT NOT NULL DEFAULT 'cash',
          note TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          isSynced INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS sale_items (
          id TEXT PRIMARY KEY,
          saleId TEXT NOT NULL,
          shopId TEXT NOT NULL,
          productId TEXT NOT NULL,
          productName TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          unitPrice REAL NOT NULL DEFAULT 0,
          totalPrice REAL NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          shopId TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          totalDue REAL NOT NULL DEFAULT 0,
          note TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          isSynced INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          shopId TEXT NOT NULL,
          customerId TEXT NOT NULL,
          saleId TEXT,
          type TEXT NOT NULL,
          amount REAL NOT NULL DEFAULT 0,
          note TEXT,
          isReversed INTEGER NOT NULL DEFAULT 0,
          reversedById TEXT,
          createdAt TEXT NOT NULL,
          isSynced INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY,
          shopId TEXT NOT NULL,
          category TEXT NOT NULL,
          amount REAL NOT NULL DEFAULT 0,
          note TEXT,
          date TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          isSynced INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          shopId TEXT NOT NULL,
          tableName TEXT NOT NULL,
          recordId TEXT NOT NULL,
          operation TEXT NOT NULL,
          payload TEXT NOT NULL,
          retryCount INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL
        );
      `);

      await ensureColumn(db, 'products', 'shopId', 'TEXT');
      await ensureColumn(db, 'sales', 'shopId', 'TEXT');
      await ensureColumn(db, 'sale_items', 'shopId', 'TEXT');
      await ensureColumn(db, 'customers', 'shopId', 'TEXT');
      await ensureColumn(db, 'transactions', 'shopId', 'TEXT');
      await ensureColumn(db, 'transactions', 'saleId', 'TEXT');
      await ensureColumn(db, 'expenses', 'shopId', 'TEXT');
      await ensureColumn(db, 'sync_queue', 'shopId', 'TEXT');

      const activeShopId = await getActiveShopId();
      if (activeShopId) {
        await db.execAsync(`
          UPDATE products SET shopId = '${activeShopId}' WHERE shopId IS NULL OR shopId = '';
          UPDATE sales SET shopId = '${activeShopId}' WHERE shopId IS NULL OR shopId = '';
          UPDATE sale_items SET shopId = '${activeShopId}' WHERE shopId IS NULL OR shopId = '';
          UPDATE customers SET shopId = '${activeShopId}' WHERE shopId IS NULL OR shopId = '';
          UPDATE transactions SET shopId = '${activeShopId}' WHERE shopId IS NULL OR shopId = '';
          UPDATE expenses SET shopId = '${activeShopId}' WHERE shopId IS NULL OR shopId = '';
          UPDATE sync_queue SET shopId = '${activeShopId}' WHERE shopId IS NULL OR shopId = '';
        `);
      }

      console.log('Database ready ✓');
    })();
  }

  return migrationsPromise;
};