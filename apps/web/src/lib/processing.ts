import type { ParseResult, Credits, InstrumentEntry, ConfidenceDetail } from "@sbsk-notes/parser"

const TITLES = [
  "Amazing Grace",
  "How Great Thou Art",
  "Be Thou My Vision",
  "It Is Well With My Soul",
  "Great Is Thy Faithfulness",
  "Holy Holy Holy",
  "Come Thou Fount",
  "Blessed Assurance",
]

const ARRANGERS = ["Lloyd Larson", "Mark Hayes", "Heather Sorenson", "Mary McDonald", "Joel Raney"]

const INSTRUMENTS = ["Flute", "Clarinet", "Trumpet", "Trombone", "Violin", "Cello", "Piano", "Oboe"]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomConfidence(): ConfidenceDetail {
  return {
    overall: 0.7 + Math.random() * 0.3,
    title: 0.8 + Math.random() * 0.2,
    credits: 0.6 + Math.random() * 0.4,
    instruments: 0.7 + Math.random() * 0.3,
  }
}

export function generateMockParseResult(): ParseResult {
  const title = pick(TITLES)
  const arranger = pick(ARRANGERS)
  const instrument = pick(INSTRUMENTS)
  const part = Math.ceil(Math.random() * 3)

  const credits: Credits = {
    composers: ["Traditional"],
    lyricists: [],
    arrangers: [arranger],
    recordingArtists: [],
  }

  const instruments: InstrumentEntry[] = [
    { name: instrument, part, raw: `${instrument} ${part}` },
  ]

  return {
    title,
    credits,
    instruments,
    confidence: randomConfidence(),
    raw: `Mock OCR text for ${title} - ${instrument} Part ${part}\nArranged by ${arranger}`,
  }
}

export async function mockProcess(): Promise<ParseResult> {
  const delay = 500 + Math.random() * 1500
  await new Promise((resolve) => setTimeout(resolve, delay))
  return generateMockParseResult()
}
