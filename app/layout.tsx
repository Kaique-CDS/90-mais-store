import type { Metadata } from "next";
import { CartProvider } from "@/components/cartcontext";
import WhatsAppButton from "@/components/whatsapp-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "90+ Store | Camisetas Premium 1:1",
  description:
    "Acervo exclusivo de camisetas de futebol premium qualidade 1:1. Nacionais, internacionais, retrô e seleções.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <CartProvider>{children}</CartProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
