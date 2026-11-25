"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Check,
  CircleDashed,
  Copy,
  History,
  Loader2,
  QrCode,
  Search,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { rupiah } from "@/lib/catalog";
import { getOrder, listMyOrders, payOrder, getSession } from "@/lib/store";
import { STATUS_META, STATUS_ORDER } from "@/lib/types";
import type { Order, OrderStatus } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  warn: "border-amber-400/40 bg-amber-400/10 text-amber-500",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
  done: "border-emerald-500/60 bg-emerald-500/15 text-emerald-500",
  bad: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-semibold", TONE_CLASS[meta.tone], className)}
    >
      {meta.label}
    </Badge>
  );
}

function MiniQr({ seed }: { seed: string }) {
  const cells: boolean[] = [];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
  for (let i = 0; i < 144; i++) {
    s = (s * 9301 + 49297) % 233280;
    cells.push(s % 5 < 2);
  }
  const finder = (r: number, c: number) =>
    (r < 2 && c < 2) || (r < 2 && c > 9) || (r > 9 && c < 2);
  return (
    <div className="grid grid-cols-12 gap-[3px] rounded-xl bg-white p-2.5" aria-hidden="true">
      {cells.map((on, i) => {
        const r = Math.floor(i / 12);
        const c = i % 12;
        const filled = finder(r, c) || (on && !(r === 0 && c === 5));
        return (
          <span
            key={i}
            className={cn(
              "h-1.5 w-1.5 rounded-[1px]",
              filled ? "bg-zinc-900" : "bg-white",
              finder(r, c) && "bg-zinc-900"
            )}
          />
        );
      })}
    </div>
  );
}

export function OrderTimeline({ order }: { order: Order }) {
  const meta = STATUS_META[order.status];
  const [copied, setCopied] = useState(false);
  const stepIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 p-4">
        <div>
          <p className="text-xs text-muted-foreground">Kode pesanan</p>
          <button
            className="group mt-0.5 inline-flex items-center gap-2 font-mono text-lg font-bold tracking-wide"
            onClick={() => {
              navigator.clipboard?.writeText(order.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
              toast.success("Kode pesanan disalin");
            }}
            aria-label="Salin kode pesanan"
          >
            {order.code}
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5">
          <p className="text-xs text-muted-foreground">Produk</p>
          <p className="mt-0.5 font-semibold">{order.productName}</p>
          <p className="text-xs text-muted-foreground">
            {order.productCat} · x{order.qty}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-0.5 font-bold text-primary">{rupiah(order.amount)}</p>
          <p className="text-xs text-muted-foreground">
            dibuat {new Date(order.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 sm:col-span-2">
          <p className="text-xs text-muted-foreground">Tujuan</p>
          <p className="mt-0.5 break-all font-medium">{order.target}</p>
          <p className="text-xs text-muted-foreground">
            dikirim ke {order.contactEmail}
            {order.contactWa ? ` · WA ${order.contactWa}` : ""}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
        <p className="text-sm font-semibold">Progress pesanan</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta.desc}</p>
        <ol className="mt-4 space-y-0">
          {STATUS_ORDER.map((s, i) => {
            const reached = stepIndex >= i && order.status !== "CANCELLED";
            const isCurrent = order.status === s;
            return (
              <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
                {i < STATUS_ORDER.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[9px] top-5 h-full w-px",
                      reached ? "bg-primary/50" : "bg-border"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 grid h-5 w-5 place-items-center rounded-full border-2",
                    reached
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  {reached ? (
                    isCurrent ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" />
                    ) : (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    )
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                  )}
                </span>
                <div className="pt-0.5">
                  <p className={cn("text-[13px] font-medium", !reached && "text-muted-foreground")}>
                    {STATUS_META[s].label}
                  </p>
                  {isCurrent && <p className="text-xs text-muted-foreground">{meta.desc}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {order.events.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
          <p className="text-sm font-semibold">Riwayat aktivitas</p>
          <ul className="mt-3 space-y-3">
            {[...order.events].reverse().map((e, i) => (
              <li key={i} className="flex gap-3 text-xs">
                <CircleDashed className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">{STATUS_META[e.status]?.label ?? e.status}</p>
                  {e.note && <p className="text-muted-foreground">{e.note}</p>}
                  <p className="text-muted-foreground/70">
                    {new Date(e.at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PaymentPanel({ order, onPaid }: { order: Order; onPaid: (o: Order) => void }) {
  const [paying, setPaying] = useState(false);
  async function pay() {
    setPaying(true);
    try {
      const updated = await payOrder(order.code);
      onPaid(updated);
      toast.success("Pembayaran terverifikasi", {
        description: "Sistem mencocokkan QRIS secara otomatis.",
      });
    } catch (e) {
      toast.error("Gagal memproses pembayaran", {
        description: e instanceof Error ? e.message : "Coba lagi.",
      });
    } finally {
      setPaying(false);
    }
  }
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <QrCode className="h-4.5 w-4.5 text-amber-500" /> Pembayaran QRIS
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Scan dengan aplikasi e-wallet / m-banking apapun. Verifikasi berjalan otomatis —
        kamu tidak perlu kirim bukti transfer ke admin.
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <MiniQr seed={order.code} />
        <div className="flex-1 space-y-1.5 text-center sm:text-left">
          <p className="text-2xl font-bold text-amber-500">{rupiah(order.amount)}</p>
          <p className="text-xs text-muted-foreground">
            Merchant: RIZQINA STORE · {order.code}
          </p>
          <Button
            className="mt-2 w-full rounded-full font-semibold sm:w-auto"
            onClick={pay}
            disabled={paying}
          >
            {paying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi…
              </>
            ) : (
              "Simulasikan Pembayaran Berhasil"
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground/80">
            Tombol demo — di produksi, webhook payment gateway yang memicu verifikasi.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TrackingView({ initialCode }: { initialCode: string | null }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<Order[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (c: string, silent = false) => {
    if (!c.trim()) return;
    if (!silent) setLoading(true);
    try {
      const o = await getOrder(c.trim());
      setOrder(o);
      return o;
    } catch (e) {
      if (!silent) {
        setOrder(null);
        toast.error("Pesanan tidak ditemukan", {
          description: e instanceof Error ? e.message : "Periksa kembali kode pesanan.",
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCode) load(initialCode);
    // muat daftar pesanan milik sesi (kalau ada)
    const s = getSession();
    if (s) listMyOrders(s.email).then(setRecent).catch(() => {});
  }, [initialCode, load]);

  // Polling real-time saat status transisi
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (order && (order.status === "PAID" || order.status === "PROCESSING")) {
      timer.current = setInterval(() => load(order.code, true), 3000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [order, load]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Cek Pesanan</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Masukkan kode pesanan (mis. <span className="font-mono">RN-XXXXXX</span>) untuk
        melihat status real-time — tanpa perlu chat admin.
      </p>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load(code);
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="RN-XXXXXX"
            className="rounded-full bg-card/60 pl-10 font-mono"
            aria-label="Kode pesanan"
          />
        </div>
        <Button type="submit" className="rounded-full font-semibold" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lacak"}
        </Button>
      </form>

      {recent.length > 0 && !order && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <History className="h-3.5 w-3.5" /> Pesanan terakhir kamu
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.slice(0, 5).map((o) => (
              <button
                key={o.code}
                onClick={() => {
                  setCode(o.code);
                  load(o.code);
                }}
                className="rounded-full border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-xs hover:border-primary/40"
              >
                {o.code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {loading && !order ? (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        ) : order ? (
          <div className="space-y-5">
            {order.status === "AWAITING_PAYMENT" && (
              <PaymentPanel order={order} onPaid={(o) => setOrder(o)} />
            )}
            {order.status === "COMPLETED" && (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                <BadgeCheck className="h-8 w-8 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-emerald-500">Pesanan selesai</p>
                  <p className="text-xs text-muted-foreground">
                    Produk sudah dikirim ke {order.contactEmail}. Simpan kode{" "}
                    <span className="font-mono">{order.code}</span> untuk klaim garansi.
                  </p>
                </div>
              </div>
            )}
            <OrderTimeline order={order} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Belum ada pesanan dilacak. Kode pesanan muncul setelah checkout.
            </p>
          </div>
        )}
      </div>

      <Separator className="my-10 opacity-50" />
      <p className="text-center text-xs text-muted-foreground">
        Status berjalan otomatis: dibayar → diproses (± 5 detik demo) → selesai (± 20 detik
        demo). Waktu produksi tercantum di tiap produk.
      </p>
    </div>
  );
}
