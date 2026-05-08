"use client";

import { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Ruler,
} from "lucide-react";

export default function ProductModal({
  camisa,
  isOpen,
  onClose,
  onAddToCart,
}: any) {
  const [size, setSize] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const imagens = Array.from(
    new Set([camisa?.imagem_url, ...(camisa?.galeria || [])].filter(Boolean)),
  );

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSize("");
      setAddedFeedback(false);
    }
  }, [isOpen, camisa]);

  if (!isOpen || !camisa) return null;

  const handleAdd = () => {
    if (!size) return;
    onAddToCart(camisa, size);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000); // Feedback de 2 segundos
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 md:p-10">
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-zinc-950 border border-zinc-900 w-full max-w-5xl h-fit max-h-[98vh] md:max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* ÁREA DA IMAGEM */}
        <div className="relative w-full md:w-[55%] bg-zinc-900/20 p-4 md:p-8 flex flex-col items-center justify-center group">
          {imagens.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(
                  (prev) => (prev - 1 + imagens.length) % imagens.length,
                );
              }}
              className="absolute left-4 z-20 p-3 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          <div className="w-full h-[320px] md:h-[480px] flex items-center justify-center select-none">
            <img
              key={currentIndex}
              src={imagens[currentIndex] as string}
              className="max-w-full max-h-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-300"
            />
          </div>

          {imagens.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex((prev) => (prev + 1) % imagens.length);
              }}
              className="absolute right-4 z-20 p-3 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div className="flex gap-3 mt-6 overflow-x-auto max-w-full pb-2 scrollbar-none px-4">
            {imagens.map((img: any, i: number) => (
              <img
                key={i}
                src={img}
                onClick={() => setCurrentIndex(i)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover cursor-pointer transition-all border-2 flex-shrink-0 ${currentIndex === i ? "border-red-600 scale-110" : "border-transparent opacity-30 hover:opacity-100"}`}
              />
            ))}
          </div>
        </div>

        {/* ÁREA DE COMPRA */}
        <div className="w-full md:w-[45%] p-8 md:p-12 flex flex-col border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950/50">
          <button
            onClick={onClose}
            className="absolute top-6 right-8 text-zinc-500 hover:text-white transition-all hover:rotate-90 z-30"
          >
            <X size={32} />
          </button>

          <div className="mb-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em]">
                {camisa.categoria}
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic leading-none tracking-tighter mb-4">
              {camisa.nome}
            </h2>
            <p className="text-3xl font-light text-zinc-100">
              R$ {Number(camisa.preco).toFixed(2)}
            </p>

            {/* SELETOR DE TAMANHO */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Escolha o Tamanho
                </label>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="text-red-600 text-[9px] font-black underline flex items-center gap-1 hover:text-red-500"
                >
                  <Ruler size={12} /> TABELA DE MEDIDAS
                </button>
              </div>

              <div className="flex gap-3">
                {["P", "M", "G", "GG"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-14 h-14 rounded-2xl font-black transition-all border-2 flex items-center justify-center ${size === s ? "bg-red-600 border-red-600 text-white scale-110 shadow-[0_0_20px_rgba(220,38,38,0.3)]" : "bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BOTÃO DE ADICIONAR (MULTI) */}
          <div className="flex flex-col gap-3 mt-10">
            <button
              disabled={!size}
              onClick={handleAdd}
              className={`w-full bg-red-600 text-white font-black py-5 rounded-[1.5rem] uppercase tracking-tighter transition-all flex items-center justify-center gap-3 ${addedFeedback ? "bg-green-600" : "hover:bg-red-700"}`}
            >
              {addedFeedback ? <Check size={20} /> : <ShoppingBag size={20} />}
              <span>
                {addedFeedback
                  ? "ADICIONADO!"
                  : size
                    ? `ADICIONAR TAMANHO ${size}`
                    : "SELECIONE O TAMANHO"}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-full border border-zinc-800 text-zinc-500 font-bold py-4 rounded-[1.5rem] text-[10px] uppercase tracking-widest hover:bg-zinc-900 transition-all"
            >
              Finalizar Escolha
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY TABELA DE MEDIDAS */}
      {showSizeChart && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setShowSizeChart(false)}
          />
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute -top-12 right-0 text-white"
            >
              <X size={32} />
            </button>
            <img
              src="/tabela-medidas.png" // NOME DO SEU ARQUIVO DE ARTE
              alt="Tabela de Medidas"
              className="w-full h-auto rounded-3xl shadow-2xl border border-zinc-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}
