// app/(tabs)/sales/index.js
// The most important screen in the app.
// Shopkeeper picks products, adjusts quantities, proceeds to cart.
// Must feel instant — no delays, no loading spinners on interaction.

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '../../../src/hooks/useProducts';
import { useApp } from '../../../src/context/AppContext';
import { ProductPickerRow } from '../../../src/components/sales/ProductPickerRow';
import { SearchBar } from '../../../src/components/common/SearchBar';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { Colors } from '../../../src/constants/colors';
import { formatCurrency } from '../../../src/utils/formatters';

export default function SalesScreen() {
  const { products, loadProducts } = useProducts();
  const { cart, cartTotal, cartItemCount, addToCart, removeFromCart, clearCart } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Reload products when screen gains focus
  // so stock counts are always current
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  // In-memory filter — keyboard stays up
  const filteredProducts = useMemo(() => {
    const available = products.filter((p) => !p.isDeleted);
    if (!searchQuery.trim()) return available;
    const q = searchQuery.toLowerCase();
    return available.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  // Get current quantity of a product in the cart
  const getCartQty = (productId) => {
    const item = cart.find((c) => c.id === productId);
    return item ? item.quantity : 0;
  };

  const handleProceedToCart = () => {
    if (cart.length === 0) return;
    router.push('/sales/cart');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Sale</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={clearCart} hitSlop={8}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductPickerRow
            product={item}
            quantityInCart={getCartQty(item.id)}
            onAdd={() => addToCart(item)}
            onRemove={() => removeFromCart(item.id)}
          />
        )}
        ListHeaderComponent={
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title={searchQuery ? 'No products found' : 'No products available'}
            subtitle={
              searchQuery
                ? `No match for "${searchQuery}"`
                : 'Add products in Inventory first'
            }
          />
        }
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky cart summary bar — only shows when cart has items */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={handleProceedToCart}
          activeOpacity={0.9}
        >
          {/* Item count badge */}
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>

          <Text style={styles.cartBarText}>Review Cart</Text>

          <View style={styles.cartBarRight}>
            <Text style={styles.cartTotal}>{formatCurrency(cartTotal)}</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}
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
  clearText: {
    fontSize: 15,
    color: Colors.danger,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Space for the sticky cart bar
    flexGrow: 1,
  },
  cartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cartBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  cartBarText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});