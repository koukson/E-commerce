import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, CartContextType } from '../types';
import api from '../config/api';
import { useAuth } from './AuthContext';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Charger le panier depuis l'API quand l'utilisateur est connecté (sauf admin)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated && user?.role !== 'admin') {
      loadCart();
    } else if (!isAuthenticated || user?.role === 'admin') {
      setItems([]);
    }
  }, [isAuthenticated, user?.role]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ items: CartItem[]; total: number; itemCount: number }>('/cart');
      setItems(response.items);
    } catch (error: any) {
      console.error('Erreur lors du chargement du panier:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      // Si non connecté, utiliser localStorage temporairement
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.product.id === product.id);
        
        if (existingItem) {
          return prevItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        
        return [...prevItems, { product, quantity }];
      });
      return;
    }

    try {
      await api.post('/cart/add', {
        productId: product.id,
        quantity,
      });
      await loadCart(); // Recharger le panier depuis l'API
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) {
      setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
      return;
    }

    try {
      await api.delete(`/cart/remove/${productId}`);
      await loadCart();
    } catch (error: any) {
      console.error('Erreur lors de la suppression du panier:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (!isAuthenticated) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
      return;
    }

    try {
      await api.put(`/cart/update/${productId}`, { quantity });
      await loadCart();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du panier:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      await api.delete('/cart/clear');
      setItems([]);
    } catch (error: any) {
      console.error('Erreur lors du vidage du panier:', error);
    }
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
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
