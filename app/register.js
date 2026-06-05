// app/register.js
// Registration — collects shop details + 4-digit PIN.
// PIN is used for account recovery if phone is lost.
// Registers locally first, then with backend.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { registerShop, getShopId, clearShopData } from '../src/services/shopService';
import { registerWithBackend, saveToken } from '../src/services/authService';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { Colors } from '../src/constants/colors';
import { clearDatabaseData } from '../src/database/db';

export default function RegisterScreen() {
  const [shopName,   setShopName]   = useState('');
  const [phone,      setPhone]      = useState('');
  const [address,    setAddress]    = useState('');
  const [pin,        setPin]        = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving,     setSaving]     = useState(false);
  const [errors,     setErrors]     = useState({});

  const phoneRef      = useRef(null);
  const pinRef        = useRef(null);
  const confirmPinRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!shopName.trim()) e.shopName = 'Shop name is required';
    if (!phone.trim())    e.phone    = 'Phone number is required';
    else if (!/^[\d\s\-+]{7,15}$/.test(phone.trim())) {
      e.phone = 'Enter a valid phone number';
    }
    if (!pin)             e.pin = 'PIN is required for account recovery';
    else if (!/^\d{4}$/.test(pin)) e.pin = 'PIN must be exactly 4 digits';
    if (pin && confirmPin !== pin) e.confirmPin = 'PINs do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      // Step 1 — Save locally first (offline-first principle)
      const localShop = await registerShop({
        name:    shopName.trim(),
        phone:   phone.trim(),
        address: address.trim() || null,
        pin,
      });

      // Step 2 — Try to register with backend
      // If no internet, skip — sync will handle it later
      try {
        const result = await registerWithBackend({
          shopId:   localShop.id,
          phone:    phone.trim(),
          shopName: shopName.trim(),
          address:  address.trim() || null,
          pin,
        });
        // Save JWT for future sync requests
        await saveToken(result.token);
      } catch (backendErr) {
        if (backendErr.response?.status === 409) {
          //await clearShopData();
          //await clearDatabaseData();
          setErrors({ general: 'This phone number is already registered.' });
          return;
        }

        // Backend unavailable — that's fine
        // App works fully offline, JWT will be obtained on next sync
        console.log('[Register] Backend unavailable — continuing offline');
      }

      router.replace('/(tabs)');

    } catch (err) {
      console.error('Registration failed:', err);
      setErrors({ general: 'Failed to register. Please try again.' });
    } finally {
      setSaving(false);
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Ionicons name="storefront-outline" size={44} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>DokanMate</Text>
            <Text style={styles.tagline}>
              Set up your shop — takes less than a minute
            </Text>
          </View>

          {/* Shop details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shop Information</Text>

            <Input
              label="Shop Name *"
              value={shopName}
              onChangeText={setShopName}
              placeholder="e.g. Rahim General Store"
              error={errors.shopName}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <Input
              ref={phoneRef}
              label="Owner Phone *"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 01712345678"
              keyboardType="phone-pad"
              error={errors.phone}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => pinRef.current?.focus()}
            />
            <Input
              label="Address (optional)"
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. Mirpur-10, Dhaka"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* PIN setup */}
          <View style={styles.card}>
            <View style={styles.pinHeader}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Recovery PIN</Text>
            </View>
            <Text style={styles.pinNote}>
              Remember this PIN. You'll need it to recover your data
              if you reinstall the app or change your phone.
            </Text>

            <Input
              ref={pinRef}
              label="4-Digit PIN *"
              value={pin}
              onChangeText={(v) => {
                if (/^\d{0,4}$/.test(v)) setPin(v);
              }}
              placeholder="e.g. 1234"
              keyboardType="number-pad"
              secureTextEntry
              error={errors.pin}
              returnKeyType="next"
              onSubmitEditing={() => confirmPinRef.current?.focus()}
            />
            <Input
              ref={confirmPinRef}
              label="Confirm PIN *"
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="Re-enter PIN"
              keyboardType="number-pad"
              secureTextEntry
              error={errors.confirmPin}
              returnKeyType="done"
            />
          </View>

          {/* Warning box */}
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <Text style={styles.warningText}>
              If you forget your PIN, your data cannot be recovered.
              Write it down somewhere safe.
            </Text>
          </View>

          {errors.general && (
            <Text style={styles.errorText}>{errors.general}</Text>
          )}

          <Button
            title="Create My Shop"
            onPress={handleRegister}
            loading={saving}
            fullWidth
          />

          <TouchableOpacity
            style={styles.recoverLink}
            onPress={() => router.push('/recover')}
            >
            <Text style={styles.recoverLinkText}>
                Already registered? Recover your data →
            </Text>
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background },
  scroll:     { padding: 24, paddingBottom: 40 },
  header:     { alignItems: 'center', marginBottom: 28, marginTop: 16 },
  logoBox: {
    width: 88, height: 88, borderRadius: 22,
    backgroundColor: '#E8F5E9', justifyContent: 'center',
    alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  appName:  { fontSize: 30, fontWeight: '800', color: Colors.primary, marginBottom: 6 },
  tagline:  { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    padding: 20, marginBottom: 16,
  },
  cardTitle:  { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  pinHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pinNote: {
    fontSize: 13, color: Colors.textMuted,
    lineHeight: 19, marginBottom: 16,
  },
  warningBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#FFF8E1', borderRadius: 10, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: '#FFE082',
  },
  warningText: { flex: 1, fontSize: 13, color: Colors.warning, lineHeight: 19 },
  errorText:   { fontSize: 13, color: Colors.danger, textAlign: 'center', marginBottom: 12 },

  recoverLink: {
    alignItems: 'center',
    paddingVertical: 16,
    },
  recoverLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    },
});