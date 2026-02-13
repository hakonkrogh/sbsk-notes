"use server"

import { db } from "@/db/index"
import { files } from "@/db/schema"
import { eq } from "drizzle-orm"
import { mockProcess } from "@/lib/processing"
import { findOrCreateGroup } from "@/lib/grouping"
import { revalidatePath } from "next/cache"

export async function processFile(fileId: string) {
  await db
    .update(files)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(files.id, fileId))

  try {
    const result = await mockProcess()

    const arranger = result.credits.arrangers[0] ?? ""
    const instrument = result.instruments[0]
    const groupId = await findOrCreateGroup(result.title, arranger)

    await db
      .update(files)
      .set({
        status: "done",
        parsedTitle: result.title,
        parsedArranger: arranger,
        parsedInstrument: instrument?.name ?? null,
        parsedPart: instrument?.part ?? null,
        parsedConfidence: result.confidence.overall,
        parsedRaw: result.raw,
        parsedCredits: result.credits,
        parsedInstruments: result.instruments,
        groupId,
        updatedAt: new Date(),
      })
      .where(eq(files.id, fileId))
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    await db
      .update(files)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(files.id, fileId))
  }

  revalidatePath("/processing")
  revalidatePath("/validation")
}

export async function processPending() {
  const pending = await db.query.files.findMany({
    where: eq(files.status, "pending"),
  })

  for (const file of pending) {
    await processFile(file.id)
  }
}

export async function retryProcessing(fileId: string) {
  await db
    .update(files)
    .set({ status: "pending", errorMessage: null, updatedAt: new Date() })
    .where(eq(files.id, fileId))

  await processFile(fileId)
}
