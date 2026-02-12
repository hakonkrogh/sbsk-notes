import { describe, it, expect } from "vitest"
import path from "node:path"
import { splitPdf } from "../pdf/index.js"
import { scan } from "./index.js"

const EXAMPLES_DIR = path.resolve(import.meta.dirname, "../../../../examples")

describe("paddle ocr", () => {
  it("extracts raw text from single-page sheet music pdf", async () => {
    const pdfPath = path.join(EXAMPLES_DIR, "single-page.pdf")
    const [pngPath] = await splitPdf(pdfPath)

    const raw = await scan(pngPath)

    expect(raw.toLowerCase()).toContain("on broadway")
    expect(raw.toLowerCase()).toContain("jerry nowak")
    expect(raw.toLowerCase()).toContain("cynthia weil, mike stoller")
  }, 120_000)
})
