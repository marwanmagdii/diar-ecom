import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerTracking } from './CustomerTrackingContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { trackEvent } = useCustomerTracking();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    trackEvent('add_to_cart', {
      productId: product.id,
      productName: product.title || product.id,
      price: product.offerPrice || product.price,
      quantity
    });
    setCart(prev => {
      let cartItemId = `${product.id}-no-color-no-size`;
      if (product.activeVariantId) {
        cartItemId = `${product.id}-${product.activeVariantId}`;
      } else if (product.selectedColor || product.color) {
        const c = product.selectedColor || product.color;
        const s = product.selectedSize || product.size || 'no-size';
        cartItemId = `${product.id}-${c}-${s}`;
      }
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId ? { ...item, qty: item.qty + quantity } : item
        );
      }
      return [...prev, { ...product, cartItemId, qty: quantity }];
    });
  };

  const removeFromCart = (cartItemId) => {
    const itemToRemove = cart.find(item => item.cartItemId === cartItemId);
    if (itemToRemove) {
      trackEvent('remove_from_cart', { 
        productId: itemToRemove.id,
        productName: itemToRemove.title || itemToRemove.titleAr || itemToRemove.name,
        price: itemToRemove.price,
        cartItemId 
      });
    }
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, qty) => {
    if (qty < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, qty } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const cartCount = cart.reduce((count, item) => count + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};
