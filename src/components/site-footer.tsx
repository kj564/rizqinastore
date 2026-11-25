"use client";

import Link from "next/link";
import { ShieldCheck, Zap, Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { ViewName } from "@/lib/views";

const PAYMENTS = ["QRIS", "DANA", "OVO", "GoPay", "ShopeePay", "Transfer Bank"];

export function SiteFooter({ onNav }: { onNav: (v: ViewName) => void }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <p className="flex items-center gap-2 text-base font-bold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-amber-400">
                <Zap className="h-4 w-4 text-zinc-950" strokeWidth={2.5} />
              </span>
              RizqiNa <span className="text-gradient">Store</span>
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Semua kebutuhan digital dalam satu tempat — produk premium, top-up game,
              PPOB, dan layanan SMM. Harga jujur di depan, status pesanan transparan,
              garansi jelas.
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Transaksi terverifikasi sistem
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Github className="h-3.5 w-3.5" /> Deploy via GitHub Pages
              </span>
            </p>
          </div>

          <nav aria-label="Tautan cepat" className="space-y-3">
            <p className="text-sm font-semibold">Jelajahi</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" onClick={(e) => { e.preventDefault(); onNav("catalog"); }} className="hover:text-foreground">Katalog Produk</Link></li>
              <li><Link href="#" onClick={(e) => { e.preventDefault(); onNav("track"); }} className="hover:text-foreground">Cek Status Pesanan</Link></li>
              <li><Link href="#" onClick={(e) => { e.preventDefault(); onNav("docs"); }} className="hover:text-foreground">Dokumentasi API</Link></li>
              <li><Link href="#" onClick={(e) => { e.preventDefault(); onNav("dashboard"); }} className="hover:text-foreground">Dashboard Akun</Link></li>
            </ul>
          </nav>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Metode Pembayaran</p>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENTS.map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-border/70 bg-background/60 px-2 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Verifikasi pembayaran otomatis — bukti transfer tidak lagi
              diinput manual via WhatsApp.
            </p>
          </div>
        </div>

        <Separator className="my-6 opacity-60" />
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} RizqiNa Store. Semua merek dagang adalah milik pemiliknya masing-masing.</p>
          <p>Dibangun dengan Next.js · Tailwind · shadcn/ui</p>
        </div>
      </div>
    </footer>
  );
}
