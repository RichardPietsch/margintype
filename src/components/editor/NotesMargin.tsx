"use client";

type Note = {
  id: string;
  selectedTextSnapshot: string;
  body: string;
  author: { name: string };
};

export function NotesMargin({ notes }: { notes: Note[] }) {
  return (
    <aside className="h-screen w-80 overflow-y-auto border-l border-zinc-200 bg-zinc-50/40 p-4">
      <h3 className="mb-3 text-sm font-medium">Notizen</h3>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="mb-1 text-xs text-zinc-500">„{note.selectedTextSnapshot}“</p>
            <p className="text-sm">{note.body}</p>
            <p className="mt-2 text-[11px] text-zinc-500">von {note.author.name}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
