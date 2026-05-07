"use client";

import { useState } from "react";
import AddToCartButton from "./addtocartbutton";

export default function ProductCard({ camisa }: { camisa: any }) {
  const [imgIndex, setImgIndex] = useState(0);

  // Transforma o texto da galeria em uma lista de links
  const fotosExtras =
    camisa.galeria && typeof camisa.galeria === "string"
      ? camisa.galeria.split(",").map((img: string) => img.trim())
      : [];

  // Junta a foto principal com as extras e remove links quebrados ou vazios
  const imagens = [camisa.imagem_url, ...fotosExtras].filter(
    (img) => img && img.length > 10,
  );

  const nextImg = () => setImgIndex((prev) => (prev + 1) % imagens.length);
  const prevImg = () =>
    setImgIndex((prev) => (prev - 1 + imagens.length) % imagens.length);

  return (
    <div className="group relative flex flex-col bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden hover:border-red-600 transition-all duration-300 mx-auto w-full max-w-[320px]">
      <div className="h-[280px] w-full bg-zinc-900 relative overflow-hidden shrink-0 group/carousel">
        {imagens.length > 0 ? (
          <>
            <img
              src={imagens[imgIndex]}
              alt={camisa.nome}
              className="object-cover w-full h-full transition-all duration-500"
            />

            {imagens.length > 1 && (
              <>
                <button
                  onClick={() => prevImg()}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/carousel:opacity-100 hover:bg-red-600 transition-all z-20"
                >
                  ❮
                </button>
                <button
                  onClick={() => nextImg()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/carousel:opacity-100 hover:bg-red-600 transition-all z-20"
                >
                  ❯
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-800 font-black italic text-4xl">
            90+
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold uppercase tracking-tight mb-1 group-hover:text-red-500 transition-colors truncate">
          {camisa.nome}
        </h3>
        <p className="text-zinc-500 text-[10px] mb-4 line-clamp-2 uppercase">
          {camisa.descricao || "Produto de alta qualidade 90+ Store"}
        </p>

        <div className="flex justify-between items-center mt-auto pt-3 border-t border-zinc-900">
          <span className="text-xl font-black">
            R$ {Number(camisa.preco).toFixed(2)}
          </span>
          <AddToCartButton produto={{ ...camisa, imagem_url: imagens[0] }} />
        </div>
      </div>
    </div>
  );
}
