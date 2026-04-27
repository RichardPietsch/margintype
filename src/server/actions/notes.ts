"use server";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { canCreateNote, getBookRole } from "@/lib/permissions/books";
import { revalidatePath } from "next/cache";

export async function createNote(input: {
  bookId: string;
  chapterId?: string;
  selectedTextSnapshot: string;
  body: string;
  anchorId?: string;
}) {
  const user = await requireUser();
  const role = await getBookRole(input.bookId, user.id);
  if (!canCreateNote(role)) throw new Error("Keine Berechtigung");

  // TODO: Replace with stable Tiptap mark-based anchor persistence.
  await prisma.note.create({
    data: {
      bookId: input.bookId,
      chapterId: input.chapterId,
      authorId: user.id,
      selectedTextSnapshot: input.selectedTextSnapshot,
      body: input.body,
      anchorId: input.anchorId
    }
  });

  revalidatePath(`/books/${input.bookId}`);
}
