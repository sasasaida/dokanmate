// src/services/syncService.js
// Reads the sync queue and uploads pending records to the backend.
// Called when internet becomes available.
// Never blocks the UI — runs entirely in the background.

import client from '../api/client';
import {
  getPendingQueue,
  dequeue,
  incrementRetry,
} from '../database/queries/syncQueue';
import { getDatabase } from '../database/db';

// Map table names to API endpoints
const ENDPOINT_MAP = {
  products:     '/sync/products',
  sales:        '/sync/sales',
  sale_items:   '/sync/sale-items',
  customers:    '/sync/customers',
  transactions: '/sync/transactions',
  expenses:     '/sync/expenses',
};

/**
 * Upload a single queue item to the server.
 * Returns true if successful, false if it failed.
 */
const uploadItem = async (queueItem) => {
  const endpoint = ENDPOINT_MAP[queueItem.tableName];
  if (!endpoint) {
    // Unknown table — remove from queue to prevent blocking
    await dequeue(queueItem.id);
    return true;
  }

  try {
    const payload = JSON.parse(queueItem.payload);

    await client.post(endpoint, {
      operation: queueItem.operation,  // INSERT | UPDATE | DELETE
      recordId:  queueItem.recordId,
      data:      payload,
    });

    return true;
  } catch (error) {
    // Network error or server error — will retry later
    console.log(`[Sync] Failed to upload ${queueItem.tableName}:`, error.message);
    return false;
  }
};

/**
 * Mark a record as synced in its original table.
 * Called after successful upload.
 */
const markAsSynced = async (tableName, recordId) => {
  // sale_items don't have isSynced column — skip them
  if (tableName === 'sale_items') return;

  try {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ${tableName} SET isSynced = 1 WHERE id = ?`,
      [recordId]
    );
  } catch (err) {
    // Non-critical — the record is synced on server, just not marked locally
    console.log('[Sync] Failed to mark as synced locally:', err.message);
  }
};

/**
 * Run a full sync pass.
 * Processes queue items one by one.
 * Stops early if too many failures (bad connection).
 *
 * Returns { synced, failed, remaining }
 */
export const runSync = async () => {
  const results = { synced: 0, failed: 0, remaining: 0 };

  try {
    const queue = await getPendingQueue();

    if (queue.length === 0) {
      console.log('[Sync] Queue empty — nothing to sync');
      return results;
    }

    console.log(`[Sync] Starting — ${queue.length} items pending`);

    let failStreak = 0;

    for (const item of queue) {
      if (failStreak >= 5) {
        console.log('[Sync] Too many failures — stopping early');
        break;
      }

      const success = await uploadItem(item);

      if (success) {
        await dequeue(item.id);
        await markAsSynced(item.tableName, item.recordId);
        results.synced++;
        failStreak = 0; // reset streak on success
      } else {
        await incrementRetry(item.id);
        results.failed++;
        failStreak++;
      }
    }

    results.remaining = results.failed;
    console.log(`[Sync] Done — synced: ${results.synced}, failed: ${results.failed}`);

  } catch (err) {
    // was referencing undefined 'error' variable before — fixed to 'err'
    console.error('[Sync] Sync pass failed:', err.message);
  }

  return results;
};     