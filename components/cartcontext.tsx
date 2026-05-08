"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);

  // 1. ADICIONAR AO CARRINHO (Com tamanho!)
  const addToCart = (product: any, size: string) => {
    setCart((prev) => {
      // Cria um ID único combinando ID do produto + Tamanho
      const cartId = `${product.id}-${size}`;
      const existing = prev.find((item) => item.cartId === cartId);

      if (existing) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, cartId, size, quantity: 1 }];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // 2. CÁLCULO DE DESCONTO PROGRESSIVO
  const subtotal = cart.reduce(
    (acc, item) => acc + item.preco * item.quantity,
    0,
  );
  const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);

  let desconto = 0;
  if (totalItens === 2) {
    desconto = 10;
  } else if (totalItens >= 3) {
    desconto = 20;
  }

  const total = subtotal - desconto;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        subtotal,
        desconto,
        total,
        totalItens,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
