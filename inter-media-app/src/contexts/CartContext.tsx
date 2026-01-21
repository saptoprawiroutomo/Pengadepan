'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface CartContextType {
  cartCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (session) {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const cart = await response.json();
          const count = cart.items?.reduce((total: number, item: any) => total + item.qty, 0) || 0;
          setCartCount(count);
        } else {
          console.error('Failed to fetch cart:', response.status);
          setCartCount(0);
        }
      } catch (error) {
        console.error('Cart fetch error:', error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [session]);

  const refreshCart = () => {
    fetchCartCount();
  };

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}
