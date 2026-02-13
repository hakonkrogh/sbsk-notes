---
name: common
description: Shared TypeScript and code style conventions for the sbsk-notes monorepo
---

# Common Conventions

## TypeScript strict patterns

- Never use `any` — use `unknown` + narrowing instead
- Prefer discriminated unions over type assertions
- Use `satisfies` over `as` when validating object shapes
- Prefer narrowing (`instanceof`, `in`, truthiness checks) over casting
- Use `interface` for object shapes, `type` for unions and computed types

## ESM

- `.js` extensions in all relative imports (TypeScript resolves `.ts` → `.js`)
- `"type": "module"` in every package.json
- Barrel `index.ts` re-exports for each package's public API

## Naming

- camelCase for functions and variables
- PascalCase for types, interfaces, and React components
- kebab-case for filenames (e.g., `page-filing.ts`, `queue-table.tsx`)

## Immutability

- `const` over `let`, never `var`
- Spread / `map` / `filter` over mutation
- No reassignment — compute values upfront or use ternaries

## Exports

- Named exports preferred (no default exports except Next.js pages/layouts)
- Barrel `index.ts` at package root re-exports public API

## Error handling

- Graceful fallbacks: empty arrays `[]`, empty strings `""`, sensible defaults
- `try/catch` around external I/O (filesystem, network, OCR)
- `err instanceof Error ? err.message : "Unknown error"` pattern for catch blocks
- No custom error classes

## Testing

- vitest for all packages
- Colocated test files: `foo.test.ts` next to `foo.ts`
- `describe` blocks for grouping, descriptive `it` names in plain English
- Import from relative `.js` paths in tests (same ESM rules)

## Tooling

- ast-grep for code search and structural matching
- pnpm monorepo: `pnpm -r build` to build all, `pnpm -r test` to test all
- `npx tsx <file>` for running TypeScript directly during dev
