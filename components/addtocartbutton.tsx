"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartstore";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagem_url?: string;
}

export default function AddToCartButton({ produto }: { produto: Produto }) {
  const addItem = useCartStore((state) => state.addItem);
  // Estado para controlar o visual de "Sucesso"
  const [adicionado, setAdicionado] = useState(false);

  const handleAdd = () => {
    // 1. Salva na memória
    addItem({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem_url: produto.imagem_url || "",
    });

    // 2. Dispara o feedback visual
    setAdicionado(true);

    // 3. Volta ao normal depois de 2 segundos
    setTimeout(() => {
      setAdicionado(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={adicionado}
      className={`font-bold px-4 py-2 text-xs uppercase transition-all duration-300 active:scale-95 ${
        adicionado
          ? "bg-green-600 text-white"
          : "bg-white text-black hover:bg-red-600 hover:text-white"
      }`}
    >
      {adicionado ? "✓ Adicionado" : "Adicionar"}
    </button>
  );
}
