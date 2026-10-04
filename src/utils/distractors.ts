import wordsData from '../data/words.json'
import type { Word } from '../types/content'

const words = wordsData as Word[]

/**
 * يختار N كلمة عشوائية من حروف أخرى (لا تشترك في نفس الرمز التعبيري مع
 * الكلمة الصحيحة، لتفادي وجود خيارين متطابقين بصريًا يربكان الطفل).
 */
export function pickDistractorWords(
  excludeLetterId: string,
  count: number,
  excludeEmojis: string[] = [],
): Word[] {
  const pool = words.filter(
    (w) => w.letterId !== excludeLetterId && !excludeEmojis.includes(w.imageEmoji),
  )
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}
