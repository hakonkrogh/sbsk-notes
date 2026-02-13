import { db } from "@/db/index"
import { files } from "@/db/schema"
import { desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let lastSnapshot = ""

      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      const poll = async () => {
        try {
          const rows = await db
            .select({
              id: files.id,
              originalName: files.originalName,
              status: files.status,
              parsedTitle: files.parsedTitle,
              parsedInstrument: files.parsedInstrument,
              parsedPart: files.parsedPart,
              parsedConfidence: files.parsedConfidence,
              errorMessage: files.errorMessage,
              updatedAt: files.updatedAt,
            })
            .from(files)
            .orderBy(desc(files.createdAt))
            .limit(100)

          const snapshot = JSON.stringify(rows)
          if (snapshot !== lastSnapshot) {
            lastSnapshot = snapshot
            send(snapshot)
          }
        } catch {
          // DB connection error — skip this tick
        }
      }

      await poll()

      const interval = setInterval(poll, 2000)

      // Clean up when client disconnects
      const cleanup = () => clearInterval(interval)
      controller.enqueue(encoder.encode(": keepalive\n\n"))

      // Store cleanup for abort
      ;(stream as unknown as { _cleanup: () => void })._cleanup = cleanup
    },
    cancel() {
      ;(stream as unknown as { _cleanup?: () => void })._cleanup?.()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
