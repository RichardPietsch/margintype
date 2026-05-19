import { BookRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getBookRole(bookId: string, userId: string): Promise<BookRole | null> {
  const member = await prisma.bookMember.findUnique({
    where: { bookId_userId: { bookId, userId } }
  });
  return member?.role ?? null;
}

export function canEditManuscript(role: BookRole | null) {
  return role === "OWNER" || role === "AUTHOR";
}

export function canManageProject(role: BookRole | null) {
  return role === "OWNER";
}

export function canManageChapters(role: BookRole | null) {
  return role === "OWNER" || role === "AUTHOR";
}

export function canCreateNote(role: BookRole | null) {
  return role === "OWNER" || role === "AUTHOR" || role === "COLLABORATOR";
}
