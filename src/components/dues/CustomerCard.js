// src/components/dues/CustomerCard.js
// Shows a customer with their current outstanding balance.
// Color-coded: green = cleared, red = has due.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

export const CustomerCard = ({ customer, onPress }) => {
  const hasDue    = customer.totalDue > 0;
  const initials  = customer.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatar, hasDue && styles.avatarDue]}>
        <Text style={[styles.initials, hasDue && styles.initialsDue]}>
          {initials}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{customer.name}</Text>
        {customer.phone ? (
          <Text style={styles.phone}>{customer.phone}</Text>
        ) : null}
      </View>

      {/* Due amount */}
      <View style={styles.right}>
        {hasDue ? (
          <>
            <Text style={styles.dueLabel}>Owes</Text>
            <Text style={styles.dueAmount}>
              {formatCurrency(customer.totalDue)}
            </Text>
          </>
        ) : (
          <View style={styles.clearedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.clearedText}>Cleared</Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={Colors.textMuted}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDue: {
    backgroundColor: '#FFEBEE',
    borderColor: Colors.danger,
  },
  initials: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  initialsDue: {
    color: Colors.danger,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  dueLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dueAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.danger,
  },
  clearedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearedText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '600',
  },
  chevron: {
    marginTop: 4,
  },
});