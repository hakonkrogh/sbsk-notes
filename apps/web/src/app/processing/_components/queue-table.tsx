"use client"

import { Badge, Table, Text, Button, Flex } from "@radix-ui/themes"
import { retryProcessing } from "../actions"

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

const STATUS_COLOR: Record<string, "orange" | "blue" | "green" | "red"> = {
  pending: "orange",
  processing: "blue",
  done: "green",
  failed: "red",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Venter",
  processing: "Behandler",
  done: "Ferdig",
  failed: "Feilet",
}

export function QueueTable({ files }: { files: QueueFile[] }) {
  if (files.length === 0) {
    return (
      <Text size="3" color="gray">
        Ingen filer i køen.
      </Text>
    )
  }

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Fil</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Tolket tittel</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Instrument</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Sikkerhet</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Handlinger</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {files.map((file) => (
          <Table.Row key={file.id}>
            <Table.Cell>
              <Text size="2">{file.originalName}</Text>
            </Table.Cell>
            <Table.Cell>
              <Badge color={STATUS_COLOR[file.status]}>{STATUS_LABEL[file.status]}</Badge>
            </Table.Cell>
            <Table.Cell>
              <Text size="2">{file.parsedTitle ?? "—"}</Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="2">
                {file.parsedInstrument
                  ? `${file.parsedInstrument}${file.parsedPart ? ` ${file.parsedPart}` : ""}`
                  : "—"}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="2">
                {file.parsedConfidence != null
                  ? `${(file.parsedConfidence * 100).toFixed(0)}%`
                  : "—"}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Flex gap="2">
                {file.status === "failed" && (
                  <Button
                    size="1"
                    variant="soft"
                    onClick={() => retryProcessing(file.id)}
                  >
                    Prøv igjen
                  </Button>
                )}
                {file.errorMessage && (
                  <Text size="1" color="red" title={file.errorMessage}>
                    {file.errorMessage.slice(0, 30)}
                  </Text>
                )}
              </Flex>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
