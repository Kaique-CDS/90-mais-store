"use client";

import ProductCard from "./productcard"; // Importação que faltava

interface Camisa {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string;
  categoria: string;
  descricao?: string;
  galeria?: string[];
}

interface CatalogProps {
  camisetas: Camisa[];
  onSelectCamisa: (camisa: Camisa) => void; // Função para abrir o modal
}

export default function Catalog({ camisetas, onSelectCamisa }: CatalogProps) {
  return (
    <div className="w-full">
      {camisetas.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 font-bold uppercase tracking-widest">
            Nenhum alvo encontrado.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {camisetas.map((camisa) => (
          <div
            key={camisa.id}
            onClick={() => onSelectCamisa(camisa)} // Gatilho para abrir o modal
            className="cursor-pointer"
          >
            <ProductCard camisa={camisa} />
          </div>
        ))}
      </div>
    </div>
  );
}
