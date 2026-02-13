"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Box, Flex } from "@radix-ui/themes"
import { GroupRow } from "./group-row"
import { FileRow } from "./file-row"
import { ImagePreview } from "./image-preview"
import { approveGroup, rejectGroup } from "../actions"

interface FileData {
  id: string
  originalName: string
  parsedTitle: string | null
  parsedArranger: string | null
  parsedInstrument: string | null
  parsedPart: number | null
  parsedConfidence: number | null
  parsedRaw: string | null
}

interface GroupData {
  id: string
  title: string
  arranger: string
  status: "pending" | "approved" | "rejected"
  files: FileData[]
}

type FocusItem =
  | { type: "group"; groupIndex: number }
  | { type: "file"; groupIndex: number; fileIndex: number }

export function GroupTree({ groups }: { groups: GroupData[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [focus, setFocus] = useState<FocusItem | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleExpand = useCallback((groupId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }, [])

  // Build flat list of navigable items
  const flatItems: FocusItem[] = []
  for (let gi = 0; gi < groups.length; gi++) {
    flatItems.push({ type: "group", groupIndex: gi })
    if (expanded.has(groups[gi].id)) {
      for (let fi = 0; fi < groups[gi].files.length; fi++) {
        flatItems.push({ type: "file", groupIndex: gi, fileIndex: fi })
      }
    }
  }

  const findFlatIndex = (item: FocusItem | null): number => {
    if (!item) return -1
    return flatItems.findIndex((fi) => {
      if (fi.type !== item.type || fi.groupIndex !== item.groupIndex) return false
      if (fi.type === "file" && item.type === "file") return fi.fileIndex === item.fileIndex
      return fi.type === "group"
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focus) {
        if (flatItems.length > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          setFocus(flatItems[0])
          e.preventDefault()
        }
        return
      }

      const currentIdx = findFlatIndex(focus)

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault()
          const next = currentIdx + 1
          if (next < flatItems.length) setFocus(flatItems[next])
          break
        }
        case "ArrowUp": {
          e.preventDefault()
          const prev = currentIdx - 1
          if (prev >= 0) setFocus(flatItems[prev])
          break
        }
        case "ArrowRight":
        case "Enter": {
          e.preventDefault()
          if (focus.type === "group") {
            const group = groups[focus.groupIndex]
            if (!expanded.has(group.id)) {
              toggleExpand(group.id)
            }
          }
          if (focus.type === "file") {
            const file = groups[focus.groupIndex].files[focus.fileIndex]
            setSelectedFile(file)
          }
          break
        }
        case "ArrowLeft": {
          e.preventDefault()
          if (focus.type === "group") {
            const group = groups[focus.groupIndex]
            if (expanded.has(group.id)) {
              toggleExpand(group.id)
            }
          } else if (focus.type === "file") {
            setFocus({ type: "group", groupIndex: focus.groupIndex })
          }
          break
        }
        case " ": {
          e.preventDefault()
          if (focus.type === "group") {
            const group = groups[focus.groupIndex]
            if (group.status === "pending") {
              approveGroup(group.id)
            }
          }
          break
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("keydown", handleKeyDown)
      return () => container.removeEventListener("keydown", handleKeyDown)
    }
  })

  return (
    <Flex gap="5" style={{ height: "calc(100vh - 120px)" }}>
      <Box
        ref={containerRef}
        tabIndex={0}
        style={{
          flex: "0 0 60%",
          overflow: "auto",
          outline: "none",
          borderRight: "1px solid var(--gray-a5)",
          paddingRight: "var(--space-4)",
        }}
      >
        {groups.map((group, gi) => (
          <Box key={group.id}>
            <GroupRow
              id={group.id}
              title={group.title}
              arranger={group.arranger}
              status={group.status}
              fileCount={group.files.length}
              expanded={expanded.has(group.id)}
              focused={focus?.type === "group" && focus.groupIndex === gi}
              onToggle={() => toggleExpand(group.id)}
            />
            {expanded.has(group.id) &&
              group.files.map((file, fi) => (
                <FileRow
                  key={file.id}
                  id={file.id}
                  originalName={file.originalName}
                  parsedInstrument={file.parsedInstrument}
                  parsedPart={file.parsedPart}
                  parsedConfidence={file.parsedConfidence}
                  focused={
                    focus?.type === "file" &&
                    focus.groupIndex === gi &&
                    focus.fileIndex === fi
                  }
                  onClick={() => {
                    setFocus({ type: "file", groupIndex: gi, fileIndex: fi })
                    setSelectedFile(file)
                  }}
                />
              ))}
          </Box>
        ))}
      </Box>
      <Box style={{ flex: "0 0 40%", overflow: "auto" }}>
        <ImagePreview file={selectedFile} />
      </Box>
    </Flex>
  )
}
