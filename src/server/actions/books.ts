"use server";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";

export async function createBook(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Titel fehlt");

  const book = await prisma.book.create({
    data: {
      ownerId: user.id,
      title,
      language: "de",
      members: {
        create: {
          userId: user.id,
          role: "OWNER"
        }
      },
      document: {
        create: {
          contentJson: {
            type: "doc",
            content: [{ type: "paragraph" }]
          }
        }
      }
    }
  });

  revalidatePath("/dashboard");
  return book.id;
}
