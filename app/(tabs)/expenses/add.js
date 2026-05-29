// app/(tabs)/expenses/add.js
// Handles both add and edit.
// If expenseId param is present → edit mode, prefill fields.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenses } from '../../../src/hooks/useExpenses';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { Colors } from '../../../src/constants/colors';
import { useApp } from '../../../src/context/AppContext';

const CATEGORIES = [
  { id: 'rent',           label: 'Rent'           },
  { id: 'utility',        label: 'Utility'        },
  { id: 'stock purchase', label: 'Stock Purchase' },
  { id: 'salary',         label: 'Salary'         },
  { id: 'transport',      label: 'Transport'      },
  { id: 'maintenance',    label: 'Maintenance'    },
  { id: 'miscellaneous',  label: 'Miscellaneous'  },
];

// Format Date object to "YYYY-MM-DD" for storage
const toDateString = (date) => date.toISOString().split('T')[0];

// Format "YYYY-MM-DD" to display string
const toDisplayDate = (str) => {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export default function AddExpenseScreen() {
  const { expenseId } = useLocalSearchParams();
  const isEdit        = !!expenseId;

  const { expenses, addExpense, editExpense } = useExpenses();
  const { showToast } = useApp();

  const [category, setCategory] = useState('miscellaneous');
  const [amount,   setAmount]   = useState('');
  const [note,     setNote]     = useState('');
  const [date,     setDate]     = useState(toDateString(new Date()));
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(isEdit);

  // Prefill if editing
  useEffect(() => {
    if (!isEdit) return;
    const existing = expenses.find((e) => e.id === expenseId);
    if (existing) {
      setCategory(existing.category);
      setAmount(String(existing.amount));
      setNote(existing.note ?? '');
      setDate(existing.date);
      setLoading(false);
    }
  }, [isEdit, expenseId, expenses]);

  const validate = () => {
    const e = {};
    if (!category)  e.category = 'Select a category';
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      e.amount = 'Enter a valid amount';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const data = {
      category,
      amount: parseFloat(amount),
      note:   note.trim() || null,
      date,
    };

    const result = isEdit
      ? await editExpense(expenseId, data)
      : await addExpense(data);

    setSaving(false);

    if (result.success) {
      showToast(isEdit ? 'Expense updated' : 'Expense added', 'success');
      router.replace('/expenses');
    } else {
      showToast('Failed to save expense', 'error');
    }
  };

  // Quick date selection buttons
  const dateOptions = [
    { label: 'Today',     value: toDateString(new Date()) },
    { label: 'Yesterday', value: (() => {
        const d = new Date(); d.setDate(d.getDate() - 1); return toDateString(d);
      })() },
  ];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category *</Text>
            {errors.category && (
              <Text style={styles.fieldError}>{errors.category}</Text>
            )}
            <View style={styles.chips}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    category === cat.id && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setCategory(cat.id);
                    setErrors((e) => ({ ...e, category: undefined }));
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat.id && styles.chipTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount & Details</Text>

            <Input
              label="Amount (৳) *"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              keyboardType="decimal-pad"
              error={errors.amount}
              autoFocus={!isEdit}
              rightElement={<Text style={styles.unit}>৳</Text>}
            />

            <Input
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="What was this expense for?"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <View style={styles.dateRow}>
              {dateOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.dateChip,
                    date === opt.value && styles.dateChipActive,
                  ]}
                  onPress={() => setDate(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateChipText,
                      date === opt.value && styles.dateChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectedDate}>
              Selected: {toDisplayDate(date)}
            </Text>
          </View>

          <Button
            title={isEdit ? 'Save Changes' : 'Add Expense'}
            onPress={handleSave}
            loading={saving}
            fullWidth
          />
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
  loading: {
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
    marginBottom: 12,
  },
  fieldError: {
    fontSize: 12,
    color: Colors.danger,
    marginBottom: 8,
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
    fontWeight: '700',
  },
  unit: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dateChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  dateChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E8F5E9',
  },
  dateChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dateChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  selectedDate: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});