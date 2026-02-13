"use server"

import { db } from "@/db/index"
import { files } from "@/db/schema"
import { saveUploadedFile } from "@/lib/uploads"
import { revalidatePath } from "next/cache"

export async function uploadFiles(formData: FormData) {
  const uploaded = formData.getAll("files") as File[]

  for (const file of uploaded) {
    if (!file.size) continue

    const { id, path } = await saveUploadedFile(file)

    await db.insert(files).values({
      id,
      originalName: file.name,
      storagePath: path,
      mimeType: file.type || "image/png",
      fileSize: file.size,
      status: "pending",
    })
  }

  revalidatePath("/upload")
  revalidatePath("/processing")
}
