import { describe, it, expect } from "vitest"
import { parse, toPageFiling } from "./parse.js"

describe("parse", () => {
  describe("happy path", () => {
    it("extracts all fields from typical layout", () => {
      const raw = `
        ON BROADWAY
        arr. Jerry Nowak
        Trumpet 2
      `
      const result = parse(raw)
      expect(result.title).toBe("ON BROADWAY")
      expect(result.credits.arrangers).toEqual(["Jerry Nowak"])
      expect(result.instruments).toEqual([{ name: "trumpet", part: 2, raw: "Trumpet 2" }])
      expect(result.confidence.overall).toBe(1)
    })

    it("extracts rich metadata with composers and recording artists", () => {
      const raw = `
        ON BROADWAY
        words and music by Cynthia Weil, Mike Stoller and Jerry Leiber
        arr. Jerry Nowak
        as recorded by The Drifters
        Trumpet 2
      `
      const result = parse(raw)
      expect(result.title).toBe("ON BROADWAY")
      expect(result.credits.composers).toEqual(["Cynthia Weil", "Mike Stoller", "Jerry Leiber"])
      expect(result.credits.lyricists).toEqual(["Cynthia Weil", "Mike Stoller", "Jerry Leiber"])
      expect(result.credits.arrangers).toEqual(["Jerry Nowak"])
      expect(result.credits.recordingArtists).toEqual(["The Drifters"])
      expect(result.instruments[0]).toEqual({ name: "trumpet", part: 2, raw: "Trumpet 2" })
    })
  })

  describe("arranger formats", () => {
    it("matches arr. format", () => {
      const result = parse("Title\narr. John Smith\nTrumpet 1")
      expect(result.credits.arrangers).toEqual(["John Smith"])
    })

    it("matches arr: format", () => {
      const result = parse("Title\narr: John Smith\nTrumpet 1")
      expect(result.credits.arrangers).toEqual(["John Smith"])
    })

    it("matches Arranged by format", () => {
      const result = parse("Title\nArranged by John Smith\nTrumpet 1")
      expect(result.credits.arrangers).toEqual(["John Smith"])
    })

    it("matches arranged by (lowercase)", () => {
      const result = parse("Title\narranged by Jane Doe\nFlute 1")
      expect(result.credits.arrangers).toEqual(["Jane Doe"])
    })

    it("matches arrangert av (Norwegian)", () => {
      const result = parse("Title\narrangert av Per Hansen\nTrompet 1")
      expect(result.credits.arrangers).toEqual(["Per Hansen"])
    })
  })

  describe("missing fields", () => {
    it("handles missing arranger", () => {
      const result = parse("ON BROADWAY\nTrumpet 1")
      expect(result.title).toBe("ON BROADWAY")
      expect(result.credits.arrangers).toEqual([])
      expect(result.instruments.length).toBe(1)
      expect(result.confidence.overall).toBeCloseTo(2 / 3)
    })

    it("handles missing instrument", () => {
      const result = parse("ON BROADWAY\narr. Jerry Nowak")
      expect(result.title).toBe("ON BROADWAY")
      expect(result.credits.arrangers).toEqual(["Jerry Nowak"])
      expect(result.instruments).toEqual([])
      expect(result.confidence.overall).toBeCloseTo(2 / 3)
    })

    it("handles missing title (all lines are short or matched)", () => {
      const result = parse("x\narr. Jerry Nowak\nTrumpet 1")
      expect(result.title).toBe("")
      expect(result.confidence.overall).toBeCloseTo(2 / 3)
    })
  })

  describe("instrument extraction", () => {
    it("extracts multi-word instrument with part", () => {
      const result = parse("Title\narr. Someone\nAlto Sax 2")
      expect(result.instruments[0]).toEqual({ name: "alto sax", part: 2, raw: "Alto Sax 2" })
    })

    it("extracts Bass Drum", () => {
      const result = parse("Title\narr. Someone\nBass Drum")
      expect(result.instruments[0].name).toBe("bass drum")
    })

    it("extracts instrument from embedded text", () => {
      const result = parse("Title\narr. Someone\nPlay the trumpet here")
      expect(result.instruments[0].name).toBe("trumpet")
      expect(result.instruments[0].part).toBe(1)
    })

    it("extracts part number from embedded instrument", () => {
      const result = parse("Title\narr. Someone\nPlay trumpet 2 here")
      expect(result.instruments[0].name).toBe("trumpet")
      expect(result.instruments[0].part).toBe(2)
    })

    it("expands multi-part instruments", () => {
      const result = parse("Title\narr. Someone\nTrombone 1, 2")
      expect(result.instruments).toEqual([
        { name: "trombone", part: 1, raw: "Trombone 1, 2" },
        { name: "trombone", part: 2, raw: "Trombone 1, 2" },
      ])
    })
  })

  describe("confidence scores", () => {
    it("returns 1.0 when all fields present", () => {
      const result = parse("Title\narr. Someone\nTrumpet 1")
      expect(result.confidence.overall).toBe(1)
      expect(result.confidence.title).toBe(1)
      expect(result.confidence.credits).toBe(1)
      expect(result.confidence.instruments).toBe(1)
    })

    it("returns 2/3 when one field missing", () => {
      const result = parse("Title\nTrumpet 1")
      expect(result.confidence.overall).toBeCloseTo(2 / 3)
    })

    it("returns 1/3 when two fields missing", () => {
      const result = parse("Title Only")
      expect(result.confidence.overall).toBeCloseTo(1 / 3)
    })

    it("returns 0 when no fields extracted", () => {
      const result = parse("")
      expect(result.confidence.overall).toBe(0)
    })
  })

  describe("edge cases", () => {
    it("handles empty string", () => {
      const result = parse("")
      expect(result.title).toBe("")
      expect(result.credits.arrangers).toEqual([])
      expect(result.instruments).toEqual([])
      expect(result.confidence.overall).toBe(0)
    })

    it("handles whitespace-only input", () => {
      const result = parse("   \n  \n   ")
      expect(result.confidence.overall).toBe(0)
    })

    it("handles single line", () => {
      const result = parse("ON BROADWAY")
      expect(result.title).toBe("ON BROADWAY")
      expect(result.confidence.overall).toBeCloseTo(1 / 3)
    })

    it("skips single-character lines for title", () => {
      const result = parse("x\nReal Title")
      expect(result.title).toBe("Real Title")
    })

    it("preserves raw text in result", () => {
      const raw = "ON BROADWAY\narr. Nowak"
      const result = parse(raw)
      expect(result.raw).toBe(raw)
    })
  })

  describe("regression: fixed bugs", () => {
    it("does not match Copyright as instrument", () => {
      const result = parse("ON BROADWAY\narr. Nowak\nCopyright 2024")
      expect(result.instruments).toEqual([])
      expect(result.title).toBe("ON BROADWAY")
    })

    it("skips copyright line for title", () => {
      const result = parse("(c) 2024 Hal Leonard\nON BROADWAY\narr. Nowak\nTrumpet 1")
      expect(result.title).toBe("ON BROADWAY")
    })

    it("skips © copyright line for title", () => {
      const result = parse("© 2024 Publisher\nSong Title")
      expect(result.title).toBe("Song Title")
    })

    it("does not match Sparrow: as arranger", () => {
      const result = parse("Sparrow: A Symphony\narr. Real Arranger\nFlute 1")
      expect(result.title).toBe("Sparrow: A Symphony")
      expect(result.credits.arrangers).toEqual(["Real Arranger"])
    })

    it("extracts part number from embedded instrument", () => {
      const result = parse("Title\narr. Someone\nPlay Trumpet 2")
      expect(result.instruments[0].name).toBe("trumpet")
      expect(result.instruments[0].part).toBe(2)
    })
  })

  describe("Norwegian content", () => {
    it("parses Norwegian credits and instrument", () => {
      const raw = `
        Ja, vi elsker
        tekst og musikk av Bjørnstjerne Bjørnson
        arrangert av Per Hansen
        Trompet 1
      `
      const result = parse(raw)
      expect(result.title).toBe("Ja, vi elsker")
      expect(result.credits.composers).toEqual(["Bjørnstjerne Bjørnson"])
      expect(result.credits.lyricists).toEqual(["Bjørnstjerne Bjørnson"])
      expect(result.credits.arrangers).toEqual(["Per Hansen"])
      expect(result.instruments[0].name).toBe("trumpet")
    })
  })
})

describe("toPageFiling", () => {
  it("converts ParseResult to PageFiling", () => {
    const result = parse("ON BROADWAY\narr. Jerry Nowak\nTrumpet 2")
    const filing = toPageFiling(result)
    expect(filing).toEqual({
      title: "ON BROADWAY",
      arranger: "Jerry Nowak",
      instrument: "trumpet",
      part: 2,
    })
  })

  it("uses first instrument by default", () => {
    const result = parse("Title\narr. Someone\nTrombone 1, 2")
    const filing = toPageFiling(result)
    expect(filing.instrument).toBe("trombone")
    expect(filing.part).toBe(1)
  })

  it("selects instrument by index", () => {
    const result = parse("Title\narr. Someone\nTrombone 1, 2")
    const filing = toPageFiling(result, 1)
    expect(filing.instrument).toBe("trombone")
    expect(filing.part).toBe(2)
  })

  it("defaults to empty when no instruments found", () => {
    const result = parse("Title\narr. Someone")
    const filing = toPageFiling(result)
    expect(filing.instrument).toBe("")
    expect(filing.part).toBe(1)
  })

  it("defaults to empty arranger when none found", () => {
    const result = parse("Title\nTrumpet 1")
    const filing = toPageFiling(result)
    expect(filing.arranger).toBe("")
  })
})
