import type { InstrumentEntry } from "./types.js"

interface InstrumentDef {
  canonical: string
  aliases: string[]
}

const INSTRUMENTS: InstrumentDef[] = [
  { canonical: "piccolo", aliases: ["piccolo", "picc."] },
  { canonical: "flute", aliases: ["flute", "fløyte", "fl."] },
  { canonical: "oboe", aliases: ["oboe", "obo"] },
  { canonical: "bassoon", aliases: ["bassoon", "fagott", "bsn."] },
  { canonical: "clarinet", aliases: ["clarinet", "klarinett", "cl."] },
  { canonical: "bass clarinet", aliases: ["bass clarinet", "bassklarinett", "b. cl.", "bcl."] },
  { canonical: "alto sax", aliases: ["alto sax", "alto saxophone", "altsaksofon", "a. sax"] },
  { canonical: "tenor sax", aliases: ["tenor sax", "tenor saxophone", "tenorsaksofon", "t. sax"] },
  { canonical: "baritone sax", aliases: ["baritone sax", "baritone saxophone", "barytonsaksofon", "bari sax", "b. sax"] },
  { canonical: "trumpet", aliases: ["trumpet", "trompet", "tpt."] },
  { canonical: "horn", aliases: ["french horn", "f horn", "horn", "valthorn"] },
  { canonical: "trombone", aliases: ["trombone", "tbn."] },
  { canonical: "baritone", aliases: ["baritone t.c.", "baritone b.c.", "baritone", "baryton"] },
  { canonical: "euphonium", aliases: ["euphonium", "eufonium"] },
  { canonical: "tuba", aliases: ["tuba"] },
  { canonical: "sousaphone", aliases: ["sousaphone", "sousafon"] },
  { canonical: "snare drum", aliases: ["snare drum", "skarptromme", "snare"] },
  { canonical: "bass drum", aliases: ["bass drum", "stortromme"] },
  { canonical: "cymbals", aliases: ["cymbals", "cymbal", "bekken"] },
  { canonical: "bells", aliases: ["bells", "glockenspiel", "klokkespill"] },
  { canonical: "percussion", aliases: ["percussion", "perkusjon", "slagverk", "perc."] },
  { canonical: "xylophone", aliases: ["xylophone", "xylofon"] },
  { canonical: "timpani", aliases: ["timpani", "pauker"] },
  { canonical: "saxophone", aliases: ["saxophone", "saksofon", "sax"] },
]

// Sort aliases longest-first within each instrument for greedy matching
const SORTED_INSTRUMENTS: InstrumentDef[] = INSTRUMENTS.map((def) => ({
  ...def,
  aliases: [...def.aliases].sort((a, b) => b.length - a.length),
}))

// Build a flat list of all aliases sorted longest-first for matching priority
const ALL_ALIASES: { canonical: string; alias: string }[] = SORTED_INSTRUMENTS
  .flatMap((def) => def.aliases.map((alias) => ({ canonical: def.canonical, alias })))
  .sort((a, b) => b.alias.length - a.alias.length)

const PART_NUM_PATTERN = /\d+/g
const OPT_PATTERN = /\(opt\.?\)/gi

function expandParts(raw: string, canonical: string, alias: string): InstrumentEntry[] {
  // Get the text after the instrument alias
  const lower = raw.toLowerCase()
  const idx = lower.indexOf(alias.toLowerCase())
  const after = idx >= 0 ? raw.slice(idx + alias.length) : ""
  const cleaned = after.replace(OPT_PATTERN, "").trim()

  // Extract all part numbers from the remaining text, e.g. "1, 2" → [1, 2]
  const nums = [...cleaned.matchAll(PART_NUM_PATTERN)].map((m) => parseInt(m[0], 10))

  if (nums.length === 0) {
    return [{ name: canonical, part: 1, raw }]
  }

  return nums.map((n) => ({ name: canonical, part: n, raw }))
}

export function matchInstruments(lines: string[]): { entries: InstrumentEntry[]; matchedIndices: Set<number> } {
  const entries: InstrumentEntry[] = []
  const matchedIndices = new Set<number>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lower = line.toLowerCase()

    for (const { canonical, alias } of ALL_ALIASES) {
      const aliasLower = alias.toLowerCase()
      const pos = lower.indexOf(aliasLower)
      if (pos === -1) continue

      // Ensure word boundary: char before must not be a letter
      if (pos > 0 && /[a-z]/i.test(lower[pos - 1])) continue

      const expanded = expandParts(line, canonical, alias)
      entries.push(...expanded)
      matchedIndices.add(i)
      break // first match wins for this line
    }
  }

  return { entries, matchedIndices }
}
