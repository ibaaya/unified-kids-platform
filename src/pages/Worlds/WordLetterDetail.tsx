import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { HighlightedWord } from '../../components/ui/HighlightedWord'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { EmojiIllustration } from '../../components/ui/EmojiIllustration'
import { useChildProfile } from '../../hooks/useChildProfile'
import { isWordsForLetterDone } from '../../engine/worldCompletionEngine'
import { getLetterPositionsInWord } from '../../utils/arabicText'
import lettersData from '../../data/letters.json'
import wordsData from '../../data/words.json'
import type { Letter, Word } from '../../types/content'

const letters = lettersData as Letter[]
const words = wordsData as Word[]
const sections: Array<{ position: Word['position']; title: string; label: string; emoji: string; color: string }> = [
  { position: 'start', title: 'أول الكلمة', label: 'الكلمات التي يبدأ بها الحرف', emoji: '🚀', color: 'var(--color-sky)' },
  { position: 'middle', title: 'وسط الكلمة', label: 'الكلمات التي يظهر فيها الحرف في الوسط', emoji: '🧩', color: 'var(--color-violet)' },
  { position: 'end', title: 'آخر الكلمة', label: 'الكلمات التي ينتهي بها الحرف', emoji: '🏁', color: 'var(--color-leaf)' },
]

/** تعرض كلمات الحرف على ثلاث محطات قصيرة بدل قائمة طويلة واحدة. */
export function WordLetterDetail() {
  const { letterId, position } = useParams()
  const navigate = useNavigate()
  const { child } = useChildProfile()
  const letter = letters.find((item) => item.id === letterId)
  const sectionIndex = sections.findIndex((item) => item.position === position)
  const section = sections[sectionIndex]

  useEffect(() => {
    if (letterId && (!position || sectionIndex < 0)) {
      navigate(`/world/words/letter/${encodeURIComponent(letterId)}/start`, { replace: true })
    }
  }, [letterId, position, sectionIndex, navigate])

  if (!letter) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" dir="rtl">
        <Card className="p-8 text-center">
          <p className="mb-4">لم يتم العثور على كلمات لهذا الحرف.</p>
          <Button onClick={() => navigate('/world/words')}>عالم الكلمات</Button>
        </Card>
      </main>
    )
  }
  if (!section) return null

  const letterWords = words.filter((word) => word.letterId === letter.id && word.position === section.position)
  const completedIds = child?.completedLessonIds ?? []
  const completedCount = letterWords.filter((word) => completedIds.includes(`word_lesson_${word.id}`)).length
  const isAllDone = isWordsForLetterDone(letter.id, completedIds)
  const previous = sections[sectionIndex - 1]
  const next = sections[sectionIndex + 1]
  const goPrevious = () => previous
    ? navigate(`/world/words/letter/${encodeURIComponent(letter.id)}/${previous.position}`)
    : navigate('/world/words')
  const goNext = () => next
    ? navigate(`/world/words/letter/${encodeURIComponent(letter.id)}/${next.position}`)
    : navigate(`/world/words/letter/${encodeURIComponent(letter.id)}/location-game`)

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-8 pb-24" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" onClick={goPrevious}>← {previous?.title ?? 'عالم الكلمات'}</Button>
        <Button variant="ghost" onClick={() => navigate('/world/words')}>الخروج ✕</Button>
      </div>

      <div className="flex items-center justify-center gap-3 mb-5" aria-label={`المحطة ${sectionIndex + 1} من 3`}>
        {sections.map((item, index) => (
          <span key={item.position} className={`h-3 rounded-full transition-all ${index === sectionIndex ? 'w-9 bg-[var(--color-leaf)]' : index < sectionIndex ? 'w-3 bg-[var(--color-leaf)]/50' : 'w-3 bg-black/10'}`} />
        ))}
      </div>

      <Card className="overflow-hidden mb-6 border-2 border-white/80 shadow-xl backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,.18)' }}>
        <div className="p-4 sm:p-5 text-center text-[var(--color-ink)] relative" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${section.color} 26%, transparent), color-mix(in srgb, ${section.color} 16%, transparent))` }}>
          {isAllDone && <span className="absolute top-3 left-3 rounded-full bg-emerald-700 text-white px-3 py-1 font-extrabold shadow">✓ مكتمل</span>}
          <div className="text-sm font-bold text-[var(--color-ink-soft)]">المحطة {sectionIndex + 1} من 3</div>
          <h1 className="font-display text-3xl font-extrabold mt-1">{section.emoji} {section.title}</h1>
          <p className="mt-2 font-semibold text-[var(--color-ink)]">{section.label} — حرف {letter.name} ({letter.id})</p>
          <div className="inline-flex mt-3 rounded-full border border-white/80 bg-white/55 px-4 py-1 text-sm font-bold">أُنجز {completedCount} من {letterWords.length}</div>
        </div>
      </Card>

      <div className="flex justify-center mb-5">
        <Mascot message={`لنكتشف حرف ${letter.name} في ${section.title}!`} size={72} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {letterWords.map((word, index) => {
          const isDone = completedIds.includes(`word_lesson_${word.id}`)
          const targetPositions = getLetterPositionsInWord(word.text, letter.id)
          const isUnambiguous = targetPositions.length === 1 && targetPositions[0] === word.position
          return (
            <Card key={word.id} className="relative p-4 sm:p-5 flex flex-col items-center gap-3 text-center border-2 border-white/85 shadow-lg backdrop-blur-md hover:border-[var(--world-words)] hover:-translate-y-1 transition-all" style={{ backgroundColor: 'rgba(255,255,255,.62)' }}>
              <span className="absolute top-2 right-2 rounded-full bg-[var(--color-sky)]/10 text-[var(--color-sky)] text-xs font-bold px-2 py-1">كلمة {index + 1}</span>
              {isDone && <span className="absolute top-2 left-2 rounded-full bg-[var(--color-leaf)]/10 text-[var(--color-leaf)] px-2 py-1 text-xs font-bold">✓</span>}
              <EmojiIllustration emoji={word.imageEmoji} className="mt-5" />
              <HighlightedWord text={word.text} letterId={letter.id} position={word.position} className="content-scale text-4xl font-extrabold" />
              {!isUnambiguous && <span className="text-xs text-amber-700">ملاحظة: الحرف يتكرر في أكثر من موضع</span>}
              <div className="flex items-center gap-2 mt-auto">
                <SpeakButton text={word.text} audioId={`word:${word.id}`} size="sm" label={`استمع لكلمة ${word.text}`} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="mt-7 flex items-center justify-center gap-3">
        {previous && <Button variant="secondary" onClick={goPrevious}>→ السابق</Button>}
        <Button size="lg" onClick={() => navigate(`/world/words/letter/${encodeURIComponent(letter.id)}/${section.position}/play`)}>🎮 العب كلمات هذه المحطة ({letterWords.length})</Button>
        {next && <Button variant="secondary" onClick={goNext}>التالي: {next.title} ←</Button>}
        {!next && <Button variant="secondary" onClick={goNext}>🎯 اختبر موضع الحرف</Button>}
      </div>
    </main>
  )
}
