import Ocr from "@gutenye/ocr-node"

let ocr: Awaited<ReturnType<typeof Ocr.create>> | null = null

async function getOcr() {
  if (!ocr) {
    ocr = await Ocr.create()
  }
  return ocr!
}

export async function recognizeWithPaddle(imagePath: string): Promise<string> {
  const svc = await getOcr()
  const lines = await svc.detect(imagePath)
  return lines.map((l: { text: string }) => l.text).join("\n")
}
