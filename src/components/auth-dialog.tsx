"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, MailCheck, ShieldCheck } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { loginUser, registerUser } from "@/lib/store";
import { toast } from "sonner";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

function strength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 10) s++;
  const labels = ["Sangat lemah", "Lemah", "Cukup", "Kuat", "Sangat kuat"];
  return { score: s as 0 | 1 | 2 | 3 | 4, label: labels[s] };
}

export function AuthDialog({
  open,
  onClose,
  onAuthed,
}: {
  open: boolean;
  onClose: () => void;
  onAuthed: (u: SessionUser) => void;
}) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [rName, setRName] = useState("");
  const [rUser, setRUser] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rWa, setRWa] = useState("");
  const [rPw, setRPw] = useState("");
  const [rPw2, setRPw2] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pwStrength = useMemo(() => strength(rPw), [rPw]);

  function validateRegister(): string | null {
    if (rName.trim().length < 2) return "Nama minimal 2 karakter.";
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(rUser.trim()))
      return "Username 3-20 karakter, hanya huruf/angka/underscore.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rEmail.trim())) return "Format email tidak valid.";
    if (rWa.trim() && !/^(\+62|62|0)8[0-9]{7,13}$/.test(rWa.replace(/[\s-]/g, "")))
      return "Format nomor WhatsApp tidak valid.";
    if (rPw.length < 8 || !/[a-zA-Z]/.test(rPw) || !/[0-9]/.test(rPw))
      return "Password minimal 8 karakter, kombinasi huruf & angka.";
    if (rPw !== rPw2) return "Konfirmasi password tidak cocok.";
    if (!agree) return "Centang persetujuan syarat layanan.";
    return null;
  }

  async function doLogin() {
    setErr(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(loginEmail.trim()))
      return setErr("Format email tidak valid.");
    if (!loginPw) return setErr("Password wajib diisi.");
    setBusy(true);
    try {
      const u = await loginUser({ email: loginEmail.trim(), password: loginPw });
      onAuthed(u);
      toast.success(`Selamat datang kembali, ${u.name}!`);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function doRegister() {
    setErr(validateRegister());
    if (validateRegister()) return;
    setBusy(true);
    try {
      const u = await registerUser({
        name: rName.trim(),
        username: rUser.trim(),
        email: rEmail.trim(),
        whatsapp: rWa.trim() || undefined,
        password: rPw,
      });
      onAuthed(u);
      toast.success("Akun berhasil dibuat", {
        description: "Demo: email verifikasi dikirim ke " + u.email + " (tidak benar-benar dikirim).",
        icon: <MailCheck className="h-4 w-4" />,
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Registrasi gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">Akun RizqiNa</DialogTitle>
          <DialogDescription className="text-left">
            Opsional — pesan produk tetap bisa tanpa akun. Akun menyimpan riwayat
            pesananmu.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 rounded-full">
            <TabsTrigger value="login" className="rounded-full">Masuk</TabsTrigger>
            <TabsTrigger value="register" className="rounded-full">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lg-email">Email</Label>
              <Input
                id="lg-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lg-pw">Password</Label>
              <Input
                id="lg-pw"
                type="password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <Button className="w-full rounded-full font-semibold" disabled={busy} onClick={doLogin}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Masuk
            </Button>
          </TabsContent>

          <TabsContent value="register" className="mt-4 space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="rg-name">Nama lengkap</Label>
              <Input id="rg-name" value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Rizqi Nasution" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rg-user">Username</Label>
                <Input id="rg-user" value={rUser} onChange={(e) => setRUser(e.target.value)} placeholder="rizqina_97" autoComplete="username" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rg-wa">WhatsApp</Label>
                <Input id="rg-wa" inputMode="tel" value={rWa} onChange={(e) => setRWa(e.target.value)} placeholder="0812xxxxxxx" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rg-email">Email</Label>
              <Input id="rg-email" type="email" value={rEmail} onChange={(e) => setREmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rg-pw">Password</Label>
              <div className="relative">
                <Input
                  id="rg-pw"
                  type={showPw ? "text" : "password"}
                  value={rPw}
                  onChange={(e) => setRPw(e.target.value)}
                  placeholder="min. 8 karakter, huruf + angka"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {rPw && (
                <div className="flex items-center gap-2 pt-0.5">
                  <div className="flex h-1.5 flex-1 gap-1" aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "flex-1 rounded-full transition-colors",
                          pwStrength.score > i
                            ? ["bg-destructive", "bg-amber-400", "bg-amber-400", "bg-primary", "bg-primary"][pwStrength.score]
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{pwStrength.label}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rg-pw2">Konfirmasi password</Label>
              <Input
                id="rg-pw2"
                type="password"
                value={rPw2}
                onChange={(e) => setRPw2(e.target.value)}
                placeholder="ulangi password"
                autoComplete="new-password"
              />
            </div>
            <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
              <span>
                Saya setuju dengan syarat layanan & kebijakan privasi. Data diproses sesuai
                prinsip minimalis — hanya yang diperlukan.
              </span>
            </label>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <Button className="w-full rounded-full font-semibold" disabled={busy} onClick={doRegister}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Buat Akun
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Password di-hash server (scrypt) — tidak pernah disimpan mentah.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
