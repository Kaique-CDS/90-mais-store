"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Check,
  Loader2,
  ImagePlus,
  Package,
  Tag,
  DollarSign,
  FolderOpen,
  Shirt,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "90maisadmin";

const CATEGORIA_OPTIONS = [
  { value: "EUROPEUS",    label: "🌍 Europeus" },
  { value: "BRASILEIROS", label: "🇧🇷 Brasileirão" },
  { value: "SELEÇÕES",    label: "🏆 Seleções" },
  { value: "OUTROS",      label: "🌐 Outros" },
  { value: "RETRO",       label: "⏳ Retrô" },
  { value: "TREINO",      label: "👟 Treino" },
];

const STORAGE_BASE_MAP: Record<string, string> = {
  EUROPEUS:    "Europeu",
  BRASILEIROS: "Brasileirao",
  SELEÇÕES:    "Selecao",
  OUTROS:      "Outros lugares do mundo",
  RETRO:       "Europeu",
  TREINO:      "Europeu",
};

const MAX_SIZE_MB = 1.5;     // tamanho alvo por imagem em MB
const MAX_DIMENSION = 1600;  // largura/altura máxima em px
const JPEG_QUALITY = 0.82;   // qualidade JPEG (0-1)

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PreviewFile {
  id: string;
  name: string;
  originalSize: number;
  compressedSize?: number;
  blob?: Blob;
  previewUrl: string;
  status: "pending" | "compressing" | "ready" | "error";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Comprime uma imagem usando o Canvas API do navegador.
 * Redimensiona para no máximo MAX_DIMENSION px e converte para JPEG.
 */
async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Redimensiona mantendo proporção se exceder o limite
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Falha na compressão"));
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao carregar imagem"));
    };

    img.src = url;
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

// ─── Componente Principal ────────────────────────────────────────────────────

export default function CadastrarCamisaPage() {
  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Form
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("EUROPEUS");
  const [preco, setPreco] = useState("149.99");
  const [storagePath, setStoragePath] = useState("");
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Autenticação ──
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Senha incorreta. Tente novamente.");
    }
  };

  // ── Sugestão automática de path no storage ──
  const suggestPath = (n: string, cat: string) => {
    const base = STORAGE_BASE_MAP[cat] || "Europeu";
    // Detecta padrão de temporada: "Barcelona 25-26 I" → "Europeu/Barcelona/25-26/I"
    // Detecta retrô: "Barcelona Retrô 2009" → "Europeu/Barcelona/RETRO/2009"
    const nameClean = n.trim();
    const parts = nameClean.split(/\s+/);
    if (parts.length >= 2) {
      const teamParts: string[] = [];
      const restParts: string[] = [];
      let foundSeason = false;
      
      for (const p of parts) {
        if (!foundSeason && (p.match(/^\d{2}-\d{2}$/) || p.match(/^(retr[oô]|RETRO)/i) || p.match(/^\d{4}$/))) {
          foundSeason = true;
        }
        if (!foundSeason) teamParts.push(p);
        else restParts.push(p);
      }
      
      const team = teamParts.join(" ");
      
      if (restParts.length > 0) {
        const isRetro = restParts[0].toLowerCase().includes("retr");
        if (isRetro) {
          const year = restParts[1] || "";
          const variant = restParts[2] || "";
          const path = [base, team, "RETRO", year, variant].filter(Boolean).join("/");
          return path;
        } else {
          const path = [base, team, ...restParts].filter(Boolean).join("/");
          return path;
        }
      }
      return `${base}/${team}`;
    }
    return base;
  };

  const handleNomeChange = (v: string) => {
    setNome(v);
    if (!storagePath || storagePath === suggestPath(nome, categoria)) {
      setStoragePath(suggestPath(v, categoria));
    }
  };

  const handleCatChange = (v: string) => {
    setCategoria(v);
    setStoragePath(suggestPath(nome, v));
    // Ajusta preço padrão por categoria
    if (v === "RETRO" && preco === "149.99") setPreco("199.99");
    if (v !== "RETRO" && preco === "199.99") setPreco("149.99");
  };

  // ── Processamento de imagens ──
  const processFiles = useCallback(async (raw: FileList | File[]) => {
    const newFiles: PreviewFile[] = Array.from(raw)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: uid(),
        name: f.name,
        originalSize: f.size,
        previewUrl: URL.createObjectURL(f),
        status: "compressing" as const,
      }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Comprime cada imagem
    for (let i = 0; i < Array.from(raw).length; i++) {
      const originalFile = Array.from(raw)[i];
      if (!originalFile.type.startsWith("image/")) continue;
      const pf = newFiles[i];

      try {
        const compressed = await compressImage(originalFile);
        const previewUrl = URL.createObjectURL(compressed);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === pf.id
              ? { ...f, blob: compressed, compressedSize: compressed.size, previewUrl, status: "ready" }
              : f,
          ),
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.id === pf.id ? { ...f, status: "error" } : f)),
        );
      }
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const toRemove = prev.find((f) => f.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const moveFile = (id: string, dir: -1 | 1) => {
    setFiles((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const readyFiles = files.filter((f) => f.status === "ready" && f.blob);
    if (readyFiles.length === 0) {
      setResult({ success: false, message: "Nenhuma imagem pronta para envio." });
      return;
    }
    if (!nome.trim() || !storagePath.trim()) {
      setResult({ success: false, message: "Nome e caminho de armazenamento são obrigatórios." });
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("password", ADMIN_PASSWORD);
      fd.append("nome", nome.trim());
      fd.append("categoria", categoria);
      fd.append("preco", preco);
      fd.append("storagePath", storagePath.trim());

      readyFiles.forEach((f, i) => {
        fd.append("images", f.blob!, `${i + 1}.jpg`);
      });

      const res = await fetch("/api/upload-camisa", { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: `✅ "${data.record.nome}" cadastrada com ${data.uploadedCount} foto(s)!`,
        });
        // Reset form
        setNome("");
        setStoragePath("");
        setPreco("149.99");
        setCategoria("EUROPEUS");
        files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        setFiles([]);
      } else {
        setResult({ success: false, message: data.error || "Erro desconhecido." });
      }
    } catch (err) {
      setResult({ success: false, message: "Falha na conexão com o servidor." });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Login Screen ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(220,38,38,0.08)_0%,_transparent_60%)] pointer-events-none" />
        <form onSubmit={handleLogin} className="relative bg-zinc-950 border border-zinc-900 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-red-950/30 border border-red-900/40 rounded-2xl flex items-center justify-center mb-4">
              <Shirt size={26} className="text-red-500" />
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Cadastrar Camisa</h1>
            <p className="text-zinc-500 text-xs mt-1 font-semibold uppercase tracking-wider">Painel Admin · 90+ Store</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Senha de administrador"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white p-4 rounded-2xl outline-none focus:border-red-600 transition-all text-sm placeholder-zinc-600"
              autoFocus
            />
            {authError && (
              <p className="text-red-500 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle size={12} /> {authError}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all text-sm uppercase tracking-widest active:scale-95"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Admin Panel ──
  const readyCount = files.filter((f) => f.status === "ready").length;
  const allReady = readyCount === files.length && files.length > 0;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Background glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(220,38,38,0.07)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/admin/painel-capas"
            className="w-10 h-10 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-2xl flex items-center justify-center transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                Cadastrar <span className="text-red-500">Camisa</span>
              </h1>
              <span className="text-[9px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-md font-black uppercase tracking-widest">
                ADMIN
              </span>
            </div>
            <p className="text-zinc-500 text-xs mt-0.5">
              Upload com compressão automática · Integração direta com Supabase
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Bloco 1: Informações ── */}
          <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={14} className="text-red-500" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Informações da Camisa</h2>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                Nome *
              </label>
              <input
                type="text"
                placeholder="Ex: Barcelona Retrô 2010"
                value={nome}
                onChange={(e) => handleNomeChange(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 text-white px-4 py-3.5 rounded-2xl outline-none transition-all text-sm font-bold placeholder-zinc-700 uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Categoria */}
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                  Categoria *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => handleCatChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 text-white px-4 py-3.5 rounded-2xl outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                >
                  {CATEGORIA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço */}
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                  Preço (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="149.99"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 text-white pl-10 pr-4 py-3.5 rounded-2xl outline-none transition-all text-sm font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Preços de referência rápida */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Padrão", val: "149.99" },
                { label: "26-27", val: "169.99" },
                { label: "Retrô", val: "199.99" },
                { label: "Jogador", val: "219.00" },
                { label: "Seleção", val: "159.99" },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setPreco(p.val)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                    preco === p.val
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                  }`}
                >
                  {p.label} · R${p.val}
                </button>
              ))}
            </div>
          </section>

          {/* ── Bloco 2: Caminho no Storage ── */}
          <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen size={14} className="text-red-500" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Caminho no Storage</h2>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-3 mb-4 flex items-start gap-2">
              <Info size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-zinc-400 text-xs leading-relaxed">
                Caminho gerado automaticamente pelo nome. As imagens serão salvas como{" "}
                <code className="text-zinc-300 bg-zinc-800 px-1 rounded">1.jpg, 2.jpg...</code> dentro desta pasta.
              </p>
            </div>

            <input
              type="text"
              placeholder="Ex: Europeu/Barcelona/RETRO/2010"
              value={storagePath}
              onChange={(e) => setStoragePath(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-600 text-white px-4 py-3.5 rounded-2xl outline-none transition-all text-xs font-mono placeholder-zinc-700"
            />

            {storagePath && (
              <p className="text-zinc-600 text-[10px] mt-2 font-mono">
                📁 camisas/{storagePath}/1.jpg
              </p>
            )}
          </section>

          {/* ── Bloco 3: Upload de Imagens ── */}
          <section className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImagePlus size={14} className="text-red-500" />
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Fotos da Camisa
                </h2>
              </div>
              {files.length > 0 && (
                <span className="text-[10px] font-black bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-xl">
                  {readyCount}/{files.length} prontas
                </span>
              )}
            </div>

            {/* Zona de Drop */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-red-500 bg-red-950/10"
                  : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && processFiles(e.target.files)}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging ? "bg-red-600" : "bg-zinc-900 border border-zinc-800"
                }`}>
                  <Upload size={20} className={isDragging ? "text-white" : "text-zinc-500"} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-300">
                    {isDragging ? "Solte para adicionar" : "Arraste fotos aqui"}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    ou clique para selecionar · JPG, PNG, WEBP
                  </p>
                  <p className="text-[10px] text-zinc-700 mt-1">
                    Compressão automática para máx. ~{MAX_SIZE_MB}MB/foto · {MAX_DIMENSION}px max
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de previews */}
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {files.map((f, idx) => (
                  <div key={f.id} className="relative group rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    {/* Preview Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.previewUrl}
                      alt={f.name}
                      className="w-full aspect-square object-cover"
                    />

                    {/* Overlay de status */}
                    {f.status === "compressing" && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                        <Loader2 size={20} className="text-red-500 animate-spin" />
                        <span className="text-[9px] text-white font-bold uppercase">Comprimindo...</span>
                      </div>
                    )}
                    {f.status === "error" && (
                      <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center gap-1">
                        <AlertCircle size={18} className="text-red-400" />
                        <span className="text-[9px] text-red-300 font-bold uppercase">Erro</span>
                      </div>
                    )}

                    {/* Badge de ordem */}
                    <div className="absolute top-2 left-2 w-5 h-5 bg-black/80 rounded-lg flex items-center justify-center text-[9px] font-black text-white border border-white/10">
                      {idx + 1}
                    </div>

                    {/* Tamanho comprimido */}
                    {f.status === "ready" && f.compressedSize && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 px-2 py-1 text-[8px] font-bold text-green-400 flex items-center justify-between">
                        <span>✓ {formatBytes(f.compressedSize)}</span>
                        <span className="text-zinc-500 line-through">{formatBytes(f.originalSize)}</span>
                      </div>
                    )}

                    {/* Botões de ação (aparecem no hover) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveFile(f.id, -1)}
                          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center justify-center text-[8px] font-black transition-colors shadow-lg"
                        >
                          ↑
                        </button>
                      )}
                      {idx < files.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveFile(f.id, 1)}
                          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center justify-center text-[8px] font-black transition-colors shadow-lg"
                        >
                          ↓
                        </button>
                      )}
                    </div>

                    {/* Badge "Capa" na primeira imagem */}
                    {idx === 0 && (
                      <div className="absolute top-2 left-7 bg-red-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">
                        CAPA
                      </div>
                    )}
                  </div>
                ))}

                {/* Botão de adicionar mais */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 transition-all"
                >
                  <ImagePlus size={20} />
                  <span className="text-[9px] font-bold uppercase">+ Fotos</span>
                </button>
              </div>
            )}
          </section>

          {/* ── Resultado ── */}
          {result && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
              result.success
                ? "bg-green-950/20 border-green-900/40 text-green-400"
                : "bg-red-950/20 border-red-900/40 text-red-400"
            }`}>
              {result.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-bold">{result.message}</p>
            </div>
          )}

          {/* ── Preview do que vai ser enviado ── */}
          {nome && storagePath && allReady && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Resumo do Cadastro</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-xl font-bold">
                  📛 {nome}
                </span>
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-xl font-bold">
                  🏷️ {categoria}
                </span>
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-xl font-bold">
                  💰 R$ {preco}
                </span>
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-xl font-bold">
                  🖼️ {readyCount} foto(s)
                </span>
              </div>
              <p className="text-zinc-600 text-[10px] font-mono">📁 camisas/{storagePath}/</p>
            </div>
          )}

          {/* ── Botão Submit ── */}
          <button
            type="submit"
            disabled={submitting || !allReady || !nome.trim() || !storagePath.trim()}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              submitting || !allReady || !nome.trim() || !storagePath.trim()
                ? "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] active:scale-95"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Enviando para o Supabase...
              </>
            ) : (
              <>
                <Package size={18} />
                {!allReady && files.length > 0
                  ? `Aguardando compressão... (${readyCount}/${files.length})`
                  : files.length === 0
                  ? "Adicione fotos para continuar"
                  : `Cadastrar Camisa · ${readyCount} foto(s)`}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
