/**
 * HarakaWorldGame.tsx  ·  src/games/templates/HarakaWorldGame.tsx
 * ════════════════════════════════════════════════════════════════
 * لعبة عالم الحركات والمقاطع الموحّدة.
 * تحل محل HarakaChoiceGame و SyllableChoiceGame تمامًا.
 *
 * كل سؤال يعرض:
 *  • الكلمة المثال مع تمييز المقطع المستهدف بلون
 *  • نص السؤال منطوقًا (زر استماع)
 *  • 4 خيارات — الخاطئ يُعطَّل فقط (لا يُكشف الصح تلقائيًا)
 *  • تغذية راجعة فورية
 */

import { useMemo, useState, useCallback } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { FeedbackMessage } from '../../components/feedback/FeedbackMessage'
import { shuffle } from '../../utils/distractors'
import { useAutoReadQuestion } from '../../hooks/useAutoReadQuestion'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { recordAttempt } from '../../engine/masteryEngine'
import { awardCorrectAnswer } from '../../engine/rewardsEngine'
import { HARAKAT_WORLD_MAP, harakaWorldSoundId } from '../../data/harakatWorld'
import type { HarakaWorldId, HarakaQuestion } from '../../data/harakatWorld'
import { stripEmojiForSpeech } from '../../utils/arabicSpeech'

// ─── مكوّن تمييز المقطع ──────────────────────────────────────────────────────

interface HighlightedWordProps {
  word: string
  highlight: string
  color: string
}

function HighlightedWord({ word, highlight, color }: HighlightedWordProps) {
  const idx = word.indexOf(highlight)
  if (idx === -1) {
    return <span className="font-display font-black text-[clamp(2.5rem,9vw,4.5rem)] text-[var(--color-ink)]">{word}</span>
  }
  return (
    <span className="font-display font-black text-[clamp(2.5rem,9vw,4.5rem)] text-[var(--color-ink)]">
      {word.slice(0, idx)}
      <span
        style={{
          color,
          textDecoration: 'underline',
          textDecorationColor: color,
          textDecorationThickness: '3px',
          textUnderlineOffset: '5px',
        }}
      >
        {word.slice(idx, idx + highlight.length)}
      </span>
      {word.slice(idx + highlight.length)}
    </span>
  )
}

// ─── الواجهة الرئيسية ─────────────────────────────────────────────────────────

interface HarakaWorldGameProps {
  harakaId: HarakaWorldId
  childId: number
  autoRead: boolean
  onFinished: (correctCount: number, total: number) => void
}

export function HarakaWorldGame({ harakaId, childId, autoRead, onFinished }: HarakaWorldGameProps) {
  const entry = HARAKAT_WORLD_MAP.get(harakaId)!
  const questions = useMemo(() => shuffle([...entry.questions]), [harakaId])

  const [qIndex, setQIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [disabledOptions, setDisabledOptions] = useState<Set<string>>(new Set())
  const [solved, setSolved] = useState(false)
  const [saving, setSaving] = useState(false)
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()

  const current: HarakaQuestion = questions[qIndex]
  const isLast = qIndex === questions.length - 1

  // اربط الصورة والكلمة بسياق السؤال فقط؛ لا تعرض مثالًا عشوائيًا مضللًا.
  const exampleForQ = useMemo(() => {
    const normalize = (value: string) => stripEmojiForSpeech(value)
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
      .replace(/["'“”؟،.,:؛!]/g, '')
      .replace(/\s+/g, '')
    const context = normalize(`${current.prompt} ${current.speechText}`)
    return entry.examples.find((example) => {
      const word = normalize(example.word)
      return word.length >= 3 && context.includes(word)
    })
  }, [current, entry])
  const exampleIndex = exampleForQ ? entry.examples.indexOf(exampleForQ) : -1

  // الخيارات مُخلوطة — تُعاد خلطها مع كل سؤال
  const options = useMemo(() => shuffle([...current.options]), [current.id])

  const audioId = `harakaworld_v2_q_${current.id}`
  const spokenPrompt = stripEmojiForSpeech(current.speechText)

  useAutoReadQuestion(
    spokenPrompt,
    autoRead,
    qIndex,
    400,
    undefined,
    audioId,
  )

  const handlePick = useCallback(
    async (option: string) => {
      if (solved || saving || disabledOptions.has(option)) return
      const isCorrect = option === current.answer

      if (isCorrect) {
        setSolved(true)
        showSuccess()
        setSaving(true)
        try {
          await recordAttempt(childId, `harakaworld_${harakaId}_${current.id}`, true)
          await awardCorrectAnswer(childId)
          setCorrectCount((c) => c + 1)
        } finally {
          setSaving(false)
        }
      } else {
        setDisabledOptions((prev) => new Set(prev).add(option))
        showRetry()
        setSaving(true)
        try {
          await recordAttempt(childId, `harakaworld_${harakaId}_${current.id}`, false)
        } finally {
          setSaving(false)
        }
      }
    },
    [solved, saving, disabledOptions, current, harakaId, childId, showSuccess, showRetry],
  )

  function handleNext() {
    if (saving) return
    if (isLast) {
      onFinished(correctCount, questions.length)
      return
    }
    setQIndex((i) => i + 1)
    setDisabledOptions(new Set())
    setSolved(false)
    reset()
  }

  return (
    <Card
      className="p-6 sm:p-8 border-2 border-white/80 shadow-xl backdrop-blur-md"
      style={{ backgroundColor: 'rgba(255,255,255,.94)' }}
    >
      {/* شريط التقدم */}
      <div className="flex items-center justify-between mb-4 text-sm font-bold text-[var(--color-ink-soft)]">
        <span>
          سؤال {qIndex + 1} من {questions.length}
        </span>
        <span>✅ {correctCount}</span>
      </div>

      {/* اعرض صورة/كلمة مرتبطة بالسؤال فقط */}
      {exampleForQ && <div
          className="flex flex-col items-center justify-center rounded-3xl border-2 border-white/80 mb-6 py-7 px-4 shadow"
        style={{ backgroundColor: `${entry.color}18` }}
      >
        {exampleForQ.emoji && (
          <span className="text-6xl sm:text-7xl mb-2" aria-hidden="true">
            {exampleForQ.emoji}
          </span>
        )}
        <HighlightedWord
          word={exampleForQ.word}
          highlight={exampleForQ.highlight}
          color={entry.color}
        />
        <div className="flex items-center gap-2 mt-2">
          <SpeakButton
            text={stripEmojiForSpeech(exampleForQ.speechText)}
            audioId={harakaWorldSoundId(harakaId, `ex_${exampleIndex}`)}
            label="استمع للكلمة"
            size="sm"
          />
          <span className="text-base sm:text-lg text-[var(--color-ink-soft)] font-bold">
            المقطع:{' '}
            <span style={{ color: entry.color }} className="font-black">
              {exampleForQ.highlight}
            </span>
          </span>
        </div>
      </div>}

      {/* نص السؤال */}
      <div className="flex items-start gap-3 mb-6 rounded-2xl bg-white/75 p-4 sm:p-5">
        <SpeakButton
          text={spokenPrompt}
          audioId={audioId}
          label="استمع للسؤال"
          size="sm"
        />
        <p className="font-display font-bold text-[var(--color-ink)] text-lg sm:text-2xl leading-relaxed">
          {current.prompt}
        </p>
      </div>

      {/* الخيارات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        {options.map((option) => {
          const isDisabled = disabledOptions.has(option)
          const isSolved = solved && option === current.answer

          return (
            <button
              key={option}
              type="button"
              disabled={isDisabled || solved || saving}
              onClick={() => handlePick(option)}
              className={[
                'min-h-20 sm:min-h-24 rounded-2xl border-2 px-5 py-5 font-display font-bold text-xl sm:text-2xl leading-relaxed transition-all duration-150',
                isSolved
                  ? 'border-[var(--color-leaf)] bg-[var(--color-leaf)]/15 text-[var(--color-leaf)]'
                  : isDisabled
                    ? 'border-black/10 bg-white/10 text-black/30 cursor-not-allowed opacity-40'
                    : 'border-white/80 bg-white/55 backdrop-blur-sm text-[var(--color-ink)] hover:border-[var(--color-sky)] hover:scale-[1.03]',
              ].join(' ')}
            >
              {stripEmojiForSpeech(option)}
              {isSolved && ' ✓'}
              {isDisabled && ' ✗'}
            </button>
          )
        })}
      </div>

      {/* تغذية راجعة */}
      {feedback && (
        <div className="mb-3">
          <FeedbackMessage status={feedback.status} message={feedback.message} />
        </div>
      )}

      {/* زر التالي */}
      {solved && (
        <div className="flex justify-center">
          <Button onClick={handleNext} disabled={saving}>
            {isLast ? 'إنهاء 🏁' : 'التالي ←'}
          </Button>
        </div>
      )}
    </Card>
  )
}
