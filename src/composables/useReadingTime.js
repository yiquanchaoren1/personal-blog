/**
 * Estimate reading time for a text (supports Chinese + English mixed content).
 * @param {string} content - Markdown or plain text content
 * @returns {{ wordCount: number, readingTime: number }}
 */
export function getReadingTime(content) {
  if (!content) return { wordCount: 0, readingTime: 1 }

  // Count Chinese characters (each character ≈ 1 word)
  const chineseChars = (content.match(/[一-鿿㐀-䶿]/g) || []).length

  // Count English/other words by whitespace separation
  const englishWords = content
    .replace(/[一-鿿㐀-䶿]/g, '') // remove Chinese
    .split(/\s+/)
    .filter(Boolean).length

  const totalWords = chineseChars + englishWords

  // Average reading speed: ~200 chars/min for Chinese, ~238 words/min for English
  // Use 200 as a balanced estimate for mixed content
  const readingTime = Math.max(1, Math.ceil(totalWords / 200))

  return { wordCount: totalWords, readingTime }
}
