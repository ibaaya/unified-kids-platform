import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { useChildProfile } from '../../hooks/useChildProfile'
import lettersData from '../../data/letters.json'
import wordsData from '../../data/words.json'
import type { Letter, Word } from '../../types/content'

const letters = lettersData as Letter[]
const words = wordsData as Word[]

export function LetterDetail() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const { child } = useChildProfile()

  const letter = letters.find((l) => l.id === letterId)
  const letterWords = words.filter((w) => w.letterId === letterId)

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center">
          <p className="mb-4">لم يتم العثور على هذا الحرف.</p>
          <Button onClick={() => navigate('/world/letters')}>عالم الحروف</Button>
        </Card>
      </div>
    )
  }

  const isLessonDone = child?.completedLessonIds.includes(`letter_lesson_${letterId}`) ?? false
  const completedIds = child?.completedLessonIds ?? []
  const totalCompleted = letterWords.filter((w) => completedIds.includes(`word_lesson_${w.id}`)).length

  const playLesson = () => navigate(`/world/letters/${letterId}/play`)
  const startWordsJourney = () => navigate(`/world/letters/${letterId}/words/start`)

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 pb-16">
      <Card className="relative mb-6 border border-white/80 p-6 text-center shadow-xl backdrop-blur-md sm:p-8" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,.20), rgba(255,255,255,.12))' }}>
        {isLessonDone && (
          <span
            className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-white text-[var(--color-leaf)] text-lg shadow-md"
            title="تم تعلّم هذا الحرف"
            aria-label="تم تعلّم هذا الحرف"
          >
            ✓
          </span>
        )}
        <div className="content-scale mb-1 text-8xl font-display font-extrabold text-white drop-shadow-[0_3px_5px_rgba(8,77,101,.85)]">
          {letter.id}
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="content-scale text-lg font-extrabold text-white drop-shadow-[0_2px_3px_rgba(8,77,101,.85)]">حرف {letter.name}</div>
          <SpeakButton text={letter.name} audioId={`letter:${letter.id}`} label={`استمع لاسم حرف ${letter.name}`} size="sm" />
        </div>
      </Card>

      <div className="flex justify-center mb-6">
        <Mascot message={`هيا نكتشف حرف ${letter.name} في كلمات جديدة! 🌟`} size={80} />
      </div>

      {letterWords.length > 0 && (
        <Card className="mb-7 flex items-center justify-between border border-white/75 p-5 shadow-lg backdrop-blur-md" style={{ background: 'rgba(255,255,255,.15)' }}>
          <span className="text-sm font-bold text-[var(--color-ink-soft)]">تقدّمك في كلمات هذا الحرف</span>
          <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-sm font-bold text-[var(--color-ink-soft)]">
            {totalCompleted} / {letterWords.length} ⭐
          </span>
        </Card>
      )}

      <div className="flex flex-col gap-3 items-stretch">
        <Button size="lg" onClick={startWordsJourney} disabled={letterWords.length === 0}>
          📚 استكشف الكلمات
        </Button>
        <Button size="lg" variant="ghost" onClick={playLesson}>
          🎮 العب واختبر نفسك
        </Button>
      </div>

      <div className="mt-8 flex justify-center gap-2 text-sm text-[var(--color-ink-soft)]">
        <span className="inline-flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: 'var(--world-letters)' }}
          />
          الحرف
        </span>
        <span className="inline-flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: 'var(--world-harakat)' }}
          />
          الحركة
        </span>
      </div>
    </div>
  )
}
