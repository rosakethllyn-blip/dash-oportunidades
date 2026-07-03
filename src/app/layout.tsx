import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oportunidades - Convênios",
  description: "Sistema de monitoramento de ocorrências em convênios hospitalares",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}