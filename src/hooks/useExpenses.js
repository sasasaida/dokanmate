// src/hooks/useExpenses.js
import { useState, useEffect, useCallback } from 'react';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getTodayExpenseTotal,
} from '../database/queries/expenses';

export const useExpenses = () => {
  const [expenses,      setExpenses]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [todayTotal,    setTodayTotal]    = useState(0);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const [data, todayAmt] = await Promise.all([
        getAllExpenses(),
        getTodayExpenseTotal(),
      ]);
      setExpenses(data);
      setTodayTotal(todayAmt);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = useCallback(async (data) => {
    try {
      const newExpense = await createExpense(data);
      setExpenses((prev) => [newExpense, ...prev]);
      // Refresh today total if the expense is for today
      const today = new Date().toISOString().split('T')[0];
      if (data.date === today) {
        setTodayTotal((prev) => prev + data.amount);
      }
      return { success: true };
    } catch (err) {
      console.error('Failed to add expense:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const editExpense = useCallback(async (id, data) => {
    try {
      await updateExpense(id, data);
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
        )
      );
      // Reload to recompute today total accurately
      const todayAmt = await getTodayExpenseTotal();
      setTodayTotal(todayAmt);
      return { success: true };
    } catch (err) {
      console.error('Failed to update expense:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const removeExpense = useCallback(async (id) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      const todayAmt = await getTodayExpenseTotal();
      setTodayTotal(todayAmt);
      return { success: true };
    } catch (err) {
      console.error('Failed to delete expense:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    expenses,
    loading,
    todayTotal,
    loadExpenses,
    addExpense,
    editExpense,
    removeExpense,
  };
};