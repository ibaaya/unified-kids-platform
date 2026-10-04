/**
 * QuizRunner — واجهة الاختبار المشتركة لقسم Learn English
 *
 * السلوك (موحّد في كل الاختبارات):
 *  - الأسئلة والخيارات تُبنى مرة واحدة وتبقى ثابتة (لا يتغير ترتيب الخيارات بعد الإجابة)
 *  - الإجابة الخاطئة: يُظلَّل الخيار الخاطئ فقط ويُطلب إعادة المحاولة — لا تظهر الإجابة الصحيحة
 *  - الإجابة الصحيحة: تُظلَّل بالأخضر ثم ينتقل للسؤال التالي
 *  - النقطة تُحتسب فقط إذا كانت الإجابة صحيحة من المحاولة الأولى
 *  - إذا أوقف ولي الأمر "إعادة المحاولة" ينتقل للسؤال التالي دون كشف الإجابة
 *  - قراءة السؤال تلقائياً حسب إعدادات ولي الأمر
 */
import { useState, useEffect, useRef, useMemo } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import type { QuizQuestion, QuizOption } from '../engine/quizEngine'
import { speakEnglish, speakWord, speakEncouragement } from '../engine/soundManager'
import { loadEnglishSettings } from '../pages/EnglishParentDashboard'

export type QuizResultContext = {
  score: number
  total: number
  restart: () => void
}

type Props = {
  /** تُستدعى عند البدء وعند "Play Again" لإنتاج أسئلة جديدة */
  build: () => QuizQuestion[]
  /** اللون الرئيسي (hex) */
  accent: string
  /** خلفية الصفحة */
  background: string
  onExit: () => void
  exitLabel?: string
  /** شارة اختيارية في الأعلى (مثل: Level 2) */
  badge?: { label: string; color: string }
  /** شاشة نتيجة مخصصة (الافتراضي: بطاقة بسيطة مع Play Again) */
  renderResult?: (ctx: QuizResultContext) => ReactNode
  onFinish?: (score: number, total: number) => void
  emptyMessage?: string
}

export function QuizRunner({
  build, accent, background, onExit, exitLabel = 'Exit', badge, renderResult, onFinish,
  emptyMessage = 'No questions available yet.',
}: Props) {
  const settings = useMemo(() => loadEnglishSettings(), [])
  const soundOn = settings.soundEnabled !== false

  const [questions, setQuestions] = useState<QuizQuestion[]>(build)
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [locked, setLocked] = useState(false)
  const [done, setDone] = useState(false)

  const scoreRef = useRef(0)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  // تنظيف المؤقتات وإيقاف الصوت عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [])

  const q = questions[step]

  // قراءة السؤال تلقائياً عند ظهوره
  useEffect(() => {
    if (!q || done || !soundOn || !settings.autoReadQuestion) return
    const t = window.setTimeout(() => speakEnglish(q.voice), 450)
    return () => window.clearTimeout(t)
  }, [q, done, soundOn, settings.autoReadQuestion])

  const goNext = () => {
    if (step + 1 >= questions.length) {
      setDone(true)
      onFinish?.(scoreRef.current, questions.length)
    } else {
      setStep(step + 1)
      setWrongIds([])
      setSolved(false)
      setLocked(false)
    }
  }

  const handlePick = (opt: QuizOption) => {
    if (!q || solved || locked || wrongIds.includes(opt.id)) return

    if (opt.isCorrect) {
      setSolved(true)
      // نقطة فقط إذا كانت الإجابة صحيحة من أول محاولة
      if (wrongIds.length === 0) {
        scoreRef.current += 1
        setScore(scoreRef.current)
      }
      if (soundOn && settings.encouragementSound) speakEncouragement()
      later(goNext, 1300)
      return
    }

    // إجابة خاطئة: نظلل الخيار الخاطئ فقط ولا نكشف الصحيح
    setWrongIds((w) => [...w, opt.id])
    if (soundOn) speakEnglish('Try again!')
    if (!settings.allowRetry) {
      setLocked(true)
      later(goNext, 1500)
    }
  }

  const restart = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    scoreRef.current = 0
    setQuestions(build())
    setStep(0); setScore(0); setWrongIds([]); setSolved(false); setLocked(false); setDone(false)
  }

  const shell = (children: ReactNode) => (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background }} dir="ltr">
      {children}
    </div>
  )

  if (questions.length === 0) {
    return shell(
      <div className="mx-auto max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="text-xl font-bold text-gray-700">{emptyMessage}</p>
        <button onClick={onExit} className="mt-4 rounded-2xl px-5 py-2 font-bold text-white" style={{ background: accent }}>
          ← Back
        </button>
      </div>,
    )
  }

  if (done) {
    if (renderResult) return <>{renderResult({ score, total: questions.length, restart })}</>
    const total = questions.length
    const great = score >= total * 0.8
    return shell(
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="text-7xl">{great ? '🌟' : '🎉'}</div>
        <h2 className="mt-4 text-3xl font-extrabold" style={{ color: '#1e3a8a' }}>{great ? 'Amazing!' : 'Good Job!'}</h2>
        <p className="mt-2 text-xl text-gray-600">Score: {score} / {total}</p>
        <div className="mt-3 h-3 rounded-full bg-gray-100">
          <div className="h-3 rounded-full transition-all" style={{ width: `${(score / total) * 100}%`, background: accent }} />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={restart} className="rounded-2xl px-5 py-3 font-bold text-white shadow transition hover:scale-105" style={{ background: '#2fb68c' }}>
            🔄 Play Again
          </button>
          <button onClick={onExit} className="rounded-2xl px-5 py-3 font-bold text-white shadow transition hover:scale-105" style={{ background: accent }}>
            ← Back
          </button>
        </div>
      </div>,
    )
  }

  if (!q) return null

  const cols = q.columns ?? (q.options.length === 3 && q.display !== 'wordWithPicture' ? 3 : 2)
  const gridCols = cols === 1 ? 'grid-cols-1' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2'

  const optionStyle = (opt: QuizOption): CSSProperties => {
    if (solved && opt.isCorrect) return { background: '#f0fdf4', borderColor: '#22c55e' }
    if (wrongIds.includes(opt.id)) return { background: '#fef2f2', borderColor: '#ef4444', opacity: 0.75 }
    return { background: 'white', borderColor: '#e5e7eb' }
  }

  return shell(
    <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
      {/* رأس الاختبار */}
      <div className="mb-3 flex items-center justify-between gap-2">
        {badge ? (
          <span className="rounded-xl px-3 py-1 text-xs font-bold text-white" style={{ background: badge.color }}>{badge.label}</span>
        ) : <span />}
        <span className="text-sm font-bold text-gray-500">{step + 1} / {questions.length}</span>
        <span className="text-sm font-bold" style={{ color: badge?.color ?? accent }}>⭐ {score}</span>
      </div>

      {/* شريط التقدم */}
      <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${(step / questions.length) * 100}%`, background: badge?.color ?? accent }} />
      </div>

      {/* السؤال + زر السماعة */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <h2 className="text-center text-base font-extrabold sm:text-lg" style={{ color: '#1e3a8a' }}>{q.text}</h2>
        <button
          onClick={() => speakEnglish(q.voice)}
          className="flex-shrink-0 rounded-full bg-blue-50 p-2 text-lg text-blue-600 transition hover:scale-110"
          title="Read question" aria-label="Read question"
        >🔊</button>
      </div>

      {/* ما يخص السؤال: حرف كبير / صورة / كلمة */}
      {q.prompt && (
        <div className="mb-5 text-center">
          {q.prompt.big && (
            <div className="text-7xl font-extrabold" style={{ color: accent }}>{q.prompt.big}</div>
          )}
          {q.prompt.emoji && (
            q.prompt.speak ? (
              <button onClick={() => speakWord(q.prompt!.speak!)} className="block w-full text-7xl transition hover:scale-110" aria-label="Hear the word">
                {q.prompt.emoji}
              </button>
            ) : <div className="text-7xl">{q.prompt.emoji}</div>
          )}
          {q.prompt.word && (
            <div className="mt-2 text-3xl font-extrabold tracking-widest" style={{ color: accent }}>
              {[...q.prompt.word].map((c, i) =>
                q.prompt!.highlight && c.toUpperCase() === q.prompt!.highlight
                  ? <span key={i} className="underline" style={{ color: '#e85d75' }}>{c}</span>
                  : <span key={i}>{c}</span>,
              )}
            </div>
          )}
        </div>
      )}

      {/* رسالة إعادة المحاولة — بدون كشف الإجابة */}
      {wrongIds.length > 0 && !solved && (
        <p className="mb-2 text-center text-sm font-bold text-orange-500">
          {settings.allowRetry ? '🔄 Not quite — try again!' : "Let's move on to the next one!"}
        </p>
      )}

      {/* الخيارات — ثابتة لا تتغير */}
      <div className={`grid ${gridCols} gap-3`}>
        {q.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handlePick(opt)}
            disabled={solved || locked || wrongIds.includes(opt.id)}
            aria-label={opt.label}
            className="flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 p-3 text-center font-bold transition-all hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={optionStyle(opt)}
          >
            {q.display === 'pictureOnly' && <span className="text-5xl">{opt.emoji}</span>}
            {q.display === 'wordWithPicture' && (
              <>
                <span className="text-4xl">{opt.emoji}</span>
                <span className="mt-1 text-base">{opt.label}</span>
              </>
            )}
            {q.display === 'textOnly' && <span className="text-lg">{opt.label}</span>}
            {q.display === 'letter' && <span className="text-4xl font-extrabold">{opt.label}</span>}
          </button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button onClick={onExit} className="text-sm text-gray-400 underline">{exitLabel}</button>
      </div>
    </div>,
  )
}
