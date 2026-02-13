# @sbsk-notes/web

Web interface for the SBSK sheet music ingestion pipeline. Upload scanned pages, process them through OCR, and validate the results before organizing into the library.

## Prerequisites

- Node.js 20.9+
- pnpm
- A [NeonDB](https://neon.tech) Postgres database (or any Postgres accessible via `@neondatabase/serverless`)

## Setup

1. Copy the environment file and fill in your database URL:

```
cp .env.local.example .env.local
```

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
UPLOAD_DIR=../../data/uploads
```

2. Install dependencies from the repo root:

```
pnpm install
```

3. Generate and apply the database migration:

```
pnpm --filter @sbsk-notes/web db:generate
pnpm --filter @sbsk-notes/web db:migrate
```

4. Start the dev server:

```
pnpm dev
```

The app runs at `http://localhost:3000`.

## Database Scripts

All scripts are scoped to this package. Run from the repo root with `pnpm --filter @sbsk-notes/web <script>`, or from `apps/web/` with `pnpm <script>`.

| Script | Description |
|--------|-------------|
| `db:generate` | Generate a SQL migration file from schema changes in `src/db/schema.ts` |
| `db:migrate` | Apply all pending migrations |
| `db:push` | Push schema directly to the database (skips migration files, useful during prototyping) |
| `db:studio` | Open Drizzle Studio to browse and edit data |
| `db:reset` | Drop all tables, enums, and migration history. Run `db:migrate` after to recreate. |

### Workflow for schema changes

1. Edit `src/db/schema.ts`
2. `db:generate` — creates a new timestamped SQL file in `drizzle/`
3. `db:migrate` — applies it to the database
4. Commit the migration file alongside the schema change

### Starting fresh

```
pnpm --filter @sbsk-notes/web db:reset
pnpm --filter @sbsk-notes/web db:migrate
```

## Project Structure

```
apps/web/
├── drizzle/                    # Generated migration SQL files
├── drizzle.config.ts           # Drizzle Kit configuration
├── .env.local                  # Environment variables (not committed)
├── src/
│   ├── db/
│   │   ├── schema.ts           # Tables, enums, relations
│   │   ├── index.ts            # Drizzle client singleton
│   │   └── reset.ts            # Database teardown script
│   ├── lib/
│   │   ├── ids.ts              # nanoid wrapper
│   │   ├── uploads.ts          # Save files to disk
│   │   ├── processing.ts       # Mock OCR processing (returns fake ParseResult)
│   │   └── grouping.ts         # Find-or-create group by title + arranger
│   └── app/
│       ├── layout.tsx          # Radix Theme + sidebar navigation
│       ├── upload/             # Upload page — drag-drop files into the system
│       ├── processing/         # Processing queue — watch files go through OCR
│       └── validation/         # Validation — review grouped results, approve/reject
```

## Pages

- **/upload** — Drag and drop scanned images (PNG, JPG, PDF). Files are saved to `UPLOAD_DIR` and tracked in the database as `pending`.
- **/processing** — View the processing queue. "Process All Pending" runs mock OCR on pending files, assigns parsed metadata, and groups files by title + arranger. SSE provides real-time status updates.
- **/validation** — Two-panel view: a tree of groups (left) and image preview with metadata (right). Keyboard navigable (arrows to move, Space to approve). Review and approve/reject groupings before they enter the library.
