import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { HighlightedWord } from '../../components/ui/HighlightedWord'
import { FeedbackMessage } from '../../components/feedback/FeedbackMessage'
import { shuffle } from '../../utils/distractors'
import { useAutoReadQuestion } from '../../hooks/useAutoReadQuestion'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { recordAttempt } from '../../engine/masteryEngine'
import { awardCorrectAnswer } from '../../engine/rewardsEngine'
import syllablesData from '../../data/syllables.json'
import type { Syllable, SyllableType } from '../../types/content'
import { getVoicePromptText } from '../../utils/voicePromptCatalog'
import { voicePromptAudioId } from '../../utils/voicePromptIds'

const allSyllables = syllablesData as Syllable[]

interface SyllableChoiceGameProps {
  letterId: string
  syllableType: SyllableType
  childId: number
  childName?: string
  autoRead: boolean
  onFinished: (correctCount: number) => void
}

/**
 * لعبة "استمع واختر المقطع الصحيح": يُنطق المقطع (حرف + حركته)، والطفل
 * يختار شكله المكتوب بين ثلاثة خيارات.
 */
export function SyllableChoiceGame({
  letterId,
  syllableType,
  childId,
  //childName,
  autoRead,
  onFinished,
}: SyllableChoiceGameProps) {
  const questions = useMemo(
    () => allSyllables.filter((s) => s.letterId === letterId && s.type === syllableType),
    [letterId, syllableType],
  )
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()

  const currentItem = questions[questionIndex]
  const isLastQuestion = questionIndex === questions.length - 1

  const options = useMemo(() => {
    const distractors = shuffle(
      allSyllables.filter((s) => s.type === syllableType && s.letterId !== letterId),
    ).slice(0, 2)
    return shuffle([currentItem, ...distractors])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem?.id])

  const promptText = getVoicePromptText('syllables', 'syllable-choice')
  const promptAudioId = voicePromptAudioId('syllables', 'syllable-choice')
  useAutoReadQuestion(
    promptText,
    autoRead && Boolean(currentItem),
    questionIndex,
    500,
    currentItem?.text,
    promptAudioId,
    currentItem ? `syllable:${currentItem.id}` : undefined,
  )

  if (!currentItem) return null

  async function handlePick(option: Syllable) {
    if (selectedId || isSavingAnswer) return
    const isCorrect = option.id === currentItem.id
    setSelectedId(option.id)
    if (isCorrect) {
      showSuccess()
    } else {
      showRetry()
    }
    setIsSavingAnswer(true)
    try {
      await recordAttempt(childId, `syllable_${currentItem.id}`, isCorrect)
      if (isCorrect) {
        await awardCorrectAnswer(childId)
        setCorrectCount((c) => c + 1)
      } else {
        // الخطأ لا يكشف المقطع الصحيح؛ أعد تفعيل الخيارات للمحاولة التالية.
        setSelectedId(null)
      }
    } finally {
      setIsSavingAnswer(false)
    }
  }

  function handleNext() {
    if (isSavingAnswer || !selectedId || feedback?.status !== 'success') return
    if (isLastQuestion) {
      onFinished(correctCount)
      return
    }
    setQuestionIndex((i) => i + 1)
    setSelectedId(null)
    reset()
  }

  return (
    <Card className="border border-white/85 p-4 pt-10 shadow-2xl backdrop-blur-md sm:px-6 sm:pb-6 sm:pt-12" style={{ background: 'rgba(255,255,255,.16)' }}>
      <div className="flex items-center justify-between mb-4 text-sm text-[var(--color-ink-soft)]">
        <span>
          سؤال {questionIndex + 1} من {questions.length}
        </span>
        <span>✅ {correctCount}</span>
      </div>

      <div className="text-center mb-5">
        <p className="content-scale font-semibold mb-2">{promptText} 🎧</p>
        <div className="flex justify-center gap-2" dir="rtl">
          <SpeakButton text={currentItem.text} audioId={`syllable:${currentItem.id}`} label="أعد الاستماع" />
          <SpeakButton text={promptText} audioId={promptAudioId} size="sm" label="أعد قراءة التعليمات" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {options.map((option) => {
          const isSelected = selectedId === option.id
          const isCorrectOption = option.id === currentItem.id
          const showState = selectedId !== null
          return (
            <button
              key={option.id}
              type="button"
              disabled={selectedId !== null || isSavingAnswer}
              onClick={() => handlePick(option)}
              className={`content-scale flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all
                ${
                    feedback?.status === 'success' && isCorrectOption
                    ? 'border-[var(--color-leaf)] bg-[var(--color-leaf)]/10'
                    : showState && isSelected
                      ? 'border-white/80 bg-white/15 opacity-50'
                      : 'border-white/90 bg-white/20 backdrop-blur-sm hover:border-[var(--color-sky)] hover:scale-105'
                }`}
            >
              <HighlightedWord text={option.text} letterId={option.letterId} position="start" className="text-3xl" highlightMadd={syllableType === 'madd'} />
            </button>
          )
        })}
      </div>

      {feedback && (
        <div className="mb-4">
          <FeedbackMessage status={feedback.status} message={feedback.message} />
        </div>
      )}

      {selectedId && feedback?.status === 'success' && (
        <div className="flex justify-center">
          <Button onClick={handleNext} disabled={isSavingAnswer}>{isLastQuestion ? 'إنهاء 🏁' : 'التالي ←'}</Button>
        </div>
      )}
    </Card>
  )
}
