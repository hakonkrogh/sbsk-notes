#!/usr/bin/env node

import path from "node:path"
import { fileURLToPath } from "node:url"
import { Command } from "commander"
import { scanCommand } from "./commands/scan.js"
import { organizeCommand } from "./commands/organize.js"
import { listCommand } from "./commands/list.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..", "..", "..")
const INBOX = path.join(ROOT, "data", "inbox")
const LIBRARY = path.join(ROOT, "data", "library")

const program = new Command()

program
  .name("sbsk")
  .description("Marching band sheet music digitization tool")
  .version("0.1.0")

program
  .command("scan")
  .description("Scan images in inbox and show OCR results")
  .option("--inbox <path>", "inbox directory", INBOX)
  .action(async (opts: { inbox: string }) => {
    await scanCommand(opts.inbox)
  })

program
  .command("organize")
  .description("Process inbox images and move to library")
  .option("--inbox <path>", "inbox directory", INBOX)
  .option("--library <path>", "library directory", LIBRARY)
  .action(async (opts: { inbox: string; library: string }) => {
    await organizeCommand(opts.inbox, opts.library)
  })

program
  .command("list")
  .description("Browse and search the library")
  .option("--library <path>", "library directory", LIBRARY)
  .option("-t, --title <title>", "filter by song title")
  .option("-i, --instrument <instrument>", "filter by instrument")
  .option("-a, --arranger <arranger>", "filter by arranger")
  .action(
    async (opts: {
      library: string
      title?: string
      instrument?: string
      arranger?: string
    }) => {
      await listCommand(opts.library, {
        title: opts.title,
        instrument: opts.instrument,
        arranger: opts.arranger,
      })
    }
  )

program.parse()
