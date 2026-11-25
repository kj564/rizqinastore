"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LogIn, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { listMyOrders } from "@/lib/store";
import { rupiah } from "@/lib/catalog";
import type { Order, SessionUser } from "@/lib/types";
import { StatusPill } from "@/components/views/tracking-view";

export function DashboardView({
  session,
  onOpenAuth,
  onTrack,
  onLogout,
}: {
  session: SessionUser | null;
  onOpenAuth: () => void;
  onTrack: (code: string) => void;
  onLogout: () => void;
}) {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    listMyOrders(session.email)
      .then((rows) => alive && setOrders(rows))
      .catch(() => alive && setOrders([]));
    return () => {
      alive = false;
    };
  }, [session]);

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10">
          <UserRound className="h-7 w-7 text-primary" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Masuk dulu, yuk</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Dashboard menyimpan profil dan riwayat pesanan. Tanpa akun pun tetap bisa
          pesan — tapi riwayat tidak tersimpan lintas perangkat.
        </p>
        <Button className="mt-6 rounded-full font-semibold" onClick={onOpenAuth}>
          <LogIn className="h-4 w-4" /> Masuk / Daftar
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/60 p-5">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
            {session.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold">{session.name}</p>
            <p className="text-xs text-muted-foreground">
              @{session.username} · {session.email}
              {session.whatsapp ? ` · WA ${session.whatsapp}` : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" className="rounded-full" onClick={onLogout}>
          Keluar
        </Button>
      </div>

      <h2 className="mt-8 text-lg font-bold tracking-tight">Riwayat pesanan</h2>
      <Separator className="mt-3 opacity-60" />

      {orders === null ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border/70 py-12 text-center text-sm text-muted-foreground">
          Belum ada pesanan dengan email ini. Coba pesan produk pertamamu!
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li
              key={o.code}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{o.productName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="font-mono">{o.code}</span> ·{" "}
                  {new Date(o.createdAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {o.qty > 1 ? ` · x${o.qty}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-primary">{rupiah(o.amount)}</p>
                <StatusPill status={o.status} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-primary"
                  onClick={() => onTrack(o.code)}
                >
                  Detail <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
