// app/(tabs)/_layout.js
// Defines the bottom tab bar.
// Each tab automatically maps to a file in this folder.

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";

const tabIcon =
  (name) =>
  ({ color, size }) => <Ionicons name={name} size={24} color={color} />;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: insets.bottom -50,
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom:  + insets.bottom,
          paddingTop: 6,
          height: 62 + insets.bottom,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: tabIcon("grid-outline"),
        }}
      />
      
      <Tabs.Screen
        name="inventory/index"
        options={{
          title: "Inventory",
          tabBarIcon: tabIcon("cube-outline"),
        }}
      />
      <Tabs.Screen
        name="inventory/add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="inventory/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="sales/index"
        options={{
          title: "New Sale",
          tabBarIcon: tabIcon("cart-outline"),
        }}
      />
      <Tabs.Screen
        name="sales/cart"
        options={{ href: null }} // Hides from tab bar
      />
      <Tabs.Screen
        name="sales/success"
        options={{ href: null }} // Hides from tab bar
      />
      <Tabs.Screen
        name="sales/[id]"
        options={{ href: null }} // Hides from tab bar
      />

      <Tabs.Screen
        name="dues/index"
        options={{
          title: "Dues",
          tabBarIcon: tabIcon("people-outline"),
        }}
      />
      <Tabs.Screen
        name="dues/add"
        options={{ href: null }} // Hides from tab bar
      />
      <Tabs.Screen
        name="dues/[id]"
        options={{ href: null }} // Hides from tab bar
      />

      <Tabs.Screen
        name="expenses/index"
        options={{
          title: "Expenses",
          tabBarIcon: tabIcon("wallet-outline"),
        }}
      />
      <Tabs.Screen
        name="expenses/add"
        options={{ href: null }} // Hides from tab bar
      />
    </Tabs>
  );
}
