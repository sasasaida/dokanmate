// src/database/queries/customers.js
// Handles both customers and their transaction ledger.
// Transactions are immutable — we never delete them, only reverse.

import { getDatabase } from '../db';
import { requireShopId, getActiveShopId } from '../shopScope';
import uuid from 'react-native-uuid';
import { enqueue } from './syncQueue';

// ─── CUSTOMERS ────────────────────────────────────────────

/**
 * Create a new customer.
 * Phone is optional — many small shop customers are known by name only.
 */
export const createCustomer = async ({ name, phone, note }) => {
  const db = await getDatabase();
  const id  = uuid.v4();
  const now = new Date().toISOString();
  const shopId = await requireShopId();

  await db.runAsync(
    `INSERT INTO customers
       (id, shopId, name, phone, totalDue, note, createdAt, updatedAt, isSynced)
     VALUES (?, ?, ?, ?, 0, ?, ?, ?, 0)`,
    [id, shopId, name.trim(), phone?.trim() ?? null, note?.trim() ?? null, now, now]
  );

  enqueue('customers', id, 'INSERT', { id, shopId, name, phone, note, totalDue: 0, createdAt: now })
    .catch(() => {});

  return { id, name: name.trim(), phone: phone?.trim() ?? null,
           totalDue: 0, note: note?.trim() ?? null,
           createdAt: now, updatedAt: now, isSynced: 0, shopId };
};

/**
 * Get all customers ordered by those with the highest due first.
 * This surfaces the most important relationships at the top.
 */
export const getAllCustomers = async () => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return [];
  return await db.getAllAsync(
    `SELECT * FROM customers WHERE shopId = ? ORDER BY totalDue DESC, name ASC`,
    [shopId]
  );
};

/**
 * Get a single customer by ID.
 */
export const getCustomerById = async (id) => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return null;
  return await db.getFirstAsync(
    `SELECT * FROM customers WHERE id = ? AND shopId = ?`, [id, shopId]
  );
};

/**
 * Update customer details.
 */
export const updateCustomer = async (id, { name, phone, note }) => {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const shopId = await requireShopId();

  await db.runAsync(
    `UPDATE customers
     SET name = ?, phone = ?, note = ?, updatedAt = ?, isSynced = 0
     WHERE id = ? AND shopId = ?`,
    [name.trim(), phone?.trim() ?? null, note?.trim() ?? null, now, id, shopId]
  );
};

/**
 * Recalculate and update a customer's totalDue from their transaction history.
 * Called after every transaction add or reverse.
 * This keeps totalDue always accurate — it's the source of truth.
 */
export const recalculateCustomerDue = async (customerId) => {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const shopId = await requireShopId();

  // Sum all active (non-reversed) transactions
  // due transactions increase the balance, payments decrease it
  const result = await db.getFirstAsync(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'due'     THEN amount ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0)
       AS balance
     FROM transactions
     WHERE customerId = ? AND shopId = ? AND isReversed = 0`,
    [customerId, shopId]
  );

  const balance = result?.balance ?? 0;

  await db.runAsync(
    `UPDATE customers
     SET totalDue = ?, updatedAt = ?, isSynced = 0
     WHERE id = ? AND shopId = ?`,
    [Math.max(0, balance), now, customerId, shopId]
  );

  return Math.max(0, balance);
};

/**
 * Get total outstanding dues across ALL customers.
 * Used on the dashboard.
 */
export const getTotalOutstandingDues = async () => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return 0;
  const result = await db.getFirstAsync(
    `SELECT COALESCE(SUM(totalDue), 0) AS total FROM customers WHERE shopId = ?`,
    [shopId]
  );
  return result?.total ?? 0;
};

// ─── TRANSACTIONS ──────────────────────────────────────────

/**
 * Record a new due (customer owes money).
 * type = 'due'
 */
export const addDueTransaction = async ({ customerId, amount, note }) => {
  const db = await getDatabase();
  const id  = uuid.v4();
  const now = new Date().toISOString();
  const shopId = await requireShopId();

  await db.runAsync(
    `INSERT INTO transactions
       (id, shopId, customerId, type, amount, note, isReversed, reversedById, createdAt, isSynced)
     VALUES (?, ?, ?, 'due', ?, ?, 0, null, ?, 0)`,
    [id, shopId, customerId, amount, note?.trim() ?? null, now]
  );

  enqueue('transactions', id, 'INSERT', {
    id, shopId, customerId, type: 'due', amount, note, createdAt: now,
  }).catch(() => {});

  // Recalculate the customer's running balance
  const newBalance = await recalculateCustomerDue(customerId);
  return { id, newBalance };
};

/**
 * Record a payment (customer pays back money).
 * type = 'payment'
 */
export const addPaymentTransaction = async ({ customerId, amount, note }) => {
  const db = await getDatabase();
  const id  = uuid.v4();
  const now = new Date().toISOString();
  const shopId = await requireShopId();

  await db.runAsync(
    `INSERT INTO transactions
       (id, shopId, customerId, type, amount, note, isReversed, reversedById, createdAt, isSynced)
     VALUES (?, ?, ?, 'payment', ?, ?, 0, null, ?, 0)`,
    [id, shopId, customerId, amount, note?.trim() ?? null, now]
  );

  enqueue('transactions', id, 'INSERT', {
    id, shopId, customerId, type: 'payment', amount, note, createdAt: now,
  }).catch(() => {});

  const newBalance = await recalculateCustomerDue(customerId);
  return { id, newBalance };
};

/**
 * Reverse a transaction instead of deleting it.
 * Creates a new reversal record that cancels the original.
 * The original row stays in the DB forever — immutable ledger.
 */
export const reverseTransaction = async ({ transactionId, customerId }) => {
  const db  = await getDatabase();
  const now = new Date().toISOString();
  const shopId = await requireShopId();

  // Mark original as reversed
  await db.runAsync(
    `UPDATE transactions
     SET isReversed = 1
     WHERE id = ? AND shopId = ?`,
    [transactionId, shopId]
  );

  const newBalance = await recalculateCustomerDue(customerId);
  return { newBalance };
};

/**
 * Get all transactions for a customer, newest first.
 * Includes reversed ones so the full history is visible.
 */
export const getCustomerTransactions = async (customerId) => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return [];
  return await db.getAllAsync(
    `SELECT * FROM transactions
     WHERE customerId = ? AND shopId = ?
     ORDER BY createdAt DESC`,
    [customerId, shopId]
  );
};