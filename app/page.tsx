"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/cartcontext";
import type { Product, Personalizacao } from "@/components/cartcontext";
import { matchesCategory } from "@/lib/categories";

import HeaderAcervo from "@/components/header";
import Catalog from "@/components/catalog";
import ProductModal from "@/components/productmodal";
import CartSidebar from "@/components/cartsidebar";
import ScrollToTop from "@/components/scrolltotop";

export default function Home() {
  const [camisas, setCamisas] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("TUDO");
  const [selectedCamisa, setSelectedCamisa] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  // Busca no Supabase — ordem alfabética
  useEffect(() => {
    async function getCamisas() {
      try {
        const { data, error } = await supabase
          .from("camisetas")
          .select("*")
          .order("nome", { ascending: true });

        if (error) throw error;
        if (data) {
          // Fix de nome enquanto DB não é atualizado (RLS bloqueia UPDATE com anon key)
          const normalized = (data as Product[]).map((c) => ({
            ...c,
            nome: c.nome.replace(/\bFranca\b/g, "França"),
          }));
          setCamisas(normalized);
        }
      } catch (err) {
        console.error("Erro ao carregar camisas:", err);
      } finally {
        setLoading(false);
      }
    }
    getCamisas();
  }, []);

  // Filtro combinado: busca + categoria (com mapeamento de categorias antigas)
  const camisasFiltradas = camisas.filter((c) => {
    const matchSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.categoria?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCat = matchesCategory(c.categoria, c.nome, activeCategory);

    return matchSearch && matchCat;
  });

  const handleAddToCart = (
    produto: Product,
    tamanho: string,
    priceModifier: number,
    personalizacao?: Personalizacao,
  ) => {
    addToCart(produto, tamanho, priceModifier, personalizacao);
    setSelectedCamisa(null);
    setIsCartOpen(true);
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <HeaderAcervo
        onSearch={setSearchTerm}
        onOpenCart={() => setIsCartOpen(true)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-500 font-black uppercase italic tracking-widest text-xs">
              Sincronizando Acervo...
            </p>
          </div>
        ) : (
          <Catalog
            camisetas={camisasFiltradas}
            onSelectCamisa={setSelectedCamisa}
          />
        )}
      </div>

      <ProductModal
        camisa={selectedCamisa!}
        isOpen={!!selectedCamisa}
        onClose={() => setSelectedCamisa(null)}
        onAddToCart={handleAddToCart}
      />

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <ScrollToTop />

      {/* RODAPÉ */}
      <footer className="py-16 border-t border-zinc-900 mt-16 text-center">
        <a
          href="https://www.instagram.com/sou90mais/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram da 90+ Store"
          className="inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-all group mb-6"
        >
          {/* Instagram SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 group-hover:text-pink-500 transition-colors"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          <span className="font-black uppercase tracking-widest text-xs group-hover:text-pink-400 transition-colors">
            @sou90mais
          </span>
        </a>

        <p className="text-zinc-700 font-black uppercase italic text-[10px] tracking-[0.5em]">
          90+ Store • Qualidade Premium 1:1 • 2026
        </p>
      </footer>
    </main>
  );
}
