import { execFile } from "node:child_process"
import { promisify } from "node:util"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

const execFileAsync = promisify(execFile)

export async function splitPdf(
  pdfPath: string,
  outDir?: string
): Promise<string[]> {
  const stem = path.parse(pdfPath).name
  const dir = outDir ?? (await fs.mkdtemp(path.join(os.tmpdir(), "sbsk-pdf-")))

  const outputPrefix = path.join(dir, stem)

  await execFileAsync("pdftoppm", ["-png", pdfPath, outputPrefix])

  const allFiles = await fs.readdir(dir)
  const pngs = allFiles
    .filter((f) => f.startsWith(stem) && f.endsWith(".png"))
    .sort()
    .map((f) => path.join(dir, f))

  return pngs
}
