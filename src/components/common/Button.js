// src/components/common/Button.js
// The primary action button used throughout the app.
// Supports multiple visual variants and a loading state.

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';

/**
 * Button variants:
 *   'primary'   — green filled, main actions (Save, Confirm)
 *   'secondary' — outlined, secondary actions (Cancel, Edit)
 *   'danger'    — red filled, destructive actions (Delete)
 *   'ghost'     — no border/fill, subtle actions (Skip, Later)
 */
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,           // Optional: Ionicons element to show before text
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost'
            ? Colors.primary
            : '#FFFFFF'}
        />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,          // Large touch target — easy to tap on small screens
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: 8,
  },
  fullWidth: {
    width: '100%',
  },

  // Variant styles
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Variant text styles
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledText: {},

  text: {
    letterSpacing: 0.2,
  },
});