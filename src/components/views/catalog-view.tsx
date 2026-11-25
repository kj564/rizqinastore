"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search, TrendingUp, Wallet, Sparkles, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { rupiah } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import type { CatalogTab } from "@/lib/views";
import { cn } from "@/lib/utils";

const TABS: { key: CatalogTab; label: string; icon: React.ElementType; desc: string }[] = [
  {
    key: "DIGITAL",
    label: "Produk Digital",
    icon: Sparkles,
    desc: "Streaming, produktivitas & AI, top-up game",
  },
  { key: "SMM", label: "SMM Panel", icon: TrendingUp, desc: "Follower, likes, views semua platform" },
  { key: "PPOB", label: "PPOB & Voucher", icon: Wallet, desc: "Pulsa, paket data, token listrik, e-wallet" },
];

function TypeIcon({ product, className }: { product: Product; className?: string }) {
  if (product.type === "SMM") return <TrendingUp className={className} />;
  if (product.type === "PPOB") return <Wallet className={className} />;
  if (product.category === "Top-Up Game") return <Gamepad2Icon className={className} />;
  return <Sparkles className={className} />;
}

function Gamepad2Icon({ className }: { className?: string }) {
  // tipis: pakai gamepad dari lucide
  return <span className={cn(className, "inline-block [&>svg]:h-full [&>svg]:w-full")}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="10" y1="11" y2="11" /><line x1="8" x2="8" y1="9" y2="13" />
      <line x1="15" x2="15.01" y1="12" y2="12" /><line x1="18" x2="18.01" y1="10" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
    </svg>
  </span>;
}

export function CatalogView({
  products,
  loading,
  tab,
  onTabChange,
  onOrder,
}: {
  products: Product[];
  loading: boolean;
  tab: CatalogTab;
  onTabChange: (t: CatalogTab) => void;
  onOrder: (p: Product) => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Semua");

  const categories = useMemo(() => {
    const set = new Set(products.filter((p) => p.type === tab).map((p) => p.category));
    return ["Semua", ...Array.from(set)];
  }, [products, tab]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.type === tab &&
        (cat === "Semua" || p.category === cat) &&
        (!term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
    );
  }, [products, tab, cat, q]);

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">Katalog</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Harga sudah final — apa yang kamu lihat adalah yang kamu bayar. Semua produk
          punya deskripsi jujur & garansi yang ditulis jelas.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Kategori katalog">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => {
                onTabChange(t.key);
                setCat("Semua");
              }}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                active
                  ? "border-primary/50 bg-primary/10 shadow-sm"
                  : "border-border/70 bg-card/50 hover:border-border hover:bg-card"
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <t.icon className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{t.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{t.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + category chips */}
      <div className="mt-6 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk, mis. netflix, followers, pulsa…"
            className="rounded-full bg-card/60 pl-10"
            aria-label="Cari produk"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium">Tidak ada produk yang cocok</p>
          <p className="text-xs text-muted-foreground">Coba kata kunci lain atau ganti kategori.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col rounded-2xl border border-border/70 bg-card/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <TypeIcon product={p} className="h-4.5 w-4.5" />
                  </span>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    {p.category}
                  </Badge>
                </div>
                {p.badge && (
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="mt-3.5 text-sm font-semibold leading-snug">{p.name}</p>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
              {p.type === "SMM" && (
                <p className="mt-2 text-[11px] text-muted-foreground/80">
                  Min. {p.minQty.toLocaleString("id-ID")} · maks {p.maxQty.toLocaleString("id-ID")} unit
                </p>
              )}
              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-base font-bold text-primary">
                  {rupiah(p.price)}
                  {p.unit && <span className="text-[11px] font-normal text-muted-foreground"> /{p.unit}</span>}
                </p>
                <Button
                  size="sm"
                  className="h-8 rounded-full text-xs font-semibold group-hover:gap-2"
                  onClick={() => onOrder(p)}
                >
                  Pesan <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {activeTab.desc} · {filtered.length} produk ditampilkan
      </p>
    </div>
  );
}
