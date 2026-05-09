import type { Metadata } from "next";
import { CartProvider } from "@/components/cartcontext";
import WhatsAppButton from "@/components/whatsapp-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catalogo 90+ Store",
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
