"use client";

import type { Product } from "@/components/cartcontext";
import ProductCard from "./productcard";

interface CatalogProps {
  /** Array de produtos que já passaram por todos os filtros (busca e categoria) */
  camisetas: Product[];
  /** Função chamada quando o usuário clica em uma camisa (abre o modal de detalhes) */
  onSelectCamisa: (camisa: Product) => void;
}

/**
 * Componente responsável por renderizar a grade (grid) de produtos.
 * Trata também o estado de "Nenhum resultado encontrado" caso a busca ou filtro retornem vazio.
 */
export default function Catalog({ camisetas, onSelectCamisa }: CatalogProps) {
  // Empty State: O que mostrar quando os filtros excluírem todas as camisas
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
    // Grid responsivo: 2 colunas no celular, 3 no tablet, 4 no desktop
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {camisetas.map((camisa, index) => (
        <div
          key={camisa.id}
          onClick={() => onSelectCamisa(camisa)}
          className="cursor-pointer"
        >
          {/* 
            Passamos o índice (index) para o ProductCard para usarmos na lógica 
            de stagger (cascata) da animação de entrada (fade in bottom up).
          */}
          <ProductCard camisa={camisa} index={index} />
        </div>
      ))}
    </div>
  );
}
