import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

export const BestSellingProductsChart = ({ data = [] }) => {
  const chartData = data
    .map((item) => ({
      name: item.name,
      sold: Number(item.totalSold) || 0,
      revenue: Number(item.revenue) || 0,
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 7); // keep it compact

  const maxValue = Math.max(...chartData.map((d) => d.sold), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Best Selling Products</Text>
      <Text style={styles.subtitle}>Top products by quantity sold</Text>

      <View style={styles.container}>
        {chartData.length === 0 ? (
          <Text style={styles.empty}>No sales data yet.</Text>
        ) : (
          chartData.map((item, index) => {
            const percent = (item.sold / maxValue) * 100;

            return (
              <View key={item.name} style={styles.row}>
                {/* label */}
                <View style={styles.topRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {index + 1}. {item.name}
                  </Text>
                  <Text style={styles.value}>
                    {item.sold} sold
                  </Text>
                </View>

                {/* bar */}
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(percent, 6)}%` },
                    ]}
                  />
                </View>

                {/* revenue hint */}
                <Text style={styles.revenue}>
                  {formatCurrency(item.revenue)}
                </Text>
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 14,
  },
  container: {
    gap: 14,
  },
  empty: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  row: {
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 10,
  },
  value: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  revenue: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});