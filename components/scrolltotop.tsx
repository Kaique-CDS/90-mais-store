"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

/**
 * Componente de botão flutuante para voltar ao topo da página.
 * Ele só aparece quando o usuário rola a tela para baixo além de um certo limite.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Função que verifica se a tela foi rolada mais de 350 pixels para baixo
    const onScroll = () => setVisible(window.scrollY > 350);
    
    // Adiciona o listener de scroll com { passive: true } para melhor performance (não bloqueia a renderização)
    window.addEventListener("scroll", onScroll, { passive: true });
    
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Se a tela estiver no topo, o componente nem é renderizado no DOM
  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-8 left-6 z-[100] bg-zinc-900/90 border border-zinc-700 p-3 rounded-2xl shadow-xl hover:bg-red-600 hover:border-red-600 transition-all hover:scale-110 backdrop-blur-sm"
    >
      <ChevronUp className="text-white" size={22} />
    </button>
  );
}
