import { Flex, Heading, Button } from "@radix-ui/themes"
import { db } from "@/db/index"
import { files } from "@/db/schema"
import { desc } from "drizzle-orm"
import { QueuePoller } from "./_components/queue-poller"
import { processPending } from "./actions"

export default async function ProcessingPage() {
  const queueFiles = await db
    .select({
      id: files.id,
      originalName: files.originalName,
      status: files.status,
      parsedTitle: files.parsedTitle,
      parsedInstrument: files.parsedInstrument,
      parsedPart: files.parsedPart,
      parsedConfidence: files.parsedConfidence,
      errorMessage: files.errorMessage,
    })
    .from(files)
    .orderBy(desc(files.createdAt))
    .limit(100)

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between" align="center">
        <Heading size="6">Processing Queue</Heading>
        <form action={processPending}>
          <Button type="submit" variant="solid">
            Process All Pending
          </Button>
        </form>
      </Flex>
      <QueuePoller initialFiles={queueFiles} />
    </Flex>
  )
}
