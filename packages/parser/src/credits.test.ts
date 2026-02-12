import { describe, it, expect } from "vitest"
import { extractCredits, splitNames } from "./credits.js"

describe("splitNames", () => {
  it("splits comma-separated names", () => {
    expect(splitNames("John Smith, Jane Doe")).toEqual(["John Smith", "Jane Doe"])
  })

  it("splits names with 'and'", () => {
    expect(splitNames("John Smith and Jane Doe")).toEqual(["John Smith", "Jane Doe"])
  })

  it("splits names with 'og' (Norwegian)", () => {
    expect(splitNames("John Smith og Jane Doe")).toEqual(["John Smith", "Jane Doe"])
  })

  it("splits names with commas and 'and'", () => {
    expect(splitNames("Alice, Bob and Charlie")).toEqual(["Alice", "Bob", "Charlie"])
  })

  it("handles single name", () => {
    expect(splitNames("John Smith")).toEqual(["John Smith"])
  })

  it("fixes OCR artifact: 'andjerry' → 'and jerry'", () => {
    expect(splitNames("Mike StollerandJerry Leiber")).toEqual(["Mike Stoller", "Jerry Leiber"])
  })

  it("fixes OCR artifact with 'og'", () => {
    expect(splitNames("PerogJens")).toEqual(["Per", "Jens"])
  })

  it("trims whitespace", () => {
    expect(splitNames("  John , Jane  ")).toEqual(["John", "Jane"])
  })

  it("handles empty string", () => {
    expect(splitNames("")).toEqual([])
  })
})

describe("extractCredits", () => {
  it("extracts arranger from 'arr.' format", () => {
    const { credits } = extractCredits(["arr. Jerry Nowak"])
    expect(credits.arrangers).toEqual(["Jerry Nowak"])
  })

  it("extracts arranger from 'arr:' format", () => {
    const { credits } = extractCredits(["arr: John Smith"])
    expect(credits.arrangers).toEqual(["John Smith"])
  })

  it("extracts arranger from 'Arranged by' format", () => {
    const { credits } = extractCredits(["Arranged by John Smith"])
    expect(credits.arrangers).toEqual(["John Smith"])
  })

  it("extracts arranger from 'arrangert av' (Norwegian)", () => {
    const { credits } = extractCredits(["arrangert av Per Hansen"])
    expect(credits.arrangers).toEqual(["Per Hansen"])
  })

  it("extracts composers from 'music by'", () => {
    const { credits } = extractCredits(["music by John Lennon"])
    expect(credits.composers).toEqual(["John Lennon"])
  })

  it("extracts lyricists from 'words by'", () => {
    const { credits } = extractCredits(["words by Paul McCartney"])
    expect(credits.lyricists).toEqual(["Paul McCartney"])
  })

  it("extracts both composers and lyricists from 'words and music by'", () => {
    const { credits } = extractCredits(["words and music by Lennon and McCartney"])
    expect(credits.composers).toEqual(["Lennon", "McCartney"])
    expect(credits.lyricists).toEqual(["Lennon", "McCartney"])
  })

  it("extracts both from 'tekst og musikk av' (Norwegian)", () => {
    const { credits } = extractCredits(["tekst og musikk av Per og Jens"])
    expect(credits.composers).toEqual(["Per", "Jens"])
    expect(credits.lyricists).toEqual(["Per", "Jens"])
  })

  it("extracts recording artists from 'as recorded by'", () => {
    const { credits } = extractCredits(["as recorded by The Beatles"])
    expect(credits.recordingArtists).toEqual(["The Beatles"])
  })

  it("extracts recording artists from 'performed by'", () => {
    const { credits } = extractCredits(["performed by Miles Davis"])
    expect(credits.recordingArtists).toEqual(["Miles Davis"])
  })

  it("extracts Norwegian recording artists from 'innspilt av'", () => {
    const { credits } = extractCredits(["innspilt av a-ha"])
    expect(credits.recordingArtists).toEqual(["a-ha"])
  })

  it("splits multiple names in credit lines", () => {
    const { credits } = extractCredits(["music by Cynthia Weil, Mike Stoller and Jerry Leiber"])
    expect(credits.composers).toEqual(["Cynthia Weil", "Mike Stoller", "Jerry Leiber"])
  })

  it("tracks matched line indices", () => {
    const { matchedIndices } = extractCredits(["ON BROADWAY", "arr. Nowak", "Trumpet 1"])
    expect(matchedIndices.has(1)).toBe(true)
    expect(matchedIndices.has(0)).toBe(false)
    expect(matchedIndices.has(2)).toBe(false)
  })

  it("does not match 'Sparrow:' as arranger (word boundary)", () => {
    const { credits } = extractCredits(["Sparrow: A Symphony"])
    expect(credits.arrangers).toEqual([])
  })

  it("extracts multiple credit types from multiple lines", () => {
    const { credits } = extractCredits([
      "words and music by Lennon and McCartney",
      "arr. George Martin",
      "as recorded by The Beatles",
    ])
    expect(credits.composers).toEqual(["Lennon", "McCartney"])
    expect(credits.lyricists).toEqual(["Lennon", "McCartney"])
    expect(credits.arrangers).toEqual(["George Martin"])
    expect(credits.recordingArtists).toEqual(["The Beatles"])
  })

  it("returns empty credits for unrelated lines", () => {
    const { credits } = extractCredits(["ON BROADWAY", "Trumpet 1"])
    expect(credits.composers).toEqual([])
    expect(credits.lyricists).toEqual([])
    expect(credits.arrangers).toEqual([])
    expect(credits.recordingArtists).toEqual([])
  })
})
