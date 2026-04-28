"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveDocument } from "@/server/actions/documents";
import { createNote } from "@/server/actions/notes";
import { createOrUpdateAutoChapter } from "@/server/actions/chapters";
import { EditorToolbar } from "./EditorToolbar";

const BASELINE_PX = 24;
const PAGE_LINES = 30;
const A5_PAGE_HEIGHT = BASELINE_PX * PAGE_LINES; // 720px text area => 30 lines

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
  const wheelLockRef = useRef(false);
  const pageViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    editable: canEdit,
    extensions: [
      StarterKit.configure({ heading: { levels: [1] } }),
      Placeholder.configure({ placeholder: "Beginne mit deinem Manuskript …" }),
      CharacterCount,
      Highlight.configure({ multicolor: true })
      // TODO: Persist explicit chapter/note anchors as hidden marks in document JSON.
    ],
    content: contentJson,
    editorProps: {
      // Keep page position stable; we flip pages manually instead of native scroll-to-caret behavior.
      handleScrollToSelection: () => true
    },
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

    const onUpdate = ({ transaction }: { transaction: { getMeta: (key: string) => unknown } }) => {
      recalcPages(editor);

      if (transaction.getMeta("paste")) {
        const pages = Math.max(1, Math.ceil(editor.view.dom.scrollHeight / A5_PAGE_HEIGHT));
        setCurrentPage(pages);
      }

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

  useEffect(() => {
    const node = pageViewportRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      setCurrentPage((prev) => {
        if (event.deltaY > 0) return Math.min(totalPages, prev + 1);
        if (event.deltaY < 0) return Math.max(1, prev - 1);
        return prev;
      });
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 120);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [totalPages]);

  useEffect(() => {
    if (!editor) return;
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ from: number | null; to: number | null }>;
      const from = custom.detail?.from;
      const to = custom.detail?.to;
      if (!from || !to) return;
      editor.chain().focus().setTextSelection({ from, to }).unsetHighlight().run();
    };
    window.addEventListener("note-deleted", handler as EventListener);
    return () => window.removeEventListener("note-deleted", handler as EventListener);
  }, [editor]);

  const words = useMemo(() => (editor?.storage.characterCount.words() ?? 0), [editor?.state]);

  if (!mounted) {
      return (
      <section className="flex-1 p-8">
        <div className="mx-auto w-[720px] rounded border border-zinc-200 bg-paper px-20 py-14 shadow-paper prose-manuscript">
          <p className="text-sm text-zinc-400">Editor wird geladen …</p>
        </div>
      </section>
    );
  }

  const pageOffset = (currentPage - 1) * A5_PAGE_HEIGHT;

  return (
    <section className="flex-1 p-8">
      <div className="relative mx-auto w-[780px]">
        <div className="mx-auto w-[720px] rounded border border-zinc-200 bg-paper px-20 py-14 shadow-paper">
          <div
            ref={pageViewportRef}
            className="h-[840px] overflow-hidden"
          >
            <div className="flex h-full items-center">
              <div className="h-[720px] w-full overflow-hidden">
                <div style={{ transform: `translateY(-${pageOffset}px)` }} className="prose-manuscript">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>
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
            editor?.chain().focus().setHighlight({ color: "#fef3c7" }).run();
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
      </div>
      <div className="mx-auto mt-2 flex w-[720px] justify-between text-xs text-zinc-500">
        <span>{pending ? "Speichert …" : "Automatisch gespeichert"}</span>
        <span>Seite {currentPage} / {totalPages} · {words} Wörter</span>
      </div>
    </section>
  );
}
