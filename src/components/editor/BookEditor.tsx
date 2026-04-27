"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveDocument } from "@/server/actions/documents";
import { createNote } from "@/server/actions/notes";
import { createOrUpdateAutoChapter } from "@/server/actions/chapters";
import { EditorToolbar } from "./EditorToolbar";

const A5_PAGE_HEIGHT = 794;

export function BookEditor({
  bookId,
  contentJson,
  canEdit,
  canAnnotate,
  onPageChange
}: {
  bookId: string;
  contentJson: any;
  canEdit: boolean;
  canAnnotate: boolean;
  onPageChange: (page: number, totalPages: number) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [selectionText, setSelectionText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelBufferRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    editable: canEdit,
    extensions: [
      StarterKit.configure({ heading: { levels: [1] } }),
      Placeholder.configure({ placeholder: "Beginne mit deinem Manuskript …" }),
      CharacterCount
      // TODO: Persist explicit chapter/note anchors as hidden marks in document JSON.
    ],
    content: contentJson,
    onSelectionUpdate: ({ editor }) => {
      setSelectionText(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to));
      setSelectionRange({ from: editor.state.selection.from, to: editor.state.selection.to });
    }
  });

  const recalcPages = (instance = editor) => {
    if (!instance) return;
    const contentHeight = instance.view.dom.scrollHeight;
    const pages = Math.max(1, Math.ceil(contentHeight / A5_PAGE_HEIGHT));
    setTotalPages(pages);
    setCurrentPage((prev) => Math.min(prev, pages));
  };

  useEffect(() => {
    if (!editor || !canEdit) return;

    const onUpdate = () => {
      recalcPages(editor);

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
    recalcPages(editor);
    const interval = setInterval(() => recalcPages(editor), 500);
    return () => clearInterval(interval);
  }, [editor]);

  useEffect(() => {
    onPageChange(currentPage, totalPages);
  }, [currentPage, onPageChange, totalPages]);

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

  const pageOffset = (currentPage - 1) * A5_PAGE_HEIGHT;

  return (
    <section className="flex-1 p-8">
      <div className="mx-auto w-[560px] rounded border border-zinc-200 bg-paper px-16 py-14 shadow-paper">
        <div className="h-[794px] overflow-hidden" onWheelCapture={(e) => {
          e.preventDefault();
          wheelBufferRef.current += e.deltaY;
          if (Math.abs(wheelBufferRef.current) < 80) return;
          if (wheelBufferRef.current > 0) setCurrentPage((p) => Math.min(totalPages, p + 1));
          else setCurrentPage((p) => Math.max(1, p - 1));
          wheelBufferRef.current = 0;
        }}>
          <div style={{ transform: `translateY(-${pageOffset}px)` }} className="prose-manuscript transition-transform duration-150">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-2 flex w-[560px] justify-between text-xs text-zinc-500">
        <span>{pending ? "Speichert …" : "Automatisch gespeichert"}</span>
        <span>Seite {currentPage} / {totalPages} · {words} Wörter</span>
      </div>
      <EditorToolbar
        editor={editor}
        canEdit={canEdit}
        canAddNote={canAnnotate && selectionText.trim().length > 0}
        onFullPage={() => {
          if (!editor || !canEdit) return;
          const title = selectionText.trim() || "Kapitel";
          const nodeId = `auto-${title.toLowerCase().replace(/\s+/g, "-").slice(0, 64)}`;
          editor.chain().focus().toggleHeading({ level: 1 }).updateAttributes("heading", { "data-full-page": "true" }).run();
          startTransition(async () => {
            await createOrUpdateAutoChapter({ bookId, title, editorNodeId: nodeId });
          });
        }}
        onAddNote={() => {
          if (!canAnnotate || !selectionText.trim() || !selectionRange) return;
          const body = window.prompt("Notiz");
          if (!body) return;
          startTransition(async () => {
            await createNote({
              bookId,
              selectedTextSnapshot: selectionText,
              body,
              anchorFrom: selectionRange.from,
              anchorTo: selectionRange.to,
              anchorId: `a-${selectionRange.from}-${selectionRange.to}`
            });
          });
        }}
      />
    </section>
  );
}
