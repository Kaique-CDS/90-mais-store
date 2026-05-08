"use client";
import { Plus } from "lucide-react";

export default function ProductCard({ camisa }: any) {
  return (
    <div className="group relative flex flex-col bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden transition-all duration-300 hover:border-red-600/40 hover:shadow-[0_0_40px_rgba(220,38,38,0.1)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900/40">
        <img
          src={camisa.imagem_url}
          alt={camisa.nome}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute top-4 left-4">
          <span className="bg-black/80 backdrop-blur-md text-red-600 text-[9px] font-black px-2 py-1 rounded-md border border-red-600/20 uppercase tracking-widest">
            {camisa.categoria}
          </span>
        </div>

        {/* BOTÃO VER DETALHES AGORA VERMELHO */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-red-600 text-white font-black text-[10px] px-6 py-3 rounded-full uppercase tracking-tighter shadow-[0_0_20px_rgba(220,38,38,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform">
            Ver Detalhes
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-2">
        <h3 className="text-zinc-100 font-bold text-sm uppercase truncate tracking-tight">
          {camisa.nome}
        </h3>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-600 font-bold uppercase">
              A partir de
            </span>
            <span className="text-white font-black text-xl tracking-tighter">
              R$ {Number(camisa.preco).toFixed(2)}
            </span>
          </div>

          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-600 group-hover:border-red-600/30 transition-all">
            <Plus size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
