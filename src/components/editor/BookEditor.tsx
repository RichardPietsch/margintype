"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveDocument } from "@/server/actions/documents";
import { createNote } from "@/server/actions/notes";
import { createOrUpdateAutoChapter } from "@/server/actions/chapters";
import { EditorToolbar } from "./EditorToolbar";

const BASELINE_PX = 24;
const PAGE_LINES = 30;
const A5_PAGE_HEIGHT = BASELINE_PX * PAGE_LINES; // 720px text area => 30 lines
const A5_RATIO = 148 / 210;
const CANVAS_PAGE_HEIGHT = 840;
const CANVAS_PAGE_WIDTH = CANVAS_PAGE_HEIGHT * A5_RATIO;
const PAGE_HORIZONTAL_PADDING = 64;
const PAGE_VERTICAL_PADDING = (CANVAS_PAGE_HEIGHT - A5_PAGE_HEIGHT) / 2;
const FOOTER_HEIGHT = 32;

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
  const [canvasScale, setCanvasScale] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLockRef = useRef(false);
  const pageViewportRef = useRef<HTMLDivElement | null>(null);
  const pageHostRef = useRef<HTMLDivElement | null>(null);

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

  useLayoutEffect(() => {
    const host = pageHostRef.current;
    if (!host) return;

    const computeScale = () => {
      const rect = host.getBoundingClientRect();
      const availableWidth = rect.width;
      const availableHeight = Math.max(0, rect.height - FOOTER_HEIGHT);
      const fittedHeight = Math.max(0, Math.min(availableHeight, availableWidth / A5_RATIO));
      const fittedWidth = fittedHeight * A5_RATIO;
      const scale = fittedHeight / CANVAS_PAGE_HEIGHT;

      setPageSize({ width: fittedWidth, height: fittedHeight });
      setCanvasScale(Math.max(0.0001, scale));
    };

    computeScale();
    const raf = window.requestAnimationFrame(computeScale);
    const observer = new ResizeObserver(computeScale);
    observer.observe(host);
    if (host.parentElement) observer.observe(host.parentElement);
    window.addEventListener("resize", computeScale);
    window.addEventListener("orientationchange", computeScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", computeScale);
      window.removeEventListener("orientationchange", computeScale);
      window.cancelAnimationFrame(raf);
    };
  }, []);

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
      <section className="flex h-full flex-1 p-4 sm:p-8">
        <div
          className="mx-auto w-full max-w-full rounded border border-zinc-200 bg-paper shadow-paper prose-manuscript"
          style={{
            width: pageSize.width > 0 ? pageSize.width : undefined,
            aspectRatio: "148 / 210",
            padding: `${PAGE_VERTICAL_PADDING}px ${PAGE_HORIZONTAL_PADDING}px`
          }}
        >
          <p className="text-sm text-zinc-400">Editor wird geladen …</p>
        </div>
      </section>
    );
  }

  const pageOffset = (currentPage - 1) * A5_PAGE_HEIGHT;

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col p-4 sm:p-8">
      <div ref={pageHostRef} className="grid h-full min-h-0 w-full flex-1 place-items-center overflow-hidden">
        <div
          className="relative"
          style={{ width: Math.max(pageSize.width, 1), height: Math.max(pageSize.height, 1) }}
        >
          <div
            className="relative"
            style={{ width: CANVAS_PAGE_WIDTH, height: CANVAS_PAGE_HEIGHT, transform: `scale(${canvasScale})`, transformOrigin: "top left" }}
          >
            <div
              className="rounded border border-zinc-200 bg-paper shadow-paper"
              style={{
                width: CANVAS_PAGE_WIDTH,
                height: CANVAS_PAGE_HEIGHT,
                padding: `${PAGE_VERTICAL_PADDING}px ${PAGE_HORIZONTAL_PADDING}px`
              }}
            >
              <div ref={pageViewportRef} className="overflow-hidden" style={{ height: A5_PAGE_HEIGHT }}>
                <div className="h-full w-full overflow-hidden">
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
      </div>
      <div className="mx-auto mt-2 flex justify-between text-xs text-zinc-500" style={{ width: pageSize.width }}>
        <span>{pending ? "Speichert …" : "Automatisch gespeichert"}</span>
        <span>Seite {currentPage} / {totalPages} · {words} Wörter</span>
      </div>
    </section>
  );
}
