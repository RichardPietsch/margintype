"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveDocument } from "@/server/actions/documents";
import { createNote } from "@/server/actions/notes";
import { EditorToolbar } from "./EditorToolbar";
import { VisualPage } from "./VisualPage";

export function BookEditor({ bookId, contentJson, canEdit, canAnnotate }: { bookId: string; contentJson: any; canEdit: boolean; canAnnotate: boolean }) {
  const [pending, startTransition] = useTransition();
  const [selectionText, setSelectionText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pages, setPages] = useState(1);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const A5_PAGE_HEIGHT = 794; // approx px at 96dpi

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    editable: canEdit,
    extensions: [
      StarterKit.configure({ heading: { levels: [1] } }),
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

    const onUpdate = () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const text = editor.getText();
        const jsonString = JSON.stringify(editor.getJSON());
        startTransition(async () => {
          await saveDocument(bookId, jsonString, text);
        });
      }, 700);
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [bookId, canEdit, editor]);

  useEffect(() => {
    if (!editor) return;
    const recalcPages = () => {
      const height = editor.view.dom.clientHeight;
      setPages(Math.max(1, Math.ceil(height / A5_PAGE_HEIGHT)));
    };
    recalcPages();
    const interval = setInterval(recalcPages, 600);
    return () => clearInterval(interval);
  }, [editor]);

  const words = useMemo(() => (editor?.storage.characterCount.words() ?? 0), [editor?.state]);

  if (!mounted) {
    return (
      <section className="flex-1 p-8">
        <div className="mx-auto w-[560px] rounded border border-zinc-200 bg-paper px-16 py-14 shadow-paper prose-manuscript">
          <p className="text-sm text-zinc-400">Editor wird geladen …</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 p-8">
      <div className="mx-auto w-[560px] rounded border border-zinc-200 bg-paper px-16 py-14 shadow-paper prose-manuscript">
        <EditorContent editor={editor} />
        {Array.from({ length: Math.max(0, pages - 1) }).map((_, i) => (
          <VisualPage key={i} pageNumber={i + 2} />
        ))}
      </div>
      <div className="mx-auto mt-2 flex w-[560px] justify-between text-xs text-zinc-500">
        <span>{pending ? "Speichert …" : "Automatisch gespeichert"}</span>
        <span>{words} Wörter</span>
      </div>
      <EditorToolbar
        editor={editor}
        canEdit={canEdit}
        canAddNote={canAnnotate && selectionText.trim().length > 0}
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
