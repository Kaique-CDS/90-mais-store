import type { Metadata } from "next";
import { CartProvider } from "@/components/cartcontext";
import WhatsAppButton from "@/components/whatsapp-button";
import "./globals.css";

// Metadados injetados na tag <head> do HTML
export const metadata: Metadata = {
  title: "Catalogo 90+ Store",
};

/**
 * Layout Base da Aplicação (RootLayout).
 * Este componente engloba todas as páginas do site. 
 * É onde injetamos provedores de contexto global e componentes fixos (como o botão do Whatsapp).
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        {/* Envolvemos a aplicação no CartProvider para que o estado do carrinho exista globalmente */}
        <CartProvider>{children}</CartProvider>
        
        {/* Componente fixo (WhatsApp) fica disponível em todas as páginas */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
