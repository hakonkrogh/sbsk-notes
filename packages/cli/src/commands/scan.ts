import fs from "node:fs/promises"
import path from "node:path"
import { scan, splitPdf } from "@sbsk-notes/core"
import type { ScanResult } from "@sbsk-notes/core"

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"])
const SUPPORTED_EXTS = new Set([...IMAGE_EXTS, ".pdf"])

export async function scanCommand(inboxDir: string): Promise<ScanResult[]> {
  let files: string[]
  try {
    files = await fs.readdir(inboxDir)
  } catch {
    console.error(`Inbox directory not found: ${inboxDir}`)
    return []
  }

  const supported = files.filter((f) => SUPPORTED_EXTS.has(path.extname(f).toLowerCase()))

  if (supported.length === 0) {
    console.log("No images found in inbox.")
    return []
  }

  console.log(`Found ${supported.length} file(s) in inbox.\n`)

  const results: ScanResult[] = []

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
        console.log(`Scanning: ${file} (page ${i + 1} of ${totalPages})`)

        try {
          const ocrResult = await scan(pagePng)
          results.push({ sourcePath: pagePng, ocrResult })

          const blank =
            !ocrResult.metadata.title && !ocrResult.instrument && !ocrResult.metadata.arranger
          if (blank) {
            console.log(`  (blank/unreadable)`)
            console.log(`  Confidence: 0%`)
          } else {
            console.log(`  Title:      ${ocrResult.metadata.title || "(unknown)"}`)
            console.log(`  Arranger:   ${ocrResult.metadata.arranger || "(unknown)"}`)
            console.log(`  Instrument: ${ocrResult.instrument || "(unknown)"}`)
            console.log(`  Part:       ${ocrResult.part}`)
            console.log(`  Confidence: ${(ocrResult.confidence * 100).toFixed(0)}%`)
          }
          console.log()
        } catch (err) {
          console.error(`  Failed to scan page ${i + 1}: ${err}`)
        }
      }

      // Clean up temp PNGs
      if (pagePngs.length > 0) {
        const tempDir = path.dirname(pagePngs[0])
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
      }
    } else {
      console.log(`Scanning: ${file}`)

      try {
        const ocrResult = await scan(filePath)
        results.push({ sourcePath: filePath, ocrResult })

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
  }

  return results
}
