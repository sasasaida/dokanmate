// app/_layout.js
// Root of the entire app.
// Initializes the database, wraps everything in providers.

import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toast } from "../src/components/common/Toast";
import { Colors } from "../src/constants/colors";
import { AppProvider, useApp } from "../src/context/AppContext";
import { runMigrations } from "../src/database/migrations";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    runMigrations()
      .then(() => setDbReady(true))
      .catch((err) => console.error("DB init failed:", err));
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
        <AppWithToast />
      </AppProvider>
    </SafeAreaProvider>
  );
}

// Separate component so it can access AppContext for toast
const AppWithToast = () => {
  const { toast } = useApp();
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
