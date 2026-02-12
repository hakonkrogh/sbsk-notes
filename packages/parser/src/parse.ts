import type { ParseResult, ConfidenceDetail } from "./types.js"
import { extractCredits } from "./credits.js"
import { matchInstruments } from "./instruments.js"

const COPYRIGHT_PATTERN = /^\(c\)|^©|^copyright\b/i
const TEMPO_PATTERN = /^[\u2669\u266A\u266B\u266C]|^tempo|^bpm\s*[=:]/i

export interface PageFiling {
  title: string
  arranger: string
  instrument: string
  part: number
}

export function parse(raw: string): ParseResult {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  // Phase 1: Credits
  const { credits, matchedIndices: creditIndices } = extractCredits(lines)

  // Phase 2: Instruments (scan lines not matched by credits)
  const remainingForInstruments = lines.map((line, i) =>
    creditIndices.has(i) ? "" : line
  )
  const { entries: instruments, matchedIndices: instrumentIndices } = matchInstruments(remainingForInstruments)

  // Phase 3: Title — first remaining line that's >1 char and not copyright/tempo
  const usedIndices = new Set([...creditIndices, ...instrumentIndices])
  let title = ""
  for (let i = 0; i < lines.length; i++) {
    if (usedIndices.has(i)) continue
    const line = lines[i]
    if (line.length <= 1) continue
    if (COPYRIGHT_PATTERN.test(line)) continue
    if (TEMPO_PATTERN.test(line)) continue
    title = line
    break
  }

  // Phase 4: Confidence
  const titleScore = title ? 1 : 0
  const creditsScore =
    credits.composers.length > 0 ||
    credits.lyricists.length > 0 ||
    credits.arrangers.length > 0 ||
    credits.recordingArtists.length > 0
      ? 1
      : 0
  const instrumentsScore = instruments.length > 0 ? 1 : 0
  const overall = (titleScore + creditsScore + instrumentsScore) / 3

  const confidence: ConfidenceDetail = {
    overall,
    title: titleScore,
    credits: creditsScore,
    instruments: instrumentsScore,
  }

  return {
    title,
    credits,
    instruments,
    confidence,
    raw,
  }
}

export function toPageFiling(result: ParseResult, instrumentIndex = 0): PageFiling {
  const arranger = result.credits.arrangers[0] ?? ""
  const entry = result.instruments[instrumentIndex]
  return {
    title: result.title,
    arranger,
    instrument: entry?.name ?? "",
    part: entry?.part ?? 1,
  }
}
