"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { FormattedProduct } from '@/lib/types/square';

interface CartItem {
  product: FormattedProduct;
  variationId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: FormattedProduct, variationId: string, quantity?: number) => void;
  removeFromCart: (productId: string, variationId: string) => void;
  updateQuantity: (productId: string, variationId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (product: FormattedProduct, variationId: string, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id && item.variationId === variationId
      );

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item.product.id === product.id && item.variationId === variationId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { product, variationId, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string, variationId: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.variationId === variationId)
      )
    );
  };

  const updateQuantity = (productId: string, variationId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variationId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && item.variationId === variationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const variation = item.product.variations.find((v) => v.id === item.variationId);
      const price = variation?.itemVariationData?.priceMoney?.amount
        ? Number(variation.itemVariationData.priceMoney.amount) / 100
        : item.product.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

