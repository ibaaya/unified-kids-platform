import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { LetterLessonFlow } from '../../games/LetterLessonFlow'
import { useChildProfile } from '../../hooks/useChildProfile'
import { awardLessonComplete } from '../../engine/rewardsEngine'
import { markLessonComplete } from '../../services/progressService'
import { checkWorldUnlocks } from '../../engine/curriculumEngine'
import lettersData from '../../data/letters.json'
import wordsData from '../../data/words.json'
import type { Letter, Word } from '../../types/content'

const letters = lettersData as Letter[]
const words = wordsData as Word[]

const PASS_THRESHOLD = 0.6 // 60% فأكثر = درس مُتقن يستحق المكافأة الكاملة

interface LessonResult {
  correct: number
  total: number
  earnedStar: boolean
}

export function LetterGamePage() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const { child, loading, refresh } = useChildProfile()
  const [result, setResult] = useState<LessonResult | null>(null)

  const letter = letters.find((l) => l.id === letterId)
  const nextLetter = [...letters].sort((a, b) => a.order - b.order).find((item) => item.order > (letter?.order ?? Number.MAX_SAFE_INTEGER))
  const letterWords = words
    .filter((w) => w.letterId === letterId)
    .sort((a, b) => (a.position === 'start' ? -1 : b.position === 'start' ? 1 : 0))

  if (loading) return null
  if (!child?.id) return <Navigate to="/onboarding" replace />
  if (!letter || letterWords.length === 0) return <Navigate to="/world/letters" replace />

  async function handleFlowFinished(correct: number, total: number) {
    const ratio = correct / total
    const lessonId = `letter_lesson_${letterId}`

    if (ratio >= PASS_THRESHOLD) {
      await awardLessonComplete(child!.id!, lessonId)
    } else {
      await markLessonComplete(child!.id!, lessonId)
    }

    await checkWorldUnlocks(child!.id!)
    await refresh()

    setResult({ correct, total, earnedStar: ratio >= PASS_THRESHOLD })
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-6 pb-16 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-extrabold">درس حرف {letter.name}</h1>
        <Button variant="ghost" onClick={() => navigate(`/world/letters/${letterId}`)}>
          ← رجوع
        </Button>
      </div>

      {result === null ? (
        <LetterLessonFlow
          letter={letter}
          words={letterWords}
          childId={child.id}
          childName={child.name}
          autoRead={child.settings?.autoReadQuestions ?? true}
          onFinished={handleFlowFinished}
        />
      ) : (
        <Card className="border border-white/80 p-8 text-center shadow-xl backdrop-blur-md" style={{ background: 'rgba(255,255,255,.15)' }}>
          <div className="flex justify-center mb-4">
            <Mascot
              message={
                result.earnedStar
                  ? 'لقد أتقنت هذا الحرف! 🏆'
                  : 'أَحْسَنْتَ على المحاولة! جرّب مرة أخرى لتتقنه أكثر 🌟'
              }
              size={90}
            />
          </div>
          <div className="text-lg text-[var(--color-ink-soft)] mb-2">
            {result.correct} من {result.total} إجابات صحيحة
          </div>
          <div className="text-2xl font-display font-extrabold mb-2">
            {result.earnedStar ? '⭐ نجمة جديدة!' : '💪 استمر بالتدريب'}
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button size="lg" className="w-full sm:max-w-md" onClick={() => navigate(nextLetter ? `/world/letters/${encodeURIComponent(nextLetter.id)}` : '/world/letters')}>
              {nextLetter ? `الحرف التالي: ${nextLetter.id} ←` : 'العودة إلى عالم الحروف'}
            </Button>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" className="!min-h-10 !px-3 !py-2 !text-sm" onClick={() => setResult(null)}>العب مرة أخرى 🔁</Button>
              <Button variant="ghost" className="!min-h-10 !px-3 !py-2 !text-sm" onClick={() => navigate('/world/letters')}>
                قائمة الحروف
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
