import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RizqiNa Store — Produk Digital, Top-Up & SMM Panel",
  description:
    "Toko digital modern: Netflix, Canva, top-up game, PPOB, dan layanan SMM. Pembayaran QRIS otomatis, status pesanan real-time, harga transparan tanpa fee tersembunyi.",
  keywords: [
    "toko digital",
    "top up game",
    "netflix murah",
    "canva pro",
    "smm panel indonesia",
    "ppob",
    "qris",
  ],
  authors: [{ name: "RizqiNa Store" }],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "RizqiNa Store",
    description:
      "Semua kebutuhan digital dalam satu tempat — pembayaran otomatis, status transparan, garansi jelas.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
