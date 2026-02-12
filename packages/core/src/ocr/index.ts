import { recognizeWithPaddle } from "./paddle.js"

export async function scan(imagePath: string): Promise<string> {
  return recognizeWithPaddle(imagePath)
}
