// src/hooks/useProducts.js
// Manages all product state for the inventory and sales screens.
// Screens import this hook — they never touch the database directly.

import { useState, useEffect, useCallback } from 'react';
import {
  getAllProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../database/queries/products';

export const useProducts = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // ---------- Load ----------

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  

  // ---------- Add ----------

  const addProduct = useCallback(async (productData) => {
    try {
      const newProduct = await createProduct(productData);
      // Optimistic update — add to local state immediately
      setProducts((prev) =>
        [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name))
      );
      return { success: true };
    } catch (err) {
      console.error('Failed to add product:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ---------- Edit ----------

  const editProduct = useCallback(async (id, productData) => {
    try {
      await updateProduct(id, productData);
      // Update local state without re-fetching from DB
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...productData, updatedAt: new Date().toISOString() }
            : p
        )
      );
      return { success: true };
    } catch (err) {
      console.error('Failed to update product:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ---------- Delete ----------

  const removeProduct = useCallback(async (id) => {
    try {
      await deleteProduct(id);
      // Remove from local state immediately
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete product:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // ---------- Computed values ----------

  const lowStockProducts = products.filter((p) => p.stock <= 5 && p.stock > 0);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  return {
    products,
    loading,
    error,
    loadProducts,
    addProduct,
    editProduct,
    removeProduct,
    lowStockProducts,
    outOfStockProducts,
  };
};