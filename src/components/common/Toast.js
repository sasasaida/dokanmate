// src/components/common/Toast.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const Toast = ({ message, type }) => {
  const backgroundColor =
    type === 'error' ? Colors.danger :
    type === 'info'  ? Colors.info   :
    Colors.success;

  return (
    <View style={[styles.toast, { backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
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
    elevation: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
  },
});