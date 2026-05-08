import { CartProvider } from "@/components/cartcontext"; // Verifique se o caminho está certo!
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        {/* O CartProvider PRECISA envolver o {children} */}
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
