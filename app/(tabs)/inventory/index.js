// app/(tabs)/inventory/index.js
// Main inventory screen — shows all products with search.
// Shopkeeper spends a lot of time here, so it must be fast and scannable.

// Replace the top section of InventoryScreen with this.
// Everything from the imports down to the return statement.

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '../../../src/hooks/useProducts';
import { ProductCard } from '../../../src/components/inventory/ProductCard';
import { SearchBar } from '../../../src/components/common/SearchBar';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { Colors } from '../../../src/constants/colors';
import { useApp } from '../../../src/context/AppContext';


const InventoryHeader = memo(({
  products,
  lowStockProducts,
  outOfStockProducts,
  searchQuery,
  setSearchQuery,
}) => (
  <View>
    {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
      <View style={styles.alertBanner}>
        <Ionicons name="warning-outline" size={18} color={Colors.warning} />
        <Text style={styles.alertText}>
          {outOfStockProducts.length > 0
            ? `${outOfStockProducts.length} item(s) out of stock`
            : `${lowStockProducts.length} item(s) running low`}
        </Text>
      </View>
    )}

    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{products.length}</Text>
        <Text style={styles.statLabel}>Products</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: Colors.warning }]}>
          {lowStockProducts.length}
        </Text>
        <Text style={styles.statLabel}>Low Stock</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: Colors.danger }]}>
          {outOfStockProducts.length}
        </Text>
        <Text style={styles.statLabel}>Out of Stock</Text>
      </View>
    </View>

    <SearchBar
      value={searchQuery}
      onChangeText={setSearchQuery}
      placeholder="Search products..."
    />
  </View>
));


export default function InventoryScreen() {
  const {
    products,
    loading,
    loadProducts,
    removeProduct,
    lowStockProducts,
    outOfStockProducts,
  } = useProducts();

  const { showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter in memory — no DB call, no re-render of FlatList data source,
  // keyboard stays up because only filteredProducts changes via useMemo
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Remove "${product.name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await removeProduct(product.id);
            if (result.success) {
              showToast(`"${product.name}" removed`, 'success');
            } else {
              showToast('Failed to delete product', 'error');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View>
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning-outline" size={18} color={Colors.warning} />
          <Text style={styles.alertText}>
            {outOfStockProducts.length > 0
              ? `${outOfStockProducts.length} item(s) out of stock`
              : `${lowStockProducts.length} item(s) running low`}
          </Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{products.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.warning }]}>
            {lowStockProducts.length}
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: Colors.danger }]}>
            {outOfStockProducts.length}
          </Text>
          <Text style={styles.statLabel}>Out of Stock</Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search products..."
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/inventory/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/inventory/${item.id}`)}
            onEdit={() => router.push(`/inventory/${item.id}`)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListHeaderComponent={
                              <InventoryHeader
                                products={products}
                                lowStockProducts={lowStockProducts}
                                outOfStockProducts={outOfStockProducts}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                              />
                            }
        ListEmptyComponent={
          !loading && (
            <EmptyState
              icon="cube-outline"
              title={searchQuery ? 'No products found' : 'No products yet'}
              subtitle={
                searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'Add your first product to start managing inventory'
              }
              actionLabel={searchQuery ? undefined : 'Add Product'}
              onAction={searchQuery ? undefined : () => router.push('/inventory/add')}
            />
          )
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadProducts}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        // This is critical — prevents FlatList from stealing keyboard focus
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// styles stay exactly the same as before

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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  alertText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
});