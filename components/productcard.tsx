"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import type { Product } from "@/components/cartcontext";
import { getFakeOriginalPrice } from "@/lib/pricing";
import { getDisplayCategory } from "@/lib/categories";
import { getOptimizedImageUrl } from "@/lib/images";

interface ProductCardProps {
  /** O objeto do produto contendo nome, preço, url da imagem, etc. */
  camisa: Product;
  /** 
   * O índice numérico (posição) deste cartão na lista do catálogo.
   * É utilizado para criar a animação de "stagger" (um cartão aparecendo logo após o outro). 
   */
  index?: number; 
}

/**
 * Componente que exibe um único produto na grade (grid) do catálogo.
 * Tem efeitos de hover dinâmicos (aumento da imagem e botão centralizado).
 */
export default function ProductCard({ camisa, index = 0 }: ProductCardProps) {
  // Calcula um preço maior fictício para ancoragem visual ("De: R$ X Por: R$ Y")
  const fakePrice = getFakeOriginalPrice(camisa.preco);
  
  // Como não mostramos a categoria no card atualmente, essa variável
  // não está sendo exibida, mas poderia ser usada se o layout mudasse.
  const displayCat = getDisplayCategory(camisa.categoria, camisa.nome);

  return (
    <div
      className="card-animate group relative flex flex-col bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden transition-all duration-300 hover:border-red-600/40 hover:shadow-[0_0_40px_rgba(220,38,38,0.1)]"
      // Calcula o atraso da animação css com base no índice para criar o efeito cascata
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Container da Imagem */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900/40">
        {/* Imagem Principal */}
        <Image
          src={getOptimizedImageUrl(camisa.imagem_url, 400)}
          alt={camisa.nome}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay translúcido com botão "Ver Detalhes" que aparece apenas no hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-red-600 text-white font-black text-[10px] px-6 py-3 rounded-full uppercase tracking-tighter shadow-[0_0_20px_rgba(220,38,38,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform">
            Ver Detalhes
          </span>
        </div>
      </div>

      {/* Container de Informações Textuais */}
      <div className="p-4 flex flex-col gap-1.5">
        <h3 className="text-zinc-100 font-bold text-xs uppercase leading-tight tracking-tight line-clamp-2">
          {camisa.nome}
        </h3>

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 text-[9px] line-through">
                R$ {fakePrice.toFixed(2)}
              </span>
              <span className="text-green-500 text-[8px] font-black uppercase">
                OFERTA
              </span>
            </div>
            <span className="text-white font-black text-lg tracking-tighter leading-none">
              R$ {Number(camisa.preco).toFixed(2)}
            </span>
          </div>

          {/* Ícone '+' pequeno no canto inferior direito */}
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-600 group-hover:border-red-600/30 transition-all">
            <Plus size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
