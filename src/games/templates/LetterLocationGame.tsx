import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { HighlightedWord } from '../../components/ui/HighlightedWord'
import { FeedbackMessage } from '../../components/feedback/FeedbackMessage'
import { useAutoReadQuestion } from '../../hooks/useAutoReadQuestion'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { recordAttempt } from '../../engine/masteryEngine'
import { awardCorrectAnswer } from '../../engine/rewardsEngine'
import { shuffle } from '../../utils/distractors'
import { getLetterPositionsInWord } from '../../utils/arabicText'
import { getVoicePromptText } from '../../utils/voicePromptCatalog'
import { voicePromptAudioId } from '../../utils/voicePromptIds'
import { EmojiIllustration } from '../../components/ui/EmojiIllustration'
import type { Letter, Word } from '../../types/content'
import type { LetterPosition } from '../../utils/arabicText'

const POSITION_OPTIONS: Array<{ id: LetterPosition; label: string; emoji: string }> = [
  { id: 'start', label: 'أول الكلمة', emoji: '🚀' },
  { id: 'middle', label: 'وسط الكلمة', emoji: '🧩' },
  { id: 'end', label: 'آخر الكلمة', emoji: '🏁' },
]

interface LetterLocationGameProps {
  letter: Letter
  words: Word[]
  childId: number
  autoRead: boolean
  onFinished: (correct: number, total: number) => void
}

export function LetterLocationGame({ letter, words, childId, autoRead, onFinished }: LetterLocationGameProps) {
  const questions = useMemo(() => {
    const unambiguousWords = words.filter((word) => {
      const positions = getLetterPositionsInWord(word.text, letter.id)
      return positions.length === 1 && positions[0] === word.position
    })

    return POSITION_OPTIONS
      .map(({ id }) => shuffle(unambiguousWords.filter((word) => word.position === id))[0])
      .filter((word): word is Word => Boolean(word))
  }, [letter.id, words])

  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedPosition, setSelectedPosition] = useState<LetterPosition | null>(null)
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()
  const currentWord = questions[questionIndex]

  const questionText = getVoicePromptText('letters', 'letter-position', { letterName: letter.name })
  const questionAudioId = voicePromptAudioId('letters', 'letter-position', letter.id)
  useAutoReadQuestion(
    questionText,
    autoRead && Boolean(currentWord),
    currentWord?.id ?? questionIndex,
    500,
    currentWord?.text,
    questionAudioId,
    currentWord ? `word:${currentWord.id}` : undefined,
  )

  if (!currentWord) {
    return (
      <Card className="p-6 text-center">
        <p className="font-bold mb-3">لا توجد كلمات صالحة للاختبار لهذا الحرف حتى الآن.</p>
        <Button onClick={() => onFinished(0, 0)}>العودة</Button>
      </Card>
    )
  }

  const isLastQuestion = questionIndex === questions.length - 1

  async function handleChoice(position: LetterPosition) {
    if (selectedPosition || isSavingAnswer) return
    const isCorrect = position === currentWord.position
    setSelectedPosition(position)
    setIsSavingAnswer(true)
    try {
      if (isCorrect) {
        showSuccess()
        await recordAttempt(childId, `letter_location_${letter.id}_${currentWord.position}`, true)
        await awardCorrectAnswer(childId)
        setCorrectCount((count) => count + 1)
      } else {
        showRetry()
        await recordAttempt(childId, `letter_location_${letter.id}_${currentWord.position}`, false)
      }
    } finally {
      setIsSavingAnswer(false)
    }
  }

  function handleRetry() {
    if (isSavingAnswer) return
    setSelectedPosition(null)
    reset()
  }

  function handleNext() {
    if (isSavingAnswer) return
    if (isLastQuestion) {
      onFinished(correctCount, questions.length)
      return
    }
    setQuestionIndex((index) => index + 1)
    setSelectedPosition(null)
    reset()
  }

  return (
    <Card className="p-4 border-2 border-white/80 shadow-xl backdrop-blur-md text-center sm:p-5" style={{ backgroundColor: 'rgba(255,255,255,.2)' }}>
      <div className="flex justify-between items-center text-sm text-[var(--color-ink-soft)] mb-5">
        <span>السؤال {questionIndex + 1} من {questions.length}</span>
        <span>⭐ {correctCount}</span>
      </div>

      <EmojiIllustration emoji={currentWord.imageEmoji} size="large" className="mx-auto mb-5" />
      <div className="flex items-center justify-center gap-2 mb-2">
        <HighlightedWord
          text={currentWord.text}
          letterId={letter.id}
          position={currentWord.position}
          className="content-scale text-4xl font-extrabold"
        />
        <SpeakButton text={currentWord.text} audioId={`word:${currentWord.id}`} label="استمع إلى الكلمة" />
      </div>
      <div className="flex items-center justify-center gap-2 mb-6">
        <p className="font-bold text-[var(--color-ink-soft)]">{questionText}</p>
        <SpeakButton text={questionText} audioId={questionAudioId} size="sm" label="أعد قراءة السؤال" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label="اختر موضع الحرف في الكلمة">
        {POSITION_OPTIONS.map((option) => {
          const isCorrectOption = option.id === currentWord.position
          const isChosen = selectedPosition === option.id
          const stateClass = selectedPosition && isCorrectOption
            ? 'border-[var(--color-leaf)] bg-[var(--color-leaf)]/15'
            : isChosen
              ? 'border-[var(--color-amber)] bg-[var(--color-amber)]/20'
              : 'border-black/10 bg-white hover:border-[var(--color-sky)] hover:-translate-y-1'
          return (
            <button
              key={option.id}
              type="button"
              disabled={selectedPosition !== null}
              onClick={() => void handleChoice(option.id)}
              className={`min-h-24 rounded-3xl border-2 p-4 transition-all flex flex-col items-center justify-center gap-1 disabled:cursor-default ${stateClass}`}
            >
              <span className="text-3xl" aria-hidden="true">{option.emoji}</span>
              <span className="font-extrabold">{option.label}</span>
            </button>
          )
        })}
      </div>

      {feedback && <div className="mt-5"><FeedbackMessage status={feedback.status} message={feedback.message} /></div>}

      {selectedPosition && (
        <div className="mt-5">
          {feedback?.status === 'success' ? (
            <Button size="lg" onClick={handleNext} disabled={isSavingAnswer}>{isLastQuestion ? 'إنهاء الاختبار 🎉' : 'السؤال التالي ←'}</Button>
          ) : (
            <Button variant="secondary" onClick={handleRetry} disabled={isSavingAnswer}>حاول مرة أخرى 🔁</Button>
          )}
        </div>
      )}
    </Card>
  )
}
