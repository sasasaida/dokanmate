// app/(tabs)/sales/[id].js

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSaleFullDetails } from '../../../src/database/queries/saleDetails';
import { formatCurrency } from '../../../src/utils/formatters';

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams();

  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const data = await getSaleFullDetails(id);

      setSale(data);
      setItems(data?.items || []);

      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text>Sale not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, padding: 16 }}>

        <FlatList
            data={items}
            keyExtractor={(item) => item.id || item._id}
            ListHeaderComponent={
                <View style={styles.header}>
                <Text style={styles.title}>Invoice</Text>

                <Text style={styles.total}>
                    Total: {formatCurrency(sale.totalAmount)}
                </Text>

                <Text style={styles.meta}>
                    Items: {items.length}
                </Text>
                </View>
            }
            renderItem={({ item }) => {
                const lineTotal = item.quantity * item.unitPrice;

                return (
                <View style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.productName}</Text>

                    <Text style={styles.sub}>
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                    </Text>
                    </View>

                    <Text style={styles.lineTotal}>
                    {formatCurrency(lineTotal)}
                    </Text>
                </View>
                );
            }}
            />
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },

  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },

  total: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },

  meta: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },

  sub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  lineTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
});