// app/(tabs)/index.js
// Dashboard — the first screen shopkeeper sees.
// Shows today's performance at a glance.
// Minimal, fast, no clutter.

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../../src/hooks/useDashboard';
import { Colors } from '../../src/constants/colors';
import { formatCurrency, formatDate } from '../../src/utils/formatters';

// ── Stat card ───────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, onPress, subtitle }) => (
  <TouchableOpacity
    style={[styles.statCard, onPress && { activeOpacity: 0.7 }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={styles.statTop}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    {subtitle ? (
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    ) : null}
  </TouchableOpacity>
);

// ── Low stock row ───────────────────────────────────────────
const LowStockRow = ({ product }) => (
  <View style={styles.lowStockRow}>
    <View style={styles.lowStockLeft}>
      <Text style={styles.lowStockName} numberOfLines={1}>
        {product.name}
      </Text>
      {product.category ? (
        <Text style={styles.lowStockCategory}>{product.category}</Text>
      ) : null}
    </View>
    <View style={[
      styles.lowStockBadge,
      product.stock === 0 && styles.lowStockBadgeDanger,
    ]}>
      <Text style={[
        styles.lowStockQty,
        product.stock === 0 && styles.lowStockQtyDanger,
      ]}>
        {product.stock === 0 ? 'Out' : `${product.stock} left`}
      </Text>
    </View>
  </View>
);

// ── Main screen ─────────────────────────────────────────────
export default function DashboardScreen() {
  const { data, loading, loadDashboard } = useDashboard();

  // Reload every time dashboard tab is focused
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const today = formatDate(new Date().toISOString());

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const profitColor =
    !data           ? Colors.textPrimary :
    data.todayProfit > 0 ? Colors.success :
    data.todayProfit < 0 ? Colors.danger  :
    Colors.textSecondary;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DokanMate</Text>
          <Text style={styles.headerDate}>{today}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadDashboard}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Today's profit — hero number */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Today's Profit</Text>
          <Text style={[styles.heroAmount, { color: profitColor }]}>
            {data ? formatCurrency(data.todayProfit) : '৳0'}
          </Text>
          <Text style={styles.heroSub}>
            Revenue {data ? formatCurrency(data.todayRevenue) : '৳0'}
            {'  ·  '}
            Expenses {data ? formatCurrency(data.todayExpenses) : '৳0'}
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          <StatCard
            label="Sales Today"
            value={data?.todaySalesCount ?? 0}
            icon="cart-outline"
            color={Colors.primary}
            subtitle="transactions"
            onPress={() => router.push('/sales')}
          />
          <StatCard
            label="Revenue"
            value={data ? formatCurrency(data.todayRevenue) : '৳0'}
            icon="trending-up-outline"
            color={Colors.success}
            onPress={() => router.push('/sales')}
          />
          <StatCard
            label="Expenses"
            value={data ? formatCurrency(data.todayExpenses) : '৳0'}
            icon="trending-down-outline"
            color={Colors.danger}
            onPress={() => router.push('/expenses')}
          />
          <StatCard
            label="Pending Dues"
            value={data ? formatCurrency(data.totalDues) : '৳0'}
            icon="people-outline"
            color={Colors.warning}
            onPress={() => router.push('/dues')}
          />
        </View>

        {/* Low stock alerts */}
        {data?.lowStockItems?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={Colors.warning}
                />
                <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/inventory')}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>

            {data.lowStockItems.slice(0, 5).map((product) => (
              <LowStockRow key={product.id} product={product} />
            ))}

            {data.lowStockItems.length > 5 && (
              <TouchableOpacity
                style={styles.viewMoreBtn}
                onPress={() => router.push('/inventory')}
              >
                <Text style={styles.viewMoreText}>
                  +{data.lowStockItems.length - 5} more items
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/sales')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="cart-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.quickLabel}>New Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/inventory/add')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="cube-outline" size={24} color={Colors.info} />
              </View>
              <Text style={styles.quickLabel}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/dues/add')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="person-add-outline" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.quickLabel}>Add Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/expenses/add')}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="wallet-outline" size={24} color={Colors.danger} />
              </View>
              <Text style={styles.quickLabel}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  headerBadgeText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 6,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  lowStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lowStockLeft: {
    flex: 1,
    marginRight: 12,
  },
  lowStockName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  lowStockCategory: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  lowStockBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  lowStockBadgeDanger: {
    backgroundColor: '#FFEBEE',
    borderColor: Colors.danger,
  },
  lowStockQty: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
  },
  lowStockQtyDanger: {
    color: Colors.danger,
  },
  viewMoreBtn: {
    paddingTop: 10,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickBtn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  quickIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});