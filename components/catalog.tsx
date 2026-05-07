"use client";

import { useState } from "react";
import AddToCartButton from "./addtocartbutton";

// Definindo o formato da nossa camisa
interface Camisa {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  descricao: string;
  imagem_url: string;
}

export default function Catalog({ camisetas }: { camisetas: Camisa[] }) {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");

  // Lista de categorias disponíveis (O senhor pode adicionar mais depois)
  const categorias = ["Todas", "Brasileirão", "Internacional", "Retro"];

  // Motor de Filtragem: Roda em tempo real a cada letra digitada
  const camisetasFiltradas = camisetas?.filter((camisa) => {
    const matchBusca = camisa.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria =
      categoriaAtiva === "Todas" ||
      camisa.categoria?.toLowerCase() === categoriaAtiva.toLowerCase();

    return matchBusca && matchCategoria;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* BARRA DE RADAR (Filtros e Busca) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-950 p-4 border border-zinc-900 rounded-lg">
        {/* Botões de Categoria */}
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

        {/* Campo de Busca */}
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

      {/* FEEDBACK DE BUSCA VAZIA */}
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

      {/* GRID DE PRODUTOS FILTRADOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {camisetasFiltradas?.map((camisa) => (
          <div
            key={camisa.id}
            className="group relative flex flex-col bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden hover:border-red-600 transition-all duration-300 mx-auto w-full max-w-[320px]"
          >
            <div className="h-[280px] w-full bg-zinc-900 relative overflow-hidden shrink-0">
              {camisa.imagem_url ? (
                <img
                  src={camisa.imagem_url}
                  alt={camisa.nome}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black italic text-4xl">
                  90+
                </div>
              )}
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">
                {camisa.categoria || "Classic"}
              </span>
            </div>

            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-bold uppercase tracking-tight mb-1 group-hover:text-red-500 transition-colors truncate">
                {camisa.nome}
              </h3>
              <p className="text-zinc-500 text-xs mb-4 line-clamp-2">
                {camisa.descricao || "Camisa de alta qualidade."}
              </p>

              <div className="flex justify-between items-center mt-auto pt-3 border-t border-zinc-900">
                <span className="text-xl font-black">
                  R$ {Number(camisa.preco).toFixed(2)}
                </span>
                <AddToCartButton produto={camisa} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
