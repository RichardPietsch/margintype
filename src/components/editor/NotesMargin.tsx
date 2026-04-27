"use client";

import { useState, useTransition } from "react";
import { addNoteComment, deleteNote, updateNote } from "@/server/actions/notes";
import { UserAvatar } from "@/components/ui/UserAvatar";

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

export function NotesMargin({ notes }: { notes: Note[] }) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <aside className="w-80 border-l border-zinc-200 bg-zinc-50/40 p-4">
      <h3 className="mb-3 text-sm font-medium">Notizen</h3>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <UserAvatar name={note.author.name} imageUrl={note.author.imageUrl} color={note.author.avatarColor} size={20} />
              <p className="text-[11px] text-zinc-500">„{note.selectedTextSnapshot}“</p>
            </div>
            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="input min-h-16 text-xs" />
                <div className="flex gap-2">
                  <button className="btn text-xs" onClick={() => setEditingId(null)}>Abbrechen</button>
                  <button
                    className="btn text-xs"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await updateNote({ noteId: note.id, body: draft });
                        setEditingId(null);
                      })
                    }
                  >
                    Speichern
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm">{note.body}</p>
            )}
            <p className="mt-2 text-[11px] text-zinc-500">von {note.author.name}</p>
            <div className="mt-2 flex gap-2 text-xs">
              <button className="btn py-1 text-xs" onClick={() => { setEditingId(note.id); setDraft(note.body); }}>Bearbeiten</button>
              <button className="btn py-1 text-xs" disabled={pending} onClick={() => startTransition(async () => await deleteNote(note.id))}>Löschen</button>
            </div>
            <div className="mt-3 space-y-2 border-t border-amber-200 pt-2">
              {note.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 text-xs">
                  <UserAvatar name={comment.author.name} imageUrl={comment.author.imageUrl} color={comment.author.avatarColor} size={18} />
                  <p><span className="font-medium">{comment.author.name}:</span> {comment.body}</p>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  startTransition(async () => {
                    const body = String(formData.get("comment") ?? "").trim();
                    if (!body) return;
                    await addNoteComment({ noteId: note.id, body });
                    e.currentTarget.reset();
                  });
                }}
              >
                <input className="input text-xs" name="comment" placeholder="Kommentieren …" />
              </form>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
