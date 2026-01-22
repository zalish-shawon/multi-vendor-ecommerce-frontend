/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define the shape of a Cart Item
interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // 1. Load Cart from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    }
  }, []);

  // 2. Save Cart to LocalStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  // --- FIXED: ADD TO CART ---
  const addToCart = (product: any) => {
    // Check existing item using the CURRENT state (not inside the setter)
    const existing = items.find((item) => item._id === product._id);

    if (existing) {
      // Check stock limit
      if (existing.quantity >= product.stock) {
        toast.error('Cannot add more. Out of stock limit reached.');
        return; // Stop here. Do not update state.
      }
      
      // If safe, update state and show toast once
      toast.success('Added to cart');
      setItems((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // New Item
      toast.success('Added to cart');
      setItems((prev) => [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          quantity: 1,
          maxStock: product.stock,
        },
      ]);
    }
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
    toast.error('Removed from cart');
  };

  // --- FIXED: UPDATE QUANTITY ---
  const updateQuantity = (id: string, quantity: number) => {
    const targetItem = items.find((item) => item._id === id);
    if (!targetItem) return;

    // Check Max Stock
    if (quantity > targetItem.maxStock) {
        toast.error(`Only ${targetItem.maxStock} items available`);
        return; // Stop
    }

    // Check Min Quantity
    if (quantity < 1) return;

    // Valid update
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  // Calculate Totals
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
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