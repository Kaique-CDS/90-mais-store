"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FixImagesPage() {
  const [camisas, setCamisas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [busca, setBusca] = useState("");

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

  if (loading) return <div className="p-10 text-white font-bold bg-black min-h-screen">Carregando painel oculto...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-2xl max-w-sm w-full border border-zinc-800">
          <h1 className="text-xl font-bold text-white mb-6 text-center">Acesso Restrito</h1>
          <input 
            type="password" 
            placeholder="Senha de acesso" 
            className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg mb-4 outline-none focus:border-red-600 transition-colors"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  const camisasFiltradas = camisas.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="p-4 md:p-10 min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-red-500 uppercase tracking-tighter">
              Gerenciador de Capas
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Painel secreto para corrigir a foto principal das camisas.
            </p>
          </div>
          
          <input 
            type="text" 
            placeholder="Buscar camisa..." 
            className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded-lg outline-none focus:border-red-600 transition-colors w-full md:w-64"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-6">
          {camisasFiltradas.map(camisa => {
            if (!camisa.imagem_url) return null;
            
            const baseUrlMatch = camisa.imagem_url.match(/^(.*\/)(\d+)\.(jpg|jpeg|png|webp|heic)$/i);
            if (!baseUrlMatch) return null;
            
            const baseUrl = baseUrlMatch[1];
            const ext = baseUrlMatch[3];
            
            const options = Array.from({ length: 12 }, (_, i) => `${baseUrl}${i + 1}.${ext}`);

            return (
              <div key={camisa.id} className="p-4 border border-zinc-900 rounded-2xl bg-[#0a0a0a]">
                <h2 className="text-lg font-bold mb-4 uppercase tracking-tight text-zinc-200">{camisa.nome}</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
                  {options.map(url => (
                    <div 
                      key={url} 
                      className={`shrink-0 border-2 rounded-xl overflow-hidden transition-all ${
                        camisa.imagem_url === url ? 'border-red-600 scale-105 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-transparent hover:border-zinc-700'
                      }`}
                    >
                      <img 
                        src={url} 
                        alt="" 
                        className="w-24 h-24 md:w-32 md:h-32 object-cover bg-zinc-950 cursor-pointer"
                        onClick={() => updateImage(camisa.id, url)}
                        onError={(e) => { 
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) parent.style.display = 'none'; 
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {camisasFiltradas.length === 0 && (
            <div className="text-center py-20 text-zinc-500">Nenhuma camisa encontrada.</div>
          )}
        </div>
      </div>
    </div>
  );
}
