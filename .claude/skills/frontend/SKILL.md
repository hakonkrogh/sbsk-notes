---
name: frontend
description: React, Radix UI Themes, and Next.js patterns for the apps/web package
---

# Frontend Conventions

Read `.claude/skills/common/SKILL.md` first — it covers shared TypeScript and code style.

## Next.js App Router

- Next.js 16 with App Router (`src/app/` directory)
- Server Components by default — only add `"use client"` for interactive features (state, effects, browser APIs, event handlers)
- Data fetching directly in Server Components using `db` queries (no API routes for reads)
- Data mutations via Server Actions (`"use server"`) in colocated `actions.ts` files
- `revalidatePath()` after mutations to refresh server-rendered data

## React 19

- Use latest React 19 patterns (use hook, server actions, etc.)
- `useCallback` for stable references passed to third-party components

## Radix UI Themes

All UI primitives come from `@radix-ui/themes`. Never import from `@radix-ui/react-*` primitives directly.

Common components: `Box`, `Flex`, `Text`, `Heading`, `Button`, `Badge`, `Table`, `Separator`, `Spinner`, `IconButton`

Layout and spacing via component props:
```tsx
<Flex direction="column" gap="4">
<Box py="2" px="3" mb="4">
<Text size="3" weight="medium">
```

Current theme configuration:
```tsx
<Theme accentColor="orange" grayColor="sand" radius="large" panelBackground="solid">
```

CSS variables for dynamic/conditional styles — always use `--accent-*` (not `--orange-*` or `--blue-*`) so colors follow the theme:
```tsx
style={{
  background: focused ? "var(--accent-a3)" : "transparent",
  borderRadius: "var(--radius-2)",
  border: "2px dashed var(--gray-a7)",
}}
```

Background layering: sidebar uses `var(--gray-3)`, main content uses `var(--gray-2)`. Table `variant="surface"` and Card components sit on this warm base as white panels.

Status colors follow the pattern:
```tsx
const STATUS_COLOR: Record<string, "orange" | "green" | "red"> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
}
<Badge color={STATUS_COLOR[status]} size="1">{status}</Badge>
```

## File structure

- Colocated `_components/` folders alongside each route's `page.tsx`
- Server Actions in `actions.ts` next to the page that uses them
- Shared utilities in `src/lib/`
- Database schema and connection in `src/db/`

## Database

- Drizzle ORM with Neon Postgres (serverless HTTP driver)
- Schema in `src/db/schema.ts`, connection in `src/db/index.ts`
- Query directly in Server Components: `await db.select().from(table).where(...)`
- `text("id").primaryKey()` with nanoid-generated IDs (not auto-increment)
- `pgEnum` for status columns
- `timestamp("created_at", { withTimezone: true }).notNull().defaultNow()` pattern

## Path alias

- `@/*` maps to `./src/*` (e.g., `import { db } from "@/db/index"`)

## Package imports

- Import business logic from `@sbsk-notes/core` and `@sbsk-notes/parser`
- Never duplicate core/parser logic in the web app

## Styling

- Radix component props for layout (spacing, alignment, text sizing)
- Inline `style` with CSS variables for dynamic values (hover states, conditional backgrounds)
- `globals.css` for page-level layout classes only (sidebar, main-content)
- `@import "@radix-ui/themes/styles.css"` in globals.css
