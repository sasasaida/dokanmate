// src/hooks/useDashboard.js
// Fetches all dashboard summary data in parallel.
// Single hook so the dashboard screen stays clean.

import { useState, useCallback } from 'react';
import { getTodayRevenue, getTodaySales } from '../database/queries/sales';
import { getTodayExpenseTotal, getExpensesByCategory } from '../database/queries/expenses';
import { getTotalOutstandingDues } from '../database/queries/customers';
import { getLowStockProducts } from '../database/queries/products';

const getCurrentMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { startDate, endDate };
};

export const useDashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch everything in parallel — much faster than sequential awaits
      const { startDate, endDate } = getCurrentMonthRange();
      const [
        todayRevenue,
        todaySales,
        todayExpenses,
        totalDues,
        lowStockItems,
        expensesByCategory,
      ] = await Promise.all([
        getTodayRevenue(),
        getTodaySales(),
        getTodayExpenseTotal(),
        getTotalOutstandingDues(),
        getLowStockProducts(5),
        getExpensesByCategory(startDate, endDate),
      ]);

      setData({
        todayRevenue,
        todaySalesCount: todaySales.length,
        todayExpenses,
        todayProfit:     todayRevenue - todayExpenses,
        totalDues,
        lowStockItems,
        expensesByCategory,
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, loadDashboard };
};