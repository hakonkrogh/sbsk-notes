"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { QueueTable } from "./queue-table"

interface QueueFile {
  id: string
  originalName: string
  status: "pending" | "processing" | "done" | "failed"
  parsedTitle: string | null
  parsedInstrument: string | null
  parsedPart: number | null
  parsedConfidence: number | null
  errorMessage: string | null
}

export function QueuePoller({ initialFiles }: { initialFiles: QueueFile[] }) {
  const [liveFiles, setLiveFiles] = useState<QueueFile[]>(initialFiles)
  const router = useRouter()
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    setLiveFiles(initialFiles)
  }, [initialFiles])

  useEffect(() => {
    let fallbackInterval: ReturnType<typeof setInterval> | null = null

    try {
      const es = new EventSource("/processing/events")
      eventSourceRef.current = es

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as QueueFile[]
          setLiveFiles(data)
        } catch {
          // ignore parse errors
        }
      }

      es.onerror = () => {
        es.close()
        eventSourceRef.current = null
        // Fall back to polling
        fallbackInterval = setInterval(() => {
          router.refresh()
        }, 5000)
      }
    } catch {
      // SSE not supported, fall back to polling
      fallbackInterval = setInterval(() => {
        router.refresh()
      }, 5000)
    }

    return () => {
      eventSourceRef.current?.close()
      if (fallbackInterval) clearInterval(fallbackInterval)
    }
  }, [router])

  return <QueueTable files={liveFiles} />
}
