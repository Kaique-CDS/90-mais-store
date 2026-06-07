"use client";

import { createContext, useContext, useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Estrutura base de um produto vindo do banco de dados */
export interface Product {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string;
  categoria?: string;
  galeria?: string[];
  total_fotos?: number;
}

/** Estrutura da personalização escolhida pelo cliente */
export interface Personalizacao {
  nome: string;
  numero: string;
}

/** 
 * Estrutura de um item que já está dentro do carrinho.
 * Ele extende um Product, mas adiciona propriedades específicas daquela
 * unidade que o cliente configurou (tamanho, quantidade, etc).
 */
export interface CartItem extends Product {
  /** ID único gerado para agrupar itens idênticos (mesmo produto, tamanho e personalização) */
  cartId: string;
  /** Tamanho selecionado (P, M, G, GG, G1) */
  size: string;
  /** Quantidade desse item exato adicionada ao carrinho */
  quantity: number;
  /** Acréscimo financeiro devido ao tamanho (Ex: G1 custa +R$20) */
  priceModifier: number;       
  /** Dados da personalização (nome e número), se houver. Custa +R$70 */
  personalizacao?: Personalizacao; 
  /** Preço unitário final da camisa com todos os acréscimos aplicados */
  effectivePrice: number;       
}

/** Estrutura dos dados e funções disponibilizadas pelo Contexto */
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

/**
 * Provedor do estado global do carrinho.
 * Envolve a aplicação (no RootLayout) permitindo que qualquer componente
 * acesse e modifique os itens no carrinho.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Tenta carregar o carrinho da "memória" (LocalStorage) ao abrir o site
  useEffect(() => {
    try {
      const saved = localStorage.getItem("@90mais-cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Erro ao ler carrinho do storage", e);
    } finally {
      setIsLoaded(true); // Marca que a leitura inicial terminou
    }
  }, []);

  // 2. Sempre que o carrinho mudar, salva na "memória" (mas só depois da leitura inicial)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("@90mais-cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  /**
   * Adiciona um novo item ao carrinho ou incrementa a quantidade se um 
   * item *exatamente igual* já existir.
   */
  const addToCart = (
    product: Product,
    size: string,
    priceModifier = 0,
    personalizacao?: Personalizacao,
  ) => {
    // Calcula o preço final unitário da camisa baseada nas escolhas
    const effectivePrice =
      product.preco + priceModifier + (personalizacao ? 70 : 0);

    // Cria uma chave única para agrupar itens. 
    // Uma camisa M lisa é diferente de uma camisa M personalizada com "PELÉ 10".
    const persKey = personalizacao
      ? `-${personalizacao.nome}-${personalizacao.numero}`
      : "";
    const cartId = `${product.id}-${size}-${priceModifier}${persKey}`;

    setCart((prev) => {
      // Se já existe no carrinho, só aumenta a quantidade
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      // Se não existe, adiciona como um novo item
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

  /** Remove o item completamente do carrinho, não importando a quantidade */
  const removeFromCart = (cartId: string) =>
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));

  /** Aumenta em 1 a quantidade de um item específico */
  const incrementItem = (cartId: string) =>
    setCart((prev) =>
      prev.map((i) =>
        i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );

  /** 
   * Diminui em 1 a quantidade de um item. 
   * Se chegar a zero, o `.filter()` garante que ele seja removido do array.
   */
  const decrementItem = (cartId: string) =>
    setCart((prev) =>
      prev
        .map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );

  /** Esvazia o carrinho completamente */
  const clearCart = () => setCart([]);

  // Cálculos dinâmicos derivados do estado atual do carrinho
  const subtotal = cart.reduce(
    (acc, item) => acc + item.effectivePrice * item.quantity,
    0,
  );

  const totalItens = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Desconto removido — sempre zero
  const desconto = 0;

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

/**
 * Hook customizado para facilitar o acesso ao contexto do carrinho 
 * de qualquer componente da árvore (sem precisar importar `useContext` e `CartContext`).
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
