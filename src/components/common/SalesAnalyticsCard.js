import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

const CHART_HEIGHT = 120;
const CHART_WIDTH = 320;

export const SalesAnalyticsCard = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    label: new Date(item.date).getDate().toString(),
    value: Number(item.totalRevenue || item.revenue || 0),
  }));

  const maxValue = Math.max(...chartData.map(d => d.value), 1);
  const barWidth = CHART_WIDTH / Math.max(chartData.length, 1);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sales Trend</Text>
          <Text style={styles.subtitle}>Daily revenue overview</Text>
        </View>

        <Text style={styles.total}>
          {formatCurrency(total)}
        </Text>
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>

          {/* baseline */}
          <Line
            x1="0"
            y1={CHART_HEIGHT - 1}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT - 1}
            stroke={Colors.border}
            strokeWidth="1"
          />

          {chartData.map((d, i) => {
            const barHeight = (d.value / maxValue) * (CHART_HEIGHT - 20);
            const x = i * barWidth + barWidth * 0.25;
            const y = CHART_HEIGHT - barHeight;

            return (
              <React.Fragment key={i}>
                {/* bar */}
                <Rect
                  x={x}
                  y={y}
                  width={barWidth * 0.5}
                  height={barHeight}
                  fill={Colors.primary}
                  rx={4}
                />

                {/* label */}
                <SvgText
                  x={x + barWidth * 0.25}
                  y={CHART_HEIGHT - 2}
                  fontSize="10"
                  fill={Colors.textMuted}
                  textAnchor="middle"
                >
                  {d.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
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
    padding: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  total: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
  },
  chartWrapper: {
    marginTop: 8,
    alignItems: 'center',
  },
});