import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/**
 * Ambil status pesanan + auto-progress berbasis waktu:
 *   PAID       -> +5 detik  -> PROCESSING
 *   PROCESSING -> +20 detik -> COMPLETED
 * Transparansi penuh: setiap perubahan status dicatat sebagai event dengan
 * timestamp — menambal kelemahan DigitalHub yang statusnya hanya via chat WA.
 */

const PAID_TO_PROCESSING_MS = 5000;
const PROCESSING_TO_COMPLETED_MS = 20000;

async function progressAndSerialize(code: string) {
  const order = await db.order.findUnique({
    where: { code },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) return null;

  const eventsToCreate: Prisma.OrderEventCreateManyInput[] = [];
  let status = order.status;
  const now = Date.now();

  if (order.paidAt) {
    const paid = order.paidAt.getTime();
    const last = order.events[order.events.length - 1]?.status ?? order.status;

    if (last === "PAID" && status === "PAID" && now - paid >= PAID_TO_PROCESSING_MS) {
      status = "PROCESSING";
      eventsToCreate.push({
        orderId: order.id,
        status: "PROCESSING",
        note: "Pesanan diteruskan ke penyedia layanan.",
      });
    }
    if (status === "PROCESSING" && now - paid >= PAID_TO_PROCESSING_MS + PROCESSING_TO_COMPLETED_MS) {
      status = "COMPLETED";
      eventsToCreate.push({
        orderId: order.id,
        status: "COMPLETED",
        note: "Produk/layanan telah dikirim ke kontak kamu. Garansi aktif.",
      });
    }
    if (eventsToCreate.length > 0) {
      await db.orderEvent.createMany({ data: eventsToCreate });
      await db.order.update({ where: { id: order.id }, data: { status } });
    }
  }

  const events =
    eventsToCreate.length > 0
      ? [
          ...order.events.map((e) => ({ status: e.status, note: e.note, createdAt: e.createdAt })),
          ...eventsToCreate.map((e) => ({
            status: e.status,
            note: e.note ?? null,
            createdAt: new Date(),
          })),
        ]
      : order.events.map((e) => ({ status: e.status, note: e.note, createdAt: e.createdAt }));

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
    status,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    events: events.map((e) => ({
      status: e.status,
      note: e.note,
      at: e.createdAt.toISOString(),
    })),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const order = await progressAndSerialize(code.toUpperCase());
    if (!order) {
      return NextResponse.json({ error: "Kode pesanan tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
