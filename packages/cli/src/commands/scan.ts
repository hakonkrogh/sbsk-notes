import fs from "node:fs/promises"
import path from "node:path"
import { scan, splitPdf } from "@sbsk-notes/core"
import { parse, toPageFiling } from "@sbsk-notes/parser"
import type { ParseResult } from "@sbsk-notes/parser"

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"])
const SUPPORTED_EXTS = new Set([...IMAGE_EXTS, ".pdf"])

export interface ScanCommandResult {
  sourcePath: string
  parseResult: ParseResult
}

function printParseResult(result: ParseResult): void {
  const filing = toPageFiling(result)
  const blank = !result.title && result.instruments.length === 0 && result.credits.arrangers.length === 0

  if (blank) {
    console.log(`  (blank/unreadable)`)
    console.log(`  Confidence: 0%`)
  } else {
    console.log(`  Title:      ${result.title || "(unknown)"}`)
    if (result.credits.composers.length > 0) {
      console.log(`  Composers:  ${result.credits.composers.join(", ")}`)
    }
    if (result.credits.lyricists.length > 0 &&
        JSON.stringify(result.credits.lyricists) !== JSON.stringify(result.credits.composers)) {
      console.log(`  Lyricists:  ${result.credits.lyricists.join(", ")}`)
    }
    console.log(`  Arranger:   ${filing.arranger || "(unknown)"}`)
    if (result.credits.recordingArtists.length > 0) {
      console.log(`  Recorded by: ${result.credits.recordingArtists.join(", ")}`)
    }
    if (result.instruments.length > 0) {
      const instList = result.instruments.map((i) =>
        `${i.name}${i.part > 1 || result.instruments.length > 1 ? ` ${i.part}` : ""}`
      )
      console.log(`  Instruments: ${instList.join(", ")}`)
    } else {
      console.log(`  Instrument: (unknown)`)
    }
    console.log(`  Confidence: ${(result.confidence.overall * 100).toFixed(0)}%`)
  }
  console.log()
}

export async function scanCommand(inboxDir: string): Promise<ScanCommandResult[]> {
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

  const results: ScanCommandResult[] = []

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
          const raw = await scan(pagePng)
          const parseResult = parse(raw)
          results.push({ sourcePath: pagePng, parseResult })
          printParseResult(parseResult)
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
        const raw = await scan(filePath)
        const parseResult = parse(raw)
        results.push({ sourcePath: filePath, parseResult })
        printParseResult(parseResult)
      } catch (err) {
        console.error(`  Failed to scan: ${err}`)
      }
    }
  }

  return results
}
