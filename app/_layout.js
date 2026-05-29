// app/_layout.js
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from '../src/database/migrations';
import { AppProvider, useApp } from '../src/context/AppContext';
import { Colors } from '../src/constants/colors';
import { Toast } from '../src/components/common/Toast';
import { useNetwork } from '../src/hooks/useNetwork';
import { runSync } from '../src/services/syncService';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    runMigrations()
      .then(() => setDbReady(true))
      .catch((err) => console.error('DB init failed:', err));
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppWithSync />
      </AppProvider>
    </SafeAreaProvider>
  );
}

// Separate component — needs AppContext for toast
const AppWithSync = () => {
  const { toast, showToast } = useApp();
  const { isConnected }      = useNetwork();

  // Trigger sync whenever we detect internet connection
  useEffect(() => {
    if (!isConnected) return;

    console.log('[App] Internet detected — starting sync');
    runSync().then(({ synced, failed }) => {
      if (synced > 0) {
        console.log(`[App] Synced ${synced} records`);
      }
    });
  }, [isConnected]);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});