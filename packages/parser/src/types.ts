export interface InstrumentEntry {
  name: string
  part: number
  raw: string
}

export interface Credits {
  composers: string[]
  lyricists: string[]
  arrangers: string[]
  recordingArtists: string[]
}

export interface ConfidenceDetail {
  overall: number
  title: number
  credits: number
  instruments: number
}

export interface ParseResult {
  title: string
  credits: Credits
  instruments: InstrumentEntry[]
  confidence: ConfidenceDetail
  raw: string
}
