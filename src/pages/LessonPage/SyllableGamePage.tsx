import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { SyllableChoiceGame } from '../../games/templates/SyllableChoiceGame'
import { useChildProfile } from '../../hooks/useChildProfile'
import { awardLessonComplete } from '../../engine/rewardsEngine'
import { checkWorldUnlocks } from '../../engine/curriculumEngine'
import syllablesData from '../../data/syllables.json'
import lettersData from '../../data/letters.json'
import type { Letter, Syllable, SyllableType } from '../../types/content'

const syllables = syllablesData as Syllable[]
const letters = lettersData as Letter[]
const PASS_THRESHOLD = 0.6

export function SyllableGamePage() {
  const { letterId, type } = useParams<{ letterId: string; type: SyllableType }>()
  const navigate = useNavigate()
  const { child, loading, refresh } = useChildProfile()
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)

  const hasQuestions =
    letterId && type && syllables.some((s) => s.letterId === letterId && s.type === type)

  if (loading) return null
  if (!child?.id) return <Navigate to="/onboarding" replace />
  if (!hasQuestions) return <Navigate to="/world/syllables" replace />
  if (type === 'madd' && !child.completedLessonIds.includes(`syllable_lesson_short_${letterId}`)) {
    return <Navigate to={`/world/syllables/${letterId}`} replace />
  }
  const hasMadd = syllables.some((item) => item.letterId === letterId && item.type === 'madd')
  const orderedLetters = [...letters].sort((a, b) => a.order - b.order).filter((letter) => syllables.some((item) => item.letterId === letter.id))
  const currentLetterIndex = orderedLetters.findIndex((letter) => letter.id === letterId)
  const nextLetterId = orderedLetters[currentLetterIndex + 1]?.id
  const passed = result !== null && result.correct / result.total >= PASS_THRESHOLD
  const continueLearning = () => {
    if (type === 'short' && hasMadd) navigate(`/world/syllables/${letterId}`, { state: { openType: 'madd' } })
    else if (nextLetterId) navigate(`/world/syllables/${nextLetterId}`)
    else navigate('/world/syllables')
  }

  async function handleFinished(correct: number, total: number) {
    const ratio = correct / total
    const lessonId = `syllable_lesson_${type}_${letterId}`

    if (ratio >= PASS_THRESHOLD) {
      await awardLessonComplete(child!.id!, lessonId)
    }

    await checkWorldUnlocks(child!.id!)
    await refresh()
    setResult({ correct, total })
  }

  return (
    <div className="min-h-screen max-w-xl mx-auto px-4 pb-16 pt-24">
      <div className="mb-6 flex items-center justify-end">
        <h1 className="font-display text-xl font-extrabold">
          اختبار مقاطع حرف {letterId} ({type === 'short' ? 'قصيرة' : 'ممدودة'})
        </h1>
      </div>

      {result === null ? (
        <SyllableChoiceGame
          letterId={letterId!}
          syllableType={type!}
          childId={child.id}
          childName={child.name}
          autoRead={child.settings?.autoReadQuestions ?? true}
          onFinished={(correct) => handleFinished(correct, 3)}
        />
      ) : (
        <Card className="border border-white/85 p-8 text-center shadow-2xl backdrop-blur-md" style={{ background: 'rgba(255,255,255,.16)' }}>
          <div className="flex justify-center mb-4">
            <Mascot
              message={
                result.correct === result.total
                  ? 'أَحْسَنْتَ! أتقنت مقاطع هذا الحرف! 🏆'
                  : 'عمل رائع! استمر بالتدريب 🌟'
              }
              size={90}
            />
          </div>
          <div className="text-lg text-[var(--color-ink-soft)] mb-4">
            {result.correct} من {result.total} إجابات صحيحة
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setResult(null)}>العب مرة أخرى 🔁</Button>
            {passed && <Button onClick={continueLearning}>{type === 'short' && hasMadd ? 'انتقل إلى المقاطع الممدودة →' : nextLetterId ? 'الحرف التالي →' : 'العودة إلى عالم المقاطع'}</Button>}
            <Button variant="ghost" onClick={() => navigate('/world/syllables')}>
              عالم المقاطع
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
