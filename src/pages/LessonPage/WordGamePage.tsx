import { useMemo, useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { WordBuildGame } from '../../games/templates/WordBuildGame'
import { LetterTraceGame } from '../../games/templates/LetterTraceGame'
import { useChildProfile } from '../../hooks/useChildProfile'
import { awardLessonComplete } from '../../engine/rewardsEngine'
import { markLessonComplete } from '../../services/progressService'
import { checkWorldUnlocks } from '../../engine/curriculumEngine'
import { shuffle } from '../../utils/distractors'
import wordsData from '../../data/words.json'
import lettersData from '../../data/letters.json'
import type { Letter, Word } from '../../types/content'

const words = wordsData as Word[]
const letters = lettersData as Letter[]
const PASS_THRESHOLD = 0.6

type Stage = 'build' | 'write' | 'result'

export function WordGamePage() {
  const { wordId } = useParams()
  const navigate = useNavigate()
  const { child, loading, refresh } = useChildProfile()
  const [stage, setStage] = useState<Stage>('build')
  const [buildResult, setBuildResult] = useState<{ correct: number; total: number } | null>(null)
  const [writeCorrect, setWriteCorrect] = useState(0)

  const targetWord = words.find((w) => w.id === wordId)
  const wordsForLetter = targetWord ? words.filter((word) => word.letterId === targetWord.letterId) : []
  const targetWordIndex = wordsForLetter.findIndex((word) => word.id === targetWord?.id)
  const nextWord = wordsForLetter[targetWordIndex + 1] ?? (targetWord
    ? letters.slice(letters.findIndex((letter) => letter.id === targetWord.letterId) + 1)
      .map((letter) => words.find((word) => word.letterId === letter.id))
      .find((word): word is Word => Boolean(word))
    : undefined)

  // 3 كلمات للعبة: الكلمة المطلوبة + كلمتان عشوائيتان أخريان لتنويع التدريب
  const sessionWords = useMemo(() => {
    if (!targetWord) return []
    const others = shuffle(words.filter((w) => w.id !== targetWord.id)).slice(0, 2)
    return shuffle([targetWord, ...others])
  }, [targetWord])

  if (loading) return null
  if (!child?.id) return <Navigate to="/onboarding" replace />
  if (!targetWord) return <Navigate to="/world/words" replace />

  const autoRead = child.settings?.autoReadQuestions ?? true

  async function handleBuildFinished(correct: number) {
    setBuildResult({ correct, total: sessionWords.length })
    setStage('write')
  }

  async function handleWriteFinished(correct: number) {
    setWriteCorrect(correct)

    const total = (buildResult?.total ?? sessionWords.length) + 1
    const correctTotal = (buildResult?.correct ?? 0) + correct
    const ratio = correctTotal / total
    const lessonId = `word_lesson_${targetWord!.id}`

    if (ratio >= PASS_THRESHOLD) {
      await awardLessonComplete(child!.id!, lessonId)
    } else {
      await markLessonComplete(child!.id!, lessonId)
    }

    await checkWorldUnlocks(child!.id!)
    await refresh()
    setStage('result')
  }

  function handleRestart() {
    setBuildResult(null)
    setWriteCorrect(0)
    setStage('build')
  }

  const total = (buildResult?.total ?? sessionWords.length) + 1
  const correctTotal = (buildResult?.correct ?? 0) + writeCorrect

  return (
    <div className="min-h-screen max-w-xl mx-auto px-4 py-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-extrabold">🧱 بناء الكلمات</h1>
        <Button variant="ghost" onClick={() => navigate('/world/words')}>
          ← رجوع
        </Button>
      </div>

      {stage === 'build' && (
        <WordBuildGame
          words={sessionWords}
          childId={child.id}
          childName={child.name}
          autoRead={autoRead}
          onFinished={handleBuildFinished}
        />
      )}

      {stage === 'write' && (
        <LetterTraceGame
          text={targetWord.text}
          label={`كلمة ${targetWord.text}`}
          promptWorldId="words"
          promptId="word-trace"
          followUpText={targetWord.text}
          followUpAudioId={`word:${targetWord.id}`}
          skillId={`word_${targetWord.id}`}
          childId={child.id}
          childName={child.name}
          autoRead={autoRead}
          onFinished={handleWriteFinished}
        />
      )}

      {stage === 'result' && (
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Mascot
              message={
                correctTotal === total
                  ? 'أَحْسَنْتَ! بنيت وكتبت الكلمة بنفسك! 🏆'
                  : 'عمل رائع! استمر بالتدريب 🌟'
              }
              size={90}
            />
          </div>
          <div className="text-lg text-[var(--color-ink-soft)] mb-4">
            {correctTotal} من {total} إجابات صحيحة
          </div>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full sm:max-w-md self-center" onClick={() => navigate(nextWord ? `/world/words/${encodeURIComponent(nextWord.id)}/play` : '/world/words')}>
              {nextWord ? `الكلمة التالية: ${nextWord.text} ←` : 'العودة إلى عالم الكلمات'}
            </Button>
            <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" className="!min-h-10 !px-3 !py-2 !text-sm" onClick={handleRestart}>العب مرة أخرى 🔁</Button>
            <Button variant="ghost" className="!min-h-10 !px-3 !py-2 !text-sm" onClick={() => navigate('/world/words')}>
              عالم الكلمات
            </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
