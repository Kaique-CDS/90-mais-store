"use client";

import { useCartStore } from "@/store/cartstore";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const [isMounted, setIsMounted] = useState(false);

  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);

  const valorTotal = items.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ==========================================
  // FUNÇÃO DE CHECKOUT VIA WHATSAPP
  // ==========================================
  const finalizarPedido = () => {
    // COLOQUE O SEU NÚMERO AQUI (Com código do país 55 e DDD. Sem espaços ou traços)
    const numeroWhatsApp = "5511945342493";

    let mensagem = "Fala, 90+ Mais! Gostaria de fechar o seguinte pedido:\n\n";

    items.forEach((item) => {
      mensagem += `${item.quantidade}x ${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
    });

    mensagem += `\n*Total Estimado: R$ ${valorTotal.toFixed(2)}*`;
    mensagem += `\n\nAguardo as instruções para pagamento e envio!`;

    // Converte o texto para formato de link
    const textoCodificado = encodeURIComponent(mensagem);
    const url = `https://wa.me/${numeroWhatsApp}?text=${textoCodificado}`;

    // Abre o WhatsApp em uma nova aba
    window.open(url, "_blank");
  };

  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={closeCart}
      ></div>

      <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-black">
          <h2 className="text-2xl font-black uppercase italic text-white">
            Sua Seleção
          </h2>
          <button
            onClick={closeCart}
            className="text-zinc-500 hover:text-white text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-zinc-600 mt-20 flex flex-col items-center gap-4">
              <span className="text-5xl">🕸️</span>
              <p className="uppercase font-bold tracking-widest text-white">
                Carrinho Vazio
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 items-center bg-black p-3 rounded border border-zinc-900"
              >
                {item.imagem_url ? (
                  <img
                    src={item.imagem_url}
                    alt={item.nome}
                    className="w-16 h-16 object-cover bg-zinc-900 rounded-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center text-xs text-zinc-700 italic font-black rounded-sm">
                    90+
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-bold text-xs uppercase tracking-tight line-clamp-1 text-white">
                    {item.nome}
                  </h3>
                  <p className="text-red-500 font-black text-sm mt-1">
                    R$ {item.preco.toFixed(2)}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Qtd: {item.quantidade}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-zinc-600 hover:text-red-600 text-xl px-2 transition-colors"
                  title="Remover item"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-zinc-900 bg-black">
          <div className="flex justify-between items-center mb-6">
            <span className="text-zinc-500 uppercase text-xs font-bold tracking-widest">
              Total Estimado
            </span>
            <span className="text-3xl font-black text-white">
              R$ {valorTotal.toFixed(2)}
            </span>
          </div>
          {/* BOTÃO ATUALIZADO COM A AÇÃO DE FINALIZAR */}
          <button
            onClick={finalizarPedido}
            disabled={items.length === 0}
            className="w-full bg-[#25D366] text-white font-black py-4 uppercase tracking-widest hover:bg-[#1ebe57] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors"
          >
            Fechar via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
