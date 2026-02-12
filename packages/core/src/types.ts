export interface SongMetadata {
  title: string
  arranger: string
}

export interface PageFiling {
  title: string
  arranger: string
  instrument: string
  part: number
}

export interface LibraryEntry {
  song: SongMetadata
  instrument: string
  part: number
  filePath: string
}
