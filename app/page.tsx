"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/cartcontext";

// Importação dos componentes que criamos
import HeaderAcervo from "@/components/header";
import Catalog from "@/components/catalog";
import ProductModal from "@/components/productmodal";
import CartSidebar from "@/components/cartsidebar";

export default function Home() {
  // 1. ESTADOS (Os "interruptores" do site)
  const [camisas, setCamisas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCamisa, setSelectedCamisa] = useState<any>(null); // Controla qual camisa abre no Modal
  const [isCartOpen, setIsCartOpen] = useState(false); // Controla a visibilidade do Carrinho
  const [loading, setLoading] = useState(true);

  // Pegamos a função de adicionar do nosso Contexto
  const { addToCart } = useCart();

  // 2. BUSCA DE DADOS NO SUPABASE
  useEffect(() => {
    async function getCamisas() {
      try {
        const { data, error } = await supabase
          .from("camisetas")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setCamisas(data);
      } catch (error) {
        console.error("Erro ao carregar camisas:", error);
      } finally {
        setLoading(false);
      }
    }
    getCamisas();
  }, []);

  // 3. LÓGICA DE FILTRO (Busca em tempo real)
  const camisasFiltradas = camisas.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.categoria?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 4. FUNÇÃO AO ADICIONAR NO CARRINHO (Dentro do Modal)
  const handleAddToCart = (produto: any, tamanho: string) => {
    addToCart(produto, tamanho); // Adiciona ao sistema de contexto
    setSelectedCamisa(null); // Fecha o modal de detalhes
    setIsCartOpen(true); // Abre o carrinho automaticamente para o cliente ver o item
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      {/* HEADER: Título, Busca e Botão do Carrinho */}
      <HeaderAcervo
        totalTimes={camisas.length}
        onSearch={setSearchTerm}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* VITRINE: Lista de Camisas */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-bg-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 font-black uppercase italic tracking-widest text-xs">
              Sincronizando Acervo...
            </p>
          </div>
        ) : (
          <Catalog
            camisetas={camisasFiltradas}
            onSelectCamisa={(camisa) => setSelectedCamisa(camisa)}
          />
        )}
      </div>

      {/* MODAL DE DETALHES: Só monta se houver camisa selecionada */}
      {selectedCamisa && (
        <ProductModal
          camisa={selectedCamisa}
          isOpen={!!selectedCamisa}
          onClose={() => setSelectedCamisa(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* SIDEBAR DO CARRINHO: Ocupa o lado direito da tela */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* RODAPÉ SIMPLES */}
      <footer className="py-20 border-t border-zinc-900 mt-20 text-center">
        <p className="text-zinc-700 font-black uppercase italic text-[10px] tracking-[0.5em]">
          90+ Store • Qualidade Premium 1:1 • 2026
        </p>
      </footer>
    </main>
  );
}
