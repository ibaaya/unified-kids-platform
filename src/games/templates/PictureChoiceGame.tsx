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
import type { Word } from '../../types/content'
import { getVoicePromptText } from '../../utils/voicePromptCatalog'
import { voicePromptAudioId } from '../../utils/voicePromptIds'
import wordsData from '../../data/words.json'
import { findHighlightIndex, tokenizeArabicWord } from '../../utils/arabicText'
import { EmojiIllustration } from '../../components/ui/EmojiIllustration'

type Mode = 'listen' | 'visual'

interface PictureChoiceGameProps {
  letterId: string
  letterName: string
  words: Word[] // كلمات الحرف الثلاث — كل واحدة تصبح سؤالًا بدورها
  childId: number
  childName?: string
  autoRead: boolean
  mode: Mode
  onFinished: (correctCount: number) => void
}

const allWords = wordsData as Word[]

/**
 * قالب واحد، وضعان مختلفان تمامًا في التجربة:
 * - listen: يُنطق اسم الكلمة صوتيًا فقط (بدون نص)، والطفل يختار الصورة المطابقة
 *   → يدرّب الاستماع والتمييز الصوتي.
 * - visual: يُعرض الحرف كبيرًا بدون صوت، والطفل يختار الصورة التي كلمتها تحوي هذا الحرف
 *   → يدرّب الربط البصري بين الحرف والمعنى.
 */
export function PictureChoiceGame({
  letterId,
  letterName,
  words,
  childId,
  //childName,
  autoRead,
  mode,
  onFinished,
}: PictureChoiceGameProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()

  const currentWord = words[questionIndex]
  const isLastQuestion = questionIndex === words.length - 1

  const options = useMemo(() => {
    const candidates = allWords.filter((word) => {
      if (word.id === currentWord.id || word.imageEmoji === currentWord.imageEmoji) return false
      if (mode === 'listen') return word.letterId !== letterId

      // In visual mode, distractors must not contain the target letter anywhere.
      // Use the app's Arabic normalization (for example, أ/إ/آ count as ا).
      return findHighlightIndex(tokenizeArabicWord(word.text), letterId, word.position) === -1
    })
    const usedEmojis = new Set([currentWord.imageEmoji])
    const distractors = shuffle(candidates).filter((word) => {
      if (usedEmojis.has(word.imageEmoji)) return false
      usedEmojis.add(word.imageEmoji)
      return true
    }).slice(0, 2)
    return shuffle([currentWord, ...distractors])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord.id, currentWord.imageEmoji, letterId, mode])

  // في وضع "استمع" السؤال نفسه هو نطق الكلمة، وفي "طابق الصورة" السؤال جملة توجيهية
  const questionText = mode === 'listen'
    ? getVoicePromptText('letters', 'listen-picture')
    : getVoicePromptText('letters', 'find-letter-picture', { letterName })
  const questionAudioId = mode === 'listen'
    ? voicePromptAudioId('letters', 'listen-picture')
    : voicePromptAudioId('letters', 'find-letter-picture', letterId)
  useAutoReadQuestion(
    questionText,
    autoRead,
    questionIndex,
    500,
    mode === 'listen' ? currentWord.text : undefined,
    questionAudioId,
    mode === 'listen' ? `word:${currentWord.id}` : undefined,
  )

  async function handlePick(option: Word) {
    if (selectedId || isSavingAnswer) return
    const isCorrect = option.id === currentWord.id
    setSelectedId(option.id)
    reset()
    if (isCorrect) {
      showSuccess()
    } else {
      showRetry()
    }
    setIsSavingAnswer(true)
    try {
      await recordAttempt(childId, `letter_${letterId}`, isCorrect)
      if (isCorrect) {
        await awardCorrectAnswer(childId)
        setCorrectCount((c) => c + 1)
      } else {
        setSelectedId(null)
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
    setSelectedId(null)
    reset()
  }

  return (
    <Card className="border border-white/80 p-4 pt-10 shadow-xl backdrop-blur-md sm:px-6 sm:pb-6 sm:pt-12" style={{ background: 'rgba(255,255,255,.15)' }}>
      <div className="flex items-center justify-between mb-4 text-sm text-[var(--color-ink-soft)]">
        <span>
          سؤال {questionIndex + 1} من {words.length}
        </span>
        <span>✅ {correctCount}</span>
      </div>

      <div className="text-center mb-5">
        {mode === 'listen' ? (
          <>
            <p className="content-scale font-semibold mb-2">{questionText} 🎧</p>
            <div className="flex justify-center gap-2">
              <SpeakButton text={questionText} audioId={questionAudioId} size="sm" label="أعد قراءة التعليمات" />
              <SpeakButton text={currentWord.text} audioId={`word:${currentWord.id}`} label="أعد الاستماع" />
            </div>
          </>
        ) : (
          <>
            <p className="content-scale font-semibold mb-2">{questionText}</p>
            <div
              className="content-scale inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl font-display font-extrabold text-white"
              style={{ backgroundColor: 'var(--world-letters)' }}
            >
              {letterId}
            </div>
            <div className="mt-1">
              <SpeakButton text={questionText} audioId={questionAudioId} size="sm" label="أعد قراءة السؤال" />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {options.map((option) => {
          const isSelected = selectedId === option.id
          const isCorrectOption = option.id === currentWord.id
          const showState = selectedId !== null
          return (
            <button
              key={option.id}
              type="button"
              disabled={selectedId !== null || isSavingAnswer}
              onClick={() => handlePick(option)}
              className={`content-scale flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all
                ${
                    feedback?.status === 'success' && isCorrectOption
                    ? 'border-[var(--color-leaf)] bg-[var(--color-leaf)]/10'
                    : showState && isSelected
                      ? 'border-white/80 bg-white/15 opacity-50'
                      : 'border-white/90 bg-white/20 backdrop-blur-sm hover:border-[var(--color-sky)] hover:scale-105'
                }`}
            >
              <EmojiIllustration emoji={option.imageEmoji} size="card" />
              {mode === 'visual' && (
                <span className="flex items-center justify-center gap-1">
                  <HighlightedWord
                    text={option.text}
                    letterId={option.letterId}
                    position={option.position}
                    className="text-base font-bold"
                  />
                  <SpeakButton text={option.text} audioId={`word:${option.id}`} size="sm" label={`اِسْتَمِعْ إِلَى كَلِمَةِ ${option.text}`} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {selectedId && feedback?.status === 'success' && (
        <div className="text-center mb-4">
          <p className="text-xs text-[var(--color-ink-soft)] mb-1">الكلمة كاملة</p>
          <div className="flex items-center justify-center gap-2">
            <HighlightedWord
              text={currentWord.text}
              letterId={currentWord.letterId}
              position={currentWord.position}
              className="content-scale text-3xl"
            />
            <SpeakButton text={currentWord.text} audioId={`word:${currentWord.id}`} size="sm" label="استمع للكلمة كاملة" />
          </div>
        </div>
      )}

      {feedback && (
        <div className="mb-4">
          <FeedbackMessage status={feedback.status} message={feedback.message} />
        </div>
      )}

      {selectedId && feedback?.status === 'success' && (
        <div className="flex justify-center">
          <Button onClick={handleNext}>{isLastQuestion ? 'إنهاء 🏁' : 'التالي ←'}</Button>
        </div>
      )}
    </Card>
  )
}
