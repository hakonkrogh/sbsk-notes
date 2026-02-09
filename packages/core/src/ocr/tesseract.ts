import Tesseract from "tesseract.js"

export async function recognizeWithTesseract(imagePath: string): Promise<string> {
  const result = await Tesseract.recognize(imagePath, "eng+nor")
  return result.data.text
}
