// src/components/common/Badge.js
// Small label for status indicators: low stock, payment method, due status.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

/**
 * Badge types:
 *  'success'  — green (in stock, paid)
 *  'warning'  — orange (low stock, partial)
 *  'danger'   — red (out of stock, overdue)
 *  'info'     — blue (bKash, Nagad)
 *  'neutral'  — gray (cash, default)
 */
export const Badge = ({ label, type = 'neutral', style }) => {
  return (
    <View style={[styles.badge, styles[type], style]}>
      <Text style={[styles.text, styles[`${type}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },

  success:     { backgroundColor: '#E8F5E9' },
  successText: { color: Colors.success },

  warning:     { backgroundColor: '#FFF3E0' },
  warningText: { color: Colors.warning },

  danger:     { backgroundColor: '#FFEBEE' },
  dangerText: { color: Colors.danger },

  info:     { backgroundColor: '#E3F2FD' },
  infoText: { color: Colors.info },

  neutral:     { backgroundColor: '#F5F5F5' },
  neutralText: { color: Colors.textSecondary },
});