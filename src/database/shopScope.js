// src/database/shopScope.js
// Central place for resolving the active shop ID from persisted auth state.

import { getShopId } from '../services/shopService';

export const getActiveShopId = async () => {
  return await getShopId();
};

export const requireShopId = async () => {
  const shopId = await getActiveShopId();
  if (!shopId) {
    throw new Error('No active shop selected');
  }
  return shopId;
};