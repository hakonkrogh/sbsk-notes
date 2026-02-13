"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Box, Text, Flex } from "@radix-ui/themes"
import { uploadFiles } from "../actions"

export function Dropzone() {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const formData = new FormData()
    for (const file of acceptedFiles) {
      formData.append("files", file)
    }
    await uploadFiles(formData)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
  })

  return (
    <Box
      {...getRootProps()}
      style={{
        border: "2px dashed var(--gray-a7)",
        borderRadius: "var(--radius-3)",
        padding: "var(--space-8)",
        cursor: "pointer",
        background: isDragActive ? "var(--blue-a2)" : "var(--gray-a2)",
        transition: "background 150ms",
      }}
    >
      <input {...getInputProps()} />
      <Flex direction="column" align="center" gap="2">
        <Text size="4" weight="medium" color={isDragActive ? "blue" : undefined}>
          {isDragActive ? "Drop files here..." : "Drag & drop sheet music files"}
        </Text>
        <Text size="2" color="gray">
          PNG, JPG, or PDF
        </Text>
      </Flex>
    </Box>
  )
}
