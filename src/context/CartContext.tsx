/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // 2. Save Cart to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Cannot add more. Out of stock limit reached.');
          return prev;
        }
        
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      toast.success('Added to cart');
      return [...prev, {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        quantity: 1,
        maxStock: product.stock
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item._id !== id));
    toast.error('Removed from cart');
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => 
      prev.map((item) => {
        if (item._id === id) {
          // Check stock limit
          if (quantity > item.maxStock) {
            toast.error(`Only ${item.maxStock} items available`);
            return item;
          }
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  // Calculate Totals
  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

// Helper hook to use the cart easily
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}