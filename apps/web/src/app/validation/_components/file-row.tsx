"use client"

import { Flex, Text } from "@radix-ui/themes"

interface FileRowProps {
  id: string
  originalName: string
  parsedInstrument: string | null
  parsedPart: number | null
  parsedConfidence: number | null
  focused: boolean
  onClick: () => void
}

export function FileRow({
  originalName,
  parsedInstrument,
  parsedPart,
  parsedConfidence,
  focused,
  onClick,
}: FileRowProps) {
  return (
    <Flex
      align="center"
      gap="3"
      py="1"
      px="3"
      ml="6"
      onClick={onClick}
      style={{
        cursor: "pointer",
        background: focused ? "var(--accent-a3)" : "transparent",
        borderRadius: "var(--radius-2)",
        userSelect: "none",
      }}
    >
      <Text size="2" style={{ flex: 1 }}>
        {originalName}
      </Text>
      {parsedInstrument && (
        <Text size="2" color="gray">
          {parsedInstrument}
          {parsedPart ? ` ${parsedPart}` : ""}
        </Text>
      )}
      {parsedConfidence != null && (
        <Text size="1" color="gray">
          {(parsedConfidence * 100).toFixed(0)}%
        </Text>
      )}
    </Flex>
  )
}
