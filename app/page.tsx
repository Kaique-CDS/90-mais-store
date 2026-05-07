import { supabase } from "@/lib/supabaseClient";
import CartHeader from "@/components/cartheader";
import CartDrawer from "@/components/cartdrawer";
import Catalog from "@/components/catalog"; // Importando o novo motor de busca

// O Next.js não fará cache estático dessa página, garantindo dados sempre novos
export const revalidate = 0;

export default async function Home() {
  // Busca bruta no servidor
  const { data: camisetas } = await supabase.from("camisetas").select("*");

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600">
      <nav className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">
            90+ <span className="text-red-600">Store</span>
          </h1>
          <CartHeader />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-2 bg-red-600"></div>
          <h2 className="text-3xl font-bold uppercase tracking-tight">
            O Catálogo
          </h2>
        </div>

        {/* COMPONENTE DE BUSCA E GRID ENTRA AQUI */}
        <Catalog camisetas={camisetas || []} />
      </div>

      <CartDrawer />
    </main>
  );
}
