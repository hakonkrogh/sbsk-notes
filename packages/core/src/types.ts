export interface SongMetadata {
  title: string
  arranger: string
}

export interface OcrResult {
  metadata: SongMetadata
  instrument: string
  part: number
  confidence: number
  raw: string
}

export interface LibraryEntry {
  song: SongMetadata
  instrument: string
  part: number
  filePath: string
}

export interface ScanResult {
  sourcePath: string
  ocrResult: OcrResult
}
