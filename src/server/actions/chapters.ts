"use server";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { canManageChapters, getBookRole } from "@/lib/permissions/books";
import { revalidatePath } from "next/cache";

export async function createPlannedChapter(bookId: string) {
  const user = await requireUser();
  const role = await getBookRole(bookId, user.id);
  if (!canManageChapters(role)) throw new Error("Keine Berechtigung");

  const maxOrder = await prisma.chapter.aggregate({ where: { bookId }, _max: { orderIndex: true } });

  await prisma.chapter.create({
    data: {
      bookId,
      title: "Neues Kapitel",
      orderIndex: (maxOrder._max.orderIndex ?? 0) + 1,
      type: "PLANNED"
    }
  });

  revalidatePath(`/books/${bookId}`);
}

export async function updateChapterDetails(input: {
  chapterId: string;
  title: string;
  description?: string;
  status: "PLANNED" | "DRAFTING" | "REVISING" | "DONE";
  targetWordCount?: number;
}) {
  const user = await requireUser();
  const chapter = await prisma.chapter.findUnique({ where: { id: input.chapterId } });
  if (!chapter) throw new Error("Kapitel nicht gefunden");

  const role = await getBookRole(chapter.bookId, user.id);
  if (!canManageChapters(role)) throw new Error("Keine Berechtigung");

  await prisma.chapter.update({
    where: { id: input.chapterId },
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      targetWordCount: input.targetWordCount
    }
  });

  revalidatePath(`/books/${chapter.bookId}`);
}

export async function createOrUpdateAutoChapter(input: { bookId: string; title: string; editorNodeId: string }) {
  const user = await requireUser();
  const role = await getBookRole(input.bookId, user.id);
  if (!canManageChapters(role)) throw new Error("Keine Berechtigung");

  const existing = await prisma.chapter.findFirst({
    where: { bookId: input.bookId, editorNodeId: input.editorNodeId, type: "AUTO" }
  });

  if (existing) {
    await prisma.chapter.update({
      where: { id: existing.id },
      data: { title: input.title }
    });
  } else {
    const maxOrder = await prisma.chapter.aggregate({ where: { bookId: input.bookId }, _max: { orderIndex: true } });
    await prisma.chapter.create({
      data: {
        bookId: input.bookId,
        title: input.title,
        type: "AUTO",
        editorNodeId: input.editorNodeId,
        orderIndex: (maxOrder._max.orderIndex ?? 0) + 1
      }
    });
  }

  revalidatePath(`/books/${input.bookId}`);
}
