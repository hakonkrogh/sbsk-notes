import path from "node:path"
import { scan, organize } from "@sbsk-notes/core"
import fs from "node:fs/promises"

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"])

export async function organizeCommand(
  inboxDir: string,
  libraryDir: string
): Promise<void> {
  let files: string[]
  try {
    files = await fs.readdir(inboxDir)
  } catch {
    console.error(`Inbox directory not found: ${inboxDir}`)
    return
  }

  const images = files.filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))

  if (images.length === 0) {
    console.log("No images found in inbox.")
    return
  }

  console.log(`Processing ${images.length} image(s)...\n`)

  for (const image of images) {
    const imagePath = path.join(inboxDir, image)
    console.log(`Processing: ${image}`)

    try {
      const ocrResult = await scan(imagePath)
      const result = await organize(imagePath, libraryDir, ocrResult)
      console.log(`  -> ${path.relative(libraryDir, result.targetPath)}`)
    } catch (err) {
      console.error(`  Failed: ${err}`)
    }
  }

  console.log("\nDone.")
}
