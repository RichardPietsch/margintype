"use client";

import { useMemo, useState } from "react";
import { ChapterSidebar } from "./ChapterSidebar";
import { NotesMargin } from "./NotesMargin";
import { BookEditor } from "./BookEditor";
import { ChapterDetailsModal } from "./ChapterDetailsModal";

type Chapter = {
  id: string;
  title: string;
  type: "AUTO" | "PLANNED";
  description: string | null;
  status: "PLANNED" | "DRAFTING" | "REVISING" | "DONE";
  targetWordCount: number | null;
};

type Note = {
  id: string;
  selectedTextSnapshot: string;
  body: string;
  author: { name: string; imageUrl?: string | null; avatarColor?: string | null };
  comments: Array<{
    id: string;
    body: string;
    author: { name: string; imageUrl?: string | null; avatarColor?: string | null };
  }>;
};

export function BookWorkspace({
  bookId,
  bookTitle,
  chapters,
  notes,
  contentJson,
  canEdit,
  canManage,
  canAnnotate
}: {
  bookId: string;
  bookTitle: string;
  chapters: Chapter[];
  notes: Note[];
  contentJson: any;
  canEdit: boolean;
  canManage: boolean;
  canAnnotate: boolean;
}) {
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const chapter = useMemo(() => chapters.find((c) => c.id === editingChapterId) ?? null, [chapters, editingChapterId]);

  return (
    <div className="flex h-screen overflow-y-auto">
      <ChapterSidebar bookId={bookId} title={bookTitle} chapters={chapters} canManage={canManage} onEditChapter={setEditingChapterId} />
      <BookEditor bookId={bookId} contentJson={contentJson} canEdit={canEdit} canAnnotate={canAnnotate} />
      <NotesMargin notes={notes} />
      <ChapterDetailsModal chapter={chapter} onClose={() => setEditingChapterId(null)} />
    </div>
  );
}
