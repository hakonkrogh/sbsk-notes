import { mkdir, writeFile } from "node:fs/promises"
import { join, extname } from "node:path"
import { createId } from "./ids"

function getUploadDir(): string {
  return process.env.UPLOAD_DIR || "../../data/uploads"
}

export async function saveUploadedFile(file: File): Promise<{ id: string; path: string }> {
  const dir = getUploadDir()
  await mkdir(dir, { recursive: true })

  const id = createId()
  const ext = extname(file.name) || ".png"
  const filename = `${id}${ext}`
  const path = join(dir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path, buffer)

  return { id, path }
}
