import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CATALOG } from "@/lib/catalog";

/** Seed idempotent — katalog terkurasi dimasukkan saat pertama kali diakses. */
async function ensureSeed() {
  const count = await db.product.count();
  if (count > 0) return;
  await db.product.createMany({
    data: CATALOG.map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      type: p.type,
      price: p.price,
      unit: p.unit ?? null,
      minQty: p.minQty,
      maxQty: p.maxQty,
      badge: p.badge ?? null,
      description: p.description,
      popular: p.popular,
    })),
  });
}

export async function GET() {
  try {
    await ensureSeed();
    const products = await db.product.findMany({ orderBy: [{ type: "asc" }, { price: "asc" }] });
    return NextResponse.json({ products });
  } catch {
    // Fallback aman: kalau DB bermasalah, tetap tampilkan katalog statis
    return NextResponse.json({ products: CATALOG });
  }
}
