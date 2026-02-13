import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql } from "drizzle-orm"

const client = neon(process.env.DATABASE_URL!)
const db = drizzle(client)

async function reset() {
  console.log("Dropping all tables...")

  await db.execute(sql`DROP TABLE IF EXISTS "files" CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS "groups" CASCADE`)
  await db.execute(sql`DROP TYPE IF EXISTS "file_status" CASCADE`)
  await db.execute(sql`DROP TYPE IF EXISTS "group_status" CASCADE`)

  // Also drop drizzle's migration tracking table so migrations can re-run
  await db.execute(sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`)

  console.log("Done. Run `pnpm db:migrate` to recreate.")
}

reset().catch((err) => {
  console.error(err)
  process.exit(1)
})
