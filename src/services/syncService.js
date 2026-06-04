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
 * Returns true if successful, false if it failed, or 'AUTH_ERROR' if auth failed.
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
  } catch (err) {
    if (err.response?.status === 401) {
      // Token expired or invalid
      // Don't crash — just stop syncing until user logs in
      console.log('[Sync] Auth error — token may be expired');
      return 'AUTH_ERROR'; // Special return value
    }

    // Network error or server error — will retry later
    console.log(`[Sync] Failed to upload ${queueItem.tableName}:`, err.message);
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
 * Stops early if too many failures or auth error.
 *
 * Returns { synced, failed, remaining, needsAuth }
 */
export const runSync = async () => {
  const results = { synced: 0, failed: 0, remaining: 0, needsAuth: false };

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

      if (success === 'AUTH_ERROR') {
        // Stop the entire sync pass — no point continuing
        console.log('[Sync] Stopping sync — re-authentication needed');
        results.needsAuth = true;
        break;
      } else if (success === true) {
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
    console.error('[Sync] Sync pass failed:', err.message);
  }

  return results;
};