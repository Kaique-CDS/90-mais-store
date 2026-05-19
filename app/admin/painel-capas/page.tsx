"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getDisplayCategory } from "@/lib/categories";
import { 
  Search, 
  X, 
  SlidersHorizontal,
  ArrowLeft, 
  FolderOpen,
  Image as ImageIcon,
  Check,
  RotateCw,
  Settings
} from "lucide-react";
import Link from "next/link";

interface CamisaRowProps {
  camisa: any;
  updateImage: (id: string, newUrl: string) => void;
}

function CamisaRow({ camisa, updateImage }: CamisaRowProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      if (!camisa.imagem_url) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/images?url=${encodeURIComponent(camisa.imagem_url)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.urls && data.urls.length > 0) {
            setOptions(data.urls);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Erro ao carregar imagens para", camisa.nome, err);
      }
      
      // Fallback a partir do padrão sequencial
      const baseUrlMatch = camisa.imagem_url.match(/^(.*\/)(\d+)\.(jpg|jpeg|png|webp|heic)$/i);
      if (baseUrlMatch) {
        const baseUrl = baseUrlMatch[1];
        const ext = baseUrlMatch[3];
        const fallback = Array.from({ length: 12 }, (_, i) => `${baseUrl}${i + 1}.${ext}`);
        setOptions(fallback);
      } else {
        setOptions([camisa.imagem_url]);
      }
      setLoading(false);
    }

    loadImages();
  }, [camisa.imagem_url, camisa.nome]);

  if (!camisa.imagem_url) return null;

  // Extrai o caminho decodificado de forma amigável para exibição
  // Ex: "Brasileirao/Santos/2012/I" -> "Brasileirão > Santos > 2012 > I"
  let friendlyPath = "";
  try {
    const urlParts = camisa.imagem_url.split('/public/camisas/');
    if (urlParts.length >= 2) {
      const fullPath = urlParts[1];
      const pathParts = fullPath.split('/');
      pathParts.pop(); // remove o nome do arquivo
      friendlyPath = decodeURIComponent(pathParts.join("  /  ")).toUpperCase();
    }
  } catch (e) {
    console.error("Erro ao amigar path", e);
  }

  return (
    <div className="p-5 border border-zinc-900 rounded-3xl bg-[#09090b]/80 backdrop-blur-sm transition-all duration-300 hover:border-zinc-800/80 group">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-zinc-105 group-hover:text-white transition-colors">
              {camisa.nome}
            </h2>
          </div>
          {friendlyPath && (
            <p className="text-[10px] text-zinc-500 tracking-wider font-semibold uppercase flex items-center gap-1.5 mt-1">
              <FolderOpen size={10} className="text-zinc-650" />
              {friendlyPath}
            </p>
          )}
        </div>
        <div>
          {loading ? (
            <span className="text-[10px] bg-zinc-900 text-zinc-500 px-3 py-1 rounded-full uppercase tracking-wider font-bold animate-pulse inline-flex items-center gap-1.5 border border-zinc-800/50">
              <RotateCw size={9} className="animate-spin text-red-500" />
              Buscando fotos...
            </span>
          ) : (
            <span className="text-[10px] bg-red-950/20 text-red-400 border border-red-900/40 px-3 py-1 rounded-full uppercase tracking-wider font-bold inline-flex items-center gap-1">
              <ImageIcon size={9} />
              {options.length} {options.length === 1 ? 'Foto' : 'Fotos'}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950/20">
        {options.map((url, idx) => {
          const isActive = camisa.imagem_url === url;
          // Extrai o nome do arquivo para usar de rótulo (ex: "1.jpg")
          let fileName = `Foto ${idx + 1}`;
          try {
            const parts = url.split('/');
            fileName = decodeURIComponent(parts[parts.length - 1]);
          } catch {}

          return (
            <div 
              key={url} 
              className={`shrink-0 flex flex-col items-center gap-2 relative transition-all duration-300 ${
                isActive ? 'scale-102' : 'hover:scale-[1.01]'
              }`}
            >
              <div 
                className={`relative rounded-2xl overflow-hidden border-3 transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'border-red-650 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                    : 'border-zinc-850 hover:border-zinc-700'
                }`}
                onClick={() => {
                  if (!isActive) updateImage(camisa.id, url);
                }}
              >
                <img 
                  src={url} 
                  alt="" 
                  className="w-28 h-28 md:w-36 md:h-36 object-cover bg-zinc-950"
                  onError={(e) => { 
                    const parent = (e.target as HTMLElement).parentElement?.parentElement;
                    if (parent) parent.style.display = 'none'; 
                  }}
                />
                
                {isActive && (
                  <div className="absolute inset-0 bg-red-950/10 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                    <span className="bg-red-600 text-white rounded-full p-1.5 shadow-lg border border-red-500">
                      <Check size={14} className="stroke-[3]" />
                    </span>
                  </div>
                )}
              </div>
              
              <span className={`text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-md ${
                isActive ? 'bg-red-950/40 text-red-400 border border-red-900/30' : 'bg-zinc-900/60 text-zinc-500'
              }`}>
                {fileName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FixImagesPage() {
  const [camisas, setCamisas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("TUDO");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("camisetas").select("*").order("nome");
      if (data) setCamisas(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "90maisadmin") {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta");
    }
  };

  const updateImage = async (id: string, newUrl: string) => {
    // Atualiza otimista na tela
    setCamisas(prev => prev.map(c => c.id === id ? { ...c, imagem_url: newUrl } : c));
    
    // Chama a API com a senha para ter permissão
    const res = await fetch("/api/update-cover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newUrl, password: passwordInput })
    });
    
    if (!res.ok) {
      alert("Erro ao atualizar a imagem no banco de dados.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="h-10 w-10 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 animate-pulse">
          Carregando painel de capas...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background light glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <form onSubmit={handleLogin} className="relative bg-zinc-950 border border-zinc-900/80 p-8 rounded-3xl max-w-sm w-full shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-12 w-12 bg-red-950/30 border border-red-900/50 rounded-2xl flex items-center justify-center text-red-500 mb-4 shadow-inner">
              <Settings size={22} className="animate-spin-[duration:10s]" />
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight uppercase">Painel de Capas</h1>
            <p className="text-zinc-500 text-xs mt-1 font-semibold uppercase tracking-wider">Acesso Restrito</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="password" 
                placeholder="Insira a senha mestra" 
                className="w-full bg-zinc-900/40 border border-zinc-800/85 text-white p-3.5 pl-4 rounded-2xl outline-none focus:border-red-600/60 focus:ring-2 focus:ring-red-500/10 transition-all text-sm placeholder-zinc-600"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
              />
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.25)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:scale-[1.01] active:scale-[0.99] text-sm uppercase tracking-wider">
              Autenticar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Mapeia todas as camisetas adicionando a categoria do display
  const camisasComCategoria = camisas.map(c => ({
    ...c,
    displayCategory: getDisplayCategory(c.categoria, c.nome, c.imagem_url)
  }));

  // Aplica os filtros de busca e categoria
  const camisasFiltradas = camisasComCategoria.filter(c => {
    const matchesSearch = c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchesCategory = categoriaAtiva === "TUDO" || c.displayCategory === categoriaAtiva;
    return matchesSearch && matchesCategory;
  });

  // Categorias disponíveis para filtro
  const categorias = [
    { id: "TUDO", label: "TUDO" },
    { id: "BRASILEIROS", label: "BRASILEIRÃO" },
    { id: "EUROPEUS", label: "EUROPA" },
    { id: "SELEÇÃO", label: "SELEÇÕES" },
    { id: "OUTROS", label: "OUTROS" },
    { id: "RETRO", label: "RETRÔ" },
    { id: "TREINO", label: "TREINO" }
  ];

  return (
    <div className="p-4 md:p-10 min-h-screen bg-black text-white relative">
      {/* Glow de fundo decorativo */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="h-10 w-10 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
              title="Voltar para a Loja"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-red-500 uppercase tracking-tighter">
                  Gerenciador de Capas
                </h1>
                <span className="text-[9px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest animate-pulse">
                  ADMIN
                </span>
              </div>
              <p className="text-zinc-500 text-xs mt-0.5 font-semibold">
                Defina a foto principal do catálogo de camisetas em tempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Deck de Pesquisa e Filtros Glassmorphism */}
        <div className="bg-[#09090b]/80 border border-zinc-900/80 rounded-3xl p-5 mb-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between">
            
            {/* Campo de Pesquisa */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar camisa pelo nome..." 
                className="w-full bg-zinc-950/60 border border-zinc-900 text-white p-3.5 pl-11 pr-10 rounded-2xl outline-none focus:border-red-650/50 focus:ring-2 focus:ring-red-500/10 transition-all text-sm placeholder-zinc-550"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button 
                  onClick={() => setBusca("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 rounded-full transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Chips de Categoria */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <div className="flex gap-2">
                {categorias.map((cat) => {
                  const isActive = categoriaAtiva === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoriaAtiva(cat.id)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-550' 
                          : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sub-barra de Status do Filtro */}
          {(busca || categoriaAtiva !== "TUDO") && (
            <div className="mt-4 pt-4 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-400 font-medium">
                <SlidersHorizontal size={12} className="text-red-500" />
                <span>Filtro ativo:</span>
                {busca && (
                  <span className="bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center gap-1 font-bold">
                    Busca: "{busca}"
                    <button onClick={() => setBusca("")} className="hover:text-red-500 cursor-pointer"><X size={10} /></button>
                  </span>
                )}
                {categoriaAtiva !== "TUDO" && (
                  <span className="bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center gap-1 font-bold">
                    Liga: {categorias.find(c => c.id === categoriaAtiva)?.label}
                    <button onClick={() => setCategoriaAtiva("TUDO")} className="hover:text-red-500 cursor-pointer"><X size={10} /></button>
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => {
                  setBusca("");
                  setCategoriaAtiva("TUDO");
                }}
                className="text-red-500 hover:text-red-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        <div className="flex justify-between items-center mb-5 px-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span>
              {camisasFiltradas.length} {camisasFiltradas.length === 1 ? 'Camisa encontrada' : 'Camisas encontradas'}
            </span>
          </div>
          {camisas.length > 0 && camisasFiltradas.length !== camisas.length && (
            <span className="text-[10px] text-zinc-650 font-bold uppercase tracking-wider">
              Filtrado de um total de {camisas.length}
            </span>
          )}
        </div>

        {/* Lista de Camisas */}
        <div className="flex flex-col gap-6">
          {camisasFiltradas.map(camisa => (
            <CamisaRow 
              key={camisa.id} 
              camisa={camisa} 
              updateImage={updateImage} 
            />
          ))}
          
          {camisasFiltradas.length === 0 && (
            <div className="text-center py-24 bg-[#09090b]/40 rounded-3xl border border-zinc-900/60 flex flex-col items-center justify-center p-6">
              <div className="h-12 w-12 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl flex items-center justify-center mb-3">
                <Search size={20} />
              </div>
              <p className="text-zinc-400 font-bold tracking-tight text-sm">Nenhuma camisa corresponde à busca</p>
              <p className="text-zinc-600 text-xs mt-1">Experimente alterar os termos de pesquisa ou remover as categorias selecionadas.</p>
              {(busca || categoriaAtiva !== "TUDO") && (
                <button 
                  onClick={() => {
                    setBusca("");
                    setCategoriaAtiva("TUDO");
                  }}
                  className="mt-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-200 font-bold px-4 py-2 rounded-xl text-xs uppercase transition-all cursor-pointer"
                >
                  Resetar Filtros
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
