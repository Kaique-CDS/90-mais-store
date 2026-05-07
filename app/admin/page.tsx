"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    nome: "",
    preco: "",
    categoria: "Nacional",
    descricao: "",
  });
  const [files, setFiles] = useState<FileList | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files) return alert("Selecione as fotos!");
    setLoading(true);
    setMsg("Iniciando decolagem...");

    try {
      const links: string[] = [];

      // 1. Loop para subir todas as fotos de uma vez
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from("camisas")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Pegar link público
        const {
          data: { publicUrl },
        } = supabase.storage.from("camisas").getPublicUrl(filePath);
        links.push(publicUrl);
      }

      // 2. Salvar no Banco de Dados
      const { error: dbError } = await supabase.from("camisetas").insert({
        nome: form.nome,
        preco: parseFloat(form.preco),
        categoria: form.categoria,
        descricao: form.descricao,
        imagem_url: links[0], // A primeira foto vira a principal
        galeria: links, // Todas as fotos vão para o carrossel
      });

      if (dbError) throw dbError;

      setMsg("✅ CAMISA CADASTRADA COM SUCESSO!");
      setForm({ nome: "", preco: "", categoria: "Nacional", descricao: "" });
      setFiles(null);
    } catch (error: any) {
      setMsg("❌ ERRO: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-900 p-8 rounded-xl">
        <h1 className="text-3xl font-black uppercase italic mb-8">
          90+ Express <span className="text-red-600">Uploader</span>
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">
              Nome da Camisa
            </label>
            <input
              required
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded"
              placeholder="Ex: Flamengo Home 2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">
                Preço (R$)
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={form.preco}
                onChange={(e) => setForm({ ...form, preco: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded"
                placeholder="149.90"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">
                Categoria
              </label>
              <select
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded h-[50px]"
              >
                <option>Nacional</option>
                <option>Internacional</option>
                <option>Retro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-2 text-zinc-500">
              Fotos (Selecione todas as 5 de uma vez)
            </label>
            <input
              required
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? "PROCESSANDO..." : "CADASTRAR PRODUTO"}
          </button>

          {msg && <p className="text-center font-bold text-sm">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
