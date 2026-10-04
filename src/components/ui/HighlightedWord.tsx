import { tokenizeArabicWord, findHighlightIndex, type LetterPosition } from '../../utils/arabicText'

interface HighlightedWordProps {
  text: string
  letterId: string
  position: LetterPosition
  /** حجم الخط، لإعادة الاستخدام في سياقات مختلفة (بطاقة كبيرة، قائمة صغيرة...) */
  className?: string
  /** تمييز حرف المد بلون مستقل في المقاطع الممدودة. */
  highlightMadd?: boolean
}

/**
 * يعرض كلمة عربية مشكولة، مع تمييز الحرف المستهدف بلون عالم الحروف،
 * وحركته بلون عالم الحركات — بينما تبقى بقية الكلمة بلونها الطبيعي.
 */
export function HighlightedWord({ text, letterId, position, className = '', highlightMadd = false }: HighlightedWordProps) {
  const tokens = tokenizeArabicWord(text)
  const highlightIndex = findHighlightIndex(tokens, letterId, position)

  return (
    <span className={`font-display ${className}`} dir="rtl">
      {tokens.map((token, idx) => {
        const isTarget = idx === highlightIndex
        const isMadd = highlightMadd && idx === tokens.length - 1 && tokens.length > 1
        return (
          <span
            key={idx}
            style={{
              color: isTarget ? 'var(--world-letters)' : isMadd ? 'var(--world-harakat)' : 'inherit',
              backgroundColor: isMadd ? 'color-mix(in srgb, var(--world-harakat) 14%, transparent)' : undefined,
              borderRadius: isMadd ? '.18em' : undefined,
              paddingInline: isMadd ? '.04em' : undefined,
            }}
            className={isTarget || isMadd ? 'font-extrabold' : undefined}
          >
            {token.base}{token.diacritics}
          </span>
        )
      })}
    </span>
  )
}
