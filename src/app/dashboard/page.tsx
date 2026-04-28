import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { createBook, deleteBook, renameBook } from "@/server/actions/books";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default async function DashboardPage() {
  const user = await requireUser();
  const books = await prisma.book.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} imageUrl={user.imageUrl} color={user.avatarColor} />
          <div>
            <h1 className="text-2xl font-medium">Bücher</h1>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="post"><button className="btn">Abmelden</button></form>
      </header>
      <form action="/api/profile/avatar" method="post" encType="multipart/form-data" className="mb-4 flex items-center gap-2 text-xs">
        <input type="file" name="avatar" accept="image/*" className="input max-w-sm" />
        <button className="btn">Profilbild hochladen</button>
      </form>
      <form
        action={async (formData) => {
          "use server";
          await createBook(formData);
        }}
        className="mb-8 flex gap-2"
      >
        <input name="title" className="input" placeholder="Buchtitel" />
        <button className="btn btn-primary">Neues Buch</button>
      </form>
      <ul className="space-y-3">
        {books.map((book) => (
          <li key={book.id} className="rounded border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/books/${book.id}`} className="text-lg">{book.title}</Link>
              <div className="flex gap-2">
                <form action={renameBook} className="flex gap-2">
                  <input type="hidden" name="bookId" value={book.id} />
                  <input name="title" defaultValue={book.title} className="input h-8 w-44 text-xs" />
                  <button className="btn h-8 py-1 text-xs">Umbenennen</button>
                </form>
                <form action={deleteBook}>
                  <input type="hidden" name="bookId" value={book.id} />
                  <button className="btn h-8 py-1 text-xs">Löschen</button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
