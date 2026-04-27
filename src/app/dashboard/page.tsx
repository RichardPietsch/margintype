import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { createBook } from "@/server/actions/books";

export default async function DashboardPage() {
  const user = await requireUser();
  const books = await prisma.book.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium">Bücher</h1>
        <form action="/api/auth/logout" method="post"><button className="btn">Abmelden</button></form>
      </header>
      <form action={createBook} className="mb-8 flex gap-2">
        <input name="title" className="input" placeholder="Buchtitel" />
        <button className="btn btn-primary">Neues Buch</button>
      </form>
      <ul className="space-y-3">
        {books.map((book) => (
          <li key={book.id} className="rounded border border-zinc-200 bg-white p-4">
            <Link href={`/books/${book.id}`} className="text-lg">{book.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
