// src/components/dues/TransactionRow.js
// One row in a customer's ledger history.
// Shows type (due/payment), amount, date, and reversal option.
// Reversed transactions are shown greyed out — never hidden.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

export const TransactionRow = ({ transaction, onReverse }) => {
  const isDue      = transaction.type === 'due';
  const isReversed = transaction.isReversed === 1;

  return (
    <View style={[styles.row, isReversed && styles.rowReversed]}>
      {/* Type icon */}
      <View style={[
        styles.iconBox,
        isDue ? styles.iconDue : styles.iconPayment,
        isReversed && styles.iconReversed,
      ]}>
        <Ionicons
          name={isDue ? 'arrow-up-outline' : 'arrow-down-outline'}
          size={18}
          color={
            isReversed
              ? Colors.textMuted
              : isDue ? Colors.danger : Colors.success
          }
        />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.topRow}>
          <Text style={[styles.type, isReversed && styles.textReversed]}>
            {isDue ? 'Due added' : 'Payment received'}
            {isReversed ? ' (reversed)' : ''}
          </Text>
          <Text style={[
            styles.amount,
            isDue ? styles.amountDue : styles.amountPayment,
            isReversed && styles.textReversed,
          ]}>
            {isDue ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.meta}>
            {formatDate(transaction.createdAt)} · {formatTime(transaction.createdAt)}
          </Text>
          {transaction.note ? (
            <Text style={styles.note} numberOfLines={1}>
              {transaction.note}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Reverse button — only for active transactions */}
      {!isReversed && (
        <TouchableOpacity
          onPress={onReverse}
          hitSlop={10}
          style={styles.reverseBtn}
        >
          <Ionicons name="arrow-undo-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  rowReversed: {
    opacity: 0.5,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDue: {
    backgroundColor: '#FFEBEE',
  },
  iconPayment: {
    backgroundColor: '#E8F5E9',
  },
  iconReversed: {
    backgroundColor: Colors.background,
  },
  details: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountDue: {
    color: Colors.danger,
  },
  amountPayment: {
    color: Colors.success,
  },
  textReversed: {
    color: Colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  note: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  reverseBtn: {
    padding: 6,
  },
});