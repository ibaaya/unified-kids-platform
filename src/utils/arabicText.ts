// أدوات معالجة النص العربي: تفكيك الكلمة إلى "حرف + حركته" لتمكين تمييز
// حرف معيّن وحركته بلون مختلف داخل الكلمة، بغض النظر عن موقعه فيها.

export interface ArabicToken {
  base: string // الحرف الأساسي (بدون حركة)
  diacritics: string // الحركة/الحركات الملحقة بالحرف (قد تكون أكثر من رمز، مثل شدة + تنوين)
}

// نطاق الحركات في الترميز العربي Unicode (فتحة، ضمة، كسرة، سكون، شدة، تنوين، إلخ)
const DIACRITIC_RANGE = /[\u064B-\u0652]/

// عائلة الألف: نعتبرها كلها "نفس الحرف" عند البحث عن حرف الألف (أ، إ، آ، ا)
const ALEF_FAMILY = new Set(['ا', 'أ', 'إ', 'آ'])

function normalizeBase(ch: string): string {
  return ALEF_FAMILY.has(ch) ? 'ا' : ch
}

/** يفكك كلمة عربية مشكولة إلى مصفوفة من {حرف, حركاته} */
export function tokenizeArabicWord(word: string): ArabicToken[] {
  const tokens: ArabicToken[] = []
  for (const ch of word) {
    if (DIACRITIC_RANGE.test(ch)) {
      if (tokens.length > 0) {
        tokens[tokens.length - 1].diacritics += ch
      }
      continue
    }
    tokens.push({ base: ch, diacritics: '' })
  }
  return tokens
}

export type LetterPosition = 'start' | 'middle' | 'end'

/** Returns every distinct word position containing the given letter. */
export function getLetterPositionsInWord(word: string, letterId: string): LetterPosition[] {
  const targetNormalized = normalizeBase(letterId)
  const tokens = tokenizeArabicWord(word)
  const positions = new Set<LetterPosition>()
  tokens.forEach((token, index) => {
    if (normalizeBase(token.base) !== targetNormalized) return
    positions.add(index === 0 ? 'start' : index === tokens.length - 1 ? 'end' : 'middle')
  })
  return [...positions]
}

/**
 * يحدد فهرس الحرف (Token) المطلوب تمييزه داخل الكلمة، بناءً على الحرف المستهدف
 * وموقعه المقصود (أول/وسط/آخر الكلمة).
 */
export function findHighlightIndex(
  tokens: ArabicToken[],
  letterId: string,
  position: LetterPosition,
): number {
  const targetNormalized = normalizeBase(letterId)
  const matches: number[] = []
  tokens.forEach((t, idx) => {
    if (normalizeBase(t.base) === targetNormalized) matches.push(idx)
  })

  if (matches.length === 0) return -1

  const lastIdx = tokens.length - 1
  if (position === 'start') return matches[0]
  if (position === 'end') return matches[matches.length - 1]

  // middle: نفضّل تطابقًا ليس في البداية ولا النهاية
  const middleMatch = matches.find((idx) => idx !== 0 && idx !== lastIdx)
  return middleMatch ?? matches[Math.floor(matches.length / 2)]
}
