# RizqiNa Store

Toko digital modern — **produk digital, top-up game, PPOB & SMM panel** — dibangun
untuk memperbaiki kelemahan umum toko digital Indonesia:

| Masalah umum (sitelama) | Solusi RizqiNa |
| --- | --- |
| Bayar manual kirim bukti via WhatsApp, nunggu admin online | Verifikasi QRIS otomatis + status real-time |
| Status order tidak transparan (harus chat admin) | Timeline pesanan: dibayar → diproses → selesai, semua tercatat |
| Registrasi tanpa verifikasi (validasi cuma di browser) | Validasi ketat server-side (zod) + password scrypt hash |
| Harga aneh & fee tersembunyi | Harga bersih, tercantum lengkap sebelum checkout |
| API di-obfuscate base64 (security by obscurity) | API resmi terdokumentasi di halaman API Docs |
| UI berantakan, kategori hasil mesin terjemah | UI modern mobile-first, dark/light mode, aksesibel |

## Fitur

- **Katalog terkurasi** — produk digital, SMM, PPOB dengan deskripsi & garansi jujur
- **Checkout tanpa akun** — cukup email kontak; akun opsional untuk riwayat
- **Pembayaran QRIS terverifikasi otomatis** (demo: tombol simulasi)
- **Tracking real-time** — polling status, timeline event ber-timestamp
- **Dashboard akun** — profil + riwayat pesanan
- **API Docs** — endpoint publik untuk integrator/reseller

## Arsitektur

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui**
- **Prisma + SQLite** untuk produk, user, order & order-event
- **Dual-mode data layer**: memakai API route bila tersedia (full-stack), otomatis
  fallback ke mode demo lokal (localStorage) saat di-host statis → situs tetap
  fungsional penuh di GitHub Pages.

## Jalankan lokal

```bash
bun install
bun run db:push
bun run dev      # http://localhost:3000
```

## Deploy ke GitHub Pages

Otomatis via GitHub Actions setiap push ke `main`
(`.github/workflows/deploy-pages.yml`):

1. `scripts/build-static.mjs` memindahkan `src/app/api` sementara
2. `next build` dengan `STATIC_EXPORT=1` (output: `out/` + basePath `/rizqinastore`)
3. Upload & deploy via `actions/deploy-pages`

> API route tidak tersedia di Pages — aplikasi otomatis beralih ke mode demo.

## API

Lihat halaman `/` → tab **API Docs**, atau langsung:

- `GET /api/health` — status layanan
- `GET /api/products` — katalog
- `POST /api/orders` — buat pesanan
- `GET /api/orders/:code` — status + timeline
- `POST /api/orders/:code/pay` — verifikasi pembayaran

---

Dibangun sebagai studi kasus reverse-engineering UX toko digital Indonesia.
Semua nama produk bersifat demo.
