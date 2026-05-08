"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Ruler,
  User,
  Hash,
} from "lucide-react";
import type { Product, Personalizacao } from "@/components/cartcontext";
import { getDisplayCategory } from "@/lib/categories";

// ─── Tamanhos ─────────────────────────────────────────────────────────────────

const SIZES = ["P", "M", "G", "GG", "G1", "G2"] as const;
type Size = (typeof SIZES)[number];

const SIZE_MODIFIER: Record<Size, number> = {
  P: 0, M: 0, G: 0, GG: 0, G1: 20, G2: 20,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductModalProps {
  camisa: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    produto: Product,
    tamanho: string,
    priceModifier: number,
    personalizacao?: Personalizacao,
  ) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductModal({
  camisa,
  isOpen,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [size, setSize] = useState<Size | "">("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [wantsPersonalizacao, setWantsPersonalizacao] = useState(false);
  const [persNome, setPersNome] = useState("");
  const [persNumero, setPersNumero] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [thumbOffset, setThumbOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const THUMBS_VISIBLE = 5;

  // Mostra imagens do DB imediatamente; escaneia mais em background
  useEffect(() => {
    if (isOpen && camisa) {
      // Reset imediato
      setCurrentIndex(0);
      setThumbOffset(0);
      setSize("");
      setAddedFeedback(false);
      setWantsPersonalizacao(false);
      setPersNome("");
      setPersNumero("");
      setShowSizeChart(false);

      // Carrega o que já está no banco instantaneamente
      const initial = Array.from(
        new Set([camisa.imagem_url, ...(camisa.galeria ?? [])].filter(Boolean)),
      ).slice(0, 10);
      setImagens(initial);

      // Escaneia sequencialmente (para no primeiro 404) para encontrar extras
      const urlMatch = camisa.imagem_url?.match(/^(.*\/)(\d+)\.jpg$/i);
      if (!urlMatch) return;
      const baseUrl = urlMatch[1];

      let cancelled = false;
      const scan = async () => {
        const found: string[] = [];
        for (let i = 1; i <= 10; i++) {
          if (cancelled) return;
          const url = `${baseUrl}${i}.jpg`;
          try {
            const res = await fetch(url, { method: "HEAD" });
            if (res.ok) found.push(url);
            else break; // para no primeiro 404
          } catch {
            break;
          }
        }
        if (!cancelled && found.length > initial.length) {
          setImagens(found);
        }
      };
      scan();
      return () => { cancelled = true; };
    }
  }, [isOpen, camisa]);

  // Thumb window acompanha currentIndex automaticamente
  useEffect(() => {
    setThumbOffset((prev) => {
      if (currentIndex < prev) return currentIndex;
      if (currentIndex >= prev + THUMBS_VISIBLE) return currentIndex - THUMBS_VISIBLE + 1;
      return prev;
    });
  }, [currentIndex]);

  // Handlers de touch para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? nextImage() : prevImage();
    touchStartX.current = null;
  };

  // Bloquear scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !camisa) return null;

  const priceModifier = size ? SIZE_MODIFIER[size as Size] : 0;
  const persValid =
    !wantsPersonalizacao || (persNome.trim() !== "" || persNumero.trim() !== "");
  const canAdd = !!size && persValid;

  const effectivePrice =
    camisa.preco + priceModifier + (wantsPersonalizacao ? 70 : 0);

  const displayCategory = getDisplayCategory(camisa.categoria, camisa.nome);

  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + imagens.length) % imagens.length);
  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % imagens.length);

  const handleAdd = () => {
    if (!size || !persValid) return;
    const pers =
      wantsPersonalizacao
        ? { nome: persNome.trim(), numero: persNumero.trim() }
        : undefined;
    onAddToCart(camisa, size, priceModifier, pers);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 md:p-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-zinc-950 border border-zinc-900 w-full max-w-5xl max-h-[98vh] md:max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        <div className="relative w-full md:w-[55%] bg-zinc-900/20 p-4 md:p-8 flex flex-col items-center justify-center group">
          {imagens.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              aria-label="Imagem anterior"
              className="absolute left-2 md:left-4 z-20 p-2 md:p-3 rounded-full bg-black/50 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-600"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div
            className="w-full h-[260px] md:h-[460px] flex items-center justify-center select-none cursor-pointer"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={imagens[currentIndex] ?? camisa.imagem_url}
              alt={`${camisa.nome} — foto ${currentIndex + 1}`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="max-w-full max-h-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]"
            />
          </div>

          {imagens.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              aria-label="Próxima imagem"
              className="absolute right-2 md:right-4 z-20 p-2 md:p-3 rounded-full bg-black/50 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-600"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Miniaturas — sem scrollbar, com navegação por setas */}
          {imagens.length > 1 && (
            <div className="flex items-center gap-1.5 mt-4">
              {/* Seta esquerda das thumbs */}
              {imagens.length > THUMBS_VISIBLE && (
                <button
                  onClick={() => setThumbOffset((p) => Math.max(0, p - 1))}
                  disabled={thumbOffset === 0}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 transition-colors flex-shrink-0"
                  aria-label="Thumbs anteriores"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {/* Thumbs visíveis */}
              <div className="flex gap-2">
                {imagens
                  .slice(thumbOffset, thumbOffset + THUMBS_VISIBLE)
                  .map((img, i) => (
                    <img
                      key={thumbOffset + i}
                      src={img}
                      alt={`Miniatura ${thumbOffset + i + 1}`}
                      loading="lazy"
                      onClick={() => setCurrentIndex(thumbOffset + i)}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover cursor-pointer transition-all border-2 flex-shrink-0 ${
                        currentIndex === thumbOffset + i
                          ? "border-red-600 scale-110"
                          : "border-transparent opacity-30 hover:opacity-100"
                      }`}
                    />
                  ))}
              </div>

              {/* Seta direita das thumbs */}
              {imagens.length > THUMBS_VISIBLE && (
                <button
                  onClick={() =>
                    setThumbOffset((p) =>
                      Math.min(p + 1, imagens.length - THUMBS_VISIBLE),
                    )
                  }
                  disabled={thumbOffset >= imagens.length - THUMBS_VISIBLE}
                  className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 transition-colors flex-shrink-0"
                  aria-label="Próximas thumbs"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── ÁREA DE COMPRA ── */}
        <div className="w-full md:w-[45%] p-6 md:p-10 flex flex-col border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950/50 overflow-y-auto">
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-6 right-8 text-zinc-500 hover:text-white transition-all hover:rotate-90 z-30"
          >
            <X size={28} />
          </button>

          {/* Categoria + Nome + Preço */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em]">
                {displayCategory}
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic leading-none tracking-tighter mb-3">
              {camisa.nome}
            </h2>

            <p className="text-2xl font-light text-zinc-100">
              R${" "}
              <span className="font-black text-white">
                {effectivePrice.toFixed(2)}
              </span>
              {(priceModifier > 0 || wantsPersonalizacao) && (
                <span className="text-zinc-500 text-sm font-normal ml-2">
                  (base R$ {camisa.preco.toFixed(2)}
                  {priceModifier > 0 && ` + R$${priceModifier} tamanho`}
                  {wantsPersonalizacao && " + R$70 personalização"})
                </span>
              )}
            </p>
          </div>

          {/* Seletor de Tamanho */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Escolha o Tamanho
              </label>
              <button
                onClick={() => setShowSizeChart(true)}
                className="text-red-600 text-[9px] font-black underline flex items-center gap-1 hover:text-red-500"
              >
                <Ruler size={12} /> TABELA
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 h-12 rounded-2xl font-black transition-all border-2 flex flex-col items-center justify-center ${
                    size === s
                      ? "bg-red-600 border-red-600 text-white scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                      : "bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-700"
                  }`}
                >
                  <span>{s}</span>
                  {(s === "G1" || s === "G2") && (
                    <span className="text-[8px] font-bold text-yellow-400 -mt-0.5">
                      +R$20
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Personalização */}
          <div className="mt-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setWantsPersonalizacao((v) => !v)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  wantsPersonalizacao
                    ? "bg-red-600 border-red-600"
                    : "border-zinc-700 bg-transparent"
                }`}
              >
                {wantsPersonalizacao && <Check size={12} className="text-white" />}
              </div>
              <div>
                <p className="text-white font-black text-xs uppercase tracking-wide">
                  Personalização{" "}
                  <span className="text-yellow-400">+R$70</span>
                </p>
                <p className="text-zinc-500 text-[10px]">
                  Nome e/ou número no dorso da camisa
                </p>
              </div>
            </label>

            {wantsPersonalizacao && (
              <div className="mt-4 flex gap-3">
                <div className="flex-1 relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="text"
                    placeholder="NOME"
                    value={persNome}
                    onChange={(e) => setPersNome(e.target.value.toUpperCase())}
                    maxLength={14}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs font-black uppercase tracking-widest py-3 pl-9 pr-3 rounded-xl outline-none focus:border-red-600 transition-all"
                  />
                </div>
                <div className="w-24 relative">
                  <Hash
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="N°"
                    value={persNumero}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 2) setPersNumero(val);
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs font-black py-3 pl-9 pr-3 rounded-xl outline-none focus:border-red-600 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              disabled={!canAdd}
              onClick={handleAdd}
              className={`w-full text-white font-black py-4 rounded-[1.5rem] uppercase tracking-tighter transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed ${
                addedFeedback ? "bg-green-600" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {addedFeedback ? <Check size={20} /> : <ShoppingBag size={20} />}
              <span>
                {addedFeedback
                  ? "ADICIONADO!"
                  : !size
                  ? "SELECIONE O TAMANHO"
                  : wantsPersonalizacao && !persValid
                  ? "PREENCHA NOME OU NÚMERO"
                  : `ADICIONAR — R$ ${effectivePrice.toFixed(2)}`}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-full border border-zinc-800 text-zinc-500 font-bold py-3 rounded-[1.5rem] text-[10px] uppercase tracking-widest hover:bg-zinc-900 transition-all"
            >
              Continuar Comprando
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
              aria-label="Fechar tabela"
              className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src="/tabela-medidas.png"
              alt="Tabela de Medidas"
              className="w-full h-auto rounded-3xl shadow-2xl border border-zinc-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}
