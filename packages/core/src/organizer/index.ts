import fs from "node:fs/promises"
import path from "node:path"
import type { OcrResult } from "../types.js"
import { buildTargetPath } from "./naming.js"

export { buildTargetPath } from "./naming.js"

export interface OrganizeResult {
  sourcePath: string
  targetPath: string
}

export async function organize(
  sourcePath: string,
  libraryDir: string,
  ocrResult: OcrResult
): Promise<OrganizeResult> {
  const ext = path.extname(sourcePath) || ".png"
  const targetPath = buildTargetPath(libraryDir, ocrResult, ext)

  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.rename(sourcePath, targetPath)

  return { sourcePath, targetPath }
}
