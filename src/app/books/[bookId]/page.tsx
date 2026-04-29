import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { canCreateNote, canEditManuscript, canManageChapters, getBookRole } from "@/lib/permissions/books";
import { notFound } from "next/navigation";
import { BookWorkspace } from "@/components/editor/BookWorkspace";

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const user = await requireUser();

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      chapters: { orderBy: { orderIndex: "asc" } },
      notes: {
        include: {
          author: { select: { name: true, imageUrl: true, avatarColor: true } },
          comments: {
            include: { author: { select: { name: true, imageUrl: true, avatarColor: true } } },
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      document: true
    }
  });

  if (!book) notFound();

  const role = await getBookRole(bookId, user.id);
  if (!role) notFound();

  const initialContentJson = JSON.parse(
    JSON.stringify(book.document?.contentJson ?? { type: "doc", content: [{ type: "paragraph" }] })
  );

  return (
    <>
      <div className="absolute right-4 top-4 z-10"><Link href={`/books/${bookId}/settings`} className="btn text-xs">Projekteinstellungen</Link></div>
      <BookWorkspace
        bookId={bookId}
        bookTitle={book.title}
        chapters={book.chapters}
        notes={book.notes}
        contentJson={initialContentJson}
        canEdit={canEditManuscript(role)}
        canManage={canManageChapters(role)}
        canAnnotate={canCreateNote(role)}
      />
    </>
  );
}
