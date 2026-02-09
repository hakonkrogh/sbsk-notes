import { recognizeWithTesseract } from "./tesseract.js"
import type { OcrResult } from "../types.js"

function parseRawText(raw: string): Omit<OcrResult, "raw"> {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  let title = ""
  let arranger = ""
  let instrument = ""
  let part = 1

  for (const line of lines) {
    const arrangerMatch = line.match(/arr[.:]\s*(.+)/i)
    if (arrangerMatch) {
      arranger = arrangerMatch[1].trim()
      continue
    }

    const partMatch = line.match(/^([\w\s]+?)\s*(\d+)$/i)
    if (partMatch && !instrument) {
      instrument = partMatch[1].trim()
      part = parseInt(partMatch[2], 10)
      continue
    }

    if (!title && line.length > 1) {
      title = line
    }
  }

  if (!instrument) {
    for (const line of lines) {
      const known = [
        "flute", "clarinet", "trumpet", "trombone", "saxophone",
        "alto sax", "tenor sax", "baritone", "tuba", "snare",
        "bass drum", "cymbals", "bells", "percussion", "horn",
        "piccolo", "oboe", "bassoon", "euphonium", "sousaphone",
      ]
      const lower = line.toLowerCase()
      for (const inst of known) {
        if (lower.includes(inst)) {
          instrument = inst
          break
        }
      }
      if (instrument) break
    }
  }

  const confidence = [title, arranger, instrument].filter(Boolean).length / 3

  return {
    metadata: { title, arranger },
    instrument,
    part,
    confidence,
  }
}

export async function scan(imagePath: string): Promise<OcrResult> {
  const raw = await recognizeWithTesseract(imagePath)
  const parsed = parseRawText(raw)
  return { ...parsed, raw }
}
