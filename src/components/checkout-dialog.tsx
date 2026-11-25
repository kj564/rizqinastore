"use client";

import { useMemo, useState } from "react";
import { Loader2, Minus, Plus, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { rupiah } from "@/lib/catalog";
import { createOrder } from "@/lib/store";
import { toast } from "sonner";
import type { Order, Product } from "@/lib/types";

function targetLabel(p: Product): string {
  if (p.type === "SMM") return p.category === "Instagram" && !p.name.includes("Followers") ? "Link postingan / profil tujuan" : "Username / link tujuan";
  if (p.type === "PPOB") return "Nomor tujuan / ID pelanggan";
  if (p.category === "Top-Up Game") return "User ID / UID game";
  return "Email tujuan / akun aktif";
}

function targetPlaceholder(p: Product): string {
  if (p.type === "SMM") return "mis. @rizqina atau https://...";
  if (p.type === "PPOB") return "mis. 0812xxxxxx / ID pelanggan";
  if (p.category === "Top-Up Game") return "mis. 1234567 (1234)";
  return "mis. nama@email.com";
}

export function CheckoutDialog({
  product,
  onClose,
  onCreated,
}: {
  product: Product | null;
  onClose: () => void;
  onCreated: (o: Order) => void;
}) {
  const [qty, setQty] = useState(1);
  const [target, setTarget] = useState("");
  const [email, setEmail] = useState("");
  const [wa, setWa] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const open = product !== null;
  const total = useMemo(() => (product ? product.price * Math.max(1, qty) : 0), [product, qty]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!product) return false;
    if (target.trim().length < 2) e.target = targetLabel(product) + " wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      e.email = "Email kontak tidak valid — produk & struk dikirim ke sini.";
    if (wa.trim() && !/^(\+62|62|0)8[0-9]{7,13}$/.test(wa.replace(/[\s-]/g, "")))
      e.wa = "Format nomor WhatsApp tidak valid.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!product) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      const order = await createOrder({
        productSlug: product.slug,
        qty: Math.max(1, qty),
        target: target.trim(),
        contactEmail: email.trim(),
        contactWa: wa.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success(`Pesanan ${order.code} dibuat`, {
        description: "Lanjut ke pembayaran QRIS.",
      });
      onClose();
      onCreated(order);
    } catch (err) {
      toast.error("Gagal membuat pesanan", {
        description: err instanceof Error ? err.message : "Coba lagi.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="text-left">Checkout</DialogTitle>
              <DialogDescription className="text-left">
                Lengkapi detail di bawah — semua field divalidasi ulang oleh server saat
                dikirim.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-border/70 bg-card/60 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold leading-snug">{product.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {product.category}
                    {product.unit ? ` · per ${product.unit}` : ""}
                  </p>
                </div>
                {product.badge && (
                  <Badge className="shrink-0 rounded-full bg-amber-400/15 text-[10px] font-bold text-amber-500">
                    {product.badge}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {product.maxQty > 1 && (
                <div className="space-y-1.5">
                  <Label htmlFor="co-qty">Jumlah</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Kurangi jumlah"
                      onClick={() => setQty((v) => Math.max(product.minQty, v - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="co-qty"
                      type="number"
                      value={qty}
                      min={product.minQty}
                      max={product.maxQty}
                      onChange={(e) => {
                        const v = Number(e.target.value) || product.minQty;
                        setQty(Math.min(product.maxQty, Math.max(product.minQty, v)));
                      }}
                      className="w-24 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      aria-label="Tambah jumlah"
                      onClick={() => setQty((v) => Math.min(product.maxQty, v + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      min {product.minQty.toLocaleString("id-ID")} · maks{" "}
                      {product.maxQty.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="co-target">{targetLabel(product)}</Label>
                <Input
                  id="co-target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder={targetPlaceholder(product)}
                />
                {errors.target && <p className="text-xs text-destructive">{errors.target}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="co-email">Email kontak</Label>
                <Input
                  id="co-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">{errors.email}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    Invoice & produk dikirim ke email ini. Tanpa perlu mendaftar akun.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="co-wa">
                  WhatsApp <span className="text-muted-foreground">(opsional)</span>
                </Label>
                <Input
                  id="co-wa"
                  inputMode="tel"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  placeholder="0812xxxxxxx"
                />
                {errors.wa && <p className="text-xs text-destructive">{errors.wa}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="co-notes">
                  Catatan <span className="text-muted-foreground">(opsional)</span>
                </Label>
                <Textarea
                  id="co-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruksi khusus, mis. server/zone game, kebutuhan profil…"
                  className="min-h-16"
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total bayar</p>
              <p className="text-xl font-bold text-primary">{rupiah(total)}</p>
            </div>

            <Button
              className="w-full rounded-full font-semibold"
              size="lg"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Memproses…
                </>
              ) : (
                "Lanjut ke Pembayaran QRIS"
              )}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Verifikasi pembayaran otomatis · data pesanan dienkripsi saat transit
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
