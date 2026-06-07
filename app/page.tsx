"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/cartcontext";
import type { Product, Personalizacao } from "@/components/cartcontext";
import { matchesCategory, getDisplayCategory } from "@/lib/categories";
import { getPriceByCategory } from "@/lib/pricing";

import HeaderAcervo from "@/components/header";
import Catalog from "@/components/catalog";
import ProductModal from "@/components/productmodal";
import CartSidebar from "@/components/cartsidebar";
import ScrollToTop from "@/components/scrolltotop";

/**
 * Página Principal (Home)
 * Ponto central da aplicação. Responsável por buscar os dados no Supabase,
 * aplicar os filtros (busca textual e categoria) e orquestrar os componentes principais.
 */
export default function Home() {
  // ─── Estados ───
  const [camisas, setCamisas] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("TUDO");
  const [selectedCamisa, setSelectedCamisa] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Controle de paginação
  const [visibleCount, setVisibleCount] = useState(12);

  const { addToCart } = useCart();

  /**
   * Busca inicial de dados no Supabase.
   * Roda apenas uma vez quando a página é carregada (graças ao array de dependências vazio []).
   */
  useEffect(() => {
    async function getCamisas() {
      try {
        // Busca todos os produtos na tabela 'camisetas', ordenados alfabeticamente pelo nome
        const { data, error } = await supabase
          .from("camisetas")
          .select("id, nome, preco, categoria, imagem_url, total_fotos, galeria")
          .order("nome", { ascending: true });

        if (error) throw error;

        if (data) {
          // Fase de Limpeza e Normalização dos Dados
          // Removemos produtos sujos da resposta antes de salvar no estado
          const normalized = (data as Product[])
            .filter((c) => {
              // Mantém produtos sem imagem para tratar em outro lugar, se necessário
              if (!c.imagem_url) return true;

              const imgLower = c.imagem_url.toLowerCase();
              const nomeLower = c.nome.toLowerCase();
              const isRetro = nomeLower.includes("retro") || nomeLower.includes("retrô");

              // Filtro de Segurança: Bloqueia imagens no formato HEIC (iPhone) pois não renderizam no navegador
              // Exceção: camisas retrô (que podem ter imagens antigas em HEIC) sempre aparecem
              if (!isRetro && (imgLower.endsWith(".heic") || imgLower.endsWith(".heif"))) return false;

              // Filtro de Segurança: Bloqueia produtos marcados como 'print' ou 'screenshot'
              if (nomeLower.includes("print") || nomeLower.includes("screenshot")) return false;

              // Filtro Específico: Remove versões duplicadas/secundárias da camisa da França de 2026
              if ((nomeLower.includes("frança") || nomeLower.includes("franca")) &&
                nomeLower.includes("2026") &&
                /\b(ii|away|2)\b/.test(nomeLower)) return false;

              return true;
            })
            .map((c) => {
              // Corrige a grafia do banco de dados (Franca -> França)
              const nomeFix = c.nome.replace(/\bFranca\b/g, "França");
              // Descobre a categoria real
              const displayCat = getDisplayCategory(c.categoria, nomeFix, c.imagem_url);
              // Calcula o preço correto com base nas nossas regras de negócio (ignorando o preço do DB se houver regra superior)
              const preco = getPriceByCategory(displayCat, nomeFix, c.preco);
              return { ...c, nome: nomeFix, preco };
            });

          // Diferencia camisas retrô com o mesmo nome (adiciona I, II, III...)
          const retroCount: Record<string, number> = {};
          
          normalized.forEach((c) => {
            const displayCat = getDisplayCategory(c.categoria, c.nome, c.imagem_url);
            if (displayCat === 'RETRO') {
              retroCount[c.nome] = (retroCount[c.nome] || 0) + 1;
            }
          });

          const retroCurrentIndex: Record<string, number> = {};
          const romanNumerals = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

          const finalNormalized = normalized.map((c) => {
            const displayCat = getDisplayCategory(c.categoria, c.nome, c.imagem_url);
            if (displayCat === 'RETRO' && retroCount[c.nome] > 1) {
              const currentIndex = (retroCurrentIndex[c.nome] || 0) + 1;
              retroCurrentIndex[c.nome] = currentIndex;
              const suffix = romanNumerals[currentIndex] || currentIndex.toString();
              return { ...c, nome: `${c.nome} ${suffix}` };
            }
            return c;
          });

          setCamisas(finalNormalized);
        }
      } catch (err) {
        console.error("Erro ao carregar camisas:", err);
      } finally {
        // Desativa a tela de loading independentemente de sucesso ou erro
        setLoading(false);
      }
    }
    getCamisas();
  }, []);

  /**
   * Reseta o contador de exibição caso o usuário digite uma busca ou troque de categoria.
   */
  useEffect(() => {
    setVisibleCount(12);
  }, [searchTerm, activeCategory]);

  /**
   * Filtro Dinâmico.
   * Recalcula a lista de camisas visíveis sempre que o `searchTerm`, `activeCategory` ou a lista base mudar.
   */
  const camisasFiltradas = camisas.filter((c) => {
    // Função helper para remover acentos
    const removeAcentos = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const normalizedSearch = removeAcentos(searchTerm.toLowerCase());
    const normalizedNome = removeAcentos(c.nome.toLowerCase());
    const normalizedCat = c.categoria ? removeAcentos(c.categoria.toLowerCase()) : "";

    // Verifica se o texto de busca bate com o nome ou com a categoria
    const matchSearch =
      normalizedNome.includes(normalizedSearch) ||
      normalizedCat.includes(normalizedSearch);

    // Verifica se a camisa pertence à categoria clicada no header
    const matchCat = matchesCategory(c.categoria, c.nome, activeCategory, c.imagem_url);

    // Só exibe se passar em AMBOS os filtros
    return matchSearch && matchCat;
  });

  // Fatia o array total para exibir apenas a quantidade controlada pelo visibleCount
  const camisasVisiveis = camisasFiltradas.slice(0, visibleCount);

  // Sem IntersectionObserver, o usuário controla quando carregar mais via botão.

  /**
   * Função ponte entre o Modal do Produto e o Contexto do Carrinho.
   * Quando o botão adicionar é clicado no modal, ele dispara essa função.
   */
  const handleAddToCart = (
    produto: Product,
    tamanho: string,
    priceModifier: number,
    personalizacao?: Personalizacao,
  ) => {
    addToCart(produto, tamanho, priceModifier, personalizacao);
    setSelectedCamisa(null); // Fecha o modal
    setIsCartOpen(true);     // Abre a sidebar do carrinho
  };

  /**
   * Função para resetar os filtros e voltar para o início do catálogo
   */
  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveCategory("TUDO");
    setVisibleCount(12);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Selecionar as 4 camisas "Mais Vendidas" (em destaque)
  const maisVendidas: Product[] = [];
  const getCamisa = (matcher: (n: string) => boolean) => {
    return camisas.find(c => matcher(c.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
  };
  
  // Camisa Brasil 2026 I (versão torcedor normal — masculina, sem feminina/infantil/jogador)
  const b1 = getCamisa(n => n.includes("brasil") && n.includes("2026") && /\bi\b/.test(n) && !/\bii\b/.test(n) && !n.includes("feminina") && !n.includes("feminino") && !n.includes("infantil") && !n.includes("jogador"));
  if (b1) maisVendidas.push(b1);
  
  // Camisa Brasil 2026 II (versão torcedor normal — masculina, sem feminina/infantil/jogador)
  const b2 = getCamisa(n => n.includes("brasil") && n.includes("2026") && /\bii\b/.test(n) && !n.includes("feminina") && !n.includes("feminino") && !n.includes("infantil") && !n.includes("jogador"));
  if (b2) maisVendidas.push(b2);
  
  const cor = getCamisa(n => n.includes("corinthians") && (n.includes("26-27") || n.includes("26/27")));
  if (cor) maisVendidas.push(cor);
  
  const fla = getCamisa(n => n.includes("flamengo") && (n.includes("26-27") || n.includes("26/27")));
  if (fla) maisVendidas.push(fla);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      {/* ── CABEÇALHO ── */}
      <HeaderAcervo
        searchTerm={searchTerm}
        onSearch={(term) => {
          setSearchTerm(term);
          if (term.trim() !== "") {
            setActiveCategory("TUDO");
          }
        }}
        onOpenCart={() => setIsCartOpen(true)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onResetFilters={handleResetFilters}
      />

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
        {loading ? (
          // Estado de Carregamento Inicial (Spinner)
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-zinc-500 font-black uppercase italic tracking-widest text-xs">
              Sincronizando Acervo...
            </p>
          </div>
        ) : (
          // Exibição do Catálogo
          <>
            {/* ── MAIS VENDIDAS ── */}
            {activeCategory === "TUDO" && searchTerm === "" && maisVendidas.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">MAIS VENDIDAS</h2>
                  <div className="h-[1px] flex-1 bg-zinc-900"></div>
                </div>
                <Catalog
                  camisetas={maisVendidas}
                  onSelectCamisa={setSelectedCamisa}
                />
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-black uppercase tracking-widest text-white">TODOS OS MANTOS</h2>
              <div className="h-[1px] flex-1 bg-zinc-900"></div>
            </div>

            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-6">
              {camisasFiltradas.length} {camisasFiltradas.length === 1 ? "manto encontrado" : "mantos encontrados"}
            </p>
            <Catalog
              camisetas={camisasVisiveis}
              onSelectCamisa={setSelectedCamisa}
            />

            {/* Botão de Ver Mais (substitui o scroll infinito para melhor performance) */}
            {visibleCount < camisasFiltradas.length && (
              <div className="w-full flex items-center justify-center mt-12 mb-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="bg-zinc-900 border border-zinc-800 text-white px-8 py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
                >
                  Ver mais mantos
                  <span className="text-zinc-500 font-normal text-[10px] bg-black px-2 py-1 rounded-md">
                    + {Math.min(12, camisasFiltradas.length - visibleCount)}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAIS E SOBREPOSIÇÕES ── */}
      <ProductModal
        camisa={selectedCamisa!}
        isOpen={!!selectedCamisa} // Modal fica aberto se houver uma camisa selecionada
        onClose={() => setSelectedCamisa(null)}
        onAddToCart={handleAddToCart}
      />

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <ScrollToTop />

      {/* ── RODAPÉ ── */}
      <footer className="py-16 border-t border-zinc-900 mt-16 text-center">
        <a
          href="https://www.instagram.com/sou90mais/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram da 90+ Store"
          className="inline-flex items-center gap-3 text-zinc-500 hover:text-white transition-all group mb-6"
        >
          {/* Ícone vetorizado (SVG) do Instagram */}
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
          90+ Store • Qualidade Premium • 2026
        </p>
      </footer>
    </main>
  );
}
