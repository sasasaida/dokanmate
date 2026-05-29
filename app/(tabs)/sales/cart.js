// app/(tabs)/sales/cart.js
// Review cart, select payment method, confirm sale.
// This is where the sale is actually written to the database.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../src/context/AppContext';
import { CartItem } from '../../../src/components/sales/CartItem';
import { Button } from '../../../src/components/common/Button';
import { Colors } from '../../../src/constants/colors';
import { formatCurrency } from '../../../src/utils/formatters';
import { createSale } from '../../../src/database/queries/sales';

// Payment method options
const PAYMENT_METHODS = [
  { id: 'cash',   label: 'Cash',   icon: 'cash-outline',          color: Colors.cash  },
  { id: 'bkash',  label: 'bKash',  icon: 'phone-portrait-outline', color: Colors.bkash },
  { id: 'nagad',  label: 'Nagad',  icon: 'phone-portrait-outline', color: Colors.nagad },
];

export default function CartScreen() {
  const { cart, cartTotal, addToCart, removeFromCart, clearCart } = useApp();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [saving, setSaving] = useState(false);

  const handleConfirmSale = async () => {
    if (cart.length === 0) return;

    setSaving(true);
    try {
        const itemCount = cart.length;
        const { saleId, totalAmount } = await createSale({
            cartItems: cart,
            paymentMethod,
            customerId: null,
            note: null,
        });

            // clear cart FIRST (but safely separated)
            clearCart();

            // defer navigation to next tick
            setTimeout(() => {
            router.replace({
                pathname: '/sales/success',
                params: {
                totalAmount: totalAmount.toString(),
                paymentMethod,
                itemCount: itemCount.toString(),
                },
            });
            }, 0);
    } catch (err) {
      console.error('Failed to save sale:', err);
      setSaving(false);
    }
  };

  useEffect(() => {
        if (cart.length === 0) {
            router.replace('/sales'); // go back to product selection if cart is empty
        }
    }, [cart.length]);

    if (cart.length === 0) {
        return null;
    }
    
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({cart.length})</Text>
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onIncrease={() => addToCart(item)}
              onDecrease={() => removeFromCart(item.id)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentBtn,
                  paymentMethod === method.id && {
                    borderColor: method.color,
                    backgroundColor: `${method.color}15`,
                  },
                ]}
                onPress={() => setPaymentMethod(method.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={method.icon}
                  size={22}
                  color={paymentMethod === method.id ? method.color : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === method.id && { color: method.color, fontWeight: '700' },
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cartTotal)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(cartTotal)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm button — fixed at bottom */}
      <View style={styles.footer}>
        <Button
          title={`Confirm Sale · ${formatCurrency(cartTotal)}`}
          onPress={handleConfirmSale}
          loading={saving}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 6,
  },
  paymentLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});