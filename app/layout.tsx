import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { InitStorage } from "@/components/InitStorage";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Propostas - Extrema Tecnologia",
  description: "Sistema completo para gerenciamento de propostas comerciais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <InitStorage />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
