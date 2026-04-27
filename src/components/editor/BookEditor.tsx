"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useMemo, useState, useTransition } from "react";
import { saveDocument } from "@/server/actions/documents";
import { createNote } from "@/server/actions/notes";
import { EditorToolbar } from "./EditorToolbar";
import { VisualPage } from "./VisualPage";

export function BookEditor({ bookId, contentJson, canEdit, canAnnotate }: { bookId: string; contentJson: any; canEdit: boolean; canAnnotate: boolean }) {
  const [pending, startTransition] = useTransition();
  const [selectionText, setSelectionText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    editable: canEdit,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Placeholder.configure({ placeholder: "Beginne mit deinem Manuskript …" }),
      CharacterCount
      // TODO: Add Yjs/Hocuspocus extension for realtime collaboration.
      // TODO: Add durable note mark extension with stable anchors.
    ],
    content: contentJson,
    onSelectionUpdate: ({ editor }) => {
      setSelectionText(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to));
    }
  });

  useEffect(() => {
    if (!editor || !canEdit) return;
    const timer = setTimeout(() => {
      const text = editor.getText();
      startTransition(async () => {
        await saveDocument(bookId, editor.getJSON(), text);
      });
    }, 900);

    return () => clearTimeout(timer);
  }, [bookId, canEdit, editor, editor?.state.doc.content.size]);

  const words = useMemo(() => (editor?.storage.characterCount.words() ?? 0), [editor?.state]);

  if (!mounted) {
    return (
      <section className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-4xl rounded border border-zinc-200 bg-paper px-20 py-16 shadow-paper prose-manuscript">
          <p className="text-sm text-zinc-400">Editor wird geladen …</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-4xl rounded border border-zinc-200 bg-paper px-20 py-16 shadow-paper prose-manuscript">
        <EditorContent editor={editor} />
        <VisualPage pageNumber={1} />
        <VisualPage pageNumber={2} />
      </div>
      <div className="mx-auto mt-2 flex max-w-4xl justify-between text-xs text-zinc-500">
        <span>{pending ? "Speichert …" : "Automatisch gespeichert"}</span>
        <span>{words} Wörter</span>
      </div>
      <EditorToolbar
        editor={editor}
        canEdit={canEdit}
        onAddNote={() => {
          if (!canAnnotate || !selectionText.trim()) return;
          const body = window.prompt("Notiz");
          if (!body) return;
          startTransition(async () => {
            await createNote({ bookId, selectedTextSnapshot: selectionText, body });
          });
        }}
      />
    </section>
  );
}
