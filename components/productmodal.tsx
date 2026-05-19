"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Ruler,
  User,
  Hash,
  Maximize,
} from "lucide-react";
import type { Product, Personalizacao } from "@/components/cartcontext";
import { getDisplayCategory } from "@/lib/categories";
import { getPriceByCategory, getFakeOriginalPrice } from "@/lib/pricing";
import { getOptimizedImageUrl } from "@/lib/images";

// ─── Constantes e Tabelas ────────────────────────────────────────────────────────

const SIZES = ["P", "M", "G", "GG", "G1", "G2"] as const;
type Size = (typeof SIZES)[number];

// Modificadores de preço fixos para tamanhos especiais (G1 e G2 cobram +R$20)
const SIZE_MODIFIER: Record<Size, number> = {
  P: 0, M: 0, G: 0, GG: 0, G1: 20, G2: 20,
};

// Quantidade máxima de miniaturas visíveis na barra inferior ao mesmo tempo
const THUMBS_VISIBLE = 5;

/**
 * Retorna o caminho da imagem da tabela de medidas de acordo com a categoria
 * e o nome da camisa (ex: detecta se a camisa é versão JOGADOR).
 */
function getSizeChartImage(displayCategory: string, nome: string): string {
  const cat = displayCategory.toUpperCase().trim();
  const nomeUpper = nome.toUpperCase();

  // Versão Jogador
  if (nomeUpper.includes("JOGADOR")) return "/Jogador.jpeg";
  // Retrô
  if (cat === "RETRO") return "/Retro.jpeg";
  // Seleção — usa tabela Torcedor (mesmo corte) até enviar arte específica
  if (cat === "SELEÇÃO") return "/Torcedor.jpeg";
  // Padrão (torcedor/temporada)
  return "/Torcedor.jpeg";
}

// ─── Propriedades ─────────────────────────────────────────────────────────────

interface ProductModalProps {
  /** Produto selecionado para exibir no Modal */
  camisa: Product;
  /** Estado que controla se o Modal deve estar visível */
  isOpen: boolean;
  /** Função de callback chamada quando o usuário clica para fechar o Modal */
  onClose: () => void;
  /** Função de callback chamada quando o usuário clica no botão "Adicionar" */
  onAddToCart: (
    produto: Product,
    tamanho: string,
    priceModifier: number,
    personalizacao?: Personalizacao,
  ) => void;
}

/**
 * Componente de Modal rico em detalhes.
 * Apresenta a galeria interativa de imagens (com swipe e zoom dinâmico por mouse tracking),
 * os seletores de tamanho e de personalização e finaliza o processo de adição ao carrinho.
 */
export default function ProductModal({
  camisa,
  isOpen,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  // ─── Estados Locais ───
  const [size, setSize] = useState<Size | "">("");
  const [currentIndex, setCurrentIndex] = useState(0); // Imagem principal ativa
  const [showSizeChart, setShowSizeChart] = useState(false); // Modal sobreposto da tabela de medidas
  const [isFullscreen, setIsFullscreen] = useState(false); // Galeria em tela cheia
  const [addedFeedback, setAddedFeedback] = useState(false); // Feedback visual verde de "Adicionado"
  const [wantsPersonalizacao, setWantsPersonalizacao] = useState(false);
  const [persNome, setPersNome] = useState("");
  const [persNumero, setPersNumero] = useState("");
  
  // Imagens da Galeria
  const [imagens, setImagens] = useState<string[]>([]);
  // Controle de paginação (offset) das miniaturas embaixo da foto principal
  const [thumbOffset, setThumbOffset] = useState(0); 

  // ID da camisa atualmente aberta. Usado para resetar estados instantaneamente.
  const [currentCamisaId, setCurrentCamisaId] = useState<string | null>(null);

  // Derivação de estado síncrona: Quando a camisa muda, reseta os valores
  // ANTES do navegador renderizar a tela. Isso elimina o "fantasma" da foto antiga
  // sem precisar destruir e recriar o modal (o que causaria lentidão e piscar branco).
  if (camisa && camisa.id !== currentCamisaId) {
    setCurrentCamisaId(camisa.id);
    setCurrentIndex(0);
    setThumbOffset(0);
    setSize("");
    setAddedFeedback(false);
    setWantsPersonalizacao(false);
    setPersNome("");
    setPersNumero("");
    setShowSizeChart(false);
    setIsFullscreen(false);
    
    // Inicialmente usamos apenas a imagem principal e a galeria se disponível
    let fotos: string[] = Array.from(
      new Set([camisa.imagem_url, ...(camisa.galeria ?? [])].filter(Boolean)),
    );
    setImagens(fotos.slice(0, 10));
  }

  /**
   * Busca dinâmica de fotos via API Route server-side (/api/images).
   * Funciona em todos os dispositivos sem problemas de CORS.
   */
  useEffect(() => {
    async function fetchAllPhotos() {
      if (!camisa?.imagem_url) return;

      // Fotos já conhecidas: imagem principal + galeria do banco
      const knownPhotos = Array.from(
        new Set([camisa.imagem_url, ...(camisa.galeria ?? [])].filter(Boolean))
      );

      // Chama a API Route server-side para listar as fotos reais que existem no banco
      try {
        const res = await fetch(`/api/images?url=${encodeURIComponent(camisa.imagem_url)}`);
        if (res.ok) {
          const data: { urls: string[] } = await res.json();
          if (data.urls && data.urls.length > 0) {
            // Garante que a imagem principal esteja na primeira posição
            const finalPhotos = Array.from(new Set([camisa.imagem_url, ...data.urls, ...knownPhotos])).filter(Boolean);
            setImagens(finalPhotos.slice(0, 15));
            return;
          }
        }
      } catch {
        // Silencioso — fallback abaixo
      }

      // Fallback final: mostra só as fotos já conhecidas
      setImagens(knownPhotos);
    }

    if (isOpen) {
      fetchAllPhotos();
    }
  }, [camisa?.id, isOpen]);

  // Referência para armazenar a posição inicial de um gesto de touch (Swipe no mobile)
  const touchStartX = useRef<number | null>(null);

  // Estados do Zoom Inteligente
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  /**
   * Captura o movimento do mouse na imagem (Desktop).
   * Altera a posição focal do zoom baseado em onde o cursor está usando transform-origin.
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };



  /** 
   * Sincroniza a barra de miniaturas para que ela role automaticamente caso 
   * o usuário use as setas principais e a imagem saia do campo de visão das miniaturas atuais.
   */
  useEffect(() => {
    setThumbOffset((prev) => {
      if (currentIndex < prev) return currentIndex;
      if (currentIndex >= prev + THUMBS_VISIBLE) return currentIndex - THUMBS_VISIBLE + 1;
      return prev;
    });
  }, [currentIndex]);

  // ─── Handlers de Touch para Mobile ───

  /** Registra a coordenada X onde o usuário tocou na tela pela primeira vez. */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  /** Simula o hover do mouse, movendo a lupa do zoom onde o dedo do usuário está arrastando. */
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const touch = e.touches[0];
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    // Math.max e min evitam que o transform saia da borda limite (0-100%)
    setMousePos({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  /** Ao soltar o dedo, verifica se houve um arrasto longo na horizontal e troca a imagem (Swipe). */
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || isZoomed) return; // Bloqueia swipe quando a imagem está com zoom
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    // Sensibilidade de 40px
    if (Math.abs(diff) > 40) diff > 0 ? nextImage() : prevImage();
    touchStartX.current = null;
  };

  /** Configura listeners globais de Scroll e Escape da janela ao abrir/fechar. */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showSizeChart) setShowSizeChart(false);
        else if (isOpen) onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, showSizeChart, onClose]);

  if (!isOpen || !camisa) return null;

  // ─── Cálculos de Preço e Validação ───

  const displayCategory = getDisplayCategory(camisa.categoria, camisa.nome);
  // O preço exibido deve seguir as regras de negócio em vez do banco de dados cego
  const basePrice = getPriceByCategory(displayCategory, camisa.nome, camisa.preco);
  const priceModifier = size ? SIZE_MODIFIER[size as Size] : 0;
  
  // Regra: Nome válido se deixado em branco (caso a pessoa só queira um número) 
  // OU se tiver pelo menos 2 letras (impede 'A' solto).
  const nomeValido = persNome.trim() === "" || persNome.trim().length >= 2;
  // Regra de personalização global: Se quer personalizar, precisa preencher ou nome, ou número, e eles devem ser válidos.
  const persValid = !wantsPersonalizacao || ((persNome.trim() !== "" || persNumero.trim() !== "") && nomeValido);
  
  // Só podemos adicionar ao carrinho se um tamanho foi selecionado E a validação de texto passou
  const canAdd = !!size && persValid;
  const effectivePrice = basePrice + priceModifier + (wantsPersonalizacao ? 70 : 0);

  const sizeChartImage = getSizeChartImage(displayCategory, camisa.nome);

  // Funções de navegação circular da galeria
  const prevImage = () => setCurrentIndex((p) => (p - 1 + imagens.length) % imagens.length);
  const nextImage = () => setCurrentIndex((p) => (p + 1) % imagens.length);

  /** Prepara os dados validados e envia para o Contexto de Carrinho */
  const handleAdd = () => {
    if (!size || !persValid) return;
    const pers = wantsPersonalizacao ? { nome: persNome.trim(), numero: persNumero.trim() } : undefined;
    
    // Mandamos o produto usando o 'basePrice' calculado como preço da camisa, ignorando possível erro do DB
    onAddToCart({ ...camisa, preco: basePrice }, size, priceModifier, pers);
    
    // Feedback visual temporário antes de fechar/limpar
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-2 md:p-10">
      {/* Backdrop (Camada desfocada do fundo) */}
      <div
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Janela Principal do Modal */}
      <div className="relative bg-zinc-950 border border-zinc-900 w-full max-w-5xl max-h-[100dvh] sm:max-h-[98vh] md:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">

        {/* ── SEÇÃO DA ESQUERDA: GALERIA DE FOTOS ── */}
        <div className="relative w-full md:w-[55%] bg-zinc-900/20 p-3 sm:p-4 md:p-8 flex flex-col items-center justify-center group">
          
          {/* Botão Flutuante (Seta Esquerda) */}
          {imagens.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              aria-label="Imagem anterior"
              className="absolute left-2 md:left-4 z-20 p-3 md:p-3 rounded-full bg-black/80 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Área Interativa da Foto Principal (Zoom & Swipe) */}
          <div
            className={`w-full h-[300px] sm:h-[350px] md:h-[460px] flex items-center justify-center select-none relative overflow-hidden rounded-xl ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsZoomed(!isZoomed)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <Image
              src={imagens[currentIndex] ?? camisa.imagem_url}
              alt={`${camisa.nome} — foto ${currentIndex + 1}`}
              priority
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-contain transition-transform duration-200 ${isZoomed ? "scale-[2.5]" : "drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]"}`}
              style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
            />

            {/* Botão Flutuante (Expandir Tela Cheia) - Movido para o canto inferior direito da imagem */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
              aria-label="Expandir imagem"
              className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-30 p-2.5 rounded-full bg-black/70 text-white backdrop-blur-sm transition-all hover:bg-red-600 shadow-xl border border-white/10 flex items-center justify-center"
            >
              <Maximize size={20} />
            </button>
          </div>

          {/* Botão Flutuante (Seta Direita) */}
          {imagens.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              aria-label="Próxima imagem"
              className="absolute right-2 md:right-4 z-20 p-3 md:p-3 rounded-full bg-black/80 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Barra de Miniaturas (Thumbnails) na base */}
          {imagens.length > 1 && (
            <div className="flex items-center gap-1.5 mt-2 sm:mt-4">
              {/* Botão para rolar miniaturas para trás */}
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

              {/* Rotação e Renderização dos pequenos quadrados de fotos */}
              <div className="flex gap-1.5 sm:gap-2">
                {imagens
                  .slice(thumbOffset, thumbOffset + THUMBS_VISIBLE)
                  .map((img, i) => (
                    <div
                      key={thumbOffset + i}
                      onClick={() => setCurrentIndex(thumbOffset + i)}
                      className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl overflow-hidden cursor-pointer transition-all border-2 flex-shrink-0 ${
                        currentIndex === thumbOffset + i
                          ? "border-red-600 scale-110"
                          : "border-transparent opacity-30 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Miniatura ${thumbOffset + i + 1}`}
                        fill
                        unoptimized
                        sizes="60px"
                        className="object-cover"
                      />
                    </div>
                  ))}
              </div>

              {/* Botão para rolar miniaturas para frente */}
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

        {/* ── SEÇÃO DA DIREITA: ÁREA DE COMPRA/FORMS ── */}
        <div className="w-full md:w-[45%] p-4 sm:p-6 md:p-10 flex flex-col border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950/50 overflow-y-auto">
          {/* Botão de Fechar Superior */}
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-4 right-4 sm:top-6 sm:right-8 text-zinc-500 hover:text-white transition-all hover:rotate-90 z-30 bg-zinc-900/80 rounded-full p-1.5"
          >
            <X size={22} />
          </button>

          {/* Categoria + Nome + Preço */}
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em]">
                {displayCategory}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white uppercase italic leading-none tracking-tighter mb-2 sm:mb-3">
              {camisa.nome}
            </h2>

            <div className="flex items-end gap-3">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-sm line-through">
                  De R$ {getFakeOriginalPrice(basePrice).toFixed(2)}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                  Por R$ {effectivePrice.toFixed(2)}
                </span>
              </div>
              
              {/* Exibe breakdown de valores caso haja adicionais ativos */}
              {(priceModifier > 0 || wantsPersonalizacao) && (
                <div className="flex flex-col mb-0.5">
                  <span className="text-zinc-500 text-[10px] font-normal leading-tight">
                    (base R$ {basePrice.toFixed(2)})
                  </span>
                  <span className="text-zinc-500 text-[10px] font-normal leading-tight">
                    {priceModifier > 0 && `+R$${priceModifier} tamanho `}
                    {wantsPersonalizacao && "+R$70 pers."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Seletor de Tamanho */}
          <div className="mt-4 sm:mt-6">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                Escolha o Tamanho
              </label>
              {/* Link que abre a tabela de medidas */}
              <button
                onClick={() => setShowSizeChart(true)}
                className="text-red-600 text-[9px] font-black underline flex items-center gap-1 hover:text-red-500"
              >
                <Ruler size={12} /> TABELA
              </button>
            </div>

            {/* Grid flexível de botões de tamanho */}
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 h-11 sm:h-12 rounded-2xl font-black transition-all border-2 flex flex-col items-center justify-center ${
                    size === s
                      ? "bg-red-600 border-red-600 text-white scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                      : "bg-transparent border-zinc-900 text-zinc-500 hover:border-zinc-700"
                  }`}
                >
                  <span>{s}</span>
                  {/* Etiqueta +R$20 no botão se for Plus Size */}
                  {(s === "G1" || s === "G2") && (
                    <span className="text-[8px] font-bold text-cyan-400 -mt-0.5">
                      +R$20
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Módulo de Personalização de Camisa */}
          <div className="mt-4 sm:mt-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 sm:p-4">
            {/* Checkbox customizado para habilitar os campos */}
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
                  <span className="text-cyan-400">+R$70</span>
                </p>
                <p className="text-zinc-500 text-[10px]">
                  Nome e/ou número no dorso da camisa
                </p>
              </div>
            </label>

            {/* Campos de Nome e Número exibidos apenas se checkbox estiver marcado */}
            {wantsPersonalizacao && (
              <div className="mt-3 sm:mt-4 flex gap-3">
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
                    minLength={2}
                    className={`w-full bg-zinc-800 border text-white text-xs font-black uppercase tracking-widest py-3 pl-9 pr-3 rounded-xl outline-none transition-all ${
                      persNome.trim().length === 1
                        ? "border-red-500 focus:border-red-500" // Cor de erro se digitou apenas 1 letra
                        : "border-zinc-700 focus:border-red-600"
                    }`}
                  />
                  {/* Aviso de erro sob o campo de nome */}
                  {persNome.trim().length === 1 && (
                    <p className="text-red-500 text-[9px] mt-1 font-bold">Mínimo 2 letras</p>
                  )}
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
                      // Remove qualquer caractere que não seja número (D)
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 2) setPersNumero(val);
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs font-black py-3 pl-9 pr-3 rounded-xl outline-none focus:border-red-600 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões Inferiores Principais (Adicionar ao carrinho ou Fechar) */}
          <div className="flex flex-col gap-3 mt-4 sm:mt-6">
            <button
              disabled={!canAdd}
              onClick={handleAdd}
              className={`w-full text-white font-black py-4 rounded-[1.5rem] uppercase tracking-tighter transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed ${
                addedFeedback ? "bg-green-600" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {addedFeedback ? <Check size={20} /> : <ShoppingBag size={20} />}
              <span>
                {/* Lógica de mensagens de erro ou sucesso dinâmicas no botão */}
                {addedFeedback
                  ? "ADICIONADO!"
                  : !size
                  ? "SELECIONE O TAMANHO"
                  : wantsPersonalizacao && persNome.trim().length === 1
                  ? "NOME PRECISA TER 2+ LETRAS"
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

      {/* OVERLAY SEPARADO: TABELA DE MEDIDAS */}
      {/* Quando a tabela de medidas for acionada, ela renderiza sobre toda a tela */}
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
              src={sizeChartImage}
              alt="Tabela de Medidas"
              className="w-full h-auto rounded-3xl shadow-2xl border border-zinc-800"
            />
          </div>
        </div>
      )}
      {/* OVERLAY SEPARADO: TELA CHEIA (FULLSCREEN ZOOM) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[1005] bg-black flex flex-col">
          {/* Botão Fechar bem visível */}
          <button
            onClick={() => { setIsZoomed(false); setIsFullscreen(false); }}
            className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50 bg-red-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:bg-red-700 transition-colors"
            aria-label="Sair da tela cheia"
          >
            <X size={28} />
          </button>

          {/* Seta Esquerda */}
          {imagens.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-5 rounded-full bg-black/80 text-white transition-all hover:bg-red-600 shadow-xl"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Seta Direita */}
          {imagens.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-5 rounded-full bg-black/80 text-white transition-all hover:bg-red-600 shadow-xl"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Área Interativa da Tela Cheia */}
          <div
            className={`flex-1 w-full h-full flex items-center justify-center select-none overflow-hidden ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsZoomed(!isZoomed)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <Image
              src={imagens[currentIndex] ?? camisa.imagem_url}
              alt={`${camisa.nome} — foto ${currentIndex + 1} em tela cheia`}
              priority
              fill
              unoptimized
              sizes="100vw"
              className={`object-contain transition-transform duration-200 ${isZoomed ? "scale-[2.5]" : ""}`}
              style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
