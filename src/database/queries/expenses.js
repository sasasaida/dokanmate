// src/database/queries/expenses.js
// All SQLite operations for the expenses table.

import { getDatabase } from '../db';
import { requireShopId, getActiveShopId } from '../shopScope';
import uuid from 'react-native-uuid';
import { enqueue } from './syncQueue';

// ─── CREATE ────────────────────────────────────────────────

/**
 * Add a new expense record.
 * date is stored separately from createdAt so shopkeeper
 * can backdate an expense if they forgot to enter it same day.
 */
export const createExpense = async ({ category, amount, note, date }) => {
  const db  = await getDatabase();
  const id  = uuid.v4();
  const now = new Date().toISOString();
  const shopId = await requireShopId();

  await db.runAsync(
    `INSERT INTO expenses
       (id, shopId, category, amount, note, date, createdAt, updatedAt, isSynced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [id, shopId, category, amount, note?.trim() ?? null, date, now, now]
  );

  enqueue('expenses', id, 'INSERT', { id, shopId, category, amount, note, date, createdAt: now })
    .catch(() => {});

  return { id, category, amount, note: note?.trim() ?? null,
           date, createdAt: now, updatedAt: now, isSynced: 0, shopId };
};

// ─── READ ──────────────────────────────────────────────────

/**
 * Get all expenses, newest first.
 */
export const getAllExpenses = async () => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return [];
  return await db.getAllAsync(
    `SELECT * FROM expenses WHERE shopId = ? ORDER BY date DESC, createdAt DESC`,
    [shopId]
  );
};

/**
 * Get expenses for today only.
 */
export const getTodayExpenses = async () => {
  const db    = await getDatabase();
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const shopId = await getActiveShopId();
  if (!shopId) return [];

  return await db.getAllAsync(
    `SELECT * FROM expenses
     WHERE shopId = ? AND date = ?
     ORDER BY createdAt DESC`,
    [shopId, today]
  );
};

/**
 * Get total expenses for today.
 * Used on the dashboard.
 */
export const getTodayExpenseTotal = async () => {
  const db    = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const shopId = await getActiveShopId();
  if (!shopId) return 0;

  const result = await db.getFirstAsync(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expenses WHERE shopId = ? AND date = ?`,
    [shopId, today]
  );
  return result?.total ?? 0;
};

/**
 * Get total expenses for a date range.
 * Used for weekly/monthly profit calculation.
 */
export const getExpenseTotalForRange = async (startDate, endDate) => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return 0;
  const result = await db.getFirstAsync(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expenses
     WHERE shopId = ? AND date >= ? AND date <= ?`,
    [shopId, startDate, endDate]
  );
  return result?.total ?? 0;
};

/**
 * Get expenses grouped by category for a date range.
 * Used for the breakdown view.
 */
export const getExpensesByCategory = async (startDate, endDate) => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();
  if (!shopId) return [];
  return await db.getAllAsync(
    `SELECT category,
            COALESCE(SUM(amount), 0) AS total,
            COUNT(*) AS count
     FROM expenses
     WHERE shopId = ? AND date >= ? AND date <= ?
     GROUP BY category
     ORDER BY total DESC`,
    [shopId, startDate, endDate]
  );
};

// ─── UPDATE ────────────────────────────────────────────────

export const updateExpense = async (id, { category, amount, note, date }) => {
  const db  = await getDatabase();
  const now = new Date().toISOString();
  const shopId = await requireShopId();

  await db.runAsync(
    `UPDATE expenses
     SET category = ?, amount = ?, note = ?, date = ?,
         updatedAt = ?, isSynced = 0
     WHERE id = ? AND shopId = ?`,
    [category, amount, note?.trim() ?? null, date, now, id, shopId]
  );
  enqueue('expenses', id, 'UPDATE', { id, shopId, category, amount, note, date })
    .catch(() => {});

};

// ─── DELETE ────────────────────────────────────────────────

/**
 * Hard delete for expenses — unlike transactions, expenses
 * don't need an immutable ledger. A mistake can just be removed.
 */
export const deleteExpense = async (id) => {
  const db = await getDatabase();
  const shopId = await requireShopId();
  await db.runAsync(`DELETE FROM expenses WHERE id = ? AND shopId = ?`, [id, shopId]);
};