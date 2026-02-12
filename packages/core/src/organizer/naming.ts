import type { PageFiling } from "../types.js"
import path from "node:path"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildTargetPath(
  libraryDir: string,
  filing: PageFiling,
  ext: string = ".png"
): string {
  const { title, arranger, instrument, part } = filing
  const songSlug = slugify(title)
  const arrangerSlug = slugify(arranger)
  const instrumentSlug = slugify(instrument)

  const folderName = arrangerSlug
    ? `${songSlug}--arr-${arrangerSlug}`
    : songSlug

  const fileName = `${instrumentSlug}-${part}${ext}`

  return path.join(libraryDir, folderName, fileName)
}
