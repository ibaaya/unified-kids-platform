import { useCallback, useEffect, useRef, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { FeedbackMessage } from '../../components/feedback/FeedbackMessage'
import { useAutoReadQuestion } from '../../hooks/useAutoReadQuestion'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { recordAttempt } from '../../engine/masteryEngine'
import { awardCorrectAnswer } from '../../engine/rewardsEngine'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { getVoicePromptText } from '../../utils/voicePromptCatalog'
import { voicePromptAudioId } from '../../utils/voicePromptIds'

interface LetterTraceGameProps {
  /** الحرف أو الكلمة المطلوب تتبّعها كتابيًا */
  text: string
  label: string // مثال: "حرف ألف" أو "كلمة أَسَدٌ" — يُستخدم في نص السؤال
  skillId: string // letter_ا أو word_word_ا_start مثلًا — لتسجيل المحاولة في محرك الإتقان
  childId: number
  childName?: string
  autoRead: boolean
  onFinished: (correctCount: number) => void
  promptWorldId?: string
  promptId?: string
  promptVariantId?: string
  promptValues?: Record<string, string>
  followUpText?: string
  followUpAudioId?: string
}

const CANVAS_SIZE = 280
const GRID_CELLS = 22 // شبكة تقريبية لقياس مدى تغطية الرسم لشكل الحرف/الكلمة
const COVERAGE_THRESHOLD = 0.42 // نسبة متساهلة تناسب خط يد طفل صغير، وليست تقييم خط احترافي

function normalizeTypedArabic(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\s]/g, '')
    .replace(/[أإآ]/g, 'ا')
}

/**
 * لعبة "اكتب الحرف/الكلمة": نموذج أولي (MVP) لتعلّم الطباعة اليدوية —
 * الطفل يتتبّع بإصبعه/الفأرة شكل الحرف الشفاف المرسوم خلفية على اللوحة.
 * التقييم هنا هيكلي بسيط (نسبة تغطية شبكة الخلايا التي يمر بها الرسم من
 * شكل الحرف الأصلي) وليس تعرّفًا حقيقيًا على الخط (OCR/handwriting
 * recognition) — وهو أمر يحتاج مكتبة متخصصة ويستحق تطويرًا منفصلاً لاحقًا.
 */
export function LetterTraceGame({
  text,
  label,
  skillId,
  childId,
  //childName,
  autoRead,
  onFinished,
  promptWorldId = 'letters',
  promptId = 'trace-letter',
  promptVariantId,
  promptValues = {},
  followUpText,
  followUpAudioId,
}: LetterTraceGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guideGridRef = useRef<boolean[]>([])
  const drawnGridRef = useRef<boolean[]>([])
  const drawingRef = useRef(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [checked, setChecked] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [inputMode, setInputMode] = useState<'draw' | 'keyboard'>('draw')
  const [keyboardText, setKeyboardText] = useState('')
  const [isSavingAnswer, setIsSavingAnswer] = useState(false)
  const { feedback, showSuccess, showRetry, reset } = useAnswerFeedback()

  const questionText = getVoicePromptText(promptWorldId, promptId, promptValues)
  const questionAudioId = voicePromptAudioId(promptWorldId, promptId, promptVariantId)
  useAutoReadQuestion(questionText, autoRead, 0, 500, followUpText, questionAudioId, followUpAudioId)

  const drawGuide = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.save()
    ctx.direction = 'rtl'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `${text.length > 2 ? 90 : 160}px 'Baloo Bhaijaan 2', 'Cairo', sans-serif`
    ctx.fillStyle = 'rgba(36, 49, 58, 0.16)'
    ctx.fillText(text, CANVAS_SIZE / 2, CANVAS_SIZE / 2)
    ctx.restore()

    // بناء شبكة "أهداف" التغطية من بكسلات الشكل المرسوم
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    const cellSize = CANVAS_SIZE / GRID_CELLS
    const grid = new Array(GRID_CELLS * GRID_CELLS).fill(false)
    for (let gy = 0; gy < GRID_CELLS; gy++) {
      for (let gx = 0; gx < GRID_CELLS; gx++) {
        let filled = false
        outer: for (let y = 0; y < cellSize; y += 3) {
          for (let x = 0; x < cellSize; x += 3) {
            const px = Math.floor(gx * cellSize + x)
            const py = Math.floor(gy * cellSize + y)
            const idx = (py * CANVAS_SIZE + px) * 4 + 3 // alpha channel
            if (imageData.data[idx] > 20) {
              filled = true
              break outer
            }
          }
        }
        grid[gy * GRID_CELLS + gx] = filled
      }
    }
    guideGridRef.current = grid
    drawnGridRef.current = new Array(GRID_CELLS * GRID_CELLS).fill(false)
  }, [text])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawGuide(ctx)
    setHasDrawn(false)
    setChecked(false)
    setAttempted(false)
    setKeyboardText('')
  }, [drawGuide])

  function markDrawnAt(x: number, y: number) {
    const cellSize = CANVAS_SIZE / GRID_CELLS
    const gx = Math.floor(x / cellSize)
    const gy = Math.floor(y / cellSize)
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = gy + dy
        const nx = gx + dx
        if (ny >= 0 && ny < GRID_CELLS && nx >= 0 && nx < GRID_CELLS) {
          drawnGridRef.current[ny * GRID_CELLS + nx] = true
        }
      }
    }
  }

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = CANVAS_SIZE / rect.width
    const scaleY = CANVAS_SIZE / rect.height
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (checked) return
    drawingRef.current = true
    setHasDrawn(true)
    const ctx = canvasRef.current?.getContext('2d')
    const { x, y } = getPoint(e)
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
    markDrawnAt(x, y)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || checked) return
    const ctx = canvasRef.current?.getContext('2d')
    const { x, y } = getPoint(e)
    if (ctx) {
      ctx.lineWidth = 14
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#ff9f45'
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    markDrawnAt(x, y)
  }

  function handlePointerUp() {
    drawingRef.current = false
  }

  function handleClear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) drawGuide(ctx)
    setHasDrawn(false)
    setKeyboardText('')
    setChecked(false)
    reset()
  }

  function handleModeChange(nextMode: 'draw' | 'keyboard') {
    if (nextMode === inputMode) return
    setInputMode(nextMode)
    setKeyboardText('')
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) drawGuide(ctx)
    setHasDrawn(false)
    setChecked(false)
    setAttempted(false)
    reset()
  }

  async function handleCheck() {
    if (checked || isSavingAnswer) return
    let isGoodAttempt = false
    if (inputMode === 'keyboard') {
      isGoodAttempt = normalizeTypedArabic(keyboardText) === normalizeTypedArabic(text)
    } else {
      const guide = guideGridRef.current
      const drawn = drawnGridRef.current
      let target = 0
      let hit = 0
      for (let i = 0; i < guide.length; i++) {
        if (guide[i]) {
          target += 1
          if (drawn[i]) hit += 1
        }
      }
      const coverage = target > 0 ? hit / target : 0
      isGoodAttempt = coverage >= COVERAGE_THRESHOLD
    }
    setChecked(true)
    setIsSavingAnswer(true)

    if (isGoodAttempt) {
      showSuccess()
    } else {
      showRetry()
    }
    try {
      if (!attempted) {
        setAttempted(true)
        await recordAttempt(childId, skillId, isGoodAttempt)
      }
      if (isGoodAttempt) await awardCorrectAnswer(childId)
    } finally {
      setIsSavingAnswer(false)
    }
  }

  function handleContinue() {
    onFinished(feedback?.status === 'success' ? 1 : 0)
  }

  const isSuccess = feedback?.status === 'success'
  const hasInput = inputMode === 'keyboard' ? keyboardText.trim().length > 0 : hasDrawn

  return (
    <Card className="border border-white/80 p-4 pt-10 shadow-xl backdrop-blur-md sm:px-6 sm:pb-6 sm:pt-12" style={{ background: 'rgba(255,255,255,.15)' }}>
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <p className="content-scale font-semibold">✍️ {questionText}</p>
          <SpeakButton text={questionText} audioId={questionAudioId} size="sm" label="أعد قراءة التعليمات" />
        </div>
        <p className="text-xs text-[var(--color-ink-soft)]">
          {inputMode === 'draw'
            ? `تدريب بسيط على تتبّع شكل ${label} بالإصبع — وليس تصحيحًا دقيقًا للخط`
            : 'اكتب الحرف أو الكلمة باستخدام لوحة المفاتيح. الحركات اختيارية.'}
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-4" role="group" aria-label="طريقة الكتابة">
        <button
          type="button"
          aria-pressed={inputMode === 'draw'}
          onClick={() => handleModeChange('draw')}
          className={`rounded-full px-4 py-2 font-bold transition-colors ${inputMode === 'draw' ? 'bg-[var(--color-sky)] text-white' : 'bg-white text-[var(--color-ink-soft)] border border-black/10'}`}
        >
          ✍️ بإصبعي
        </button>
        <button
          type="button"
          aria-pressed={inputMode === 'keyboard'}
          onClick={() => handleModeChange('keyboard')}
          className={`rounded-full px-4 py-2 font-bold transition-colors ${inputMode === 'keyboard' ? 'bg-[var(--color-sky)] text-white' : 'bg-white text-[var(--color-ink-soft)] border border-black/10'}`}
        >
          ⌨️ بالكيبورد
        </button>
      </div>

      <div className="flex justify-center mb-5">
        {inputMode === 'draw' ? (
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="rounded-3xl border-2 border-black/10 bg-white touch-none shadow-inner max-w-full"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            aria-label={`تتبّع ${label} على اللوحة`}
          />
        ) : (
          <div className="w-full max-w-md rounded-3xl border-2 border-dashed border-[var(--color-sky)]/50 bg-white p-5 shadow-inner">
            <div className="text-5xl font-display text-black/10 mb-4 select-none" aria-hidden="true">{text}</div>
            <label htmlFor="trace-keyboard-input" className="block text-sm font-bold text-[var(--color-ink-soft)] mb-2">اكتب هنا</label>
            <input
              id="trace-keyboard-input"
              type="text"
              dir="rtl"
              lang="ar"
              autoComplete="off"
              autoCapitalize="off"
              value={keyboardText}
              onChange={(event) => setKeyboardText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && keyboardText.trim() && !checked) void handleCheck()
              }}
              disabled={checked}
              placeholder="اكتب الحرف أو الكلمة"
              className="w-full min-h-16 rounded-2xl border-2 border-[var(--color-sky)]/30 px-4 text-center text-3xl font-display focus:border-[var(--color-sky)] focus:outline-none disabled:bg-gray-50"
            />
          </div>
        )}
      </div>

      {feedback && (
        <div className="mb-4">
          <FeedbackMessage status={feedback.status} message={feedback.message} />
        </div>
      )}

      <div className="flex justify-center gap-3">
        {!checked && (
          <>
            <Button variant="ghost" onClick={handleClear} disabled={!hasInput}>
              امسح 🔄
            </Button>
            <Button onClick={handleCheck} disabled={!hasInput || isSavingAnswer}>
              تحقق ✓
            </Button>
          </>
        )}
        {checked && !isSuccess && (
          <Button onClick={handleClear} disabled={isSavingAnswer}>حاول مرة أخرى 🔁</Button>
        )}
        {checked && isSuccess && <Button onClick={handleContinue}>متابعة ←</Button>}
      </div>
    </Card>
  )
}
