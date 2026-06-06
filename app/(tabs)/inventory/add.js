// app/(tabs)/inventory/add.js
// Fast product creation screen.
// Designed to be completed in under 20 seconds.
// Only name + price are required. Everything else is optional.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../../src/hooks/useProducts';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { Colors } from '../../../src/constants/colors';
import { useApp } from '../../../src/context/AppContext';

// Product categories — quick select chips
const CATEGORIES = [
  'Grocery', 'Beverages', 'Snacks', 'Dairy',
  'Personal Care', 'Household', 'Medicine', 'Other',
];

export default function AddProductScreen() {
  const { addProduct } = useProducts();
  const { showToast } = useApp();

  // Form state
  const [name, setName]           = useState('');
  const [price, setPrice]         = useState('');
  const [stock, setStock]         = useState('');
  const [category, setCategory]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState({});

  // Refs for keyboard navigation between fields
  const priceRef = useRef(null);
  const stockRef = useRef(null);

  // ---------- Validation ----------

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = 'Enter a valid price';
    }
    if (stock && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
      newErrors.stock = 'Stock must be a whole number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Submit ----------

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    const result = await addProduct({
      name:     name.trim(),
      price:    parseFloat(price),
      stock:    parseInt(stock) || 0,
      category: category || null,
    });
    setSaving(false);

    if (result.success) {
      showToast(`"${name.trim()}" added`, 'success');
      router.replace('/inventory');
    } else {
      showToast('Failed to save product', 'error');
    }
  };

  // Save and immediately start adding another product
  const handleSaveAndAddAnother = async () => {
    if (!validate()) return;

    setSaving(true);
    const result = await addProduct({
      name:     name.trim(),
      price:    parseFloat(price),
      stock:    parseInt(stock) || 0,
      category: category || null,
    });
    setSaving(false);

    if (result.success) {
      showToast(`"${name.trim()}" added`, 'success');
      // Reset form for next product
      setName('');
      setPrice('');
      setStock('');
      setCategory('');
      setErrors({});
    } else {
      showToast('Failed to save product', 'error');
    }
  };

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
          {/* Required fields section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>

           <Input
              label="Product Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rice 1kg, Surf Excel 500g"
              error={errors.name}
              autoFocus
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
              rightElement={
                <Text style={styles.unit}>৳</Text>
              }
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
              rightElement={
                <Text style={styles.unit}>pcs</Text>
              }
            />
          </View>

          {/* Category quick-select */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category (optional)</Text>
            <View style={styles.chips}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    category === cat && styles.chipSelected,
                  ]}
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

          {/* Action buttons */}
          <View style={styles.actions}>
            <Button
              title="Save Product"
              onPress={handleSave}
              loading={saving}
              fullWidth
            />
            <Button
              title="Save & Add Another"
              onPress={handleSaveAndAddAnother}
              variant="secondary"
              loading={saving}
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