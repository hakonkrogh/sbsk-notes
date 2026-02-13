import { db } from "@/db/index"
import { groups } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { createId } from "./ids"

export async function findOrCreateGroup(title: string, arranger: string): Promise<string> {
  const existing = await db.query.groups.findFirst({
    where: and(eq(groups.title, title), eq(groups.arranger, arranger)),
  })

  if (existing) {
    return existing.id
  }

  const id = createId()
  await db.insert(groups).values({
    id,
    title,
    arranger,
  })

  return id
}
