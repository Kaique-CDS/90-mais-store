"use client";

import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cartcontext";
import { CATEGORIES } from "@/lib/categories";

interface HeaderProps {
  /** Função que atualiza o estado de busca textual no componente pai (Home) */
  onSearch: (term: string) => void;
  /** Função para abrir o Drawer do carrinho */
  onOpenCart: () => void;
  /** Qual categoria (botão) está selecionada atualmente */
  activeCategory: string;
  /** Função para alterar a categoria selecionada */
  setActiveCategory: (cat: string) => void;
}

/**
 * Cabeçalho principal da aplicação.
 * Contém o Logo, a barra de busca textual, o botão do carrinho com badge de quantidade
 * e o carrossel horizontal de filtros de categoria.
 */
export default function HeaderAcervo({
  onSearch,
  onOpenCart,
  activeCategory,
  setActiveCategory,
}: HeaderProps) {
  // Pegamos a quantidade de itens do contexto para mostrar no Badge vermelho do carrinho
  const { totalItens } = useCart();

  return (
    <header className="w-full pt-10 pb-6 px-6 bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Linha 1: Logo, Busca e Botão do Carrinho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Área do Logo */}
          <div className="flex-shrink-0 h-8 md:h-10 w-auto flex items-center justify-start">
            <img 
              src="/logo.png" 
              alt="90+ Store" 
              className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
              onError={(e) => {
                // Fallback de segurança: caso a imagem logo.png falhe no carregamento,
                // escondemos a tag img e mostramos o texto <h1> como substituto.
                (e.target as HTMLElement).style.display = 'none';
                (e.target as HTMLElement).nextElementSibling!.classList.remove('hidden');
              }}
            />
            {/* Oculto por padrão, aparece apenas se a imagem falhar */}
            <h1 className="hidden text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              90+ <span className="text-red-600">STORE</span>
            </h1>
          </div>

          {/* Área de Interação (Busca + Carrinho) */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Input de Busca */}
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input
                type="text"
                placeholder="BUSCAR TIME..."
                onChange={(e) => onSearch(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white py-4 pl-12 pr-6 rounded-xl outline-none focus:border-red-600 transition-all font-bold uppercase text-xs tracking-widest"
              />
            </div>

            {/* Botão do Carrinho com Badge Dinâmico */}
            <button
              onClick={onOpenCart}
              aria-label="Abrir carrinho"
              className="relative bg-red-600 p-4 rounded-xl hover:scale-105 transition-all flex items-center justify-center flex-shrink-0"
            >
              <ShoppingCart className="text-white" size={20} />
              {totalItens > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                  {totalItens}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Linha 2: Filtros de Categoria (Pílulas) */}
        {/* scrollbar-none é uma classe Tailwind customizada para esconder a barra de rolagem mas manter o scroll via touch */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveCategory(tag)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === tag
                  ? "bg-red-600 border-red-600 text-white" // Estado Ativo
                  : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600" // Estado Inativo
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
