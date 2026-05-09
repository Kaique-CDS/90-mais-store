"use client";

import { useState, useEffect } from "react";

const IMAGES = [
  "banner3.png",
  "banner2.png",
  "banner1.png"
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full relative overflow-hidden rounded-[2rem] mt-6 border border-zinc-900 group shadow-2xl bg-zinc-950">
      {/* Spacer invisível para definir a altura exata do container baseada na imagem */}
      <img src={IMAGES[0]} alt="spacer" className="w-full h-auto opacity-0 pointer-events-none block" />

      {IMAGES.map((img, i) => (
        <img
          key={img}
          src={img}
          alt={`Banner ${i + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"
            }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {IMAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? "w-6 bg-red-600" : "w-1.5 bg-white/30"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
