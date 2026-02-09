import fs from "node:fs/promises"
import path from "node:path"
import { scan } from "@sbsk-notes/core"
import type { ScanResult } from "@sbsk-notes/core"

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"])

export async function scanCommand(inboxDir: string): Promise<ScanResult[]> {
  let files: string[]
  try {
    files = await fs.readdir(inboxDir)
  } catch {
    console.error(`Inbox directory not found: ${inboxDir}`)
    return []
  }

  const images = files.filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))

  if (images.length === 0) {
    console.log("No images found in inbox.")
    return []
  }

  console.log(`Found ${images.length} image(s) in inbox.\n`)

  const results: ScanResult[] = []

  for (const image of images) {
    const imagePath = path.join(inboxDir, image)
    console.log(`Scanning: ${image}`)

    try {
      const ocrResult = await scan(imagePath)
      results.push({ sourcePath: imagePath, ocrResult })

      console.log(`  Title:      ${ocrResult.metadata.title || "(unknown)"}`)
      console.log(`  Arranger:   ${ocrResult.metadata.arranger || "(unknown)"}`)
      console.log(`  Instrument: ${ocrResult.instrument || "(unknown)"}`)
      console.log(`  Part:       ${ocrResult.part}`)
      console.log(`  Confidence: ${(ocrResult.confidence * 100).toFixed(0)}%`)
      console.log()
    } catch (err) {
      console.error(`  Failed to scan: ${err}`)
    }
  }

  return results
}
