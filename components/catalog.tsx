"use client";

import type { Product } from "@/components/cartcontext";
import ProductCard from "./productcard";

interface CatalogProps {
  camisetas: Product[];
  onSelectCamisa: (camisa: Product) => void;
}

export default function Catalog({ camisetas, onSelectCamisa }: CatalogProps) {
  if (camisetas.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
        <p className="text-zinc-500 font-bold uppercase tracking-widest">
          Nenhum alvo encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {camisetas.map((camisa) => (
        <div
          key={camisa.id}
          onClick={() => onSelectCamisa(camisa)}
          className="cursor-pointer"
        >
          <ProductCard camisa={camisa} />
        </div>
      ))}
    </div>
  );
}
