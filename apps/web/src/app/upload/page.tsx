import { Flex, Heading } from "@radix-ui/themes"
import { db } from "@/db/index"
import { files } from "@/db/schema"
import { desc } from "drizzle-orm"
import { Dropzone } from "./_components/dropzone"
import { UploadList } from "./_components/upload-list"

export default async function UploadPage() {
  const recentFiles = await db
    .select({
      id: files.id,
      originalName: files.originalName,
      fileSize: files.fileSize,
      status: files.status,
      createdAt: files.createdAt,
    })
    .from(files)
    .orderBy(desc(files.createdAt))
    .limit(50)

  return (
    <Flex direction="column" gap="5">
      <Heading size="6">Last opp</Heading>
      <Dropzone />
      <UploadList files={recentFiles} />
    </Flex>
  )
}
