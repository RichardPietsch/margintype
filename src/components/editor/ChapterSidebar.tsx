"use client";

import { Pencil } from "lucide-react";
import { createPlannedChapter } from "@/server/actions/chapters";

type Chapter = { id: string; title: string; type: "AUTO" | "PLANNED" };

export function ChapterSidebar({
  bookId,
  title,
  chapters,
  onEditChapter,
  canManage,
  className = "",
  onNavigate
}: {
  bookId: string;
  title: string;
  chapters: Chapter[];
  onEditChapter: (id: string) => void;
  canManage: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <aside className={`flex min-h-0 w-full flex-col border-r border-zinc-200 bg-zinc-50/70 p-4 backdrop-blur ${className}`}>
      <a href="/dashboard" onClick={onNavigate} className="mb-4 text-xs text-zinc-500">← Zurück</a>
      <h2 className="mb-4 line-clamp-2 text-sm font-medium">{title}</h2>
      <ul className="flex-1 space-y-2 overflow-y-auto">
        {chapters.map((chapter) => (
          <li key={chapter.id} className="flex items-center justify-between rounded border border-zinc-200 bg-white px-2 py-1.5 text-sm">
            <span className="line-clamp-1">{chapter.title}</span>
            {canManage && (
              <button onClick={() => { onEditChapter(chapter.id); onNavigate?.(); }} className="text-zinc-500 hover:text-zinc-800"><Pencil size={14} /></button>
            )}
          </li>
        ))}
      </ul>
      {canManage && (
        <form action={async () => await createPlannedChapter(bookId)}>
          <button className="btn mt-3 w-full text-xs">Kapitel hinzufügen</button>
        </form>
      )}
    </aside>
  );
}
