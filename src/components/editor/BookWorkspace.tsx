"use client";

import { useEffect, useMemo, useState } from "react";
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
  anchorFrom?: number | null;
  anchorTo?: number | null;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const chapter = useMemo(() => chapters.find((c) => c.id === editingChapterId) ?? null, [chapters, editingChapterId]);
  const showSidebars = viewport.width >= viewport.height;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className={`grid h-screen min-h-screen ${showSidebars ? "grid-cols-[1fr_2fr_1fr]" : "grid-cols-1"}`}>
        {showSidebars && (
          <ChapterSidebar
            bookId={bookId}
            title={bookTitle}
            chapters={chapters}
            canManage={canManage}
            onEditChapter={setEditingChapterId}
            className="h-full"
          />
        )}
        <div className="min-h-0">
          <BookEditor
            bookId={bookId}
            contentJson={contentJson}
            canEdit={canEdit}
            canAnnotate={canAnnotate}
            onPageChange={(page, pages) => {
              setCurrentPage(page);
              setTotalPages(pages);
            }}
          />
        </div>
        {showSidebars && <NotesMargin notes={notes} currentPage={currentPage} totalPages={totalPages} className="h-full" />}
      </div>
      <ChapterDetailsModal chapter={chapter} onClose={() => setEditingChapterId(null)} />
    </div>
  );
}
