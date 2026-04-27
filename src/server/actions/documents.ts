"use server";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { canEditManuscript, getBookRole } from "@/lib/permissions/books";

export async function saveDocument(bookId: string, contentJson: unknown, plainTextCache?: string) {
  const user = await requireUser();
  const role = await getBookRole(bookId, user.id);
  if (!canEditManuscript(role)) throw new Error("Nur Autor:innen dürfen das Manuskript bearbeiten");

  await prisma.bookDocument.upsert({
    where: { bookId },
    create: {
      bookId,
      contentJson,
      plainTextCache,
      version: 1
    },
    update: {
      contentJson,
      plainTextCache,
      version: { increment: 1 }
    }
  });
}
