"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  Gamepad2,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Timer,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { rupiah } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import type { ViewName } from "@/lib/views";

const FEATURES = [
  {
    icon: QrCode,
    title: "Pembayaran otomatis",
    desc: "QRIS diverifikasi sistem — tanpa kirim bukti transfer manual via WhatsApp, tanpa nunggu admin online.",
  },
  {
    icon: Timer,
    title: "Status real-time",
    desc: "Setiap pesanan punya timeline transparan: dibayar, diproses, selesai. Tidak perlu chat admin untuk tahu progress.",
  },
  {
    icon: ShieldCheck,
    title: "Validasi berlapis",
    desc: "Registrasi & pesanan divalidasi di server: password kuat, data diverifikasi — bukan sekadar cek di browser.",
  },
  {
    icon: BadgePercent,
    title: "Harga transparan",
    desc: "Harga bersih dan jujur di depan. Tidak ada angka aneh atau fee tersembunyi saat checkout.",
  },
  {
    icon: BadgeCheck,
    title: "Garansi eksplisit",
    desc: "Sifat garansi ditulis jelas di tiap produk: masa aktif, refill, atau ketentuan ganti.",
  },
  {
    icon: Smartphone,
    title: "UI modern & responsif",
    desc: "Mobile-first, tema gelap/terang, aksesibel — dibangun dengan standar desain terkini.",
  },
];

const STEPS = [
  { n: "1", t: "Pilih produk", d: "Katalog terkurasi dengan deskripsi & garansi yang jelas." },
  { n: "2", t: "Bayar via QRIS", d: "Scan sekali — cocok untuk semua e-wallet & m-banking." },
  { n: "3", t: "Verifikasi otomatis", d: "Sistem mencocokkan pembayaran dalam hitungan detik." },
  { n: "4", t: "Terima produk", d: "Produk dikirim ke kontakmu + timeline garansi aktif." },
];

function MiniQr() {
  const cells: boolean[] = [];
  let seed = 42;
  for (let i = 0; i < 100; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed % 5 < 2);
  }
  return (
    <div className="grid grid-cols-10 gap-0.5 rounded-lg bg-white p-2" aria-hidden="true">
      {cells.map((on, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-[1px] ${on ? "bg-zinc-900" : "bg-white"}`} />
      ))}
    </div>
  );
}

function HeroVisual({ onOrder }: { onOrder: (p: Product) => void }) {
  const demo: Product = {
    id: "demo",
    slug: "netflix-premium-1p1u",
    name: "Netflix Premium 1P1U",
    category: "Streaming & Hiburan",
    type: "DIGITAL",
    price: 25000,
    unit: "30 hari",
    minQty: 1,
    maxQty: 1,
    badge: "TERLARIS",
    description: "",
    popular: true,
  };
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/15 via-transparent to-amber-400/10 blur-2xl" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative space-y-3"
      >
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Badge className="rounded-full bg-amber-400/15 text-[10px] font-bold text-amber-500">
                TERLARIS
              </Badge>
              <p className="mt-1 text-sm font-semibold">Netflix Premium 1P1U</p>
              <p className="text-xs text-muted-foreground">4K UHD · garansi 30 hari</p>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-bold text-primary">{rupiah(demo.price)}</p>
            <Button size="sm" className="h-8 rounded-full text-xs font-semibold" onClick={() => onOrder(demo)}>
              Pesan
            </Button>
          </div>
        </div>

        <div className="ml-auto flex w-fit items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-lg backdrop-blur">
          <MiniQr />
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              <QrCode className="h-3.5 w-3.5 text-primary" /> QRIS otomatis
            </p>
            <p className="text-[11px] text-muted-foreground">terverifikasi sistem</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-lg backdrop-blur">
          <div className="space-y-2">
            {[
              ["Pembayaran diterima", true],
              ["Sedang diproses", true],
              ["Selesai — garansi aktif", false],
            ].map(([label, done], i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${done ? "bg-primary" : "bg-muted-foreground/40"}`}
                />
                <p className="text-xs text-muted-foreground">{label as string}</p>
                {done && <BadgeCheck className="ml-auto h-3.5 w-3.5 text-primary" />}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function HomeView({
  products,
  loading,
  onOrder,
  onNav,
}: {
  products: Product[];
  loading: boolean;
  onOrder: (p: Product) => void;
  onNav: (v: ViewName) => void;
}) {
  const popular = products.filter((p) => p.popular).slice(0, 4);
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-glow">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              <Sparkles className="h-3 w-3" /> Platform digital generasi baru
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Semua kebutuhan digital, <span className="text-gradient">satu tempat.</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Produk premium, top-up game, PPOB, dan SMM panel — dengan pembayaran QRIS
              otomatis, status pesanan real-time, dan harga yang jujur di depan.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="rounded-full font-semibold" onClick={() => onNav("catalog")}>
                Jelajahi Produk <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-medium"
                onClick={() => onNav("track")}
              >
                Cek Status Pesanan
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Gamepad2 className="h-4 w-4 text-primary" /> Top-up 1-5 menit
              </span>
              <span className="inline-flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" /> SMM mulai Rp 3.500
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-primary" /> Tanpa minimal deposit
              </span>
            </div>
          </motion.div>
          <HeroVisual onOrder={onOrder} />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border/60 px-4 sm:grid-cols-4 sm:px-6">
          {[
            ["25+", "Produk terkurasi"],
            ["12+", "Layanan SMM"],
            ["< 5 mnt", "Verifikasi pembayaran"],
            ["30 hari", "Garansi refill SMM"],
          ].map(([v, l]) => (
            <div key={l} className="px-4 py-6 text-center">
              <p className="text-2xl font-bold tracking-tight text-foreground">{v}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kenapa RizqiNa */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kenapa <span className="text-gradient">RizqiNa</span>?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Dibangun dari nol untuk memperbaiki semua yang menyebalkan dari toko digital
            biasa: bayar manual, status gak jelas, harga aneh, dan UI berantakan.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/70 bg-card/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lg"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Populer */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Paling dicari</h2>
            <p className="mt-1 text-sm text-muted-foreground">Produk favorit pelanggan minggu ini.</p>
          </div>
          <Button variant="ghost" className="rounded-full text-primary" onClick={() => onNav("catalog")}>
            Lihat semua <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))
            : popular.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOrder(p)}
                  className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card/60 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      {p.category}
                    </Badge>
                    {p.badge && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-snug">{p.name}</p>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">
                      {rupiah(p.price)}
                      {p.unit && <span className="text-[11px] font-normal text-muted-foreground"> /{p.unit}</span>}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Pesan <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              ))}
        </div>
      </section>

      {/* Cara pesan */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Cara pesan — 4 langkah, tanpa drama
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border/70 bg-card/60 p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.n}
                </span>
                <h3 className="mt-3.5 text-sm font-semibold">{s.t}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-card to-amber-400/10 px-6 py-12 text-center sm:px-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Siap cobain cara baru belanja digital?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tanpa daftar wajib, tanpa deposit. Cukup pilih produk, bayar, pantau statusnya
            secara real-time.
          </p>
          <Button size="lg" className="mt-6 rounded-full font-semibold" onClick={() => onNav("catalog")}>
            Mulai Sekarang <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
