// src/components/sales/ProductPickerRow.js
// One product row in the sales product picker.
// Big tap target, shows stock, instant add to cart.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

export const ProductPickerRow = ({ product, quantityInCart, onAdd, onRemove }) => {
  const outOfStock = product.stock === 0;

  return (
    <View style={[styles.row, outOfStock && styles.rowDisabled]}>
      {/* Product info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <Text style={[
            styles.stock,
            product.stock <= 5 && !outOfStock && { color: Colors.warning },
            outOfStock && { color: Colors.danger },
          ]}>
            {outOfStock ? ' · Out of stock' : ` · Stock: ${product.stock}`}
          </Text>
        </View>
      </View>

      {/* Cart quantity control */}
      {quantityInCart > 0 ? (
        // Already in cart — show stepper
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={onRemove}
            activeOpacity={0.7}
            hitSlop={6}
          >
            <Ionicons name="remove" size={18} color={Colors.danger} />
          </TouchableOpacity>

          <Text style={styles.qty}>{quantityInCart}</Text>

          <TouchableOpacity
            style={[styles.stepBtn, styles.stepBtnAdd]}
            onPress={onAdd}
            disabled={outOfStock || quantityInCart >= product.stock}
            activeOpacity={0.7}
            hitSlop={6}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        // Not in cart yet — show add button
        <TouchableOpacity
          style={[styles.addBtn, outOfStock && styles.addBtnDisabled]}
          onPress={onAdd}
          disabled={outOfStock}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={outOfStock ? Colors.textMuted : '#FFFFFF'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

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
  },
  rowDisabled: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  stock: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: Colors.border,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnAdd: {
    backgroundColor: Colors.primary,
  },
  qty: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },
});