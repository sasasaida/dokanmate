// src/navigation/TabNavigator.js
// Defines the five bottom tabs and the screen stacks inside each tab.
// Each tab has its own NativeStack so screens can be pushed independently.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

// --- Import all screens ---
// Dashboard
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';

// Inventory
import { InventoryScreen }   from '../screens/Inventory/InventoryScreen';
import { AddProductScreen }  from '../screens/Inventory/AddProductScreen';
import { EditProductScreen } from '../screens/Inventory/EditProductScreen';

// Sales
import { SalesScreen }       from '../screens/Sales/SalesScreen';
import { CartScreen }        from '../screens/Sales/CartScreen';
import { SaleSuccessScreen } from '../screens/Sales/SaleSuccessScreen';

// Dues
import { DuesScreen }            from '../screens/Dues/DuesScreen';
import { CustomerDetailScreen }  from '../screens/Dues/CustomerDetailScreen';
import { AddCustomerScreen }     from '../screens/Dues/AddCustomerScreen';

// Expenses
import { ExpensesScreen }    from '../screens/Expenses/ExpensesScreen';
import { AddExpenseScreen }  from '../screens/Expenses/AddExpenseScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Stack navigators for each tab ---
// Each wraps its screens in its own stack.

const DashboardStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen}
      options={{ title: 'Dashboard' }} />
  </Stack.Navigator>
);

const InventoryStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="InventoryMain" component={InventoryScreen}
      options={{ title: 'Inventory' }} />
    <Stack.Screen name="AddProduct" component={AddProductScreen}
      options={{ title: 'Add Product' }} />
    <Stack.Screen name="EditProduct" component={EditProductScreen}
      options={{ title: 'Edit Product' }} />
  </Stack.Navigator>
);

const SalesStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="SalesMain" component={SalesScreen}
      options={{ title: 'New Sale' }} />
    <Stack.Screen name="Cart" component={CartScreen}
      options={{ title: 'Cart' }} />
    <Stack.Screen name="SaleSuccess" component={SaleSuccessScreen}
      options={{ headerShown: false }} />
  </Stack.Navigator>
);

const DuesStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="DuesMain" component={DuesScreen}
      options={{ title: 'Dues & Credit' }} />
    <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen}
      options={{ title: 'Customer Ledger' }} />
    <Stack.Screen name="AddCustomer" component={AddCustomerScreen}
      options={{ title: 'Add Customer' }} />
  </Stack.Navigator>
);

const ExpensesStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen name="ExpensesMain" component={ExpensesScreen}
      options={{ title: 'Expenses' }} />
    <Stack.Screen name="AddExpense" component={AddExpenseScreen}
      options={{ title: 'Add Expense' }} />
  </Stack.Navigator>
);

// --- Tab bar icon helper ---
const tabIcon = (routeName, focused) => {
  const icons = {
    Dashboard: focused ? 'grid'         : 'grid-outline',
    Inventory: focused ? 'cube'         : 'cube-outline',
    Sales:     focused ? 'cart'         : 'cart-outline',
    Dues:      focused ? 'people'       : 'people-outline',
    Expenses:  focused ? 'wallet'       : 'wallet-outline',
  };
  return icons[routeName] || 'ellipse-outline';
};

// --- Shared stack header style ---
// Defined once, applied to every stack screen.
const stackScreenOptions = {
  headerStyle: {
    backgroundColor: Colors.surface,
  },
  headerTintColor: Colors.primary,
  headerTitleStyle: {
    fontWeight: '600',
    fontSize: 17,
    color: Colors.textPrimary,
  },
  // headerShadowVisible causes a type error on some Expo/RN versions.
  // Use elevation + borderBottomWidth instead — works on both platforms.
  headerElevation: 0,
  contentStyle: {
    backgroundColor: Colors.background,
  },
};

// --- Main Tab Navigator ---
export const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color }) => (
        <Ionicons
          name={tabIcon(route.name, focused)}
          size={24}
          color={color}
        />
      ),
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        paddingBottom: 6,
        paddingTop: 6,
        height: 62,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen name="Inventory" component={InventoryStack} />
    <Tab.Screen
      name="Sales"
      component={SalesStack}
      options={{ tabBarLabel: 'New Sale' }}
    />
    <Tab.Screen name="Dues" component={DuesStack} />
    <Tab.Screen name="Expenses" component={ExpensesStack} />
  </Tab.Navigator>
);