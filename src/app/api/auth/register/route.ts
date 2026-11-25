import { NextResponse } from "next/server";
import { randomBytes, scryptSync } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * Registrasi dengan validasi ketat di server — menambal kelemahan Jashub
 * yang hanya memvalidasi di sisi klien dan tidak memverifikasi apapun.
 */

const schema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(60),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  email: z.string().trim().email("Format email tidak valid").max(120),
  whatsapp: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[0-9]{7,13}$/, "Format nomor WhatsApp Indonesia tidak valid")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[a-zA-Z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Data tidak valid.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { name, username, email, whatsapp, password } = parsed.data;

  try {
    const existing = await db.user.findFirst({
      where: { OR: [{ username: username }, { email: email.toLowerCase() }] },
    });
    if (existing) {
      const field =
        existing.username.toLowerCase() === username.toLowerCase() ? "Username" : "Email";
      return NextResponse.json({ error: `${field} sudah terdaftar.` }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        whatsapp: whatsapp || null,
        name,
        passwordHash: hashPassword(password),
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp ?? undefined,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
