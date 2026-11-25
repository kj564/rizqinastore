"use client";

import { BadgeCheck, BookOpen, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const ENDPOINTS = [
  { m: "GET", p: "/api/health", d: "Cek status layanan & mode aplikasi" },
  { m: "GET", p: "/api/products", d: "Daftar semua produk (digital, SMM, PPOB)" },
  { m: "POST", p: "/api/auth/register", d: "Registrasi akun — validasi ketat di server" },
  { m: "POST", p: "/api/auth/login", d: "Login dengan email + password (scrypt hash)" },
  { m: "POST", p: "/api/orders", d: "Buat pesanan baru" },
  { m: "GET", p: "/api/orders?email=…", d: "Riwayat pesanan per email" },
  { m: "GET", p: "/api/orders/:code", d: "Status pesanan + timeline event (auto-progress)" },
  { m: "POST", p: "/api/orders/:code/pay", d: "Trigger verifikasi pembayaran QRIS" },
];

function methodClass(m: string) {
  return m === "GET"
    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
    : "border-amber-400/40 bg-amber-400/10 text-amber-500";
}

const SAMPLE = `# 1) Buat pesanan
curl -X POST https://host/api/orders \\
  -H "Content-Type: application/json" \\
  -d '{
    "productSlug": "netflix-premium-1p1u",
    "qty": 1,
    "target": "nama@email.com",
    "contactEmail": "pembeli@email.com"
  }'

# 2) Verifikasi pembayaran (di produksi: webhook gateway)
curl -X POST https://host/api/orders/RN-A1B2C3/pay

# 3) Pantau status (auto-progress PAID -> PROCESSING -> COMPLETED)
curl https://host/api/orders/RN-A1B2C3`;

const PRINCIPLES = [
  "Tidak ada secret yang di-obfuscate base64 seperti security by obscurity — API resmi dan terdokumentasi.",
  "Error response tidak pernah membocorkan data internal (mis. IP pemanggil).",
  "Setiap input divalidasi dengan schema (zod) di sisi server sebelum menyentuh database.",
  "Password di-hash dengan scrypt + salt acak; tidak ada plaintext password di log.",
];

export function DocsView() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1 rounded-full border-primary/30 bg-primary/10 text-primary">
          <BookOpen className="h-3 w-3" /> Dokumentasi
        </Badge>
        <Badge variant="outline" className="rounded-full text-muted-foreground">v1 · publik</Badge>
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">API Docs</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        API resmi untuk reseller & integrator. Semua endpoint ber-JSON, mudah diuji dengan
        curl. Berjalan penuh saat aplikasi di-deploy versi full-stack (mode “API aktif”).
      </p>

      <h2 className="mt-8 text-lg font-bold tracking-tight">Endpoint</h2>
      <ul className="mt-3 overflow-hidden rounded-2xl border border-border/70">
        {ENDPOINTS.map((e, i) => (
          <li
            key={e.p + e.m}
            className={cn(
              "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3",
              i % 2 === 0 ? "bg-card/60" : "bg-transparent"
            )}
          >
            <Badge variant="outline" className={cn("rounded-md font-mono text-[10px] font-bold", methodClass(e.m))}>
              {e.m}
            </Badge>
            <code className="font-mono text-[13px] font-medium">{e.p}</code>
            <span className="text-xs text-muted-foreground">— {e.d}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-bold tracking-tight">Contoh alur order</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border/70 bg-card/60">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">bash</span>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-muted-foreground">
          {SAMPLE}
        </pre>
      </div>

      <h2 className="mt-8 text-lg font-bold tracking-tight">Prinsip keamanan</h2>
      <Separator className="my-3 opacity-60" />
      <ul className="space-y-2.5">
        {PRINCIPLES.map((p) => (
          <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
