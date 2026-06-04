// src/services/authService.js
// Manages JWT token storage and auth API calls.

import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const TOKEN_KEY = '@dokanmate_token';

// ── Token management ───────────────────────────────────────

export const saveToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  // Attach to all future axios requests automatically
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  delete client.defaults.headers.common['Authorization'];
};

/**
 * Called on app start — restores token into axios headers.
 * Returns token or null.
 */
export const loadToken = async () => {
  const token = await getToken();
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return token;
};

// ── API calls ──────────────────────────────────────────────

/**
 * Register new shop on the backend.
 * Called once after local registration.
 */
export const registerWithBackend = async ({
  shopId, phone, shopName, address, pin,
}) => {
  const response = await client.post('/auth/register', {
    shopId, phone, shopName, address, pin,
  });
  return response.data;
};

/**
 * Recover account using phone + PIN.
 * Returns JWT + shopId from the server.
 */
export const recoverAccount = async ({ phone, pin }) => {
  const response = await client.post('/auth/recover', { phone, pin });
  return response.data;
};

/**
 * Change PIN.
 */
export const changePinAPI = async ({ phone, currentPin, newPin }) => {
  const response = await client.post('/auth/change-pin', {
    phone, currentPin, newPin,
  });
  return response.data;
};