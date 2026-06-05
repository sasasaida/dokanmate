// app/(tabs)/sales/cart.js
// Review cart, select payment method, confirm sale.
// This is where the sale is actually written to the database.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../src/context/AppContext';
import { CartItem } from '../../../src/components/sales/CartItem';
import { Button } from '../../../src/components/common/Button';
import { Input } from '../../../src/components/common/Input';
import { SearchBar } from '../../../src/components/common/SearchBar';
import { useCustomers } from '../../../src/hooks/useCustomers';
import { Colors } from '../../../src/constants/colors';
import { formatCurrency } from '../../../src/utils/formatters';
import { createSale } from '../../../src/database/queries/sales';

// Payment method options
const PAYMENT_METHODS = [
  { id: 'cash',   label: 'Cash',   icon: 'cash-outline',          color: Colors.cash  },
  { id: 'bkash',  label: 'bKash',  icon: 'phone-portrait-outline', color: Colors.bkash },
  { id: 'nagad',  label: 'Nagad',  icon: 'phone-portrait-outline', color: Colors.nagad },
  { id: 'due',    label: 'Due',    icon: 'calendar-outline',       color: Colors.danger },
];

export default function CartScreen() {
  const { cart, cartTotal, addToCart, removeFromCart, clearCart, showToast } = useApp();
  const { customers, loadCustomers } = useCustomers();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [saleNote, setSaleNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const query = customerSearch.toLowerCase();
    return customers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(query);
      const phoneMatch = customer.phone ? customer.phone.includes(customerSearch.trim()) : false;
      return nameMatch || phoneMatch;
    });
  }, [customers, customerSearch]);

  const saleSummary = useMemo(() => {
    return cart
      .map((item) => `${item.name} x${item.quantity} (${formatCurrency(item.price * item.quantity)})`)
      .join(', ');
  }, [cart]);

  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerPickerVisible(false);
    setCustomerSearch('');
  }, []);

  const handleConfirmSale = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'due' && !selectedCustomerId) {
      showToast('Select a customer for due sales', 'error');
      return;
    }

    setSaving(true);
    try {
        const itemCount = cart.length;
        const noteParts = [];
        if (saleNote.trim()) {
          noteParts.push(saleNote.trim());
        }
        if (saleSummary) {
          noteParts.push(`Items: ${saleSummary}`);
        }
        const finalNote = noteParts.join(' | ');
        const { totalAmount } = await createSale({
            cartItems: cart,
            paymentMethod,
            customerId: paymentMethod === 'due' ? selectedCustomerId : null,
            note: finalNote,
        });

            // clear cart FIRST (but safely separated)
            clearCart();
            setSaleNote('');
            setSelectedCustomerId(null);

            // defer navigation to next tick
            setTimeout(() => {
            router.replace({
                pathname: '/sales/success',
                params: {
                totalAmount: totalAmount.toString(),
                paymentMethod,
                itemCount: itemCount.toString(),
                customerName: selectedCustomer?.name ?? '',
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

  const openCustomerPicker = () => {
    setCustomerPickerVisible(true);
  };

  const closeCustomerPicker = () => {
    setCustomerPickerVisible(false);
    setCustomerSearch('');
  };

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

        {paymentMethod === 'due' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <TouchableOpacity
              style={styles.customerPicker}
              onPress={openCustomerPicker}
              activeOpacity={0.8}
            >
              <View style={styles.customerPickerLeft}>
                <Ionicons name="person-outline" size={20} color={Colors.textMuted} />
                <View style={styles.customerPickerText}>
                  <Text style={styles.customerPickerLabel}>Select customer</Text>
                  <Text style={styles.customerPickerValue} numberOfLines={1}>
                    {selectedCustomer ? selectedCustomer.name : 'Tap to choose who owes this amount'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sale Note</Text>
          <Input
            value={saleNote}
            onChangeText={setSaleNote}
            placeholder="Optional reference or reminder"
            multiline
            numberOfLines={3}
            style={{ marginBottom: 0 }}
          />
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
          title={paymentMethod === 'due' ? `Record Due · ${formatCurrency(cartTotal)}` : `Confirm Sale · ${formatCurrency(cartTotal)}`}
          onPress={handleConfirmSale}
          loading={saving}
          fullWidth
        />
      </View>

      <Modal
        visible={customerPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCustomerPicker}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeCustomerPicker}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.handleBar} />
            <Text style={styles.modalTitle}>Select Customer</Text>
            <SearchBar
              value={customerSearch}
              onChangeText={setCustomerSearch}
              placeholder="Search customers..."
              autoFocus
            />
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedCustomerId;
                return (
                  <TouchableOpacity
                    style={[styles.customerRow, isSelected && styles.customerRowSelected]}
                    onPress={() => handleSelectCustomer(item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.customerAvatar}>
                      <Text style={styles.customerAvatarText}>
                        {item.name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.customerRowText}>
                      <Text style={styles.customerRowName}>{item.name}</Text>
                      <Text style={styles.customerRowMeta}>
                        {item.phone ? `${item.phone} · ` : ''}{formatCurrency(item.totalDue)} due
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyCustomers}>
                  <Text style={styles.emptyCustomersText}>No customers found</Text>
                </View>
              }
              contentContainerStyle={styles.customerList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  customerPicker: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  customerPickerText: {
    flex: 1,
  },
  customerPickerLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  customerPickerValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  customerList: {
    paddingBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  customerRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customerAvatarText: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  customerRowText: {
    flex: 1,
  },
  customerRowName: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  customerRowMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyCustomers: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyCustomersText: {
    color: Colors.textMuted,
  },
});