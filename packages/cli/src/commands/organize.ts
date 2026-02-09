import path from "node:path"
import { scan, organize, splitPdf } from "@sbsk-notes/core"
import fs from "node:fs/promises"

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"])
const SUPPORTED_EXTS = new Set([...IMAGE_EXTS, ".pdf"])

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

  const supported = files.filter((f) => SUPPORTED_EXTS.has(path.extname(f).toLowerCase()))

  if (supported.length === 0) {
    console.log("No images found in inbox.")
    return
  }

  console.log(`Processing ${supported.length} file(s)...\n`)

  for (const file of supported) {
    const filePath = path.join(inboxDir, file)
    const ext = path.extname(file).toLowerCase()

    if (ext === ".pdf") {
      let pagePngs: string[]
      try {
        pagePngs = await splitPdf(filePath)
      } catch (err) {
        console.error(`Failed to split PDF: ${file} — ${err}`)
        continue
      }

      const totalPages = pagePngs.length
      for (let i = 0; i < totalPages; i++) {
        const pagePng = pagePngs[i]
        console.log(`Processing: ${file} (page ${i + 1} of ${totalPages})`)

        try {
          const ocrResult = await scan(pagePng)
          const result = await organize(pagePng, libraryDir, ocrResult)
          console.log(`  -> ${path.relative(libraryDir, result.targetPath)}`)
        } catch (err) {
          console.error(`  Failed page ${i + 1}: ${err}`)
        }
      }

      // Clean up temp dir (remaining files, if any pages failed to organize)
      if (pagePngs.length > 0) {
        const tempDir = path.dirname(pagePngs[0])
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
      }

      // Delete original PDF from inbox
      await fs.unlink(filePath).catch(() => {})
    } else {
      console.log(`Processing: ${file}`)

      try {
        const ocrResult = await scan(filePath)
        const result = await organize(filePath, libraryDir, ocrResult)
        console.log(`  -> ${path.relative(libraryDir, result.targetPath)}`)
      } catch (err) {
        console.error(`  Failed: ${err}`)
      }
    }
  }

  console.log("\nDone.")
}
