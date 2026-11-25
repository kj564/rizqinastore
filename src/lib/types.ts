export type ProductType = "DIGITAL" | "SMM" | "PPOB";

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  type: ProductType;
  price: number;
  unit?: string | null;
  minQty: number;
  maxQty: number;
  badge?: string | null;
  description: string;
  popular: boolean;
}

export interface OrderEvent {
  status: OrderStatus;
  note?: string | null;
  at: string;
}

export interface Order {
  code: string;
  productName: string;
  productSlug: string;
  productType: ProductType;
  productCat: string;
  qty: number;
  target: string;
  contactEmail: string;
  contactWa?: string | null;
  notes?: string | null;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string | null;
  events: OrderEvent[];
}

export interface CreateOrderPayload {
  productSlug: string;
  qty: number;
  target: string;
  contactEmail: string;
  contactWa?: string;
  notes?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  whatsapp?: string;
}

export type AppMode = "fullstack" | "offline";

export const STATUS_META: Record<
  OrderStatus,
  { label: string; desc: string; tone: "warn" | "ok" | "info" | "done" | "bad" }
> = {
  AWAITING_PAYMENT: {
    label: "Menunggu Pembayaran",
    desc: "Selesaikan pembayaran agar pesanan diproses.",
    tone: "warn",
  },
  PAID: {
    label: "Pembayaran Diterima",
    desc: "Pembayaran terverifikasi otomatis oleh sistem.",
    tone: "info",
  },
  PROCESSING: {
    label: "Sedang Diproses",
    desc: "Pesanan sedang diproses ke penyedia layanan.",
    tone: "ok",
  },
  COMPLETED: {
    label: "Selesai",
    desc: "Produk/layanan telah dikirim ke kontak kamu.",
    tone: "done",
  },
  CANCELLED: {
    label: "Dibatalkan",
    desc: "Pesanan dibatalkan.",
    tone: "bad",
  },
};

export const STATUS_ORDER: OrderStatus[] = [
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "COMPLETED",
];
