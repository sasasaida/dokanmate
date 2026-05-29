// app/(tabs)/dues/[id].js
// Full ledger for a single customer.
// Shows running balance, all transactions, add due/payment buttons.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCustomers } from '../../../src/hooks/useCustomers';
import { getCustomerById } from '../../../src/database/queries/customers';
import { TransactionRow } from '../../../src/components/dues/TransactionRow';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { Colors } from '../../../src/constants/colors';
import { formatCurrency } from '../../../src/utils/formatters';
import { useApp } from '../../../src/context/AppContext';

// ── Transaction action modal ────────────────────────────────
// Reused for both "Add Due" and "Record Payment"
const TransactionModal = ({ visible, type, customerId, onClose, onSuccess }) => {
  const { recordDue, recordPayment } = useCustomers();
  const { showToast } = useApp();

  const [amount, setAmount] = useState('');
  const [note,   setNote]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  // Reset fields when modal opens
  useEffect(() => {
    if (visible) { setAmount(''); setNote(''); setError(''); }
  }, [visible]);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }

    setSaving(true);
    const fn     = type === 'due' ? recordDue : recordPayment;
    const result = await fn({ customerId, amount: parsed, note });
    setSaving(false);

    if (result.success) {
      showToast(
        type === 'due' ? 'Due recorded' : 'Payment recorded',
        'success'
      );
      onSuccess(result.newBalance);
      onClose();
    } else {
      showToast('Failed to save', 'error');
    }
  };

  const isDue = type === 'due';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalSheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          <Text style={styles.modalTitle}>
            {isDue ? 'Add Due' : 'Record Payment'}
          </Text>
          <Text style={styles.modalSubtitle}>
            {isDue
              ? 'Customer is taking goods on credit'
              : 'Customer is paying back their due'}
          </Text>

          <Input
            label={`Amount (৳) *`}
            value={amount}
            onChangeText={(v) => { setAmount(v); setError(''); }}
            placeholder="0"
            keyboardType="decimal-pad"
            error={error}
            autoFocus
            rightElement={<Text style={styles.unit}>৳</Text>}
          />

          <Input
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder={isDue ? 'What did they take?' : 'Payment reference'}
            multiline
            numberOfLines={2}
          />

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title={isDue ? 'Add Due' : 'Record Payment'}
              onPress={handleSubmit}
              loading={saving}
              variant={isDue ? 'danger' : 'primary'}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Main screen ─────────────────────────────────────────────
export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const { undoTransaction, loadTransactions } = useCustomers();
  const { showToast } = useApp();

  const [customer,     setCustomer]     = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modalType,    setModalType]    = useState(null); // 'due' | 'payment' | null

  // Load customer + transactions together
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [cust, txns] = await Promise.all([
        getCustomerById(id),
        loadTransactions(id),
      ]);
      setCustomer(cust);
      setTransactions(txns);
    } catch (err) {
      console.error('Failed to load customer detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id, loadTransactions]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // After a transaction is added, update balance without full reload
  const handleTransactionSuccess = (newBalance) => {
    setCustomer((prev) => ({ ...prev, totalDue: newBalance }));
    // Reload transactions list to show new entry
    loadTransactions(id).then(setTransactions);
  };

  const handleReverse = (transaction) => {
    Alert.alert(
      'Reverse Transaction',
      `Reverse this ${transaction.type} of ${formatCurrency(transaction.amount)}?\n\nThe transaction will remain visible in history but will no longer affect the balance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reverse',
          style: 'destructive',
          onPress: async () => {
            const result = await undoTransaction({
              transactionId: id,
              customerId: id,
            });
            // Use the transaction's own id
            const r2 = await undoTransaction({
              transactionId: transaction.id,
              customerId: customer.id,
            });
            if (r2.success) {
              setCustomer((prev) => ({ ...prev, totalDue: r2.newBalance }));
              loadTransactions(customer.id).then(setTransactions);
              showToast('Transaction reversed', 'success');
            } else {
              showToast('Failed to reverse', 'error');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: Colors.textSecondary }}>Customer not found</Text>
      </View>
    );
  }

  const hasDue = customer.totalDue > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Customer summary card */}
      <View style={styles.summaryCard}>
        {/* Avatar */}
        <View style={[styles.avatar, hasDue && styles.avatarDue]}>
          <Text style={[styles.initials, hasDue && styles.initialsDue]}>
            {customer.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </Text>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customer.name}</Text>
          {customer.phone ? (
            <Text style={styles.customerPhone}>{customer.phone}</Text>
          ) : null}
        </View>

        {/* Balance */}
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>
            {hasDue ? 'Owes' : 'Cleared'}
          </Text>
          <Text style={[styles.balanceAmount, hasDue && styles.balanceAmountDue]}>
            {formatCurrency(customer.totalDue)}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDue]}
          onPress={() => setModalType('due')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.danger} />
          <Text style={[styles.actionBtnText, { color: Colors.danger }]}>
            Add Due
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPayment]}
          onPress={() => setModalType('payment')}
          activeOpacity={0.8}
        >
          <Ionicons name="cash-outline" size={20} color={Colors.success} />
          <Text style={[styles.actionBtnText, { color: Colors.success }]}>
            Record Payment
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction history */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            onReverse={() => handleReverse(item)}
          />
        )}
        ListHeaderComponent={
          <Text style={styles.historyTitle}>
            Transaction History ({transactions.length})
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>
              No transactions yet
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Due / Payment modal */}
      <TransactionModal
        visible={modalType !== null}
        type={modalType}
        customerId={customer.id}
        onClose={() => setModalType(null)}
        onSuccess={handleTransactionSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDue: {
    backgroundColor: '#FFEBEE',
    borderColor: Colors.danger,
  },
  initials: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  initialsDue: {
    color: Colors.danger,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  customerPhone: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  balanceBox: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.success,
  },
  balanceAmountDue: {
    color: Colors.danger,
  },
  actionRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  actionBtnDue: {
    borderColor: Colors.danger,
    backgroundColor: '#FFEBEE',
  },
  actionBtnPayment: {
    borderColor: Colors.success,
    backgroundColor: '#E8F5E9',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emptyHistory: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  unit: {
    fontSize: 15,
    color: Colors.textMuted,
  },
});