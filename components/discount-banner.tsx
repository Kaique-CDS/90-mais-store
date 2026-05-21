"use client";

import { useEffect, useRef, useState } from "react";

/**
 * DiscountBanner — Banner de desconto progressivo para a 90+ Store.
 * Design premium inspirado em lojas de sportswear de alto nível.
 * Aparece no topo da header com animação de entrada suave e pode ser dispensado.
 */
export default function DiscountBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animação de entrada após mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Efeito de pulso leve nos ícones
  useEffect(() => {
    intervalRef.current = setInterval(() => setTick((p) => p + 1), 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`discount-banner-root w-full transition-all duration-700 ease-out ${
        visible ? "opacity-100 max-h-24" : "opacity-0 max-h-0"
      } overflow-hidden`}
      style={{ willChange: "max-height, opacity" }}
    >
      <div className="discount-banner-inner relative flex items-center justify-center px-4 py-3 overflow-hidden">
        {/* ── Fundo gradiente animado ── */}
        <div className="discount-banner-bg" aria-hidden="true" />

        {/* ── Brilho diagonal ── */}
        <div className="discount-banner-shine" aria-hidden="true" />

        {/* ── Conteúdo central ── */}
        <div className="relative z-10 flex items-center gap-3 sm:gap-5 flex-wrap justify-center">
          {/* Ícone / badge esquerdo */}
          <span
            className={`discount-banner-badge transition-transform duration-300 ${
              tick % 2 === 0 ? "scale-110" : "scale-100"
            }`}
            aria-hidden="true"
          >
            ⚽
          </span>

          {/* Texto principal */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <span className="discount-banner-label">
              A partir da 2ª camisa
            </span>
            <div className="discount-banner-divider hidden sm:block" aria-hidden="true" />
            <span className="discount-banner-highlight">
              5% de desconto
            </span>
            <div className="discount-banner-divider hidden sm:block" aria-hidden="true" />
            <span className="discount-banner-sub">
              automático no carrinho
            </span>
          </div>

          {/* Ícone / badge direito */}
          <span
            className={`discount-banner-badge transition-transform duration-300 ${
              tick % 2 !== 0 ? "scale-110" : "scale-100"
            }`}
            aria-hidden="true"
          >
            🏆
          </span>
        </div>

        {/* ── Botão fechar ── */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso de desconto"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Estilos embutidos (sem TailwindCSS personalizado) ── */}
      <style jsx>{`
        .discount-banner-inner {
          background: linear-gradient(
            135deg,
            #0f0f0f 0%,
            #1a0505 20%,
            #2d0808 40%,
            #1a0505 60%,
            #0f0f0f 100%
          );
          border-bottom: 1px solid rgba(220, 38, 38, 0.25);
          min-height: 48px;
        }

        .discount-banner-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(220, 38, 38, 0.06) 25%,
            rgba(220, 38, 38, 0.12) 50%,
            rgba(220, 38, 38, 0.06) 75%,
            transparent 100%
          );
          animation: bannerPulse 4s ease-in-out infinite;
        }

        .discount-banner-shine {
          position: absolute;
          top: -20px;
          left: -80px;
          width: 60px;
          height: 200px;
          background: linear-gradient(
            105deg,
            transparent 0%,
            rgba(255, 255, 255, 0.04) 50%,
            transparent 100%
          );
          transform: skewX(-20deg);
          animation: bannerShine 6s ease-in-out infinite;
        }

        .discount-banner-badge {
          font-size: 1.1rem;
          display: inline-block;
          filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.5));
        }

        .discount-banner-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .discount-banner-highlight {
          color: #fff;
          font-size: 0.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
          text-shadow: 0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.4);
          background: linear-gradient(135deg, #fff 0%, #ffa0a0 50%, #fff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerText 3s ease-in-out infinite;
          background-size: 200% auto;
        }

        .discount-banner-sub {
          color: rgba(255, 255, 255, 0.45);
          font-size: 0.6rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        .discount-banner-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.6);
          flex-shrink: 0;
        }

        @keyframes bannerPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes bannerShine {
          0% { left: -80px; opacity: 0; }
          10% { opacity: 1; }
          70% { opacity: 1; }
          100% { left: calc(100% + 80px); opacity: 0; }
        }

        @keyframes shimmerText {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }

        @media (max-width: 640px) {
          .discount-banner-label,
          .discount-banner-sub {
            font-size: 0.58rem;
          }
          .discount-banner-highlight {
            font-size: 0.72rem;
          }
        }
      `}</style>
    </div>
  );
}
