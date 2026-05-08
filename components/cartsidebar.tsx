"use client";

import { useCart } from "@/components/cartcontext"; // Verifique se o caminho está exatamente assim
import { X, Trash2, ShoppingBag } from "lucide-react";

// 1. Definimos o que é um Item do Carrinho para o VS Code não reclamar
interface CartItem {
  cartId: string;
  nome: string;
  size: string;
  quantity: number;
  preco: number;
  imagem_url: string;
}

export default function CartSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // 2. Pegamos os dados do contexto
  const cartContext = useCart();

  // 3. Se o contexto não existir, retornamos nulo para evitar erro de "undefined"
  if (!cartContext) return null;

  const { cart, removeFromCart, total, subtotal, desconto } = cartContext;

  if (!isOpen) return null;

  const finalizarWhatsApp = () => {
    // Definimos 'i' como CartItem para o VS Code aceitar o .nome, .size, etc.
    const mensagem = cart
      .map((i: CartItem) => `- ${i.nome} (Tam: ${i.size}) x${i.quantity}`)
      .join("\n");

    const texto = `Fala, equipe 90+!  Tenho interesse nesse manto:\n\n${mensagem}\n\nSubtotal: R$ ${subtotal.toFixed(2)}\nDesconto: R$ ${desconto.toFixed(2)}\nTotal: R$ ${total.toFixed(2)}\n\nFico no aguardo da confirmação de vocês para prosseguir com o pedido.`;

    window.open(
      `https://wa.me/5511945342493?text=${encodeURIComponent(texto)}`, // COLOQUE SEU NÚMERO AQUI
      "_blank",
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-900 shadow-2xl p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase italic text-white flex items-center gap-2">
              <ShoppingBag className="text-red-600" /> Seu Carrinho
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
            {cart.length === 0 ? (
              <p className="text-zinc-600 font-bold uppercase text-center mt-20 italic">
                O carrinho está vazio
              </p>
            ) : (
              cart.map((item: CartItem) => (
                <div
                  key={item.cartId}
                  className="flex gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all"
                >
                  <img
                    src={item.imagem_url}
                    alt={item.nome}
                    className="w-20 h-20 object-cover rounded-lg bg-zinc-800"
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold text-xs uppercase leading-tight">
                      {item.nome}
                    </p>
                    <p className="text-red-600 text-[10px] font-black uppercase mt-1">
                      TAMANHO: {item.size}
                    </p>
                    <p className="text-zinc-400 font-bold mt-2 text-sm">
                      R$ {Number(item.preco).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="text-zinc-700 hover:text-red-500 transition-colors self-start p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* TOTAL E DESCONTOS */}
          <div className="mt-8 pt-6 border-t border-zinc-900 space-y-4">
            <div className="flex justify-between text-zinc-500 font-bold text-[10px] uppercase tracking-widest">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>

            {desconto > 0 && (
              <div className="flex justify-between text-red-600 font-black text-[10px] uppercase tracking-widest animate-pulse">
                <span>Desconto Progressivo</span>
                <span>- R$ {desconto.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-white font-black text-3xl uppercase italic tracking-tighter">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            <button
              onClick={finalizarWhatsApp}
              disabled={cart.length === 0}
              className="w-full bg-[#D4FF00] text-black font-black py-5 rounded-2xl mt-4 uppercase tracking-tighter hover:bg-[#b8dd00] transition-all disabled:opacity-20 disabled:grayscale"
            >
              Finalizar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
