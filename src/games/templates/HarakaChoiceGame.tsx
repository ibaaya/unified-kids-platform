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
import harakatData from '../../data/harakat.json'
import { HARAKA_LABELS } from '../../data/harakaLabels'
import type { HarakaVariant, HarakaType } from '../../types/content'
import { getVoicePromptText } from '../../utils/voicePromptCatalog'
import { voicePromptAudioId } from '../../utils/voicePromptIds'

const allHarakat = harakatData as HarakaVariant[]

interface HarakaChoiceGameProps {
  harakaType: HarakaType
  childId: number
  childName?: string
  autoRead: boolean
  onFinished: (correctCount: number) => void
}

/**
 * لعبة "استمع واختر الشكل الصحيح": يُنطق شكل الحرف بحركته صوتيًا، والطفل
 * يختار الشكل المكتوب المطابق بين ثلاثة خيارات — يدرّب ربط صوت الحركة
 * بشكلها المكتوب.
 *
 * السلوك الجديد: عند الخطأ، يُعطَّل الخيار الخاطئ فقط، ويستطيع الطفل
 * إعادة المحاولة حتى يختار الصحيح. الإجابة الصحيحة لا تُكشف تلقائياً.
 */
export function HarakaChoiceGame({ harakaType, childId, autoRead, onFinished }: HarakaChoiceGameProps) {
  const questions = useMemo(() => allHarakat.filter((h) => h.haraka === harakaType), [harakaType])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongSoundIds, setWrongSoundIds] = useState<Set<string>>(new Set())
  const [solvedSoundId, setSolvedSoundId] = useState<string | null>(null)
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()

  const currentItem = questions[questionIndex]
  const isLastQuestion = questionIndex === questions.length - 1

  const options = useMemo(() => {
    const distractors = shuffle(
      allHarakat.filter((h) => h.letterId !== currentItem.letterId && h.soundId !== currentItem.soundId),
    ).slice(0, 2)
    return shuffle([currentItem, ...distractors])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem.soundId])

  const promptText = getVoicePromptText('harakat', 'haraka-choice', { harakaLabel: HARAKA_LABELS[harakaType] })
  const promptAudioId = voicePromptAudioId('harakat', 'haraka-choice', harakaType)
  useAutoReadQuestion(promptText, autoRead, questionIndex, 500, currentItem.form, promptAudioId, `haraka:${currentItem.soundId}`)

  async function handlePick(option: HarakaVariant) {
    // لا تفعل شيئاً إذا تم حل السؤال بالفعل، أو إذا كان الخيار معطلاً
    if (solvedSoundId !== null || isSavingAnswer) return
    if (wrongSoundIds.has(option.soundId)) return

    const isCorrect = option.soundId === currentItem.soundId

    if (isCorrect) {
      setSolvedSoundId(option.soundId)
      showSuccess()
    } else {
      // أضف الخيار إلى قائمة الخاطئة فقط، ولا تكشف الإجابة الصحيحة
      setWrongSoundIds((prev) => new Set(prev).add(option.soundId))
      showRetry()
    }
    setIsSavingAnswer(true)
    try {
      await recordAttempt(childId, `haraka_${harakaType}`, isCorrect)
      if (isCorrect) {
        await awardCorrectAnswer(childId)
        setCorrectCount((c) => c + 1)
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
    setWrongSoundIds(new Set())
    setSolvedSoundId(null)
    reset()
  }

  return (
    <Card className="p-6 border-2 border-white/80 shadow-xl backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,.18)' }}>
      <div className="flex items-center justify-between mb-4 text-sm text-[var(--color-ink-soft)]">
        <span>
          سؤال {questionIndex + 1} من {questions.length}
        </span>
        <span>✅ {correctCount}</span>
      </div>

      <div className="text-center mb-5">
        <p className="content-scale font-semibold mb-2">
          {promptText} 🎧
        </p>
        <div className="flex justify-center gap-2" dir="rtl">
          <SpeakButton text={currentItem.form} audioId={`haraka:${currentItem.soundId}`} label="أعد الاستماع" />
          <SpeakButton text={promptText} audioId={promptAudioId} size="sm" label="أعد قراءة التعليمات" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {options.map((option) => {
          const isWrong = wrongSoundIds.has(option.soundId)
          const isSolved = solvedSoundId === option.soundId

          return (
            <button
              key={option.soundId}
              type="button"
              disabled={isWrong || solvedSoundId !== null || isSavingAnswer}
              onClick={() => handlePick(option)}
              className={`content-scale flex flex-col items-center gap-1 p-4 rounded-2xl border-2 border-white/80 bg-white/55 backdrop-blur-sm transition-all
                ${
                  isSolved
                    ? 'border-[var(--color-leaf)] bg-[var(--color-leaf)]/10'
                    : isWrong
                      ? 'border-black/10 opacity-40 cursor-not-allowed'
                      : 'border-black/10 hover:border-[var(--color-sky)] hover:scale-105'
                }`}
            >
              <HighlightedWord
                text={option.form}
                letterId={option.letterId}
                position="start"
                className="text-3xl"
              />
            </button>
          )
        })}
      </div>

      {feedback && (
        <div className="mb-4">
          <FeedbackMessage status={feedback.status} message={feedback.message} />
        </div>
      )}

      {solvedSoundId && (
        <div className="flex justify-center">
          <Button onClick={handleNext} disabled={isSavingAnswer}>{isLastQuestion ? 'إنهاء 🏁' : 'التالي ←'}</Button>
        </div>
      )}
    </Card>
  )
}
