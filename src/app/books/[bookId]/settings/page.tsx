import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { canManageProject, getBookRole } from "@/lib/permissions/books";
import { exportToMarkdown } from "@/lib/export/markdown";
import { getAiConfig } from "@/lib/ai/service";

export default async function BookSettingsPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const user = await requireUser();
  const role = await getBookRole(bookId, user.id);
  if (!role) notFound();

  const book = await prisma.book.findUnique({ where: { id: bookId }, include: { document: true, members: { include: { user: true } } } });
  if (!book) notFound();

  const markdown = exportToMarkdown({ title: book.title, plainText: book.document?.plainTextCache ?? "" });
  const ai = getAiConfig();

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href={`/books/${bookId}`} className="text-xs text-zinc-500">← Zurück zum Manuskript</Link>
      <h1 className="mt-3 text-2xl font-medium">Projekteinstellungen</h1>

      <section className="mt-8 rounded border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-medium">Sprache</h2>
        <p className="mt-2 text-sm text-zinc-600">Standard: {book.language}. TODO: Typografie-/Rechtschreiboptionen je Projekt erweitern.</p>
      </section>

      <section className="mt-4 rounded border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-medium">Mitglieder</h2>
        <ul className="mt-2 space-y-1 text-sm text-zinc-700">
          {book.members.map((m) => <li key={m.id}>{m.user.name} – {m.role}</li>)}
        </ul>
        {!canManageProject(role) && <p className="mt-2 text-xs text-zinc-500">Nur Owner können Mitglieder verwalten.</p>}
      </section>

      <section className="mt-4 rounded border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-medium">Export</h2>
        <p className="mb-3 mt-2 text-sm text-zinc-600">Markdown/HTML sofort, PDF/DOCX/EPUB als zukünftige Job-Worker.</p>
        <details className="rounded border border-zinc-200 p-3 text-sm"><summary>Markdown Vorschau</summary><pre className="mt-2 overflow-x-auto text-xs">{markdown}</pre></details>
        <div className="mt-3 flex gap-2 text-xs"><button className="btn">Markdown exportieren</button><button className="btn" disabled>PDF (bald)</button><button className="btn" disabled>DOCX (bald)</button><button className="btn" disabled>EPUB (bald)</button></div>
      </section>

      <section className="mt-4 rounded border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-medium">Lokale KI</h2>
        <p className="mt-2 text-sm text-zinc-600">Privatmodus: Nutze lokale Modelle statt Cloud. Endpoint: {ai.baseUrl}, Modell: {ai.model}</p>
      </section>
    </div>
  );
}
