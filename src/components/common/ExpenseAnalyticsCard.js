import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

const CATEGORY_COLORS = {
  rent: Colors.primary,
  utility: Colors.warning,
  transport: Colors.info,
  'stock purchase': Colors.danger,
  maintenance: '#6A1B9A',
  salary: '#00897B',
  miscellaneous: '#FBC02D',
};

const extraColors = ['#4A148C', '#00796B', '#AD1457', '#FF8F00', '#0288D1'];

const normalizeCategory = (category) => String(category || 'others').trim().toLowerCase();

export const ExpenseAnalyticsCard = ({ data = [] }) => {
  const segments = data
    .map((item, index) => {
      const category = normalizeCategory(item.category);
      const amount = Number(item.total) || 0;
      if (amount <= 0) return null;
      const color = CATEGORY_COLORS[category] ?? extraColors[index % extraColors.length];
      return { category, amount, color };
    })
    .filter(Boolean);

  const totalAmount = segments.reduce((sum, segment) => sum + segment.amount, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Expense Analytics</Text>
          <Text style={styles.subtitle}>Monthly categories at a glance</Text>
        </View>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </View>

      <View style={styles.graphContainer}>
        {segments.length === 0 ? (
          <Text style={styles.emptyText}>No expenses recorded this month.</Text>
        ) : (
          segments.map((segment) => {
            const percent = totalAmount > 0 ? (segment.amount / totalAmount) * 100 : 0;
            return (
              <View key={segment.category} style={styles.barRow}>
                <View style={styles.barTopRow}>
                  <View style={[styles.dot, { backgroundColor: segment.color }]} />
                  <Text style={styles.barLabel}>{segment.category}</Text>
                  <Text style={styles.barPercent}>{Math.round(percent)}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(6, Math.min(100, percent))}%`, backgroundColor: segment.color }]} />
                </View>
                <Text style={styles.barAmount}>{formatCurrency(segment.amount)}</Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  totalBox: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.surface,
  },
  graphContainer: {
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  barRow: {
    gap: 8,
  },
  barTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  barLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  barPercent: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  barTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barAmount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
