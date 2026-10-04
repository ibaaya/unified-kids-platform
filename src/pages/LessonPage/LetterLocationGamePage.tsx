import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Mascot } from '../../components/character/Mascot'
import { LetterLocationGame } from '../../games/templates/LetterLocationGame'
import { useChildProfile } from '../../hooks/useChildProfile'
import { awardLessonComplete } from '../../engine/rewardsEngine'
import { checkWorldUnlocks } from '../../engine/curriculumEngine'
import { markLessonComplete } from '../../services/progressService'
import { getLetterPositionsInWord } from '../../utils/arabicText'
import lettersData from '../../data/letters.json'
import wordsData from '../../data/words.json'
import type { Letter, Word } from '../../types/content'

const letters = lettersData as Letter[]
const allWords = wordsData as Word[]

export function LetterLocationGamePage() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const { child, loading, refresh } = useChildProfile()
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)

  const letter = letters.find((item) => item.id === letterId)
  const words = allWords.filter((word) => word.letterId === letterId &&
    getLetterPositionsInWord(word.text, word.letterId).length === 1 &&
    getLetterPositionsInWord(word.text, word.letterId)[0] === word.position)

  if (loading) return null
  if (!child?.id) return <Navigate to="/onboarding" replace />
  if (!letter || words.length < 3) return <Navigate to="/world/words" replace />

  async function handleFinished(correct: number, total: number) {
    setResult({ correct, total })
    if (total > 0 && correct / total >= 2 / 3) {
      await awardLessonComplete(child!.id!, `letter_location_lesson_${letter!.id}`)
    } else {
      await markLessonComplete(child!.id!, `letter_location_lesson_${letter!.id}`)
    }
    await checkWorldUnlocks(child!.id!)
    await refresh()
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8 pb-24" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(`/world/words/letter/${encodeURIComponent(letter.id)}/end`)}>← الكلمات</Button>
        <span className="font-bold text-[var(--color-ink-soft)]">تحدي موضع الحرف</span>
      </div>

      <div className="flex justify-center mb-5">
        <Mascot message={`هيا نبحث عن حرف ${letter.name} في الكلمة!`} size={76} />
      </div>

      {result ? (
        <Card className="p-7 text-center">
          <div className="text-5xl mb-3">{result.correct === result.total ? '🏆' : '🌟'}</div>
          <h1 className="font-display text-2xl font-extrabold mb-2">أحسنت يا بطل!</h1>
          <p className="text-[var(--color-ink-soft)] mb-6">إجاباتك الصحيحة: {result.correct} من {result.total}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={() => setResult(null)}>العب من جديد 🔁</Button>
            <Button variant="secondary" onClick={() => navigate(`/world/words/letter/${encodeURIComponent(letter.id)}/end`)}>العودة للكلمات</Button>
          </div>
        </Card>
      ) : (
        <LetterLocationGame
          letter={letter}
          words={words}
          childId={child.id}
          autoRead={child.settings?.autoReadQuestions ?? true}
          onFinished={(correct, total) => void handleFinished(correct, total)}
        />
      )}
    </main>
  )
}
