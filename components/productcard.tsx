"use client";

import { Plus } from "lucide-react";
import type { Product } from "@/components/cartcontext";

interface ProductCardProps {
  camisa: Product;
}

export default function ProductCard({ camisa }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden transition-all duration-300 hover:border-red-600/40 hover:shadow-[0_0_40px_rgba(220,38,38,0.1)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900/40">
        <img
          src={camisa.imagem_url}
          alt={camisa.nome}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay "Ver Detalhes" ao hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-red-600 text-white font-black text-[10px] px-6 py-3 rounded-full uppercase tracking-tighter shadow-[0_0_20px_rgba(220,38,38,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform">
            Ver Detalhes
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-zinc-100 font-bold text-xs uppercase leading-tight tracking-tight line-clamp-2">
          {camisa.nome}
        </h3>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-600 font-bold uppercase">
              A partir de
            </span>
            <span className="text-white font-black text-lg tracking-tighter">
              R$ {Number(camisa.preco).toFixed(2)}
            </span>
          </div>

          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-600 group-hover:border-red-600/30 transition-all">
            <Plus size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
