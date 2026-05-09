"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cartcontext";
import type { CartItem } from "@/components/cartcontext";
import { X, Trash2, ShoppingBag, Plus, Minus, Trash } from "lucide-react";
import { getFakeOriginalPrice } from "@/lib/pricing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPers(p: CartItem["personalizacao"]): string {
  if (!p) return "";
  const { nome, numero } = p;
  if (nome && numero) return ` | Personalização: ${nome} #${numero}`;
  if (nome) return ` | Personalização: ${nome}`;
  if (numero) return ` | Personalização: #${numero}`;
  return "";
}

// ─── Component ────────────────────────────────────────────────────────────────

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
    subtotal,
    desconto,
    total,
    totalItens,
  } = useCart();

  // Bloquear scroll do body enquanto sidebar está aberta
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Fechar com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const finalizarWhatsApp = () => {
    const linhas = [
      "Fala, equipe 90+! Tenho interesse nesse(s) manto(s):\n",
      ...cart.map((i: CartItem) =>
        `- ${i.nome} (Tam: ${i.size}) x${i.quantity} — R$ ${(i.effectivePrice * i.quantity).toFixed(2)}${formatPers(i.personalizacao)}`
      ),
      "",
      `Subtotal: R$ ${subtotal.toFixed(2)}`,
      totalItens >= 2 ? `Desconto 5%: - R$ ${desconto.toFixed(2)}` : null,
      `*Total: R$ ${total.toFixed(2)}*`,
      "Frete: Grátis",
      "",
      "Fico no aguardo da confirmação para prosseguir!",
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.open(`https://wa.me/5511945342493?text=${encodeURIComponent(linhas)}`, "_blank");
  };

  const btnQty = "w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Painel lateral — ocupa toda a tela no mobile */}
      <div
        className={`fixed inset-y-0 right-0 z-[1000] w-full sm:max-w-md bg-zinc-950 border-l border-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-zinc-900">
          <h2 className="text-lg sm:text-xl font-black uppercase italic text-white flex items-center gap-2">
            <ShoppingBag className="text-red-600" size={20} />
            Seu Carrinho
            {totalItens > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md ml-1">
                {totalItens}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button onClick={clearCart} aria-label="Limpar carrinho" title="Limpar carrinho"
                className="text-zinc-600 hover:text-red-500 transition-colors p-2">
                <Trash size={18} />
              </button>
            )}
            <button onClick={onClose} aria-label="Fechar carrinho"
              className="text-zinc-500 hover:text-white transition-colors p-2">
              <X size={26} />
            </button>
          </div>
        </div>

        {/* Lista de itens */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3">
          {/* Banner de desconto animado */}
          {desconto > 0 && (
            <div className="discount-shimmer rounded-2xl px-4 py-3 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎉</span>
                <div>
                  <p className="text-white font-black text-xs uppercase tracking-wide">Desconto Ativado!</p>
                  <p className="text-green-100 text-[10px]">5% aplicado por comprar 2+ itens</p>
                </div>
              </div>
              <span className="text-white font-black text-sm">- R$ {desconto.toFixed(2)}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <ShoppingBag size={40} className="text-zinc-800" />
              <p className="text-zinc-600 font-bold uppercase text-center italic text-sm">
                O carrinho está vazio
              </p>
            </div>
          ) : (
            cart.map((item: CartItem) => (
              <div key={item.cartId}
                className="flex gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
                <img src={item.imagem_url} alt={item.nome}
                  className="w-16 h-16 sm:w-18 sm:h-18 object-cover rounded-lg bg-zinc-800 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-xs uppercase leading-tight line-clamp-2">{item.nome}</p>
                  <p className="text-red-600 text-[10px] font-black uppercase mt-0.5">
                    TAM: {item.size}
                    {item.priceModifier > 0 && (
                      <span className="text-cyan-500 ml-1">(+R${item.priceModifier})</span>
                    )}
                  </p>
                  {item.personalizacao && (
                    <p className="text-zinc-400 text-[10px] mt-0.5">
                      ✏️{" "}
                      {[item.personalizacao.nome, item.personalizacao.numero ? `#${item.personalizacao.numero}` : ""]
                        .filter(Boolean)
                        .join(" ")}
                      <span className="text-cyan-500 ml-1">(+R$70)</span>
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-zinc-300 font-black text-sm">
                      R$ {(item.effectivePrice * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-zinc-600 text-[10px] line-through">
                      R$ {(getFakeOriginalPrice(item.effectivePrice) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-1 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => incrementItem(item.cartId)} className={btnQty} aria-label="Aumentar quantidade">
                      <Plus size={13} className="text-white" />
                    </button>
                    <span className="text-white font-black text-sm w-8 text-center">{item.quantity}</span>
                    <button onClick={() => decrementItem(item.cartId)} className={btnQty} aria-label="Diminuir quantidade">
                      <Minus size={13} className="text-white" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.cartId)} aria-label={`Remover ${item.nome}`}
                    className="text-zinc-700 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totais */}
        {cart.length > 0 && (
          <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-4 border-t border-zinc-900 space-y-3">
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

            <div className="flex justify-between text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
              <span>Frete</span>
              <span className="text-green-500 font-black">Grátis</span>
            </div>

            <div className="flex justify-between text-white font-black text-xl sm:text-2xl uppercase italic tracking-tighter pt-1">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            <button onClick={finalizarWhatsApp}
              className="w-full bg-[#D4FF00] text-black font-black py-4 rounded-2xl uppercase tracking-tighter hover:bg-[#b8dd00] active:scale-95 transition-all text-sm">
              Finalizar no WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
