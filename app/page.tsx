import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data: camisetas } = await supabase.from("camisetas").select("*");

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600">
      {/* HEADER PROFISSIONAL */}
      <nav className="border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            90+ <span className="text-red-600">Store</span>
          </h1>
          <div className="flex gap-4">
            <div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
              🛒
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* TÍTULO DA SEÇÃO */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-8 w-2 bg-red-600"></div>
          <h2 className="text-4xl font-bold uppercase tracking-tight">
            O Catálogo
          </h2>
        </div>

        {/* GRID DE PRODUTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {camisetas?.map((camisa) => (
            <div
              key={camisa.id}
              className="group relative flex flex-col bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden hover:border-red-600 transition-all duration-300"
            >
              {/* ÁREA DA IMAGEM */}
              <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden">
                {camisa.imagem_url ? (
                  <img
                    src={camisa.imagem_url}
                    alt={camisa.nome}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black italic text-4xl">
                    90+
                  </div>
                )}
                {/* TAG DE CATEGORIA */}
                <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                  {camisa.categoria || "Classic"}
                </span>
              </div>

              {/* INFO DO PRODUTO */}
              <div className="p-5">
                <h3 className="text-xl font-bold uppercase tracking-tight mb-1 group-hover:text-red-500 transition-colors">
                  {camisa.nome}
                </h3>
                <p className="text-zinc-500 text-sm mb-4 line-clamp-1">
                  {camisa.descricao ||
                    "Camisa de alta qualidade padrão jogador."}
                </p>

                <div className="flex justify-between items-center mt-auto">
                  <span className="text-2xl font-black">
                    R$ {Number(camisa.preco).toFixed(2)}
                  </span>
                  <button className="bg-white text-black font-bold px-4 py-2 text-xs uppercase hover:bg-red-600 hover:text-white transition-colors">
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
