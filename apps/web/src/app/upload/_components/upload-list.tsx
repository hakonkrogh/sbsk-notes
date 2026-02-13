import { Badge, Table, Text } from "@radix-ui/themes"

interface FileRow {
  id: string
  originalName: string
  fileSize: number
  status: "pending" | "processing" | "done" | "failed"
  createdAt: Date
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadList({ files }: { files: FileRow[] }) {
  if (files.length === 0) {
    return (
      <Text size="3" color="gray">
        Ingen filer lastet opp ennå.
      </Text>
    )
  }

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Navn</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Størrelse</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Lastet opp</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {files.map((file) => (
          <Table.Row key={file.id}>
            <Table.Cell>
              <Text size="2">{file.originalName}</Text>
            </Table.Cell>
            <Table.Cell>
              <Text size="2" color="gray">
                {formatBytes(file.fileSize)}
              </Text>
            </Table.Cell>
            <Table.Cell>
              <Badge color={STATUS_COLOR[file.status]}>{STATUS_LABEL[file.status]}</Badge>
            </Table.Cell>
            <Table.Cell>
              <Text size="2" color="gray">
                {file.createdAt.toLocaleString()}
              </Text>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
