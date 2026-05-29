// src/database/queries/syncQueue.js
// Manages the local sync queue table.
// Every record that needs to reach the server goes through here.

import { getDatabase } from '../db';

/**
 * Add a record to the sync queue.
 * Called automatically after every local write operation.
 *
 * @param tableName  - which table: 'products' | 'sales' | 'customers' | etc.
 * @param recordId   - the UUID of the record
 * @param operation  - 'INSERT' | 'UPDATE' | 'DELETE'
 * @param payload    - full record data as a JS object (will be JSON stringified)
 */
export const enqueue = async (tableName, recordId, operation, payload) => {
  const db  = await getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO sync_queue
       (tableName, recordId, operation, payload, retryCount, createdAt)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [tableName, recordId, operation, JSON.stringify(payload), now]
  );
  console.log('[Queue] Enqueued:', tableName, operation, recordId);
};

/**
 * Get all pending items in the queue.
 * Ordered oldest first — we sync in the order things happened.
 */
export const getPendingQueue = async () => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM sync_queue
     WHERE retryCount < 3
     ORDER BY createdAt ASC`
  );
};

/**
 * Remove a successfully synced item from the queue.
 */
export const dequeue = async (id) => {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
};

/**
 * Increment retry count when an upload fails.
 * After 3 failures the item is excluded from future sync attempts.
 * This prevents one bad record from blocking the entire queue.
 */
export const incrementRetry = async (id) => {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE sync_queue SET retryCount = retryCount + 1 WHERE id = ?`,
    [id]
  );
};

/**
 * Remove all successfully synced items.
 * Called after a full sync pass completes.
 */
export const clearSyncedItems = async (ids) => {
  if (!ids || ids.length === 0) return;
  const db          = await getDatabase();
  const placeholders = ids.map(() => '?').join(', ');
  await db.runAsync(
    `DELETE FROM sync_queue WHERE id IN (${placeholders})`,
    ids
  );
};

/**
 * Get count of pending items — for UI indicator.
 */
export const getPendingCount = async () => {
  const db    = await getDatabase();
  const result = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM sync_queue WHERE retryCount < 3`
  );
  return result?.count ?? 0;
};