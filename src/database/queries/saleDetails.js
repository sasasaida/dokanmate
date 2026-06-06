//src/database/queries/saleDetails.js

import { getDatabase } from '../db';
import { getActiveShopId } from '../shopScope';

/**
 * Fetch full sale with items
 */
export const getSaleFullDetails = async (saleId) => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();

  if (!shopId) return null;

  const sale = await db.getFirstAsync(
    `SELECT * FROM sales WHERE id = ? AND shopId = ?`,
    [saleId, shopId]
  );

  if (!sale) return null;

  const items = await db.getAllAsync(
    `SELECT * FROM sale_items WHERE saleId = ? AND shopId = ?`,
    [saleId, shopId]
  );

  return {
    ...sale,
    items,
  };
};


export const getSalesByDateRange = async (startDate, endDate) => {
  const db = await getDatabase();
  const shopId = await getActiveShopId();

  if (!shopId) return [];

  return await db.getAllAsync(
    `
    SELECT 
      DATE(createdAt) AS date,
      COALESCE(SUM(totalAmount), 0) AS revenue,
      COUNT(*) AS count
    FROM sales
    WHERE shopId = ?
      AND DATE(createdAt) BETWEEN ? AND ?
    GROUP BY DATE(createdAt)
    ORDER BY date ASC
    `,
    [shopId, startDate, endDate]
  );
};