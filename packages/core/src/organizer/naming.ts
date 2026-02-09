import type { OcrResult } from "../types.js"
import path from "node:path"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildTargetPath(
  libraryDir: string,
  ocrResult: OcrResult,
  ext: string = ".png"
): string {
  const { metadata, instrument, part } = ocrResult
  const songSlug = slugify(metadata.title)
  const arrangerSlug = slugify(metadata.arranger)
  const instrumentSlug = slugify(instrument)

  const folderName = arrangerSlug
    ? `${songSlug}--arr-${arrangerSlug}`
    : songSlug

  const fileName = `${instrumentSlug}-${part}${ext}`

  return path.join(libraryDir, folderName, fileName)
}
