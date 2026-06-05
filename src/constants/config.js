// src/constants/config.js
// Central place for all configuration.
// When you move to production, only this file needs to change.

export const Config = {
  // Change this to your server IP when testing on a real device
  // For Android emulator: 10.0.2.2 maps to your computer's localhost
   API_BASE_URL: 'https://1f67-103-87-136-115.ngrok-free.app/api',

  // How many items to show per page in lists
  PAGE_SIZE: 20,

  // Sync settings
  SYNC_RETRY_LIMIT: 3,
  SYNC_INTERVAL_MS: 30000, // Try to sync every 30 seconds when online

  // Low stock threshold (show warning if quantity <= this)
  LOW_STOCK_THRESHOLD: 5,
};