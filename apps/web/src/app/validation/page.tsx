import { Heading, Flex } from "@radix-ui/themes"
import { db } from "@/db/index"
import { groups, files } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { GroupTree } from "./_components/group-tree"

export default async function ValidationPage() {
  const allGroups = await db
    .select()
    .from(groups)
    .orderBy(desc(groups.createdAt))

  const groupsWithFiles = await Promise.all(
    allGroups.map(async (group) => {
      const groupFiles = await db
        .select({
          id: files.id,
          originalName: files.originalName,
          parsedTitle: files.parsedTitle,
          parsedArranger: files.parsedArranger,
          parsedInstrument: files.parsedInstrument,
          parsedPart: files.parsedPart,
          parsedConfidence: files.parsedConfidence,
          parsedRaw: files.parsedRaw,
        })
        .from(files)
        .where(eq(files.groupId, group.id))
        .orderBy(files.parsedInstrument, files.parsedPart)

      return {
        id: group.id,
        title: group.title,
        arranger: group.arranger,
        status: group.status,
        files: groupFiles,
      }
    })
  )

  return (
    <Flex direction="column" gap="4">
      <Heading size="6">Validation</Heading>
      <GroupTree groups={groupsWithFiles} />
    </Flex>
  )
}
