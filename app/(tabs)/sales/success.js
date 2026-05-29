// app/(tabs)/sales/success.js
// Shown after a sale is confirmed.
// Full screen — no header. Positive reinforcement for the shopkeeper.
// Auto-navigates back to sales after 3 seconds, or manual tap.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../src/constants/colors';
import { formatCurrency } from '../../../src/utils/formatters';

export default function SaleSuccessScreen() {
  const { totalAmount, paymentMethod, itemCount } = useLocalSearchParams();

  // Auto-return to sales screen after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/sales');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const paymentLabel =
    paymentMethod === 'bkash' ? 'bKash' :
    paymentMethod === 'nagad' ? 'Nagad' : 'Cash';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={56} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Sale Complete!</Text>
        <Text style={styles.amount}>{formatCurrency(parseFloat(totalAmount))}</Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items</Text>
            <Text style={styles.detailValue}>{itemCount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{paymentLabel}</Text>
          </View>
        </View>

        <Text style={styles.hint}>Returning to sales in 3s...</Text>

        <TouchableOpacity
          style={styles.newSaleBtn}
          onPress={() => router.replace('/sales')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.newSaleText}>New Sale Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  amount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  details: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 24,
  },
  newSaleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  newSaleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});