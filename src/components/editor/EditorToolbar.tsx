"use client";

import type { Editor } from "@tiptap/react";

export function EditorToolbar({
  editor,
  onAddNote,
  onFullPage,
  canEdit,
  canAddNote
}: {
  editor: Editor | null;
  onAddNote: () => void;
  onFullPage: () => void;
  canEdit: boolean;
  canAddNote: boolean;
}) {
  if (!editor) return null;

  const itemClass = "btn h-9 w-9 p-0 text-xs";

  return (
    <>
      <div className="absolute left-[-64px] top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2 rounded-xl border border-zinc-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <button className={itemClass} onClick={onFullPage} disabled={!canEdit} title="Full Page">□</button>
        <button className={itemClass} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!canEdit}>H1</button>
        <button className={itemClass} onClick={() => editor.chain().focus().setParagraph().run()} disabled={!canEdit}>P</button>
        <button className={itemClass} onClick={() => editor.chain().focus().toggleBold().run()} disabled={!canEdit}><strong>B</strong></button>
        <button className={itemClass} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!canEdit}><em>I</em></button>
      </div>
      <div className="absolute right-[-64px] top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2 rounded-xl border border-zinc-200 bg-white/95 p-2 shadow-sm backdrop-blur">
        <button className="btn h-9 w-9 p-0 text-lg leading-none" onClick={onAddNote} disabled={!canAddNote} title="Kommentar hinzufügen">+</button>
      </div>
    </>
  );
}
