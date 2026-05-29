// src/components/common/Input.js
// Reusable text input component with:
// - label
// - error handling
// - focus styling
// - optional right-side element
// - forwardRef support for keyboard navigation

import React, { useState, forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

// Main component
const InputComponent = (
  {
    label,
    value,
    onChangeText,
    placeholder,
    error,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines = 1,
    editable = true,
    style,
    inputStyle,
    rightElement,
    autoFocus = false,
    returnKeyType,
    onSubmitEditing,
  },
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          multiline && styles.inputMultiline,
        ]}
      >
        <TextInput
          ref={ref}
          style={[
            styles.input,
            multiline && styles.textMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Optional right-side element */}
        {rightElement && (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        )}
      </View>

      {/* Error text */}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

// Wrap component with forwardRef
export const Input = forwardRef(InputComponent);

// Helps debugging + fixes some Hermes weirdness
Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    minHeight: 52,
  },

  inputFocused: {
    borderColor: Colors.borderFocus,
  },

  inputError: {
    borderColor: Colors.danger,
  },

  inputDisabled: {
    backgroundColor: Colors.surfaceAlt,
    opacity: 0.7,
  },

  inputMultiline: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },

  textMultiline: {
    textAlignVertical: 'top',
  },

  rightElement: {
    marginLeft: 8,
  },

  error: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 2,
  },
});