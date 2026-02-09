export type {
  SongMetadata,
  OcrResult,
  LibraryEntry,
  ScanResult,
} from "./types.js"

export { scan } from "./ocr/index.js"

export { organize, buildTargetPath } from "./organizer/index.js"
export type { OrganizeResult } from "./organizer/index.js"

export { listLibrary, search } from "./library/index.js"
export type { SearchOptions } from "./library/index.js"
