// src/services/restoreService.js
// Restores shop data from backend backup when the local shop has no records.

import { getDatabase } from '../database/db';
import { getActiveShopId } from '../database/shopScope';

const toBooleanInt = (value) => (value ? 1 : 0);

export const getLocalDataCounts = async () => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) {
    return {
      products: 0,
      customers: 0,
      sales: 0,
      saleItems: 0,
      transactions: 0,
      expenses: 0,
    };
  }

  const [products, customers, sales, saleItems, transactions, expenses] = await Promise.all([
    db.getFirstAsync(`SELECT COUNT(*) AS count FROM products WHERE shopId = ?`, [shopId]),
    db.getFirstAsync(`SELECT COUNT(*) AS count FROM customers WHERE shopId = ?`, [shopId]),
    db.getFirstAsync(`SELECT COUNT(*) AS count FROM sales WHERE shopId = ?`, [shopId]),
    db.getFirstAsync(`SELECT COUNT(*) AS count FROM sale_items WHERE shopId = ?`, [shopId]),
    db.getFirstAsync(`SELECT COUNT(*) AS count FROM transactions WHERE shopId = ?`, [shopId]),
    db.getFirstAsync(`SELECT COUNT(*) AS count FROM expenses WHERE shopId = ?`, [shopId]),
  ]);

  return {
    products: products?.count ?? 0,
    customers: customers?.count ?? 0,
    sales: sales?.count ?? 0,
    saleItems: saleItems?.count ?? 0,
    transactions: transactions?.count ?? 0,
    expenses: expenses?.count ?? 0,
  };
};

const getTotalCount = (counts) =>
  Object.values(counts).reduce((sum, value) => sum + value, 0);

export const ensureLocalShopRecord = async ({ shop, pin }) => {
  const db = await getDatabase();
  const existing = await db.getFirstAsync(`SELECT id FROM shop WHERE id = ?`, [shop.id]);
  const now = new Date().toISOString();

  if (!existing) {
    await db.runAsync(
      `INSERT INTO shop (id, name, phone, address, pin, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shop.id, shop.name, shop.phone ?? null, shop.address ?? null, pin ?? null, now, now]
    );
    return;
  }

  await db.runAsync(
    `UPDATE shop SET name = ?, phone = ?, address = ?, pin = ?, updatedAt = ? WHERE id = ?`,
    [shop.name, shop.phone ?? null, shop.address ?? null, pin ?? null, now, shop.id]
  );
};

const restoreProducts = async (db, shopId, products) => {
  for (const product of products) {
    await db.runAsync(
      `INSERT OR IGNORE INTO products
         (id, shopId, name, price, stock, category, expiryDate, isDeleted, createdAt, updatedAt, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        product._id,
        shopId,
        product.name,
        product.price ?? 0,
        product.stock ?? 0,
        product.category ?? null,
        product.expiryDate ?? null,
        toBooleanInt(product.isDeleted),
        product.createdAt,
        product.updatedAt,
      ]
    );
  }
};

const restoreCustomers = async (db, shopId, customers) => {
  for (const customer of customers) {
    await db.runAsync(
      `INSERT OR IGNORE INTO customers
         (id, shopId, name, phone, totalDue, note, createdAt, updatedAt, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        customer._id,
        shopId,
        customer.name,
        customer.phone ?? null,
        customer.totalDue ?? 0,
        customer.note ?? null,
        customer.createdAt,
        customer.updatedAt,
      ]
    );
  }
};

const restoreSalesAndItems = async (db, shopId, sales) => {
  for (const sale of sales) {
    await db.runAsync(
      `INSERT OR IGNORE INTO sales
         (id, shopId, customerId, totalAmount, paymentMethod, note, createdAt, updatedAt, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        sale._id,
        shopId,
        sale.customerId ?? null,
        sale.totalAmount ?? 0,
        sale.paymentMethod ?? 'cash',
        sale.note ?? null,
        sale.createdAt,
        sale.updatedAt,
      ]
    );

    if (Array.isArray(sale.items)) {
      for (const item of sale.items) {
        await db.runAsync(
          `INSERT OR IGNORE INTO sale_items
             (id, saleId, shopId, productId, productName, quantity, unitPrice, totalPrice, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item._id,
            sale._id,
            shopId,
            item.productId,
            item.productName,
            item.quantity ?? 0,
            item.unitPrice ?? 0,
            item.totalPrice ?? 0,
            item.createdAt,
          ]
        );
      }
    }
  }
};

const restoreTransactions = async (db, shopId, transactions) => {
  for (const transaction of transactions) {
    await db.runAsync(
      `INSERT OR IGNORE INTO transactions
         (id, shopId, customerId, saleId, type, amount, note, isReversed, reversedById, createdAt, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        transaction._id,
        shopId,
        transaction.customerId,
        transaction.saleId ?? null,
        transaction.type,
        transaction.amount ?? 0,
        transaction.note ?? null,
        toBooleanInt(transaction.isReversed),
        transaction.reversedById ?? null,
        transaction.createdAt,
      ]
    );
  }
};

const restoreExpenses = async (db, shopId, expenses) => {
  for (const expense of expenses) {
    await db.runAsync(
      `INSERT OR IGNORE INTO expenses
         (id, shopId, category, amount, note, date, createdAt, updatedAt, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        expense._id,
        shopId,
        expense.category,
        expense.amount ?? 0,
        expense.note ?? null,
        expense.date,
        expense.createdAt,
        expense.updatedAt,
      ]
    );
  }
};

export const restoreShopBackup = async ({ shop, data, pin }) => {
  const db = await getDatabase();
  await ensureLocalShopRecord({ shop, pin });

  const localCounts = await getLocalDataCounts();
  const localTotal = getTotalCount(localCounts);

  if (localTotal > 0) {
    return {
      status: 'local',
      localCounts,
      backupCounts: {
        products: data.products.length,
        customers: data.customers.length,
        sales: data.sales.length,
        transactions: data.transactions.length,
        expenses: data.expenses.length,
      },
    };
  }

  const backupCounts = {
    products: data.products.length,
    customers: data.customers.length,
    sales: data.sales.length,
    transactions: data.transactions.length,
    expenses: data.expenses.length,
  };
  const backupTotal = getTotalCount(backupCounts);

  if (backupTotal === 0) {
    return {
      status: 'empty',
      localCounts,
      backupCounts,
    };
  }

  await restoreProducts(db, shop.id, data.products);
  await restoreCustomers(db, shop.id, data.customers);
  await restoreSalesAndItems(db, shop.id, data.sales);
  await restoreTransactions(db, shop.id, data.transactions);
  await restoreExpenses(db, shop.id, data.expenses);

  return {
    status: 'restored',
    localCounts,
    backupCounts,
  };
};
