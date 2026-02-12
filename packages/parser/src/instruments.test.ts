import { describe, it, expect } from "vitest"
import { matchInstruments } from "./instruments.js"

describe("matchInstruments", () => {
  it("matches a simple instrument with part number", () => {
    const { entries } = matchInstruments(["Trumpet 2"])
    expect(entries).toEqual([{ name: "trumpet", part: 2, raw: "Trumpet 2" }])
  })

  it("matches multi-word instrument", () => {
    const { entries } = matchInstruments(["Alto Sax 1"])
    expect(entries).toEqual([{ name: "alto sax", part: 1, raw: "Alto Sax 1" }])
  })

  it("matches instrument without part number (defaults to 1)", () => {
    const { entries } = matchInstruments(["Flute"])
    expect(entries).toEqual([{ name: "flute", part: 1, raw: "Flute" }])
  })

  it("expands 'Trombone 1, 2' into two entries", () => {
    const { entries } = matchInstruments(["Trombone 1, 2"])
    expect(entries).toEqual([
      { name: "trombone", part: 1, raw: "Trombone 1, 2" },
      { name: "trombone", part: 2, raw: "Trombone 1, 2" },
    ])
  })

  it("strips (opt.) from instrument lines", () => {
    const { entries } = matchInstruments(["Bells (opt.)"])
    expect(entries).toEqual([{ name: "bells", part: 1, raw: "Bells (opt.)" }])
  })

  it("matches Norwegian instrument names", () => {
    const { entries } = matchInstruments(["Trompet 1"])
    expect(entries).toEqual([{ name: "trumpet", part: 1, raw: "Trompet 1" }])
  })

  it("matches abbreviated instrument names", () => {
    const { entries } = matchInstruments(["Tpt. 3"])
    expect(entries).toEqual([{ name: "trumpet", part: 3, raw: "Tpt. 3" }])
  })

  it("prefers longer alias match (french horn over horn)", () => {
    const { entries } = matchInstruments(["French Horn 1"])
    expect(entries).toEqual([{ name: "horn", part: 1, raw: "French Horn 1" }])
  })

  it("matches horn when not prefixed by french", () => {
    const { entries } = matchInstruments(["Horn 2"])
    expect(entries).toEqual([{ name: "horn", part: 2, raw: "Horn 2" }])
  })

  it("matches bass drum (does not collide with bass clarinet)", () => {
    const { entries } = matchInstruments(["Bass Drum"])
    expect(entries).toEqual([{ name: "bass drum", part: 1, raw: "Bass Drum" }])
  })

  it("returns matchedIndices for matched lines", () => {
    const { entries, matchedIndices } = matchInstruments(["Title Line", "Trumpet 1", "Other text"])
    expect(entries.length).toBe(1)
    expect(matchedIndices.has(1)).toBe(true)
    expect(matchedIndices.has(0)).toBe(false)
  })

  it("skips empty lines", () => {
    const { entries } = matchInstruments(["", "Clarinet 1", ""])
    expect(entries).toEqual([{ name: "clarinet", part: 1, raw: "Clarinet 1" }])
  })

  it("does not match instrument substring in unrelated words", () => {
    const { entries } = matchInstruments(["Copyright 2024"])
    expect(entries).toEqual([])
  })

  it("matches percussion with Norwegian alias slagverk", () => {
    const { entries } = matchInstruments(["Slagverk"])
    expect(entries).toEqual([{ name: "percussion", part: 1, raw: "Slagverk" }])
  })

  it("matches baritone t.c.", () => {
    const { entries } = matchInstruments(["Baritone T.C. 1"])
    expect(entries).toEqual([{ name: "baritone", part: 1, raw: "Baritone T.C. 1" }])
  })
})
