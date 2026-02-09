# sbsk-notes

Read `docs/use-cases.md` before making changes — it describes what we're building and why.

## Project structure

pnpm monorepo with two packages:

- `packages/core` — all business logic (OCR, file organization, library search). No CLI or UI concerns.
- `packages/cli` — thin CLI wrapper that delegates to core.

## Conventions

- TypeScript strict mode, never use `any`
- ESM throughout (`"type": "module"`, `.js` extensions in imports)
- `data/inbox/` is where scanned images go, `data/library/` is the organized output
- Library naming: `<song>--arr-<arranger>/<instrument>-<part>.png`
- New client code (web, API, etc.) should import from `@sbsk-notes/core`, not duplicate logic

## Dev

- `npx tsx packages/cli/src/index.ts <command>` to run during dev
- `pnpm -r build` to compile all packages
