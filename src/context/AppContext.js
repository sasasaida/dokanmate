// src/context/AppContext.js
// Global state shared across all screens.
// Keep this LEAN — only truly global state lives here.
// Screen-specific state stays inside the screen component.

import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Cart state — shared between Sales screen and Cart screen
  const [cart, setCart] = useState([]);

  // Global notification/toast state
  const [toast, setToast] = useState(null);

  /**
   * Add a product to the cart, or increase quantity if already there.
   */
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  /**
   * Remove one unit from a cart item. Remove item entirely if quantity reaches 0.
   */
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  /**
   * Clear the entire cart after a sale is confirmed.
   */
  const clearCart = () => setCart([]);

  /**
   * Show a brief toast message.
   * type: 'success' | 'error' | 'info'
   */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        cart,
        cartTotal,
        cartItemCount,
        addToCart,
        removeFromCart,
        clearCart,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/**
 * Custom hook — use this instead of useContext(AppContext) everywhere.
 * Gives a clear error if used outside the provider.
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};