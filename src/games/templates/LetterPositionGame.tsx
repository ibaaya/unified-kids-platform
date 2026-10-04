import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { HighlightedWord } from '../../components/ui/HighlightedWord'
import { FeedbackMessage } from '../../components/feedback/FeedbackMessage'
import { tokenizeArabicWord, findHighlightIndex } from '../../utils/arabicText'
import { recordAttempt } from '../../engine/masteryEngine'
import { awardCorrectAnswer } from '../../engine/rewardsEngine'
import { useAutoReadQuestion } from '../../hooks/useAutoReadQuestion'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import type { Word } from '../../types/content'
import { getVoicePromptText } from '../../utils/voicePromptCatalog'
import { voicePromptAudioId } from '../../utils/voicePromptIds'
import { EmojiIllustration } from '../../components/ui/EmojiIllustration'

interface LetterPositionGameProps {
  letterId: string
  letterName: string
  words: Word[] // كلمات الحرف الثلاث (أول/وسط/آخر)
  childId: number
  childName?: string
  autoRead: boolean
  onFinished: (correctCount: number) => void
}

/**
 * لعبة "أين الحرف؟": تُعرض كلمة (مسموعة + مرئية)، ويضغط الطفل على المقطع
 * (حرف + حركته) الذي يظن أنه الحرف المستهدف. تُسجَّل كل محاولة في محرك
 * الإتقان، وتُمنح نقاط عند الإجابة الصحيحة، ونجمة عند إنهاء اللعبة كاملة.
 */
export function LetterPositionGame({
  letterId,
  letterName,
  words,
  childId,
  //childName,
  autoRead,
  onFinished,
}: LetterPositionGameProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()

  const currentWord = words[questionIndex]
  const tokens = useMemo(() => tokenizeArabicWord(currentWord.text), [currentWord.text])
  const correctIndex = useMemo(
    () => findHighlightIndex(tokens, letterId, currentWord.position),
    [tokens, letterId, currentWord.position],
  )

  const questionText = getVoicePromptText('letters', 'letter-position', { letterName })
  const questionAudioId = voicePromptAudioId('letters', 'letter-position', letterId)
  useAutoReadQuestion(questionText, autoRead, questionIndex, 500, currentWord?.text, questionAudioId, currentWord ? `word:${currentWord.id}` : undefined)

  const isLastQuestion = questionIndex === words.length - 1

  async function handleTileTap(tappedIndex: number) {
    if (answered || isSavingAnswer) return
    const isCorrect = tappedIndex === correctIndex
    setIsSavingAnswer(true)
    if (isCorrect) {
      setAnswered(true)
      showSuccess()
    } else {
      showRetry()
    }

    try {
      await recordAttempt(childId, `letter_${letterId}`, isCorrect)
      if (isCorrect) {
        await awardCorrectAnswer(childId)
        setCorrectCount((c) => c + 1)
      }
    } finally {
      setIsSavingAnswer(false)
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      onFinished(correctCount)
      return
    }
    setQuestionIndex((i) => i + 1)
    setAnswered(false)
    reset()
  }

  return (
    <Card className="relative isolate overflow-hidden rounded-[2rem] border-2 border-white/85 p-4 pt-10 shadow-[0_22px_55px_rgba(12,80,112,.24),inset_0_1px_0_rgba(255,255,255,.7)] backdrop-blur-md sm:px-6 sm:pb-6 sm:pt-12" style={{ background: 'linear-gradient(140deg, rgba(255,255,255,.24), rgba(226,249,255,.18))' }}>
      <div className="mb-4 flex items-center justify-between text-sm font-extrabold text-[var(--color-ink)] sm:mb-5">
        <span>
          سؤال {questionIndex + 1} من {words.length}
        </span>
        <span>✅ {correctCount}</span>
      </div>

      <div className="text-center">
        <p className="mb-1 text-2xl font-extrabold leading-relaxed sm:text-4xl">
          {questionText.split(letterName)[0]}
          <span className="px-1 text-3xl font-black sm:text-4xl" style={{ color: 'var(--world-letters)', textShadow: '0 1px 0 rgba(255,255,255,.9)' }}>{letterName}</span>
          {questionText.split(letterName).slice(1).join(letterName)}
        </p>
        <SpeakButton text={questionText} audioId={questionAudioId} label="أعد قراءة السؤال" />
      </div>

      <div className="my-3 flex justify-center sm:my-4">
        <EmojiIllustration emoji={currentWord.imageEmoji} size="large" />
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-2 sm:mt-3 sm:gap-3" dir="rtl">
        {tokens.map((token, idx) => {
          const isSelected = answered && idx === correctIndex
          const isWrongSelected = answered && idx !== correctIndex
          return (
            <button
              key={idx}
              type="button"
              disabled={answered || isSavingAnswer}
              onClick={() => handleTileTap(idx)}
              className={`h-20 min-w-[76px] rounded-2xl border-2 px-3 text-6xl font-display font-bold shadow-md transition-all sm:h-24 sm:min-w-[100px] sm:px-4 sm:text-7xl
                ${
                  isSelected
                    ? 'border-[var(--color-leaf)] bg-[var(--color-leaf)]/15'
                    : isWrongSelected
                      ? 'border-white/80 bg-white/20 opacity-50'
                      : 'border-white/90 bg-white/25 backdrop-blur-sm hover:border-[var(--color-sky)] hover:scale-105'
                }`}
            >
              {token.base}
              {token.diacritics}
            </button>
          )
        })}
      </div>

      {answered && feedback?.status === 'success' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-sky-950/20 p-4 backdrop-blur-[3px] sm:p-6" role="dialog" aria-label="نتيجة الإجابة">
          <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-white via-sky-50 to-amber-50 px-5 py-4 text-center shadow-[0_20px_55px_rgba(9,53,78,.35)] sm:gap-4 sm:px-8 sm:py-6">
            <div className="flex items-center justify-center gap-3">
              <HighlightedWord
                text={currentWord.text}
                letterId={letterId}
                position={currentWord.position}
                className="text-5xl font-extrabold sm:text-7xl"
              />
              <SpeakButton text={currentWord.text} size="sm" label="استمع للكلمة كاملة" />
            </div>
            <FeedbackMessage status={feedback.status} message={feedback.message} />
            <Button onClick={handleNext}>{isLastQuestion ? 'إنهاء اللعبة 🏁' : 'التالي ←'}</Button>
          </div>
        </div>
      )}
      {feedback?.status === 'retry' && (
        <div className="mt-4"><FeedbackMessage status={feedback.status} message={feedback.message} /></div>
      )}
    </Card>
  )
}
