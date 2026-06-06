// app/(tabs)/inventory/[id].js
// Edit an existing product.
// [id] is a dynamic route — expo-router passes it via useLocalSearchParams().
// Pre-fills all fields with current product data.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductById } from '../../../src/database/queries/products';
import { useProducts } from '../../../src/hooks/useProducts';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { Colors } from '../../../src/constants/colors';
import { useApp } from '../../../src/context/AppContext';

const CATEGORIES = [
  'Grocery', 'Beverages', 'Snacks', 'Dairy',
  'Personal Care', 'Household', 'Medicine', 'Other',
];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const { editProduct, removeProduct } = useProducts();
  const { showToast } = useApp();

  const [product, setProduct]   = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Form fields
  const [name, setName]         = useState('');
  const [price, setPrice]       = useState('');
  const [stock, setStock]       = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  const priceRef = useRef(null);
  const stockRef = useRef(null);

  // Load product data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setName(data.name);
          setPrice(String(data.price));
          setStock(String(data.stock));
          setCategory(data.category || '');
        }
      } catch (err) {
        console.error('Failed to load product:', err);
        showToast('Failed to load product', 'error');
        router.replace('/inventory');
      } finally {
        setLoadingProduct(false);
      }
    };
    load();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = 'Enter a valid price';
    }
    if (stock && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
      newErrors.stock = 'Stock must be a whole number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    const result = await editProduct(id, {
      name:     name.trim(),
      price:    parseFloat(price),
      stock:    parseInt(stock) || 0,
      category: category || null,
    });
    setSaving(false);

    if (result.success) {
      showToast('Product updated', 'success');
      router.replace('/inventory');
    } else {
      showToast('Failed to update product', 'error');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Remove "${product?.name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await removeProduct(id);
            if (result.success) {
              showToast('Product deleted', 'success');
              router.replace('/inventory');
            } else {
              showToast('Failed to delete', 'error');
            }
          },
        },
      ]
    );
  };

  if (loadingProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            <Input
              label="Product Name *"
              value={name}
              onChangeText={setName}
              placeholder="Product name"
              error={errors.name}
              returnKeyType="next"
              onSubmitEditing={() => priceRef.current?.focus()}
            />

            <Input
              ref={priceRef}
              label="Selling Price (৳) *"
              value={price}
              onChangeText={setPrice}
              placeholder="0"
              keyboardType="decimal-pad"
              error={errors.price}
              returnKeyType="next"
              onSubmitEditing={() => stockRef.current?.focus()}
              rightElement={<Text style={styles.unit}>৳</Text>}
            />

            <Input
              ref={stockRef}
              label="Current Stock"
              value={stock}
              onChangeText={setStock}
              placeholder="0"
              keyboardType="number-pad"
              error={errors.stock}
              returnKeyType="done"
              rightElement={<Text style={styles.unit}>pcs</Text>}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category (optional)</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipSelected]}
                  onPress={() => setCategory(category === cat ? '' : cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              fullWidth
            />
            <Button
              title="Delete Product"
              onPress={handleDelete}
              variant="danger"
              fullWidth
              style={{ marginTop: 10 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
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
    marginBottom: 14,
  },
  unit: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
  },
});