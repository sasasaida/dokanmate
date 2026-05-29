// src/hooks/useCustomers.js
// Manages customer list state and all transaction operations.
// Screens never touch the DB directly.

import { useState, useEffect, useCallback } from 'react';
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  getCustomerTransactions,
  addDueTransaction,
  addPaymentTransaction,
  reverseTransaction,
} from '../database/queries/customers';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);

  // ── Load ──────────────────────────────────────────────

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // ── Add customer ──────────────────────────────────────

  const addCustomer = useCallback(async (data) => {
    try {
      const newCustomer = await createCustomer(data);
      setCustomers((prev) =>
        [newCustomer, ...prev].sort((a, b) => b.totalDue - a.totalDue)
      );
      return { success: true, customer: newCustomer };
    } catch (err) {
      console.error('Failed to add customer:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ── Edit customer ─────────────────────────────────────

  const editCustomer = useCallback(async (id, data) => {
    try {
      await updateCustomer(id, data);
      setCustomers((prev) =>
        prev.map((c) => c.id === id ? { ...c, ...data } : c)
      );
      return { success: true };
    } catch (err) {
      console.error('Failed to update customer:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ── Refresh one customer's balance in list ─────────────

  const refreshCustomerBalance = useCallback(async (customerId, newBalance) => {
    setCustomers((prev) =>
      prev
        .map((c) => c.id === customerId ? { ...c, totalDue: newBalance } : c)
        .sort((a, b) => b.totalDue - a.totalDue)
    );
  }, []);

  // ── Add due ────────────────────────────────────────────

  const recordDue = useCallback(async ({ customerId, amount, note }) => {
    try {
      const { newBalance } = await addDueTransaction({ customerId, amount, note });
      await refreshCustomerBalance(customerId, newBalance);
      return { success: true, newBalance };
    } catch (err) {
      console.error('Failed to record due:', err);
      return { success: false, error: err.message };
    }
  }, [refreshCustomerBalance]);

  // ── Add payment ────────────────────────────────────────

  const recordPayment = useCallback(async ({ customerId, amount, note }) => {
    try {
      const { newBalance } = await addPaymentTransaction({ customerId, amount, note });
      await refreshCustomerBalance(customerId, newBalance);
      return { success: true, newBalance };
    } catch (err) {
      console.error('Failed to record payment:', err);
      return { success: false, error: err.message };
    }
  }, [refreshCustomerBalance]);

  // ── Reverse transaction ────────────────────────────────

  const undoTransaction = useCallback(async ({ transactionId, customerId }) => {
    try {
      const { newBalance } = await reverseTransaction({ transactionId, customerId });
      await refreshCustomerBalance(customerId, newBalance);
      return { success: true, newBalance };
    } catch (err) {
      console.error('Failed to reverse transaction:', err);
      return { success: false, error: err.message };
    }
  }, [refreshCustomerBalance]);

  // ── Load transactions for one customer ─────────────────

  const loadTransactions = useCallback(async (customerId) => {
    try {
      return await getCustomerTransactions(customerId);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      return [];
    }
  }, []);

  // ── Computed ───────────────────────────────────────────

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.totalDue || 0), 0);
  const customersWithDue = customers.filter((c) => c.totalDue > 0);

  return {
    customers,
    loading,
    loadCustomers,
    addCustomer,
    editCustomer,
    recordDue,
    recordPayment,
    undoTransaction,
    loadTransactions,
    totalOutstanding,
    customersWithDue,
  };
};