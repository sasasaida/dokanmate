// app/_layout.js
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from '../src/database/migrations';
import { AppProvider, useApp } from '../src/context/AppContext';
import { Colors } from '../src/constants/colors';
import { Toast } from '../src/components/common/Toast';
import { useNetwork } from '../src/hooks/useNetwork';
import { runSync } from '../src/services/syncService';
import { getShopId } from '../src/services/shopService';
import { loadToken } from '../src/services/authService';

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        await runMigrations();

        if (isMounted) {
          setAppReady(true);
        }

        // Load token into axios headers if it exists
        await loadToken();

        const shopId = await getShopId();

        if (isMounted) {
          if (shopId) {
            router.replace('/(tabs)');
          } else {
            router.replace('/register');
          }
        }
      } catch (err) {
        console.error('Init failed:', err);
        if (isMounted) {
          setAppReady(true);
        }
        router.replace('/register');
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!appReady) {
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

const AppWithSync = () => {
  const { toast }       = useApp();
  const { isConnected } = useNetwork();

  useEffect(() => {
    if (!isConnected) return;
    runSync().catch(() => {});
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