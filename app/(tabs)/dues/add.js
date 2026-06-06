// app/(tabs)/dues/add.js
// Simple form to create a new customer.
// Only name is required — phone is optional.

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomers } from '../../../src/hooks/useCustomers';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { Colors } from '../../../src/constants/colors';
import { useApp } from '../../../src/context/AppContext';

export default function AddCustomerScreen() {
  const { addCustomer } = useCustomers();
  const { showToast }   = useApp();

  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [note,    setNote]    = useState('');
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Customer name is required';
    if (phone && !/^[\d\s\-+]{7,15}$/.test(phone.trim())) {
      e.phone = 'Enter a valid phone number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const result = await addCustomer({
      name:  name.trim(),
      phone: phone.trim() || null,
      note:  note.trim()  || null,
    });
    setSaving(false);

    if (result.success) {
      showToast(`${name.trim()} added`, 'success');
      router.replace('/dues');
    } else {
      showToast('Failed to add customer', 'error');
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
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>

            <Input
              label="Full Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rahim Mia"
              error={errors.name}
              autoFocus
            />

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 01712345678"
              keyboardType="phone-pad"
              error={errors.phone}
              autoCapitalize="none"
            />

            <Input
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="Any note about this customer"
              multiline
              numberOfLines={3}
            />
          </View>

          <Button
            title="Add Customer"
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
});