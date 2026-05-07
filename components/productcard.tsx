"use client";

import { useState } from "react";
import AddToCartButton from "./addtocartbutton";

interface Camisa {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  descricao: string;
  imagem_url?: string;
  galeria?: string[];
}

export default function ProductCard({ camisa }: { camisa: Camisa }) {
  const [imgIndex, setImgIndex] = useState(0);

  // ==========================================================
  // O CÓDIGO ENTRA AQUI: LÓGICA DE AGREGAÇÃO DE IMAGENS
  // ==========================================================
  const listaConsolidada = [
    camisa.imagem_url, // Pega a foto da coluna antiga
    ...(camisa.galeria || []), // Pega as fotos da nova coluna (se existirem)
  ];

  // Remove links vazios, nulos ou repetidos
  const imagens = Array.from(new Set(listaConsolidada)).filter(
    (img) => typeof img === "string" && img.trim() !== "",
  ) as string[];
  // ==========================================================

  const nextImg = () => setImgIndex((prev) => (prev + 1) % imagens.length);
  const prevImg = () =>
    setImgIndex((prev) => (prev - 1 + imagens.length) % imagens.length);

  const produtoParaCarrinho = {
    id: camisa.id,
    nome: camisa.nome,
    preco: camisa.preco,
    imagem_url: imagens[0] || "", // Usa a primeira foto válida para o carrinho
  };

  return (
    <div className="group relative flex flex-col bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden hover:border-red-600 transition-all duration-300 mx-auto w-full max-w-[320px]">
      <div className="h-[280px] w-full bg-zinc-900 relative overflow-hidden shrink-0 group/carousel">
        {imagens.length > 0 ? (
          <>
            <img
              src={imagens[imgIndex]}
              alt={`${camisa.nome} - Foto ${imgIndex + 1}`}
              className="object-cover w-full h-full transition-all duration-500"
            />

            {imagens.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/carousel:opacity-100 hover:bg-red-600 transition-all z-20"
                >
                  ❮
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/carousel:opacity-100 hover:bg-red-600 transition-all z-20"
                >
                  ❯
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                  {imagens.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? "bg-red-600 w-3" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black italic text-4xl">
            90+
          </div>
        )}

        <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm z-10">
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
          <AddToCartButton produto={produtoParaCarrinho} />
        </div>
      </div>
    </div>
  );
}
