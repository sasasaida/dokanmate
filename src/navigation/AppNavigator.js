// src/navigation/AppNavigator.js
// Root navigator — wraps the entire app.
// Also handles the global toast notification overlay.

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';

export const AppNavigator = () => {
  const { toast } = useApp();

  return (
    <NavigationContainer>
      {/* Toast sits on top of everything, outside the navigator */}
      {toast && <Toast message={toast.message} type={toast.type} />}
      <TabNavigator />
    </NavigationContainer>
  );
};

// Simple toast notification — shows for 3 seconds then disappears.
// We manage its lifecycle in AppContext via showToast().
const Toast = ({ message, type }) => {
  const backgroundColor =
    type === 'error' ? Colors.danger :
    type === 'info'  ? Colors.info   :
    Colors.success;

  return (
    <View style={[styles.toast, { backgroundColor }]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 10,
    zIndex: 9999,
    elevation: 10, // Android shadow
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});