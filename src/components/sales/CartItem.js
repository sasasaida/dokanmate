// src/components/sales/CartItem.js
// Shows one item in the cart with quantity controls.
// Large +/- buttons — easy to tap quickly.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

export const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => (
  <View style={styles.row}>
    {/* Product name + unit price */}
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.unitPrice}>{formatCurrency(item.price)} each</Text>
    </View>

    {/* Quantity controls */}
    <View style={styles.controls}>
      <TouchableOpacity
        style={styles.qtyBtn}
        onPress={onDecrease}
        activeOpacity={0.7}
        hitSlop={4}
      >
        <Ionicons
          name={item.quantity === 1 ? 'trash-outline' : 'remove'}
          size={18}
          color={item.quantity === 1 ? Colors.danger : Colors.textSecondary}
        />
      </TouchableOpacity>

      <Text style={styles.qty}>{item.quantity}</Text>

      <TouchableOpacity
        style={styles.qtyBtn}
        onPress={onIncrease}
        activeOpacity={0.7}
        hitSlop={4}
      >
        <Ionicons name="add" size={18} color={Colors.primary} />
      </TouchableOpacity>
    </View>

    {/* Line total */}
    <Text style={styles.total}>
      {formatCurrency(item.price * item.quantity)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  unitPrice: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qty: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },
  total: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    minWidth: 60,
    textAlign: 'right',
  },
});