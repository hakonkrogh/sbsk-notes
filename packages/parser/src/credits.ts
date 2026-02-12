import type { Credits } from "./types.js"

type CreditRole = keyof Credits

interface CreditPattern {
  role: CreditRole
  /** Additional role to populate (e.g. "words and music" → composers + lyricists) */
  alsoRole?: CreditRole
  pattern: RegExp
}

const CREDIT_PATTERNS: CreditPattern[] = [
  // "words and music by" / "tekst og musikk av" → both composers and lyricists
  { role: "composers", alsoRole: "lyricists", pattern: /\bwords\s+and\s+music\s+by\s+(.+)/i },
  { role: "composers", alsoRole: "lyricists", pattern: /\btekst\s+og\s+musikk\s+av\s+(.+)/i },

  // Music / composers
  { role: "composers", pattern: /\bmusic\s+by\s+(.+)/i },
  { role: "composers", pattern: /\bmusikk\s+av\s+(.+)/i },

  // Lyrics / lyricists
  { role: "lyricists", pattern: /\bwords\s+by\s+(.+)/i },
  { role: "lyricists", pattern: /\blyrics\s+by\s+(.+)/i },
  { role: "lyricists", pattern: /\btekst\s+av\s+(.+)/i },

  // Arrangers — check "arranged by" before short "arr." to avoid partial matches
  { role: "arrangers", pattern: /\barranged\s+by\s+(.+)/i },
  { role: "arrangers", pattern: /\barrangert\s+av\s+(.+)/i },
  { role: "arrangers", pattern: /\barr[.:]\s*(.+)/i },

  // Recording artists
  { role: "recordingArtists", pattern: /\bas\s+recorded\s+by\s+(.+)/i },
  { role: "recordingArtists", pattern: /\brecorded\s+by\s+(.+)/i },
  { role: "recordingArtists", pattern: /\bperformed\s+by\s+(.+)/i },
  { role: "recordingArtists", pattern: /\binnspilt\s+av\s+(.+)/i },
]

/**
 * Fix OCR artifacts like "andjerry" → "and jerry" (lowercase followed by uppercase
 * without space, likely a missing space before "and"/"og").
 */
function fixOcrArtifacts(text: string): string {
  // Insert space when lowercase letter is directly followed by "and" or "og" + uppercase
  return text
    .replace(/([a-z])(and)([A-Z])/g, "$1 $2 $3")
    .replace(/([a-z])(og)([A-Z])/g, "$1 $2 $3")
}

/**
 * Split a name list on commas and "and"/"og" conjunctions.
 * E.g. "John Smith, Jane Doe and Bob" → ["John Smith", "Jane Doe", "Bob"]
 */
export function splitNames(raw: string): string[] {
  const fixed = fixOcrArtifacts(raw)
  return fixed
    .split(/,|\band\b|\bog\b/i)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function extractCredits(lines: string[]): { credits: Credits; matchedIndices: Set<number> } {
  const credits: Credits = {
    composers: [],
    lyricists: [],
    arrangers: [],
    recordingArtists: [],
  }
  const matchedIndices = new Set<number>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const { role, alsoRole, pattern } of CREDIT_PATTERNS) {
      const m = line.match(pattern)
      if (!m) continue

      const names = splitNames(m[1])
      credits[role].push(...names)
      if (alsoRole) {
        credits[alsoRole].push(...names)
      }
      matchedIndices.add(i)
      break // first pattern match wins for this line
    }
  }

  return { credits, matchedIndices }
}
