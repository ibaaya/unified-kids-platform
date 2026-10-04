import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { HarakaChoiceGame } from '../../games/templates/HarakaChoiceGame'
import { useChildProfile } from '../../hooks/useChildProfile'
import { awardLessonComplete } from '../../engine/rewardsEngine'
import { markLessonComplete } from '../../services/progressService'
import { checkWorldUnlocks } from '../../engine/curriculumEngine'
import { HARAKA_ORDER, HARAKA_LABELS } from '../../data/harakaLabels'
import type { HarakaType } from '../../types/content'

const PASS_THRESHOLD = 0.6

export function HarakaGamePage() {
  const { harakaType } = useParams<{ harakaType: HarakaType }>()
  const navigate = useNavigate()
  const { child, loading, refresh } = useChildProfile()
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)
  const currentHarakaIndex = harakaType ? HARAKA_ORDER.indexOf(harakaType) : -1
  const nextHaraka = currentHarakaIndex >= 0 ? HARAKA_ORDER[currentHarakaIndex + 1] : undefined

  const isValid = harakaType && HARAKA_ORDER.includes(harakaType)

  if (loading) return null
  if (!child?.id) return <Navigate to="/onboarding" replace />
  if (!isValid) return <Navigate to="/world/harakat" replace />

  async function handleFinished(correct: number, total: number) {
    const ratio = correct / total
    const lessonId = `haraka_lesson_${harakaType}`

    if (ratio >= PASS_THRESHOLD) {
      await awardLessonComplete(child!.id!, lessonId)
    } else {
      await markLessonComplete(child!.id!, lessonId)
    }

    await checkWorldUnlocks(child!.id!)
    await refresh()
    setResult({ correct, total })
  }

  return (
    <div className="min-h-screen max-w-xl mx-auto px-4 py-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-extrabold">اختبار {HARAKA_LABELS[harakaType!]}</h1>
        <Button variant="ghost" onClick={() => navigate(`/world/harakat/${harakaType}`)}>
          ← رجوع
        </Button>
      </div>

      {result === null ? (
        <HarakaChoiceGame
          harakaType={harakaType!}
          childId={child.id}
          childName={child.name}
          autoRead={child.settings?.autoReadQuestions ?? true}
          onFinished={(correct) => handleFinished(correct, 3)}
        />
      ) : (
        <Card className="p-8 text-center border-2 border-white/80 shadow-xl backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,.18)' }}>
          <div className="flex justify-center mb-4">
            <Mascot
              message={
                result.correct === result.total
                  ? 'لقد أتقنت هذه الحركة! 🏆'
                  : 'أَحْسَنْتَ على المحاولة! جرّب مرة أخرى 🌟'
              }
              size={90}
            />
          </div>
          <div className="text-lg text-[var(--color-ink-soft)] mb-4">
            {result.correct} من {result.total} إجابات صحيحة
          </div>
          <div className="flex flex-col items-center gap-3">
            <Button size="lg" className="w-full sm:max-w-md" onClick={() => navigate(nextHaraka ? `/world/harakat/${nextHaraka}` : '/world/harakat')}>
              {nextHaraka ? `الحركة التالية: ${HARAKA_LABELS[nextHaraka]} ←` : 'العودة إلى عالم الحركات'}
            </Button>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="secondary" className="!min-h-10 !px-3 !py-2 !text-sm" onClick={() => setResult(null)}>العب مرة أخرى 🔁</Button>
              <Button variant="ghost" className="!min-h-10 !px-3 !py-2 !text-sm" onClick={() => navigate('/world/harakat')}>
                قائمة الحركات
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
