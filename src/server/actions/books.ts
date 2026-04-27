"use server";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

export async function createBook(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Titel fehlt");

  const book = await prisma.book.create({
    data: {
      ownerId: user.id,
      title,
      language: "de",
      members: {
        create: {
          userId: user.id,
          role: "OWNER"
        }
      },
      document: {
        create: {
          contentJson: {
            type: "doc",
            content: [{ type: "paragraph" }]
          }
        }
      }
    }
  });

  revalidatePath("/dashboard");
  return book.id;
}

export async function renameBook(formData: FormData) {
  const user = await requireUser();
  const bookId = String(formData.get("bookId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!bookId || !title) throw new Error("Ungültige Eingabe");

  const membership = await prisma.bookMember.findUnique({ where: { bookId_userId: { bookId, userId: user.id } } });
  if (!membership || (membership.role !== "OWNER" && membership.role !== "AUTHOR")) {
    throw new Error("Keine Berechtigung");
  }

  await prisma.book.update({ where: { id: bookId }, data: { title } });
  revalidatePath("/dashboard");
}

export async function deleteBook(formData: FormData) {
  const user = await requireUser();
  const bookId = String(formData.get("bookId") ?? "");
  if (!bookId) throw new Error("Ungültige Eingabe");

  const membership = await prisma.bookMember.findUnique({ where: { bookId_userId: { bookId, userId: user.id } } });
  if (!membership || membership.role !== "OWNER") throw new Error("Nur Owner darf löschen");

  await prisma.book.delete({ where: { id: bookId } });
  revalidatePath("/dashboard");
}
