import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Mascot } from '../../components/character/Mascot'
import { WordBuildGame } from '../../games/templates/WordBuildGame'
import { useChildProfile } from '../../hooks/useChildProfile'
import { awardLessonComplete } from '../../engine/rewardsEngine'
import { checkWorldUnlocks } from '../../engine/curriculumEngine'
import wordsData from '../../data/words.json'
import lettersData from '../../data/letters.json'
import type { Letter, Word } from '../../types/content'

const words = wordsData as Word[]
const letters = lettersData as Letter[]
const labels = { start: 'أول الكلمة', middle: 'وسط الكلمة', end: 'آخر الكلمة' } as const
const positions: Word['position'][] = ['start', 'middle', 'end']

export function WordPositionGamePage() {
  const { letterId, position } = useParams<{ letterId: string; position: Word['position'] }>()
  const navigate = useNavigate()
  const { child, loading, refresh } = useChildProfile()
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)
  const sessionWords = words.filter((word) => word.letterId === letterId && word.position === position)
  const positionIndex = position ? positions.indexOf(position) : -1
  const nextPosition = positionIndex >= 0 ? positions[positionIndex + 1] : undefined
  const currentLetterIndex = letters.findIndex((letter) => letter.id === letterId)
  const nextLetter = letters.slice(currentLetterIndex + 1).find((letter) => words.some((word) => word.letterId === letter.id && word.position === 'start'))
  const nextPath = nextPosition
    ? `/world/words/letter/${encodeURIComponent(letterId ?? '')}/${nextPosition}`
    : nextLetter
      ? `/world/words/letter/${encodeURIComponent(nextLetter.id)}/start`
      : '/world/words'
  const nextLabel = nextPosition
    ? `المحطة التالية: ${labels[nextPosition]}`
    : nextLetter
      ? `الحرف التالي: ${nextLetter.id}`
      : 'العودة إلى عالم الكلمات'

  if (loading) return null
  if (!child?.id) return <Navigate to="/onboarding" replace />
  if (!letterId || !position || !(position in labels) || sessionWords.length === 0) return <Navigate to="/world/words" replace />

  async function handleWordAnswered(word: Word, isCorrect: boolean) {
    if (isCorrect) await awardLessonComplete(child!.id!, `word_lesson_${word.id}`)
  }

  async function finish(correct: number) {
    await checkWorldUnlocks(child!.id!)
    await refresh()
    setResult({ correct, total: sessionWords.length })
  }

  return <main className="min-h-screen max-w-4xl mx-auto px-4 py-8 pb-16" dir="rtl">
    <div className="flex justify-between items-center mb-5">
      <h1 className="font-display text-2xl font-extrabold">بناء الكلمات — {labels[position]} · {letterId}</h1>
      <Button variant="ghost" onClick={() => navigate(`/world/words/letter/${encodeURIComponent(letterId)}/${position}`)}>رجوع</Button>
    </div>
    {result === null ? <WordBuildGame words={sessionWords} childId={child.id} childName={child.name} autoRead={child.settings?.autoReadQuestions ?? true} onWordAnswered={handleWordAnswered} onFinished={finish} /> :
      <Card className="p-8 text-center border-2 border-white/80 shadow-xl backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,.2)' }}><Mascot message={result.correct === result.total ? 'أحسنت! أنهيت كلمات هذه المحطة! 🏆' : 'عمل رائع، واصل التدريب! 🌟'} size={90} />
        <p className="text-lg my-4">{result.correct} من {result.total} إجابات صحيحة</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button size="lg" className="w-full sm:max-w-md" onClick={() => navigate(nextPath)}>{nextLabel} ←</Button>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" className="!min-h-10 !px-3 !py-2 !text-sm" onClick={() => setResult(null)}>العب مرة أخرى 🔁</Button>
            <Button variant="ghost" className="!min-h-10 !px-3 !py-2 !text-sm" onClick={() => navigate('/world/words')}>عالم الكلمات</Button>
          </div>
        </div>
      </Card>}
  </main>
}
