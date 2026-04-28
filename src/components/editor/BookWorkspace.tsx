"use client";

import { useMemo, useState } from "react";
import { BookOpenText, MessageSquareText, X } from "lucide-react";
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
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const chapter = useMemo(() => chapters.find((c) => c.id === editingChapterId) ?? null, [chapters, editingChapterId]);

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="hidden xl:flex">
        <ChapterSidebar bookId={bookId} title={bookTitle} chapters={chapters} canManage={canManage} onEditChapter={setEditingChapterId} className="h-screen" />
      </div>
      <div className="min-w-0 flex-1">
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
      <div className="hidden xl:flex">
        <NotesMargin notes={notes} currentPage={currentPage} totalPages={totalPages} className="h-screen" />
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-between px-3 xl:hidden">
        <button className="pointer-events-auto btn h-10 gap-2 bg-white/95 px-3 text-xs shadow" onClick={() => setShowChapterDrawer(true)}>
          <BookOpenText size={16} /> Kapitel
        </button>
        <button className="pointer-events-auto btn h-10 gap-2 bg-white/95 px-3 text-xs shadow" onClick={() => setShowNotesDrawer(true)}>
          <MessageSquareText size={16} /> Notizen
        </button>
      </div>
      {showChapterDrawer && (
        <>
          <button className="fixed inset-0 z-40 bg-black/30 xl:hidden" aria-label="Kapitel schließen" onClick={() => setShowChapterDrawer(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-[min(90vw,20rem)] xl:hidden">
            <ChapterSidebar
              bookId={bookId}
              title={bookTitle}
              chapters={chapters}
              canManage={canManage}
              onEditChapter={setEditingChapterId}
              onNavigate={() => setShowChapterDrawer(false)}
              className="h-full shadow-lg"
            />
            <button className="btn absolute right-3 top-3 h-9 w-9 bg-white p-0" onClick={() => setShowChapterDrawer(false)} aria-label="Kapitel schließen">
              <X size={16} />
            </button>
          </div>
        </>
      )}
      {showNotesDrawer && (
        <>
          <button className="fixed inset-0 z-40 bg-black/30 xl:hidden" aria-label="Notizen schließen" onClick={() => setShowNotesDrawer(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-[min(90vw,20rem)] xl:hidden">
            <NotesMargin notes={notes} currentPage={currentPage} totalPages={totalPages} className="h-full shadow-lg" />
            <button className="btn absolute left-3 top-3 h-9 w-9 bg-white p-0" onClick={() => setShowNotesDrawer(false)} aria-label="Notizen schließen">
              <X size={16} />
            </button>
          </div>
        </>
      )}
      <ChapterDetailsModal chapter={chapter} onClose={() => setEditingChapterId(null)} />
    </div>
  );
}
