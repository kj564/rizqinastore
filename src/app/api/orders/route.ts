import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createSchema = z.object({
  productSlug: z.string().trim().min(1),
  qty: z.number().int().min(1).max(100),
  target: z.string().trim().min(2, "Target wajib diisi").max(200),
  contactEmail: z.string().trim().email("Format email kontak tidak valid").max(120),
  contactWa: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

function genCode(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return `RN-${s}`;
}

function serialize(order: {
  code: string;
  productName: string;
  productSlug: string;
  productType: string;
  productCat: string;
  qty: number;
  target: string;
  contactEmail: string;
  contactWa: string | null;
  notes: string | null;
  amount: number;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  events: { status: string; note: string | null; createdAt: Date }[];
}) {
  return {
    code: order.code,
    productName: order.productName,
    productSlug: order.productSlug,
    productType: order.productType,
    productCat: order.productCat,
    qty: order.qty,
    target: order.target,
    contactEmail: order.contactEmail,
    contactWa: order.contactWa,
    notes: order.notes,
    amount: order.amount,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    events: order.events.map((e) => ({
      status: e.status,
      note: e.note,
      at: e.createdAt.toISOString(),
    })),
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Data tidak valid." },
      { status: 400 }
    );
  }
  const { productSlug, qty, target, contactEmail, contactWa, notes } = parsed.data;

  try {
    const product = await db.product.findUnique({ where: { slug: productSlug } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    if (qty < product.minQty || qty > product.maxQty) {
      return NextResponse.json(
        { error: `Jumlah harus antara ${product.minQty} - ${product.maxQty}.` },
        { status: 400 }
      );
    }

    const order = await db.order.create({
      data: {
        code: genCode(),
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productType: product.type,
        productCat: product.category,
        qty,
        target,
        contactEmail: contactEmail.toLowerCase(),
        contactWa: contactWa || null,
        notes: notes || null,
        amount: product.price * qty,
        status: "AWAITING_PAYMENT",
        events: {
          create: {
            status: "AWAITING_PAYMENT",
            note: "Pesanan dibuat. Menunggu pembayaran QRIS.",
          },
        },
      },
      include: { events: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json({ order: serialize(order) }, { status: 201 });
  } catch (e) {
    console.error("[orders:POST] gagal membuat pesanan:", e);
    return NextResponse.json({ error: "Gagal membuat pesanan. Coba lagi." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ orders: [] });
  try {
    const orders = await db.order.findMany({
      where: { contactEmail: email.toLowerCase() },
      include: { events: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ orders: orders.map(serialize) });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
