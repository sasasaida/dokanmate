// app/(tabs)/expenses/index.js
// Lists all expenses with today's total and a filter by category.

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenses } from '../../../src/hooks/useExpenses';
import { ExpenseItem } from '../../../src/components/expenses/ExpenseItem';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { Colors } from '../../../src/constants/colors';
import { formatCurrency } from '../../../src/utils/formatters';
import { useApp } from '../../../src/context/AppContext';

const CATEGORIES = [
  'All', 'Rent', 'Utility', 'Stock Purchase',
  'Salary', 'Transport', 'Maintenance', 'Miscellaneous',
];

export default function ExpensesScreen() {
  const { expenses, loading, todayTotal, loadExpenses, removeExpense } =
    useExpenses();
  const { showToast } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  // Filter by selected category
  const filteredExpenses = useMemo(() => {
    if (activeCategory === 'All') return expenses;
    return expenses.filter(
      (e) => e.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [expenses, activeCategory]);

  // Total for the filtered view
  const filteredTotal = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  );

  const handleDelete = (expense) => {
    Alert.alert(
      'Delete Expense',
      `Delete this ${expense.category} expense of ${formatCurrency(expense.amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await removeExpense(expense.id);
            if (result.success) {
              showToast('Expense deleted', 'success');
            } else {
              showToast('Failed to delete', 'error');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View>
      {/* Today summary */}
      <View style={styles.todayCard}>
        <View>
          <Text style={styles.todayLabel}>Today's Expenses</Text>
          <Text style={styles.todayAmount}>{formatCurrency(todayTotal)}</Text>
        </View>
        <View style={styles.todayIcon}>
          <Ionicons name="trending-down-outline" size={28} color={Colors.danger} />
        </View>
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterChip,
              activeCategory === cat && styles.filterChipActive,
            ]}
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                activeCategory === cat && styles.filterChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtered total */}
      {activeCategory !== 'All' && (
        <View style={styles.filteredTotal}>
          <Text style={styles.filteredTotalText}>
            {activeCategory}: {formatCurrency(filteredTotal)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/expenses/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onEdit={() =>
              router.push({
                pathname: '/expenses/add',
                params: { expenseId: item.id },
              })
            }
            onDelete={() => handleDelete(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              icon="wallet-outline"
              title={
                activeCategory !== 'All'
                  ? `No ${activeCategory} expenses`
                  : 'No expenses recorded'
              }
              subtitle="Track your shop expenses to calculate real profit"
              actionLabel={activeCategory === 'All' ? 'Add Expense' : undefined}
              onAction={
                activeCategory === 'All'
                  ? () => router.push('/expenses/add')
                  : undefined
              }
            />
          )
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadExpenses}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  todayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  todayLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  todayAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.danger,
  },
  todayIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  filteredTotal: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filteredTotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
});