"use client"

import { Badge, Flex, Text, IconButton } from "@radix-ui/themes"

interface GroupRowProps {
  id: string
  title: string
  arranger: string
  status: "pending" | "approved" | "rejected"
  fileCount: number
  expanded: boolean
  focused: boolean
  onToggle: () => void
}

const STATUS_COLOR: Record<string, "orange" | "green" | "red"> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
}

export function GroupRow({
  title,
  arranger,
  status,
  fileCount,
  expanded,
  focused,
  onToggle,
}: GroupRowProps) {
  return (
    <Flex
      align="center"
      gap="3"
      py="2"
      px="3"
      onClick={onToggle}
      style={{
        cursor: "pointer",
        background: focused ? "var(--blue-a3)" : "transparent",
        borderRadius: "var(--radius-2)",
        userSelect: "none",
      }}
    >
      <IconButton variant="ghost" size="1" tabIndex={-1}>
        <Text size="2">{expanded ? "\u25BC" : "\u25B6"}</Text>
      </IconButton>
      <Text size="3" weight="medium" style={{ flex: 1 }}>
        {title}
      </Text>
      {arranger && (
        <Text size="2" color="gray">
          arr. {arranger}
        </Text>
      )}
      <Badge color={STATUS_COLOR[status]} size="1">
        {status}
      </Badge>
      <Text size="1" color="gray">
        {fileCount} {fileCount === 1 ? "file" : "files"}
      </Text>
    </Flex>
  )
}
