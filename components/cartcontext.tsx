"use client";

import { createContext, useContext, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string;
  categoria?: string;
  galeria?: string[];
}

export interface Personalizacao {
  nome: string;
  numero: string;
}

export interface CartItem extends Product {
  cartId: string;
  size: string;
  quantity: number;
  priceModifier: number;       // +20 para G1/G2
  personalizacao?: Personalizacao; // +70 se informado
  effectivePrice: number;       // preco + priceModifier + (personalizacao ? 70 : 0)
}

interface CartContextValue {
  cart: CartItem[];
  addToCart: (
    product: Product,
    size: string,
    priceModifier?: number,
    personalizacao?: Personalizacao,
  ) => void;
  removeFromCart: (cartId: string) => void;
  incrementItem: (cartId: string) => void;
  decrementItem: (cartId: string) => void;
  clearCart: () => void;
  subtotal: number;
  desconto: number;
  total: number;
  totalItens: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (
    product: Product,
    size: string,
    priceModifier = 0,
    personalizacao?: Personalizacao,
  ) => {
    const effectivePrice =
      product.preco + priceModifier + (personalizacao ? 70 : 0);

    const persKey = personalizacao
      ? `-${personalizacao.nome}-${personalizacao.numero}`
      : "";
    const cartId = `${product.id}-${size}-${priceModifier}${persKey}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          ...product,
          cartId,
          size,
          quantity: 1,
          priceModifier,
          personalizacao,
          effectivePrice,
        },
      ];
    });
  };

  const removeFromCart = (cartId: string) =>
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));

  const incrementItem = (cartId: string) =>
    setCart((prev) =>
      prev.map((i) =>
        i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );

  const decrementItem = (cartId: string) =>
    setCart((prev) =>
      prev
        .map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.effectivePrice * item.quantity,
    0,
  );

  const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);

  // 5% de desconto a partir de 2 itens
  const desconto = totalItens >= 2 ? subtotal * 0.05 : 0;

  const total = subtotal - desconto;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        incrementItem,
        decrementItem,
        clearCart,
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
