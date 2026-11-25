import { CATALOG } from "@/lib/catalog";
import {
  type AppMode,
  type CreateOrderPayload,
  type Order,
  type OrderStatus,
  type Product,
  type SessionUser,
} from "@/lib/types";

/**
 * Data layer ganda:
 * - fullstack : memakai API route + Prisma (saat preview di sandbox / self-host)
 * - offline   : localStorage + simulasi state machine (untuk GitHub Pages yang statis)
 *
 * Ini menambal kelemahan kedua situs lama: DigitalHub menaruh konfigurasi
 * base64 yang mudah dibaca (security by obscurity) dan tidak ada status order
 * yang transparan — di sini semua mode punya alur status yang sama & terlihat.
 */

const LS_ORDERS = "rn.orders.v1";
const LS_USERS = "rn.users.v1";
const LS_SESSION = "rn.session.v1";

let mode: AppMode | null = null;

async function detectMode(): Promise<AppMode> {
  if (mode) return mode;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch("/api/health", { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    mode = res.ok ? "fullstack" : "offline";
  } catch {
    mode = "offline";
  }
  return mode;
}

export async function getAppMode(): Promise<AppMode> {
  return detectMode();
}

// ---------------------------------------------------------------------------
// Offline helpers
// ---------------------------------------------------------------------------

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function genCode(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return `RN-${s}`;
}

function seedOfflineOrders(): Order[] {
  const empty: Order[] = [];
  return lsGet<Order[]>(LS_ORDERS, empty);
}

/** State machine waktu: PAID -> (+5s) PROCESSING -> (+20s) COMPLETED */
function progressOrder(o: Order, now = Date.now()): Order {
  if (o.status === "CANCELLED" || o.status === "COMPLETED" || !o.paidAt) return o;
  const paid = new Date(o.paidAt).getTime();
  const events = [...o.events];
  const pushEvent = (status: OrderStatus, note: string) => {
    if (events.length === 0 || events[events.length - 1].status !== status) {
      events.push({ status, note, at: new Date().toISOString() });
    }
  };

  if (o.status === "PAID" && now - paid >= 5000) {
    o.status = "PROCESSING";
    pushEvent("PROCESSING", "Pesanan diteruskan ke penyedia layanan.");
  }
  if (o.status === "PROCESSING" && now - paid >= 20000) {
    o.status = "COMPLETED";
    pushEvent("COMPLETED", "Produk/layanan telah dikirim ke kontak kamu. Garansi aktif.");
  }
  o.events = events;
  return o;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listProducts(): Promise<Product[]> {
  if ((await detectMode()) === "fullstack") {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { products: Product[] };
        return data.products;
      }
    } catch {
      /* fallthrough */
    }
  }
  return CATALOG;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  if ((await detectMode()) === "fullstack") {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as { order: Order };
        return data.order;
      }
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(err?.error || "Gagal membuat pesanan.");
    } catch (e) {
      if (e instanceof Error && !e.message.startsWith("Failed to fetch")) throw e;
      /* fallthrough ke offline */
    }
  }

  // offline
  const product = CATALOG.find((p) => p.slug === payload.productSlug);
  if (!product) throw new Error("Produk tidak ditemukan.");
  if (payload.qty < product.minQty || payload.qty > product.maxQty) {
    throw new Error(`Jumlah harus antara ${product.minQty} - ${product.maxQty}.`);
  }
  const order: Order = {
    code: genCode(),
    productName: product.name,
    productSlug: product.slug,
    productType: product.type,
    productCat: product.category,
    qty: payload.qty,
    target: payload.target,
    contactEmail: payload.contactEmail,
    contactWa: payload.contactWa || null,
    notes: payload.notes || null,
    amount: product.price * payload.qty,
    status: "AWAITING_PAYMENT",
    createdAt: new Date().toISOString(),
    paidAt: null,
    events: [
      {
        status: "AWAITING_PAYMENT",
        note: "Pesanan dibuat. Menunggu pembayaran QRIS.",
        at: new Date().toISOString(),
      },
    ],
  };
  const all = seedOfflineOrders();
  all.unshift(order);
  lsSet(LS_ORDERS, all);
  return order;
}

export async function getOrder(code: string): Promise<Order> {
  if ((await detectMode()) === "fullstack") {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(code)}`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { order: Order };
        return data.order;
      }
      if (res.status === 404) throw new Error("Kode pesanan tidak ditemukan.");
    } catch (e) {
      if (e instanceof Error && !e.message.startsWith("Failed to fetch")) throw e;
      /* fallthrough ke offline */
    }
  }
  const all = seedOfflineOrders();
  const found = all.find((o) => o.code.toUpperCase() === code.trim().toUpperCase());
  if (!found) throw new Error("Kode pesanan tidak ditemukan.");
  const before = found.status;
  progressOrder(found);
  if (found.status !== before) {
    lsSet(
      LS_ORDERS,
      all.map((o) => (o.code === found.code ? found : o))
    );
  }
  return found;
}

export async function payOrder(code: string): Promise<Order> {
  if ((await detectMode()) === "fullstack") {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(code)}/pay`, {
        method: "POST",
      });
      if (res.ok) {
        const data = (await res.json()) as { order: Order };
        return data.order;
      }
      if (res.status === 404) throw new Error("Kode pesanan tidak ditemukan.");
    } catch (e) {
      if (e instanceof Error && !e.message.startsWith("Failed to fetch")) throw e;
      /* fallthrough ke offline */
    }
  }
  const all = seedOfflineOrders();
  const found = all.find((o) => o.code.toUpperCase() === code.trim().toUpperCase());
  if (!found) throw new Error("Kode pesanan tidak ditemukan.");
  if (found.status !== "AWAITING_PAYMENT") throw new Error("Pesanan ini sudah dibayar.");
  found.status = "PAID";
  found.paidAt = new Date().toISOString();
  found.events.push({
    status: "PAID",
    note: "QRIS terverifikasi otomatis. Menunggu antrian pemrosesan.",
    at: new Date().toISOString(),
  });
  lsSet(LS_ORDERS, all);
  return found;
}

export async function listMyOrders(email: string): Promise<Order[]> {
  if ((await detectMode()) === "fullstack") {
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { orders: Order[] };
        return data.orders;
      }
    } catch {
      /* fallthrough ke offline */
    }
  }
  const now = Date.now();
  return seedOfflineOrders()
    .filter((o) => o.contactEmail.toLowerCase() === email.toLowerCase())
    .map((o) => progressOrder({ ...o }, now))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// ---------------------------------------------------------------------------
// Auth (demo-proof: validasi server-side saat fullstack, hash offline)
// ---------------------------------------------------------------------------

export async function registerUser(input: {
  name: string;
  username: string;
  email: string;
  whatsapp?: string;
  password: string;
}): Promise<SessionUser> {
  if ((await detectMode()) === "fullstack") {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = (await res.json()) as { user: SessionUser };
      lsSet(LS_SESSION, data.user);
      return data.user;
    }
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error || "Registrasi gagal.");
  }

  const users = lsGet<Array<SessionUser & { passwordHash: string }>>(LS_USERS, []);
  if (users.some((u) => u.username.toLowerCase() === input.username.toLowerCase()))
    throw new Error("Username sudah dipakai.");
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase()))
    throw new Error("Email sudah terdaftar.");
  const passwordHash = await sha256Hex(input.password);
  const user: SessionUser & { passwordHash: string } = {
    id: `u-${Date.now().toString(36)}`,
    name: input.name,
    username: input.username,
    email: input.email,
    whatsapp: input.whatsapp,
    passwordHash,
  };
  users.push(user);
  lsSet(LS_USERS, users);
  const { passwordHash: _omit, ...session } = user;
  lsSet(LS_SESSION, session);
  return session;
}

export async function loginUser(input: { email: string; password: string }): Promise<SessionUser> {
  if ((await detectMode()) === "fullstack") {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = (await res.json()) as { user: SessionUser };
      lsSet(LS_SESSION, data.user);
      return data.user;
    }
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error || "Login gagal.");
  }

  const users = lsGet<Array<SessionUser & { passwordHash: string }>>(LS_USERS, []);
  const found = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (!found) throw new Error("Email belum terdaftar.");
  const hash = await sha256Hex(input.password);
  if (hash !== found.passwordHash) throw new Error("Password salah.");
  const { passwordHash: _omit, ...session } = found;
  lsSet(LS_SESSION, session);
  return session;
}

export function getSession(): SessionUser | null {
  return lsGet<SessionUser | null>(LS_SESSION, null);
}

export function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(LS_SESSION);
}
