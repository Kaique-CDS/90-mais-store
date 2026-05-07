"use client";

import { useCartStore } from "@/store/cartstore";
import { useEffect, useState } from "react";

export default function CartHeader() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart); // Puxando a função de abrir

  const totalItems = items.reduce((acc, item) => acc + item.quantidade, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex gap-4">
      <div
        onClick={openCart}
        className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 relative cursor-pointer hover:bg-zinc-800 transition-colors"
      >
        🛒
        {isMounted && totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
            {totalItems}
          </span>
        )}
      </div>
    </div>
  );
}
