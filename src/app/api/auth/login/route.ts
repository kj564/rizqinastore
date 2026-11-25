import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().trim().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const orig = Buffer.from(hash, "hex");
  return orig.length === test.length && timingSafeEqual(orig, test);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Data tidak valid." },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  try {
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      // Pesan sengaja generik — tidak membocorkan field mana yang salah
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }
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
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export const runtime = "nodejs";
