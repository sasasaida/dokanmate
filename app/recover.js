// app/recover.js
// Data recovery screen — for reinstall or new phone.
// Enter phone + PIN → get JWT + shopId back from server.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { recoverAccount, saveToken } from '../src/services/authService';
import { getShopData } from '../src/services/shopService';
import { restoreShopBackup } from '../src/services/restoreService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { Colors } from '../src/constants/colors';

export default function RecoverScreen() {
  const [phone,   setPhone]   = useState('');
  const [pin,     setPin]     = useState('');
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const pinRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!phone.trim()) e.phone = 'Enter your registered phone number';
    if (!pin)          e.pin   = 'Enter your 4-digit PIN';
    else if (!/^\d{4}$/.test(pin)) e.pin = 'PIN must be 4 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRecover = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      // Call backend — verify phone + PIN, get JWT + shopId
      const result = await recoverAccount({
        phone: phone.trim(),
        pin,
      });

      // Save JWT for sync
      await saveToken(result.token);

      // Ensure the recovered shop identity is persisted locally.
      const existing = await getShopData();
      if (!existing || existing.id !== result.shop.id) {
        await AsyncStorage.setItem('@dokanmate_shop_id', result.shop.id);
      }

      await AsyncStorage.setItem(
        '@dokanmate_shop_data',
        JSON.stringify({
          id:        result.shop.id,
          name:      result.shop.name,
          phone:     result.shop.phone,
          address:   result.shop.address,
          pin,
          createdAt: new Date().toISOString(),
        })
      );

      const restoreResult = await restoreShopBackup({
        shop: result.shop,
        data: {
          products: result.products ?? [],
          customers: result.customers ?? [],
          sales: result.sales ?? [],
          transactions: result.transactions ?? [],
          expenses: result.expenses ?? [],
        },
        pin,
      });

      let message;
      if (restoreResult.status === 'local') {
        message = 'Local shop data already exists on this device. No restore needed.';
      } else if (restoreResult.status === 'restored') {
        message = `Backup data was found and restored from the server. Your shop is ready to use.`;
      } else {
        message = 'No local or backup data exists for this shop yet. You can start adding records now.';
      }

      Alert.alert(
        'Account Recovered ✓',
        `Welcome back, ${result.shop.name}!\n\n${message}`,
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      );

    } catch (err) {
      const message =
        err.response?.data?.error ||
        'Recovery failed. Check your phone number and PIN.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="refresh-circle-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Recover Your Data</Text>
            <Text style={styles.subtitle}>
              Enter your registered phone number and PIN to restore your shop data.
            </Text>
          </View>

          <View style={styles.card}>
            <Input
              label="Registered Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 01712345678"
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={errors.phone}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => pinRef.current?.focus()}
            />

            <Input
              ref={pinRef}
              label="4-Digit PIN"
              value={pin}
              onChangeText={(v) => {
                if (/^\d{0,4}$/.test(v)) setPin(v);
              }}
              placeholder="Your recovery PIN"
              keyboardType="number-pad"
              secureTextEntry
              error={errors.pin}
              returnKeyType="done"
              onSubmitEditing={handleRecover}
            />

            {errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}

            <Button
              title="Recover My Data"
              onPress={handleRecover}
              loading={loading}
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={Colors.info}
            />
            <Text style={styles.infoText}>
              Your synced data will be restored automatically after recovery.
              Data that was never synced cannot be recovered.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll:    { padding: 24, paddingBottom: 40 },
  header:    { alignItems: 'center', marginBottom: 28, marginTop: 16 },
  iconBox: {
    width: 88, height: 88, borderRadius: 22,
    backgroundColor: '#E3F2FD', justifyContent: 'center',
    alignItems: 'center', marginBottom: 14,
  },
  title:    { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    padding: 20, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: Colors.danger, marginBottom: 8, textAlign: 'center' },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#E3F2FD', borderRadius: 10,
    padding: 14, borderWidth: 1, borderColor: '#BBDEFB',
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.info, lineHeight: 19 },
});