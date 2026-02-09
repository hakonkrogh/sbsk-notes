import fs from "node:fs/promises"
import path from "node:path"
import type { LibraryEntry, SongMetadata } from "../types.js"

function parseFolderName(name: string): SongMetadata {
  const parts = name.split("--arr-")
  const title = (parts[0] ?? "").replace(/-/g, " ").trim()
  const arranger = (parts[1] ?? "").replace(/-/g, " ").trim()
  return { title, arranger }
}

function parseFileName(name: string): { instrument: string; part: number } {
  const stem = path.parse(name).name
  const match = stem.match(/^(.+)-(\d+)$/)
  if (match) {
    return {
      instrument: match[1].replace(/-/g, " "),
      part: parseInt(match[2], 10),
    }
  }
  return { instrument: stem.replace(/-/g, " "), part: 1 }
}

export async function listLibrary(libraryDir: string): Promise<LibraryEntry[]> {
  const entries: LibraryEntry[] = []

  let folders: string[]
  try {
    folders = await fs.readdir(libraryDir)
  } catch {
    return entries
  }

  for (const folder of folders) {
    const folderPath = path.join(libraryDir, folder)
    const stat = await fs.stat(folderPath)
    if (!stat.isDirectory()) continue

    const song = parseFolderName(folder)
    const files = await fs.readdir(folderPath)

    for (const file of files) {
      if (file.startsWith(".")) continue
      const { instrument, part } = parseFileName(file)
      entries.push({
        song,
        instrument,
        part,
        filePath: path.join(folderPath, file),
      })
    }
  }

  return entries
}

export interface SearchOptions {
  title?: string
  instrument?: string
  arranger?: string
}

export function search(
  entries: LibraryEntry[],
  options: SearchOptions
): LibraryEntry[] {
  return entries.filter((entry) => {
    if (options.title) {
      if (!entry.song.title.toLowerCase().includes(options.title.toLowerCase())) {
        return false
      }
    }
    if (options.instrument) {
      if (!entry.instrument.toLowerCase().includes(options.instrument.toLowerCase())) {
        return false
      }
    }
    if (options.arranger) {
      if (!entry.song.arranger.toLowerCase().includes(options.arranger.toLowerCase())) {
        return false
      }
    }
    return true
  })
}
