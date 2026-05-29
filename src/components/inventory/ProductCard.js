// src/components/inventory/ProductCard.js
// Displays a single product in the inventory list.
// Shows name, price, stock level with color-coded badge.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../common/Badge';
import { Colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

/**
 * Determine stock badge type based on quantity.
 */
const getStockBadge = (stock) => {
  if (stock === 0)  return { label: 'Out of stock', type: 'danger' };
  if (stock <= 5)   return { label: `Low: ${stock}`, type: 'warning' };
  return { label: `In stock: ${stock}`, type: 'success' };
};

export const ProductCard = ({ product, onPress, onEdit, onDelete }) => {
  const stockBadge = getStockBadge(product.stock);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left: product info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>

        <View style={styles.meta}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {product.category ? (
            <Text style={styles.category}> · {product.category}</Text>
          ) : null}
        </View>

        <Badge
          label={stockBadge.label}
          type={stockBadge.type}
          style={styles.badge}
        />
      </View>

      {/* Right: action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onEdit}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Ionicons name="pencil-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
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
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  category: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
});