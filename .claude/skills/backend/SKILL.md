---
name: backend
description: Core, parser, and CLI package patterns for the sbsk-notes monorepo
---

# Backend Conventions

Read `.claude/skills/common/SKILL.md` first — it covers shared TypeScript and code style.

## Package separation

- `@sbsk-notes/core` — business logic (OCR, file organization, library search). No CLI or UI concerns.
- `@sbsk-notes/parser` — pure text parsing (OCR output → structured data). No I/O, no side effects.
- `@sbsk-notes/cli` — thin CLI wrapper. Delegates to core/parser, no business logic here.

## Parser patterns

- Phased extraction pipeline: credits → instruments → title (each phase excludes lines matched by prior phases)
- Confidence scoring: 0–1 scale, computed as fraction of fields successfully extracted
- Graceful fallback: empty strings for missing title/arranger, empty arrays for missing instruments/credits
- Pure functions — no I/O, no side effects, deterministic output from input
- Types in dedicated `types.ts`, exported via barrel `index.ts`

## Core patterns

- `async/await` for all I/O (filesystem reads, OCR calls, PDF splitting)
- Filesystem-as-database: library directory scanned at runtime (no separate DB for CLI workflow)
- Deterministic file naming: same metadata → same output path (enables overwrite-on-rescan)
- Slugification: lowercase, replace non-alphanumeric with `-`, trim leading/trailing hyphens

```ts
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}
```

- Library path format: `<song-slug>--arr-<arranger-slug>/<instrument-slug>-<part>.<ext>`
- If no arranger, folder is just `<song-slug>`

## CLI patterns

- `citty` for command routing, `consola` for logging, `@clack/prompts` for interactive UX
- CLI delegates to core/parser — no business logic in command handlers
- Imports from `@sbsk-notes/core` and `@sbsk-notes/parser` (workspace packages)

## Supported file types

- Images: PNG, JPG, JPEG, TIFF, TIF, BMP, WebP
- Documents: PDF (split into per-page PNGs before OCR)

## Package config

- Strict `exports` field in `package.json` with `import` and `types` entries:

```json
"exports": {
  ".": {
    "import": "./dist/index.js",
    "types": "./dist/index.d.ts"
  }
}
```

## Build

- `tsc` per package, output to `dist/` from `src/`
- `npx tsx <file>` for dev execution (no build step needed)
- `pnpm -r build` to compile all packages
