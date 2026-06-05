// app/settings.js
// Shop settings — view shop info, edit details.
// Accessible from the dashboard header.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getShopData, updateShop, clearShopData } from '../src/services/shopService';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { Colors } from '../src/constants/colors';
import { useApp } from '../src/context/AppContext';
import { clearDatabaseData } from '../src/database/db';

export default function SettingsScreen() {
  const { showToast } = useApp();

  const [shop,     setShop]     = useState(null);
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [address,  setAddress]  = useState('');
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    getShopData().then((data) => {
      if (data) {
        setShop(data);
        setName(data.name     ?? '');
        setPhone(data.phone   ?? '');
        setAddress(data.address ?? '');
      }
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateShop(shop.id, { name, phone, address });
      setShop((prev) => ({ ...prev, name, phone, address }));
      setEditing(false);
      showToast('Shop details updated', 'success');
    } catch (err) {
      showToast('Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset App Data',
      'This will clear your shop registration from this device. Your synced data in the cloud will be safe.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearShopData();
            router.replace('/register');
          },
        },
      ]
    );
  };

  if (!shop) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Settings</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)} hitSlop={10}>
          <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Shop ID card */}
        <View style={styles.idCard}>
          <View style={styles.idCardLeft}>
            <View style={styles.logoBox}>
              <Ionicons name="storefront-outline" size={28} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.shopId} numberOfLines={1}>
                ID: {shop.id?.slice(0, 8)}...
              </Text>
            </View>
          </View>
          <View style={styles.syncBadge}>
            <Ionicons name="cloud-done-outline" size={14} color={Colors.success} />
            <Text style={styles.syncBadgeText}>Backed up</Text>
          </View>
        </View>

        {/* Shop details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Details</Text>

          {editing ? (
            <>
              <Input
                label="Shop Name *"
                value={name}
                onChangeText={setName}
                placeholder="Shop name"
                autoFocus
              />
              <Input
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="Owner phone"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
              <Input
                label="Address"
                value={address}
                onChangeText={setAddress}
                placeholder="Shop address"
                multiline
                numberOfLines={2}
              />
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={saving}
                fullWidth
              />
            </>
          ) : (
            <>
              <InfoRow label="Shop Name" value={shop.name} />
              <InfoRow label="Phone"    value={shop.phone   || 'Not set'} />
              <InfoRow label="Address"  value={shop.address || 'Not set'} />
              <InfoRow
                label="Registered"
                value={new Date(shop.createdAt).toLocaleDateString('en-BD', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              />
            </>
          )}
        </View>

        {/* Danger zone */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, { color: Colors.danger }]}>
            Danger Zone
          </Text>
          <Text style={styles.dangerNote}>
            Resetting clears your registration from this device only.
            Your backed-up data in the cloud remains safe.
          </Text>
          <Button
            title="Reset Device Registration"
            onPress={handleReset}
            variant="danger"
            fullWidth
            style={{ marginTop: 12 }}
          />
          <Button
            title="Clear Local Data"
            onPress={async () => {
              await clearDatabaseData();
            }}
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Simple read-only info row
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  editBtn: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  idCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  idCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  shopId: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  dangerSection: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF8F8',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  dangerNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});