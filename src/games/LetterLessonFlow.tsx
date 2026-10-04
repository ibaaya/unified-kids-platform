import { useState } from 'react'
import { LetterPositionGame } from './templates/LetterPositionGame'
import { PictureChoiceGame } from './templates/PictureChoiceGame'
import { LetterTraceGame } from './templates/LetterTraceGame'
import type { Letter, Word } from '../types/content'

interface LetterLessonFlowProps {
  letter: Letter
  words: Word[]
  childId: number
  childName?: string
  autoRead: boolean
  /** correctCount من أصل (عدد الكلمات × 3) + 1 لسؤال الكتابة */
  onFinished: (correctCount: number, totalQuestions: number) => void
}

const STAGE_TITLES = ['🔤 أين الحرف؟', '🎧 استمع واختر', '👀 طابق الصورة', '✍️ اكتب الحرف']
const TOTAL_STAGES = 4

/**
 * يشغّل مراحل الحرف الأربع بالتسلسل: تمييز الموضع → استماع → تمييز بصري
 * → كتابة الحرف. المرحلة الأخيرة (الكتابة) سؤال واحد فقط بعكس الثلاث
 * الأولى (سؤال لكل كلمة)، لذا مجموع الأسئلة = (عدد الكلمات × 3) + 1.
 */
export function LetterLessonFlow({
  letter,
  words,
  childId,
  childName,
  autoRead,
  onFinished,
}: LetterLessonFlowProps) {
  const [stage, setStage] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)

  const totalQuestions = words.length * 3 + 1

  function handleStageFinished(correctCount: number) {
    const newTotal = totalCorrect + correctCount
    setTotalCorrect(newTotal)
    if (stage === TOTAL_STAGES - 1) {
      onFinished(newTotal, totalQuestions)
    } else {
      setStage((s) => s + 1)
    }
  }

  return (
    <div>
      <div className="relative z-20 -mb-4 flex flex-wrap justify-center gap-1 px-2 sm:gap-2">
        {STAGE_TITLES.map((title, idx) => (
          <span
            key={title}
            className={`rounded-full border px-2.5 py-1.5 text-[10px] font-extrabold shadow-md backdrop-blur-sm sm:px-3 sm:text-xs ${
              idx === stage
                ? 'scale-105 border-white bg-[var(--world-letters)] text-white shadow-lg'
                : idx < stage
                  ? 'border-white/80 bg-emerald-100/90 text-emerald-800'
                  : 'border-white/70 bg-white/75 text-[var(--color-ink-soft)]'
            }`}
          >
            {idx < stage ? '✓ ' : ''}
            {title}
          </span>
        ))}
      </div>

      {stage === 0 && (
        <LetterPositionGame
          letterId={letter.id}
          letterName={letter.name}
          words={words}
          childId={childId}
          childName={childName}
          autoRead={autoRead}
          onFinished={handleStageFinished}
        />
      )}
      {stage === 1 && (
        <PictureChoiceGame
          letterId={letter.id}
          letterName={letter.name}
          words={words}
          childId={childId}
          childName={childName}
          autoRead={autoRead}
          mode="listen"
          onFinished={handleStageFinished}
        />
      )}
      {stage === 2 && (
        <PictureChoiceGame
          letterId={letter.id}
          letterName={letter.name}
          words={words}
          childId={childId}
          childName={childName}
          autoRead={autoRead}
          mode="visual"
          onFinished={handleStageFinished}
        />
      )}
      {stage === 3 && (
        <LetterTraceGame
          text={letter.id}
          label={`حرف ${letter.name}`}
          skillId={`letter_${letter.id}`}
          childId={childId}
          childName={childName}
          autoRead={autoRead}
          promptVariantId={letter.id}
          promptValues={{ letterName: letter.name }}
          onFinished={handleStageFinished}
        />
      )}
    </div>
  )
}
