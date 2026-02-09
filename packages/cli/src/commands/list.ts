import { listLibrary, search } from "@sbsk-notes/core"
import type { SearchOptions } from "@sbsk-notes/core"

export async function listCommand(
  libraryDir: string,
  options: SearchOptions
): Promise<void> {
  const entries = await listLibrary(libraryDir)

  if (entries.length === 0) {
    console.log("Library is empty.")
    return
  }

  const filtered = search(entries, options)

  if (filtered.length === 0) {
    console.log("No matching entries found.")
    return
  }

  const grouped = new Map<string, typeof filtered>()
  for (const entry of filtered) {
    const key = `${entry.song.title} (arr. ${entry.song.arranger || "unknown"})`
    const list = grouped.get(key) ?? []
    list.push(entry)
    grouped.set(key, list)
  }

  for (const [songKey, parts] of grouped) {
    console.log(songKey)
    for (const part of parts.sort((a, b) => a.instrument.localeCompare(b.instrument))) {
      console.log(`  ${part.instrument} - part ${part.part}`)
    }
    console.log()
  }

  console.log(`${filtered.length} file(s) in library.`)
}
