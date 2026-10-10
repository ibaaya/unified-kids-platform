import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { HighlightedWord } from '../../components/ui/HighlightedWord'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { EmojiIllustration } from '../../components/ui/EmojiIllustration'
import { useChildProfile } from '../../hooks/useChildProfile'
import lettersData from '../../data/letters.json'
import wordsData from '../../data/words.json'
import type { Letter, Word } from '../../types/content'
import { getDefiniteLetterName } from '../../utils/arabicLetterNames'

const letters = lettersData as Letter[]
const words = wordsData as Word[]
const positionPhrase: Record<Word['position'], string> = {
  start: 'فِي أَوَّلِ الْكَلِمَةِ',
  middle: 'فِي وَسَطِ الْكَلِمَةِ',
  end: 'فِي آخِرِ الْكَلِمَةِ',
}

const wordPositionSections: Array<{
  position: Word['position']
  title: string
  description: string
  emoji: string
  accent: string
  iconBackground: string
}> = [
  {
    position: 'start',
    title: 'في أول الكلمة',
    description: 'نبحث عن الحرف في بداية الكلمة',
    emoji: '🚀',
    accent: 'text-emerald-700',
    iconBackground: 'bg-emerald-100',
  },
  {
    position: 'middle',
    title: 'في وسط الكلمة',
    description: 'نكتشف الحرف بين حروف الكلمة',
    emoji: '🧩',
    accent: 'text-sky-700',
    iconBackground: 'bg-sky-100',
  },
  {
    position: 'end',
    title: 'في آخر الكلمة',
    description: 'نلاحظ الحرف في نهاية الكلمة',
    emoji: '🏁',
    accent: 'text-violet-700',
    iconBackground: 'bg-violet-100',
  },
]

export function LetterWordsPage() {
  const { letterId, position } = useParams()
  const navigate = useNavigate()
  const { child } = useChildProfile()

  const letter = letters.find((l) => l.id === letterId)
  const letterWords = words.filter((w) => w.letterId === letterId)

  const sectionIndex = wordPositionSections.findIndex((s) => s.position === position)
  const section = sectionIndex >= 0 ? wordPositionSections[sectionIndex] : undefined

  // إن كان الرابط يحمل قسمًا غير صالح، نعيد الطفل تلقائيًا إلى صفحة الحرف
  useEffect(() => {
    if (letter && !section) {
      navigate(`/world/letters/${letterId}`, { replace: true })
    }
  }, [letter, section, letterId, navigate])

  if (!letter || !section) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center">
          <p>جارٍ التحويل…</p>
        </Card>
      </div>
    )
  }

  const completedIds = child?.completedLessonIds ?? []
  const playLesson = () => navigate(`/world/letters/${letterId}/play`)

  const sectionWords = letterWords.filter((word) => word.position === section.position)
  const completedCount = sectionWords.filter((word) => completedIds.includes(`word_lesson_${word.id}`)).length

  const prevSection = sectionIndex > 0 ? wordPositionSections[sectionIndex - 1] : null
  const nextSection = sectionIndex < wordPositionSections.length - 1 ? wordPositionSections[sectionIndex + 1] : null

  const goPrev = () => {
    if (prevSection) navigate(`/world/letters/${letterId}/words/${prevSection.position}`)
    else navigate('/world/letters')
  }
  const goNext = () => {
    if (nextSection) navigate(`/world/letters/${letterId}/words/${nextSection.position}`)
    else playLesson()
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 pt-24 pb-16 sm:pt-28">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={goPrev}>
          ← {prevSection ? prevSection.title : 'حرف ' + letter.name}
        </Button>
      </div>

      <Card className="relative mb-6 border border-white/80 p-5 text-center shadow-xl backdrop-blur-md sm:p-6" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,.20), rgba(255,255,255,.12))' }}>
        <div
          className="font-display font-extrabold text-white drop-shadow-[0_3px_5px_rgba(8,77,101,.85)]"
          style={{ fontSize: 'calc(6rem * var(--content-scale))' }}
        >
          {letter.id}
        </div>
        <div className="mt-1 flex items-center justify-center gap-2">
          <div
            className="font-extrabold text-white drop-shadow-[0_2px_3px_rgba(8,77,101,.85)]"
            style={{ fontSize: 'calc(1.125rem * var(--content-scale))' }}>
            حرف {letter.name}
          </div>
          <SpeakButton text={letter.name} audioId={`letter:${letter.id}`} label={`استمع لاسم حرف ${letter.name}`} size="sm" />
        </div>
      </Card>

      {/* مؤشر التقدم عبر الأقسام الثلاثة */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {wordPositionSections.map((s, i) => (
          <span
            key={s.position}
            className={`w-3 h-3 rounded-full transition-all ${
              i === sectionIndex
                ? 'w-8 bg-[var(--color-leaf)]'
                : i < sectionIndex
                ? 'bg-[var(--color-leaf)]/60'
                : 'bg-black/10'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <section aria-labelledby={`position-${section.position}`}>
        <Card className="overflow-hidden border border-white/75 shadow-xl backdrop-blur-md" style={{ background: 'rgba(255,255,255,.14)' }}>
          <div className="flex items-center gap-4 p-4 sm:p-5 border-b border-black/5">
            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-3xl ${section.iconBackground}`}>
              {section.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--color-ink-soft)]">
                المحطة {sectionIndex + 1} من {wordPositionSections.length}
              </div>
              <h1 id={`position-${section.position}`} className={`text-xl sm:text-2xl font-extrabold ${section.accent}`}>
                {section.title}
              </h1>
              <p className="text-sm text-[var(--color-ink-soft)] mt-1">{section.description}</p>
              <p className="mt-2 text-lg sm:text-xl font-extrabold text-[var(--color-ink)]">
                لِنَكْتَشِفَ حَرْفَ {getDefiniteLetterName(letter.id)} {positionPhrase[section.position]} (
                <span className="inline-block text-5xl sm:text-6xl align-middle text-[var(--world-letters)] drop-shadow-sm" aria-label={`الحرف ${letter.name}`}>{letter.id}</span>
                )
              </p>
            </div>
            <div className="shrink-0 rounded-full bg-black/[0.04] px-3 py-1.5 text-xs sm:text-sm font-bold text-[var(--color-ink-soft)]">
              {completedCount} / {sectionWords.length} ⭐
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 sm:p-5">
            {sectionWords.map((word) => {
              const isDone = completedIds.includes(`word_lesson_${word.id}`)
              return (
              <Card key={word.id} className="relative flex flex-col items-center gap-3 border border-white/80 bg-white/15 p-4 text-center shadow-lg backdrop-blur-md">
                  {isDone && (
                    <span
                      className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-leaf)]/10 text-[var(--color-leaf)] text-sm"
                      title="تم إتقان هذه الكلمة"
                      aria-label="تم إتقان هذه الكلمة"
                    >
                      ✓
                    </span>
                  )}
                  <EmojiIllustration emoji={word.imageEmoji} className="text-8xl" />
                  <HighlightedWord
                    text={word.text}
                    letterId={letter.id}
                    position={word.position}
                    className="font-extrabold min-h-16"
                    style={{ fontSize: 'clamp(2.75rem, 6vw, 3.5rem)' }}
                  />
                  <SpeakButton text={word.text} audioId={`word:${word.id}`} label={`استمع لكلمة ${word.text}`} />
                </Card>
              )
            })}
          </div>
        </Card>
      </section>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={goNext}>
          {nextSection ? `${nextSection.title} ←` : '🎮 العب واختبر نفسك'}
        </Button>
      </div>
    </div>
  )
}