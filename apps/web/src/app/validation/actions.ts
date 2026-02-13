"use server"

import { db } from "@/db/index"
import { groups } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function approveGroup(groupId: string) {
  await db
    .update(groups)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(groups.id, groupId))

  revalidatePath("/validation")
}

export async function rejectGroup(groupId: string) {
  await db
    .update(groups)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(groups.id, groupId))

  revalidatePath("/validation")
}
