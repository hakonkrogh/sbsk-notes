"use client"

import { Box, Flex, Text, Separator } from "@radix-ui/themes"

interface PreviewFile {
  id: string
  originalName: string
  parsedTitle: string | null
  parsedArranger: string | null
  parsedInstrument: string | null
  parsedPart: number | null
  parsedConfidence: number | null
  parsedRaw: string | null
}

export function ImagePreview({ file }: { file: PreviewFile | null }) {
  if (!file) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ height: "100%", background: "var(--gray-a2)", borderRadius: "var(--radius-3)" }}
      >
        <Text size="3" color="gray">
          Velg en fil for forhåndsvisning
        </Text>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="4" style={{ height: "100%", overflow: "auto" }}>
      <Box
        style={{
          borderRadius: "var(--radius-3)",
          overflow: "hidden",
          background: "var(--gray-a2)",
          maxHeight: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/files/${file.id}/image`}
          alt={file.originalName}
          style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
        />
      </Box>
      <Separator size="4" />
      <Flex direction="column" gap="2" px="2">
        <Text size="2" weight="bold">
          {file.originalName}
        </Text>
        {file.parsedTitle && (
          <MetadataRow label="Tittel" value={file.parsedTitle} />
        )}
        {file.parsedArranger && (
          <MetadataRow label="Arrangør" value={file.parsedArranger} />
        )}
        {file.parsedInstrument && (
          <MetadataRow
            label="Instrument"
            value={`${file.parsedInstrument}${file.parsedPart ? ` stemme ${file.parsedPart}` : ""}`}
          />
        )}
        {file.parsedConfidence != null && (
          <MetadataRow
            label="Sikkerhet"
            value={`${(file.parsedConfidence * 100).toFixed(0)}%`}
          />
        )}
        {file.parsedRaw && (
          <Box mt="2">
            <Text size="1" color="gray" as="p" style={{ whiteSpace: "pre-wrap" }}>
              {file.parsedRaw}
            </Text>
          </Box>
        )}
      </Flex>
    </Flex>
  )
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex gap="2">
      <Text size="2" color="gray" style={{ minWidth: 80 }}>
        {label}
      </Text>
      <Text size="2">{value}</Text>
    </Flex>
  )
}
