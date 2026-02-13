import { NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import { db } from "@/db/index"
import { files } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const file = await db.query.files.findFirst({
    where: eq(files.id, id),
  })

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const buffer = await readFile(file.storagePath)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 })
  }
}
