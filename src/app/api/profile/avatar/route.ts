import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

function randomAvatarColor() {
  const colors = ["#0ea5e9", "#22c55e", "#8b5cf6", "#f97316", "#e11d48", "#06b6d4", "#84cc16"];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const form = await req.formData();
  const file = form.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL("/dashboard?avatar=missing", req.url));
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = file.type.includes("png") ? "png" : "jpg";
  const filename = `${user.id}-${Date.now()}.${extension}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      imageUrl: `/uploads/avatars/${filename}`,
      avatarColor: user.avatarColor ?? randomAvatarColor()
    }
  });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
