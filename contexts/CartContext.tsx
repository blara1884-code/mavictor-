
import React, { createContext, useState, useContext, useEffect } from 'react';
import type { CartItem, Product, User } from '../types';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size: string) => void;
  removeFromCart: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (paymentMethod: 'pix' | 'card' | 'cash', customerName: string) => Promise<boolean>;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const { fetchProducts } = useProducts();

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/cart/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setCart(data);
          }
        } catch (e) {
          console.error("Erro ao buscar carrinho do servidor", e);
        }
      } else {
        // Fallback to local for guests
        const storedCart = localStorage.getItem('cart');
        if (storedCart) setCart(JSON.parse(storedCart));
      }
    };
    fetchCart();
  }, [user]);

  useEffect(() => {
    const syncCart = async () => {
      if (user) {
        try {
          await fetch(`/api/cart/${user.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cart)
          });
        } catch (e) {
          console.error("Erro ao sincronizar carrinho", e);
        }
      } else {
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    };
    syncCart();
  }, [cart, user]);
  
  const addToCart = (product: Product, quantity: number, size: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id && item.size === size);
      if (existingItem) {
        const newQuantity = Math.min(product.stock_quantity, existingItem.quantity + quantity);
        return prevCart.map(item =>
          (item.product.id === product.id && item.size === size) ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(product.stock_quantity, quantity), size }];
    });
  };

  const removeFromCart = (productId: number, size: string) => {
    setCart(prevCart => prevCart.filter(item => !(item.product.id === productId && item.size === size)));
  };

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product.id === productId && item.size === size) {
          const newQuantity = Math.max(1, Math.min(item.product.stock_quantity, quantity));
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async (paymentMethod: 'pix' | 'card' | 'cash', customerName: string): Promise<boolean> => {
    if (!user || user.role !== 'client') {
      console.error("Nenhum cliente logado para finalizar a compra.");
      return false;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newOrder = {
        userEmail: user.email,
        customerName: customerName,
        totalPrice: totalPrice,
        payment_method: paymentMethod,
        status: 'pending',
        items: cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size
        })),
        created_at: new Date().toISOString()
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });

      if (!response.ok) throw new Error("Erro ao salvar pedido no servidor");

      clearCart();
      return true;
    } catch (error) {
      console.error("Falha no checkout:", error);
      return false;
    }
  };


  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, checkout, itemCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};