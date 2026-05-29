// src/screens/Dashboard/DashboardScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const InventoryScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Inventory — coming soon</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { fontSize: 16, color: Colors.textSecondary },
});