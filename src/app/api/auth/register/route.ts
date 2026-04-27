import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const data = await req.formData();
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim().toLowerCase();
  const password = String(data.get("password") || "");

  if (!email || !password || !name) return NextResponse.redirect(new URL("/register?error=1", req.url));

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.redirect(new URL("/register?exists=1", req.url));

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) }
  });
  await createSession(user.id);

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
