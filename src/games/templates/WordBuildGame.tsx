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

// ألوان لطيفة للحروف (ثابتة حسب موضع الحرف الأصلي)
const TILE_COLORS = [
  { bg: '#FFE0E6', border: '#FF8FA3', text: '#C9184A' },
  { bg: '#E0F2FF', border: '#7CC4FA', text: '#0B6BAE' },
  { bg: '#E6FFE0', border: '#8FE38F', text: '#2E7D32' },
  { bg: '#FFF4D6', border: '#FFCC66', text: '#B26A00' },
  { bg: '#F0E6FF', border: '#B18CFF', text: '#6A1B9A' },
  { bg: '#FFE8D6', border: '#FFA26B', text: '#C2410C' },
  { bg: '#D6FFF9', border: '#5EDCCB', text: '#00796B' },
  { bg: '#FFE6F5', border: '#FF8FD4', text: '#AD1457' },
]

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

  function tileColor(tile: Tile) {
    return TILE_COLORS[tile.originalIndex % TILE_COLORS.length]
  }

  function handleTileTap(tile: Tile) {
    if (builtOrder.includes(tile.originalIndex)) return
    if (isComplete) return
    setBuiltOrder((prev) => [...prev, tile.originalIndex])
  }

  function handleReset() {
    setBuiltOrder([])
    reset()
  }

  /* async function handleCheck() {
    if (isSavingAnswer) return
    const isCorrect = builtOrder.every((idx, i) => idx === i)
    setAttemptedThisQuestion(true)

    if (isCorrect) {
      // ابدأ تسجيل التشجيع مباشرة من نقرة الطفل، كما في لعبة الحركات.
      showSuccess()
      setCorrectCount((count) => count + 1)
      setIsSavingAnswer(true)
      try {
        if (!attemptedThisQuestion) await recordAttempt(childId, `word_${currentWord.id}`, true)
        await onWordAnswered?.(currentWord, true)
        await awardCorrectAnswer(childId)
      } finally {
        setIsSavingAnswer(false)
      }
      return
    }

    showRetry()
    setIsSavingAnswer(true)
    try {
      if (!attemptedThisQuestion) await recordAttempt(childId, `word_${currentWord.id}`, false)
    } finally {
      setIsSavingAnswer(false)
    }
    } */

      async function handleCheck() {
    if (isSavingAnswer) return
    const isCorrect = builtOrder.every((idx, i) => idx === i)
    setAttemptedThisQuestion(true)

    if (isCorrect) {
      showSuccess()
      setCorrectCount((count) => count + 1)

      // ✅ أخّر العمليات الـ async 1.5 ثانية حتى لا تتداخل مع صوت التشجيع
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSavingAnswer(true)
      try {
        if (!attemptedThisQuestion) await recordAttempt(childId, `word_${currentWord.id}`, true)
        await onWordAnswered?.(currentWord, true)
        await awardCorrectAnswer(childId)
      } finally {
        setIsSavingAnswer(false)
      }
      return
    }

    showRetry()
    setIsSavingAnswer(true)
    try {
      if (!attemptedThisQuestion) await recordAttempt(childId, `word_${currentWord.id}`, false)
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
      <div className="flex items-center justify-between mb-4 text-base font-bold text-[var(--color-ink-soft)]">
        <span>
          كلمة {questionIndex + 1} من {words.length}
        </span>
        <span>✅ {correctCount}</span>
      </div>

      <div className="text-center mb-5">
        <EmojiIllustration emoji={currentWord.imageEmoji} className="mx-auto mb-3" />
        {/* السؤال — مكبّر بـ content-scale-lg */}
        <p className="content-scale-lg mb-3 font-extrabold leading-relaxed">{questionText}</p>
        <div className="flex justify-center gap-2">
          <SpeakButton text={questionText} audioId={questionAudioId} size="sm" label="أعد قراءة التعليمات" />
          <SpeakButton text={currentWord.text} audioId={`word:${currentWord.id}`} label="استمع للكلمة" />
        </div>
      </div>

      {/* منطقة البناء */}
      <div
        className="min-h-20 flex items-center justify-center gap-3 mb-4 rounded-2xl border-2 border-dashed border-black/10 p-4"
        dir="rtl"
      >
        {builtOrder.length === 0 && (
          <span className="content-scale-lg font-semibold text-[var(--color-ink-soft)]">اضغط على الحروف بالأسفل بالترتيب</span>
        )}
        {builtOrder.map((idx) => {
          const tile = correctTiles[idx]
          const color = tileColor(tile)
          return (
            <span
              key={idx}
              className="content-scale-xl flex items-center justify-center min-w-14 h-16 px-2 rounded-xl font-display font-extrabold sm:min-w-16 sm:h-20"
              style={{ backgroundColor: color.bg, border: `2px solid ${color.border}`, color: color.text }}
            >
              {tile.base}
              {tile.diacritics}
            </span>
          )
        })}
      </div>

      {/* الحروف المتاحة — مكبّرة وملونة */}
      <div className="flex justify-center gap-3 flex-wrap mb-5" dir="rtl">
        {shuffledTiles.map((tile) => {
          const used = builtOrder.includes(tile.originalIndex)
          const color = tileColor(tile)
          return (
            <button
              key={tile.originalIndex}
              type="button"
              disabled={used || isComplete}
              onClick={() => handleTileTap(tile)}
              className={`content-scale-xl min-w-16 h-20 px-4 rounded-2xl font-display font-extrabold shadow-sm transition-all sm:min-w-[4.5rem] sm:h-24
                ${used ? 'opacity-20' : 'hover:scale-105'}`}
              style={{
                backgroundColor: used ? '#f3f4f6' : color.bg,
                border: `2px solid ${used ? '#e5e7eb' : color.border}`,
                color: used ? '#9ca3af' : color.text,
              }}
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
            <span className="content-scale-xl font-display font-extrabold" style={{ color: 'var(--world-words)' }}>
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
