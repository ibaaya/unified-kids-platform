import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { FeedbackMessage } from '../../components/feedback/FeedbackMessage'
import { tokenizeArabicWord, type ArabicToken } from '../../utils/arabicText'
import { shuffle } from '../../utils/distractors'
import { useAutoReadQuestion } from '../../hooks/useAutoReadQuestion'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { recordAttempt } from '../../engine/masteryEngine'
import { awardCorrectAnswer } from '../../engine/rewardsEngine'
import type { Word } from '../../types/content'
import { getVoicePromptText } from '../../utils/voicePromptCatalog'
import { voicePromptAudioId } from '../../utils/voicePromptIds'
import { EmojiIllustration } from '../../components/ui/EmojiIllustration'

interface Tile extends ArabicToken {
  originalIndex: number
}

interface WordBuildGameProps {
  words: Word[]
  childId: number
  childName?: string
  autoRead: boolean
  onFinished: (correctCount: number) => void
  onWordAnswered?: (word: Word, isCorrect: boolean) => void | Promise<void>
}

/**
 * "رتّب الحروف": بدل السحب والإفلات (غير موثوق دائمًا على الشاشات اللمسية)،
 * الطفل يضغط على الأجزاء (حرف+حركته) بالترتيب الصحيح لبناء الكلمة.
 */
export function WordBuildGame({ words, childId, autoRead, onFinished, onWordAnswered }: WordBuildGameProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [builtOrder, setBuiltOrder] = useState<number[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [attemptedThisQuestion, setAttemptedThisQuestion] = useState(false)
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()

  const currentWord = words[questionIndex]
  const isLastQuestion = questionIndex === words.length - 1
  const questionText = getVoicePromptText('words', 'word-build')
  const questionAudioId = voicePromptAudioId('words', 'word-build')

  useAutoReadQuestion(questionText, autoRead, questionIndex, 500, currentWord.text, questionAudioId, `word:${currentWord.id}`)

  const correctTiles: Tile[] = useMemo(
    () => tokenizeArabicWord(currentWord.text).map((t, idx) => ({ ...t, originalIndex: idx })),
    [currentWord.text],
  )

  const shuffledTiles = useMemo(() => shuffle(correctTiles), [correctTiles])

  const isComplete = builtOrder.length === correctTiles.length

  function handleTileTap(tile: Tile) {
    if (builtOrder.includes(tile.originalIndex)) return
    if (isComplete) return
    setBuiltOrder((prev) => [...prev, tile.originalIndex])
  }

  function handleReset() {
    setBuiltOrder([])
    reset()
  }

  async function handleCheck() {
    if (isSavingAnswer) return
    const isCorrect = builtOrder.every((idx, i) => idx === i)
    setAttemptedThisQuestion(true)
    setIsSavingAnswer(true)

    try {
      if (isCorrect) {
        showSuccess()
        if (!attemptedThisQuestion) await recordAttempt(childId, `word_${currentWord.id}`, true)
        await onWordAnswered?.(currentWord, true)
        await awardCorrectAnswer(childId)
        setCorrectCount((c) => c + 1)
      } else {
        showRetry()
        if (!attemptedThisQuestion) await recordAttempt(childId, `word_${currentWord.id}`, false)
      }
    } finally {
      setIsSavingAnswer(false)
    }
  }

  function handleNext() {
    if (isSavingAnswer) return
    if (isLastQuestion) {
      onFinished(correctCount)
      return
    }
    setQuestionIndex((i) => i + 1)
    setBuiltOrder([])
    reset()
    setAttemptedThisQuestion(false)
  }

  const isCorrectResult = feedback?.status === 'success'

  return (
    <Card className="p-4 border-2 border-white/80 shadow-xl backdrop-blur-md sm:p-5" style={{ backgroundColor: 'rgba(255,255,255,.2)' }}>
      <div className="flex items-center justify-between mb-4 text-sm text-[var(--color-ink-soft)]">
        <span>
          كلمة {questionIndex + 1} من {words.length}
        </span>
        <span>✅ {correctCount}</span>
      </div>

      <div className="text-center mb-5">
        <EmojiIllustration emoji={currentWord.imageEmoji} className="mx-auto mb-3" />
        <p className="content-scale font-semibold mb-2">{questionText}</p>
        <div className="flex justify-center gap-2">
          <SpeakButton text={questionText} audioId={questionAudioId} size="sm" label="أعد قراءة التعليمات" />
          <SpeakButton text={currentWord.text} audioId={`word:${currentWord.id}`} label="استمع للكلمة" />
        </div>
      </div>

      {/* منطقة البناء */}
      <div
        className="min-h-[64px] flex items-center justify-center gap-2 mb-4 rounded-2xl border-2 border-dashed border-black/10 p-3"
        dir="rtl"
      >
        {builtOrder.length === 0 && (
          <span className="text-[var(--color-ink-soft)] text-sm">اضغط على الحروف بالأسفل بالترتيب</span>
        )}
        {builtOrder.map((idx) => {
          const tile = correctTiles[idx]
          return (
            <span key={idx} className="content-scale text-3xl font-display font-bold">
              {tile.base}
              {tile.diacritics}
            </span>
          )
        })}
      </div>

      {/* الحروف المتاحة */}
      <div className="flex justify-center gap-3 flex-wrap mb-5" dir="rtl">
        {shuffledTiles.map((tile) => {
          const used = builtOrder.includes(tile.originalIndex)
          return (
            <button
              key={tile.originalIndex}
              type="button"
              disabled={used || isComplete}
              onClick={() => handleTileTap(tile)}
              className={`content-scale min-w-[56px] h-16 px-3 rounded-2xl bg-white/90 text-[var(--color-ink)] text-3xl font-display font-bold border-2 border-white shadow-sm transition-all
                ${
                  used
                    ? 'opacity-20 border-black/5'
                    : 'border-black/10 hover:border-[var(--color-sky)] hover:scale-105'
                }`}
            >
              {tile.base}
              {tile.diacritics}
            </button>
          )
        })}
      </div>

      {isCorrectResult && (
        <div className="text-center mb-4">
          <p className="text-xs text-[var(--color-ink-soft)] mb-1">الكلمة كاملة متصلة</p>
          <div className="flex items-center justify-center gap-2">
            <span className="content-scale text-3xl font-display font-extrabold" style={{ color: 'var(--world-words)' }}>
              {currentWord.text}
            </span>
            <SpeakButton text={currentWord.text} audioId={`word:${currentWord.id}`} size="sm" label="استمع للكلمة كاملة" />
          </div>
        </div>
      )}

      {feedback && (
        <div className="mb-4">
          <FeedbackMessage status={feedback.status} message={feedback.message} />
        </div>
      )}

      <div className="flex justify-center gap-3">
        {!isCorrectResult && builtOrder.length > 0 && (
          <Button variant="ghost" onClick={handleReset}>
            امسح 🔄
          </Button>
        )}
        {!isCorrectResult && isComplete && (
          <Button onClick={handleCheck} disabled={isSavingAnswer}>تحقق ✓</Button>
        )}
        {isCorrectResult && (
          <Button onClick={handleNext} disabled={isSavingAnswer}>{isLastQuestion ? 'إنهاء 🏁' : 'الكلمة التالية ←'}</Button>
        )}
      </div>
    </Card>
  )
}
