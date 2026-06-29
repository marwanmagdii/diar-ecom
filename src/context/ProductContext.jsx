import React, { createContext, useContext, useState, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const logAdminAction = async (actionType, description, details = {}) => {
    try {
      const currentAdmin = localStorage.getItem('currentAdmin') || 'Marwan';
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: currentAdmin, actionType, description, details })
      });
    } catch (e) {
      console.error('Failed to log admin action', e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/products');
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to add product');
      }
      const { data } = await res.json();
      setProducts(prev => [data, ...prev]);
      logAdminAction('add_product', `Added product: ${product.title || product.id}`, data);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to update product');
      }
      const { data } = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? data : p));
      logAdminAction('update_product', `Updated product: ${id}`, updatedFields);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to delete product');
      }
      setProducts(products.filter(p => p.id !== id));
      logAdminAction('delete_product', `Deleted product: ${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, addProduct, updateProduct, deleteProduct, fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};
