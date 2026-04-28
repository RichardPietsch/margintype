"use client";

import { useTransition } from "react";
import { updateChapterDetails } from "@/server/actions/chapters";

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  status: "PLANNED" | "DRAFTING" | "REVISING" | "DONE";
  targetWordCount: number | null;
};

export function ChapterDetailsModal({ chapter, onClose }: { chapter: Chapter | null; onClose: () => void }) {
  const [pending, startTransition] = useTransition();

  if (!chapter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6">
        <h3 className="mb-4 text-lg font-medium">Kapitel bearbeiten</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(async () => {
              await updateChapterDetails({
                chapterId: chapter.id,
                title: String(data.get("title")),
                description: String(data.get("description") || ""),
                status: data.get("status") as Chapter["status"],
                targetWordCount: Number(data.get("targetWordCount")) || undefined
              });
              onClose();
            });
          }}
          className="space-y-4"
        >
          <input name="title" defaultValue={chapter.title} className="input" />
          <textarea name="description" defaultValue={chapter.description ?? ""} className="input min-h-24" />
          <select name="status" defaultValue={chapter.status} className="input">
            <option value="PLANNED">Geplant</option><option value="DRAFTING">Entwurf</option><option value="REVISING">Überarbeitung</option><option value="DONE">Fertig</option>
          </select>
          <input name="targetWordCount" type="number" defaultValue={chapter.targetWordCount ?? ""} className="input" />
          <div className="grid grid-cols-3 gap-3 text-xs text-zinc-600">
            <div className="rounded border border-zinc-200 p-3"><p className="font-medium">Zusammenfassung</p><p>KI-Platzhalter</p></div>
            <div className="rounded border border-zinc-200 p-3"><p className="font-medium">Stilanalyse</p><p>KI-Platzhalter</p></div>
            <div className="rounded border border-zinc-200 p-3"><p className="font-medium">Wiederholungen</p><p>KI-Platzhalter</p></div>
          </div>
          <div className="flex justify-end gap-2"><button type="button" className="btn" onClick={onClose}>Schließen</button><button disabled={pending} className="btn btn-primary">Speichern</button></div>
        </form>
      </div>
    </div>
  );
}
