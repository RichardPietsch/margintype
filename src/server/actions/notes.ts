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
  anchorFrom?: number;
  anchorTo?: number;
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
      anchorId: input.anchorId,
      anchorFrom: input.anchorFrom,
      anchorTo: input.anchorTo
    }
  });

  revalidatePath(`/books/${input.bookId}`);
}

export async function updateNote(input: { noteId: string; body: string }) {
  const user = await requireUser();
  const note = await prisma.note.findUnique({ where: { id: input.noteId } });
  if (!note) throw new Error("Notiz nicht gefunden");
  if (note.authorId !== user.id) throw new Error("Nur Autor:in darf die Notiz bearbeiten");

  await prisma.note.update({ where: { id: note.id }, data: { body: input.body } });
  revalidatePath(`/books/${note.bookId}`);
}

export async function deleteNote(noteId: string) {
  const user = await requireUser();
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) throw new Error("Notiz nicht gefunden");
  if (note.authorId !== user.id) throw new Error("Nur Autor:in darf die Notiz löschen");

  await prisma.note.delete({ where: { id: note.id } });
  revalidatePath(`/books/${note.bookId}`);
}

export async function addNoteComment(input: { noteId: string; body: string }) {
  const user = await requireUser();
  const note = await prisma.note.findUnique({ where: { id: input.noteId } });
  if (!note) throw new Error("Notiz nicht gefunden");

  await prisma.noteComment.create({
    data: {
      noteId: note.id,
      authorId: user.id,
      body: input.body
    }
  });
  revalidatePath(`/books/${note.bookId}`);
}
