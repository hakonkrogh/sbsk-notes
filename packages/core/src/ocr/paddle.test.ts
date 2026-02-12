import { describe, it, expect } from "vitest"
import path from "node:path"
import { splitPdf } from "../pdf/index.js"
import { scan } from "./index.js"

const EXAMPLES_DIR = path.resolve(import.meta.dirname, "../../../../examples")

describe("paddle ocr", () => {
  it("extracts metadata from single-page sheet music pdf", async () => {
    const pdfPath = path.join(EXAMPLES_DIR, "single-page.pdf")
    const [pngPath] = await splitPdf(pdfPath)

    const result = await scan(pngPath)

    expect(result.raw.toLowerCase()).toContain("on broadway")
    expect(result.raw.toLowerCase()).toContain("jerry nowak")
    expect(result.raw.toLowerCase()).toContain("cynthia weil, mike stoller and jerry leiber")
    expect(result.metadata.title).toBe("ON BROADWAY")
    expect(result.confidence).toBeGreaterThan(0)
  }, 120_000)
})
