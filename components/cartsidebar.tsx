"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/cartcontext";
import type { CartItem } from "@/components/cartcontext";
import { X, Trash2, ShoppingBag, Plus, Minus, Trash } from "lucide-react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    cart,
    removeFromCart,
    incrementItem,
    decrementItem,
    clearCart,
    total,
    subtotal,
    desconto,
    totalItens,
  } = useCart();

  const [freteInput, setFreteInput] = useState("");

  const freteValue = parseFloat(freteInput.replace(",", ".")) || 0;
  const totalComFrete = total + freteValue;

  // Bloquear scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const finalizarWhatsApp = () => {
    const linhasItens = cart.map((i: CartItem) => {
      const pers = i.personalizacao
        ? ` | Personalização: ${i.personalizacao.nome} #${i.personalizacao.numero}`
        : "";
      return `- ${i.nome} (Tam: ${i.size}) x${i.quantity} — R$ ${(i.effectivePrice * i.quantity).toFixed(2)}${pers}`;
    });

    const linhas = [
      "Fala, equipe 90+! Tenho interesse nesse(s) manto(s):\n",
      ...linhasItens,
      "",
      `Subtotal: R$ ${subtotal.toFixed(2)}`,
      totalItens >= 2
        ? `Desconto 5%: - R$ ${desconto.toFixed(2)}`
        : null,
      freteValue > 0
        ? `Frete: R$ ${freteValue.toFixed(2)}`
        : "Frete: A combinar",
      `*Total: R$ ${totalComFrete.toFixed(2)}*`,
      "",
      "Fico no aguardo da confirmação para prosseguir!",
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.open(
      `https://wa.me/5511945342493?text=${encodeURIComponent(linhas)}`,
      "_blank",
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Painel lateral */}
      <div
        className={`fixed inset-y-0 right-0 z-[1000] w-full max-w-md bg-zinc-950 border-l border-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900">
          <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
            <ShoppingBag className="text-red-600" size={22} />
            Seu Carrinho
            {totalItens > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md ml-1">
                {totalItens}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                aria-label="Limpar carrinho"
                className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                title="Limpar carrinho"
              >
                <Trash size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Fechar carrinho"
              className="text-zinc-500 hover:text-white transition-colors p-2"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Frete grátis Sudeste */}
        <div className="mx-6 mt-4 bg-green-950/40 border border-green-800/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-lg">🚚</span>
          <p className="text-green-400 text-[10px] font-black uppercase tracking-wider">
            Frete grátis para SP, RJ, MG e ES
          </p>
        </div>

        {/* Lista de itens */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <ShoppingBag size={40} className="text-zinc-800" />
              <p className="text-zinc-600 font-bold uppercase text-center italic text-sm">
                O carrinho está vazio
              </p>
            </div>
          ) : (
            cart.map((item: CartItem) => (
              <div
                key={item.cartId}
                className="flex gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <img
                  src={item.imagem_url}
                  alt={item.nome}
                  className="w-16 h-16 object-cover rounded-lg bg-zinc-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-xs uppercase leading-tight truncate">
                    {item.nome}
                  </p>
                  <p className="text-red-600 text-[10px] font-black uppercase mt-0.5">
                    TAM: {item.size}
                    {item.priceModifier > 0 && (
                      <span className="text-yellow-500 ml-1">(+R${item.priceModifier})</span>
                    )}
                  </p>
                  {item.personalizacao && (
                    <p className="text-zinc-400 text-[10px] mt-0.5">
                      ✏️ {item.personalizacao.nome} #{item.personalizacao.numero}
                      <span className="text-yellow-500 ml-1">(+R$70)</span>
                    </p>
                  )}
                  <p className="text-zinc-300 font-black text-sm mt-1">
                    R$ {(item.effectivePrice * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-between gap-1">
                  {/* Botões +/- */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => incrementItem(item.cartId)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={12} className="text-white" />
                    </button>
                    <span className="text-white font-black text-sm w-7 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => decrementItem(item.cartId)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={12} className="text-white" />
                    </button>
                  </div>
                  {/* Remover */}
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    aria-label={`Remover ${item.nome}`}
                    className="text-zinc-700 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totais */}
        {cart.length > 0 && (
          <div className="px-6 pb-6 pt-4 border-t border-zinc-900 space-y-3">
            <div className="flex justify-between text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>

            {desconto > 0 && (
              <div className="flex justify-between text-green-400 font-black text-[10px] uppercase tracking-widest">
                <span>Desconto 5% 🎉</span>
                <span>- R$ {desconto.toFixed(2)}</span>
              </div>
            )}

            {/* Campo de frete */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 space-y-1">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Valor do Frete (R$)
              </p>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={freteInput}
                onChange={(e) => setFreteInput(e.target.value)}
                className="w-full bg-transparent text-white font-bold text-sm outline-none placeholder:text-zinc-700"
              />
              <p className="text-zinc-600 text-[9px]">
                Informe o valor combinado com a equipe 90+
              </p>
            </div>

            <div className="flex justify-between text-white font-black text-2xl uppercase italic tracking-tighter">
              <span>Total</span>
              <span>R$ {totalComFrete.toFixed(2)}</span>
            </div>

            <button
              onClick={finalizarWhatsApp}
              className="w-full bg-[#D4FF00] text-black font-black py-4 rounded-2xl uppercase tracking-tighter hover:bg-[#b8dd00] transition-all text-sm"
            >
              Finalizar no WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
