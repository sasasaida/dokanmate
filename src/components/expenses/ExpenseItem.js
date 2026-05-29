// src/components/expenses/ExpenseItem.js
// One expense row. Shows category icon, amount, date, note.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Category metadata — icon and color for each type
const CATEGORY_META = {
  rent:          { icon: 'home-outline',         color: '#7B1FA2' },
  utility:       { icon: 'flash-outline',         color: '#1565C0' },
  'stock purchase': { icon: 'cube-outline',       color: '#2E7D32' },
  salary:        { icon: 'people-outline',         color: '#E65100' },
  transport:     { icon: 'car-outline',            color: '#00838F' },
  maintenance:   { icon: 'build-outline',          color: '#5D4037' },
  miscellaneous: { icon: 'ellipsis-horizontal-outline', color: '#546E7A' },
};

const getMeta = (category) =>
  CATEGORY_META[category?.toLowerCase()] ??
  CATEGORY_META['miscellaneous'];

export const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const meta = getMeta(expense.category);

  return (
    <View style={styles.row}>
      {/* Category icon */}
      <View style={[styles.iconBox, { backgroundColor: `${meta.color}18` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.category}>
          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(expense.date)}</Text>
          {expense.note ? (
            <Text style={styles.note} numberOfLines={1}> · {expense.note}</Text>
          ) : null}
        </View>
      </View>

      {/* Amount + actions */}
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
            <Ionicons name="pencil-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    gap: 3,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  note: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.danger,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
});