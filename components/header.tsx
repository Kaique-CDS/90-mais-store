"use client";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cartcontext";

export default function HeaderAcervo({
  totalTimes,
  onSearch,
  onOpenCart,
  activeCategory,
  setActiveCategory,
}: any) {
  const { totalItens } = useCart();
  const tags = ["TUDO", "NACIONAL", "INTERNACIONAL", "RETRO", "SELEÇÃO"];

  return (
    <header className="w-full pt-10 pb-6 px-6 bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* LOGO E BUSCA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
            90+ <span className="text-red-600">STORE</span>
          </h1>

          <div className="relative w-full md:max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              size={18}
            />
            <input
              type="text"
              placeholder="BUSCAR TIME..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white py-4 pl-12 pr-6 rounded-xl outline-none focus:border-red-600 transition-all font-bold uppercase text-xs tracking-widest"
            />
          </div>
        </div>

        {/* TAGS DE CATEGORIA */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveCategory(tag)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeCategory === tag
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* PROMOÇÃO */}
        <div className="bg-red-600/10 border border-red-600/20 px-6 py-3 rounded-lg">
          <p className="text-red-600 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] text-center">
            🔥 LEVE 2 (-R$10) | LEVE 3 OU MAIS (-R$20)
          </p>
        </div>

        <button
          onClick={onOpenCart}
          className="fixed top-8 right-8 z-[100] bg-red-600 p-4 rounded-2xl shadow-xl hover:scale-110 transition-all flex items-center gap-3"
        >
          <ShoppingCart className="text-white" size={24} />
          {totalItens > 0 && (
            <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded-md">
              {totalItens}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
