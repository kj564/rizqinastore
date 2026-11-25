import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Simulasi verifikasi QRIS otomatis. Produksi: webhook payment gateway. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const order = await db.order.findUnique({ where: { code: code.toUpperCase() } });
    if (!order) {
      return NextResponse.json({ error: "Kode pesanan tidak ditemukan." }, { status: 404 });
    }
    if (order.status !== "AWAITING_PAYMENT") {
      return NextResponse.json({ error: "Pesanan ini sudah dibayar." }, { status: 409 });
    }
    const now = new Date();
    await db.order.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt: now },
    });
    await db.orderEvent.create({
      data: {
        orderId: order.id,
        status: "PAID",
        note: "QRIS terverifikasi otomatis. Menunggu antrian pemrosesan.",
      },
    });
    return NextResponse.json({
      order: {
        ...order,
        status: "PAID",
        paidAt: now.toISOString(),
        createdAt: order.createdAt.toISOString(),
        events: [
          {
            status: "AWAITING_PAYMENT",
            note: "Pesanan dibuat. Menunggu pembayaran QRIS.",
            at: order.createdAt.toISOString(),
          },
          {
            status: "PAID",
            note: "QRIS terverifikasi otomatis. Menunggu antrian pemrosesan.",
            at: now.toISOString(),
          },
        ],
      },
    });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
