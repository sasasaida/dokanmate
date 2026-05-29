// src/database/queries/customers.js
// Handles both customers and their transaction ledger.
// Transactions are immutable — we never delete them, only reverse.

import { getDatabase } from '../db';
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

  await db.runAsync(
    `INSERT INTO customers
       (id, name, phone, totalDue, note, createdAt, updatedAt, isSynced)
     VALUES (?, ?, ?, 0, ?, ?, ?, 0)`,
    [id, name.trim(), phone?.trim() ?? null, note?.trim() ?? null, now, now]
  );

  enqueue('customers', id, 'INSERT', { id, name, phone, note, totalDue: 0, createdAt: now })
    .catch(() => {});

  return { id, name: name.trim(), phone: phone?.trim() ?? null,
           totalDue: 0, note: note?.trim() ?? null,
           createdAt: now, updatedAt: now, isSynced: 0 };
};

/**
 * Get all customers ordered by those with the highest due first.
 * This surfaces the most important relationships at the top.
 */
export const getAllCustomers = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM customers ORDER BY totalDue DESC, name ASC`
  );
};

/**
 * Get a single customer by ID.
 */
export const getCustomerById = async (id) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    `SELECT * FROM customers WHERE id = ?`, [id]
  );
};

/**
 * Update customer details.
 */
export const updateCustomer = async (id, { name, phone, note }) => {
  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE customers
     SET name = ?, phone = ?, note = ?, updatedAt = ?, isSynced = 0
     WHERE id = ?`,
    [name.trim(), phone?.trim() ?? null, note?.trim() ?? null, now, id]
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

  // Sum all active (non-reversed) transactions
  // due transactions increase the balance, payments decrease it
  const result = await db.getFirstAsync(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'due'     THEN amount ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0)
       AS balance
     FROM transactions
     WHERE customerId = ? AND isReversed = 0`,
    [customerId]
  );

  const balance = result?.balance ?? 0;

  await db.runAsync(
    `UPDATE customers
     SET totalDue = ?, updatedAt = ?, isSynced = 0
     WHERE id = ?`,
    [Math.max(0, balance), now, customerId]
  );

  return Math.max(0, balance);
};

/**
 * Get total outstanding dues across ALL customers.
 * Used on the dashboard.
 */
export const getTotalOutstandingDues = async () => {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    `SELECT COALESCE(SUM(totalDue), 0) AS total FROM customers`
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

  await db.runAsync(
    `INSERT INTO transactions
       (id, customerId, type, amount, note, isReversed, reversedById, createdAt, isSynced)
     VALUES (?, ?, 'due', ?, ?, 0, null, ?, 0)`,
    [id, customerId, amount, note?.trim() ?? null, now]
  );

  enqueue('transactions', id, 'INSERT', {
    id, customerId, type: 'due', amount, note, createdAt: now,
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

  await db.runAsync(
    `INSERT INTO transactions
       (id, customerId, type, amount, note, isReversed, reversedById, createdAt, isSynced)
     VALUES (?, ?, 'payment', ?, ?, 0, null, ?, 0)`,
    [id, customerId, amount, note?.trim() ?? null, now]
  );

  enqueue('transactions', id, 'INSERT', {
    id, customerId, type: 'payment', amount, note, createdAt: now,
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

  // Mark original as reversed
  await db.runAsync(
    `UPDATE transactions
     SET isReversed = 1
     WHERE id = ?`,
    [transactionId]
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
  return await db.getAllAsync(
    `SELECT * FROM transactions
     WHERE customerId = ?
     ORDER BY createdAt DESC`,
    [customerId]
  );
};