"use client";

import type { Editor } from "@tiptap/react";

export function EditorToolbar({ editor, onAddNote, canEdit }: { editor: Editor | null; onAddNote: () => void; canEdit: boolean }) {
  if (!editor) return null;

  const itemClass = "btn px-2 py-1 text-xs";

  return (
    <div className="sticky bottom-4 mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
      <button className={itemClass} onClick={() => editor.chain().focus().setParagraph().run()} disabled={!canEdit}>P</button>
      <button className={itemClass} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!canEdit}>H1</button>
      <button className={itemClass} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!canEdit}>H2</button>
      <button className={itemClass} onClick={() => editor.chain().focus().toggleBold().run()} disabled={!canEdit}><strong>B</strong></button>
      <button className={itemClass} onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!canEdit}><em>I</em></button>
      <button className={itemClass} onClick={onAddNote}>Notiz +</button>
    </div>
  );
}
