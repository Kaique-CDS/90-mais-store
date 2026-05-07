"use client";

import { useState } from "react";
import ProductCard from "./productcard";

interface Camisa {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  descricao: string;
  imagem_url?: string;
  galeria?: string[];
}

export default function Catalog({ camisetas }: { camisetas: Camisa[] }) {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");

  const categorias = ["Todas", "Nacional", "Internacional", "Retro"];

  const camisetasFiltradas = camisetas?.filter((camisa) => {
    const matchBusca = camisa.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria =
      categoriaAtiva === "Todas" ||
      camisa.categoria?.toLowerCase() === categoriaAtiva.toLowerCase();

    return matchBusca && matchCategoria;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-950 p-4 border border-zinc-900 rounded-lg">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm whitespace-nowrap transition-colors ${
                categoriaAtiva === cat
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="BUSCAR CAMISA..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all uppercase placeholder:text-zinc-600"
          />
          <span className="absolute right-4 top-3 text-zinc-500">🔍</span>
        </div>
      </div>

      {camisetasFiltradas?.length === 0 && (
        <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
          <p className="text-xl font-bold uppercase tracking-widest">
            Nenhum alvo encontrado.
          </p>
          <p className="text-sm mt-2">
            Tente limpar a busca ou mudar a categoria.
          </p>
        </div>
      )}

      {/* CHAMANDO O NOVO COMPONENTE COM O CARROSSEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {camisetasFiltradas?.map((camisa) => (
          <ProductCard key={camisa.id} camisa={camisa} />
        ))}
      </div>
    </div>
  );
}
