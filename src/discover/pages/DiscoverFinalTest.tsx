/**
 * DiscoverFinalTest — الاختبار الشامل لقسم «اكتشف ما حولك»
 *
 * المزايا الجديدة:
 * - 30 سؤالاً لكل مستوى.
 * - دعم أسئلة صح/خطأ (trueFalse) في المستوى السهل.
 * - زر تلميح (hint) في المستوى الصعب.
 * - شاشة نتيجة تحليلية: أفضل/أضعف عالم + رسالة تشجيعية.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DiscoverTestLevel } from '../engine/discoverProgress'
import {
  getDiscoverOverallTestPercentage,
  isDiscoverFinalTestComplete,
  isDiscoverTestLevelUnlocked,
  loadDiscoverProgress,
  saveDiscoverTestLevelResult,
} from '../engine/discoverProgress'
import {
  getDiscoverQuestionsByLevel,
  getDiscoverQuizQuestionItems,
  type DiscoverQuizQuestion,
} from '../data/discoverQuizData'
import { DISCOVER_WORLDS } from '../data/discoverData'
import { speakArabic } from '../../engine/soundManager'

const LEVELS: {
  id: DiscoverTestLevel
  title: string
  subtitle: string
  emoji: string
  color: string
}[] = [
  { id: 'easy', title: 'المستوى السهل', subtitle: 'أعرف وأتذكر', emoji: '🌱', color: '#2fb68c' },
  { id: 'medium', title: 'المستوى المتوسط', subtitle: 'أفكر وأربط', emoji: '🧠', color: '#3aa0d9' },
  { id: 'hard', title: 'المستوى الصعب', subtitle: 'أتحدى نفسي', emoji: '🏆', color: '#8b5fbf' },
]

// ——— سجل إجابات المستخدم (لتحليل الأخطاء) ———
interface AnswerRecord {
  worldId: string
  correct: boolean
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

function levelTitle(level: DiscoverTestLevel): string {
  return LEVELS.find((item) => item.id === level)?.title ?? ''
}

function worldTitle(worldId: string): string {
  return DISCOVER_WORLDS.find((w) => w.id === worldId)?.titleAr ?? worldId
}

function worldEmoji(worldId: string): string {
  return DISCOVER_WORLDS.find((w) => w.id === worldId)?.emoji ?? '🌍'
}

// ——— تحليل الأخطاء ———
interface AnalysisResult {
  strongestWorld: { id: string; correct: number; total: number } | null
  weakestWorld: { id: string; correct: number; total: number } | null
  message: string
}

function analyzeAnswers(records: AnswerRecord[]): AnalysisResult {
  if (records.length === 0) {
    return { strongestWorld: null, weakestWorld: null, message: '' }
  }
  const byWorld = new Map<string, { correct: number; total: number }>()
  for (const r of records) {
    const cur = byWorld.get(r.worldId) ?? { correct: 0, total: 0 }
    cur.total += 1
    if (r.correct) cur.correct += 1
    byWorld.set(r.worldId, cur)
  }
  const entries = [...byWorld.entries()].map(([id, v]) => ({ id, ...v }))

  // الأقوى: أعلى نسبة، وعند التعادل الأكثر إجابات صحيحة
  const strongest = [...entries].sort((a, b) => {
    const ra = a.correct / a.total
    const rb = b.correct / b.total
    if (rb !== ra) return rb - ra
    return b.correct - a.correct
  })[0]

  // الأضعف: أقل نسبة، وعند التعادل الأكثر أخطاء
  const weakest = [...entries].sort((a, b) => {
    const ra = a.correct / a.total
    const rb = b.correct / b.total
    if (ra !== rb) return ra - rb
    return (a.total - a.correct) - (b.total - b.correct)
  })[0]

  // رسالة تشجيعية
  let message = ''
  if (strongest && weakest && strongest.id !== weakest.id) {
    message = `أَنْتَ مُمْتَازٌ فِي ${worldTitle(strongest.id)}! تَدَرَّبْ أَكْثَرَ عَلَى ${worldTitle(weakest.id)}.`
  } else if (strongest) {
    message = `أَدَاؤُكَ جَيِّدٌ فِي ${worldTitle(strongest.id)}! اسْتَمِرَّ.`
  }

  return {
    strongestWorld: strongest ? { id: strongest.id, correct: strongest.correct, total: strongest.total } : null,
    weakestWorld: weakest ? { id: weakest.id, correct: weakest.correct, total: weakest.total } : null,
    message,
  }
}

export function DiscoverFinalTest() {
  const [selectedLevel, setSelectedLevel] = useState<DiscoverTestLevel | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const [lastResult, setLastResult] = useState<{ score: number; total: number } | null>(null)
  const [attemptKey, setAttemptKey] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])

  const questions = useMemo(() => {
    if (!selectedLevel) return []
    const list = shuffle(getDiscoverQuestionsByLevel(selectedLevel))
    // نخلط خيارات كل سؤال مع الحفاظ على correctId صحيحًا.
    return list.map((question) => ({
      ...question,
      optionIds: shuffle(question.optionIds),
    }))
  }, [selectedLevel, attemptKey])

  const question: DiscoverQuizQuestion | undefined = questions[questionIndex]

  // قراءة السؤال تلقائيًا
  useEffect(() => {
    if (!question || finished) return
    const timer = window.setTimeout(() => speakArabic(question.prompt), 250)
    return () => window.clearTimeout(timer)
  }, [question?.id, finished])

  // إعادة تعيين التلميح عند تغيير السؤال
  useEffect(() => {
    setShowHint(false)
  }, [question?.id])

  const startLevel = (level: DiscoverTestLevel) => {
    if (!isDiscoverTestLevelUnlocked(level)) return
    setSelectedLevel(level)
    setQuestionIndex(0)
    setScore(0)
    setSelectedId(null)
    setFinished(false)
    setLastResult(null)
    setAnswers([])
    setShowHint(false)
    setAttemptKey((v) => v + 1)
  }

  const answer = (optionId: string) => {
    if (!question || selectedId !== null) return

    setSelectedId(optionId)
    const isCorrect = optionId === question.correctId
    const nextScore = score + (isCorrect ? 1 : 0)
    const record: AnswerRecord = { worldId: question.worldId, correct: isCorrect }
    const nextAnswers = [...answers, record]

    window.setTimeout(() => {
      if (questionIndex + 1 >= questions.length) {
        setScore(nextScore)
        setAnswers(nextAnswers)
        setLastResult({ score: nextScore, total: questions.length })
        setFinished(true)
        if (selectedLevel) {
          saveDiscoverTestLevelResult(selectedLevel, nextScore, questions.length)
        }
      } else {
        setScore(nextScore)
        setAnswers(nextAnswers)
        setQuestionIndex((v) => v + 1)
        setSelectedId(null)
      }
    }, 850)
  }

  const goToLevelSelector = () => {
    setSelectedLevel(null)
    setQuestionIndex(0)
    setSelectedId(null)
    setFinished(false)
    setLastResult(null)
    setAnswers([])
  }

  // ═══════════════════════════════════════════════
  // شاشة اختيار المستوى
  // ═══════════════════════════════════════════════
  if (!selectedLevel) {
    const progress = loadDiscoverProgress()
    const overall = getDiscoverOverallTestPercentage()
    const complete = isDiscoverFinalTestComplete()

    return (
      <div
        className="min-h-screen px-4 py-6 pb-20"
        dir="rtl"
        style={{ background: 'linear-gradient(160deg,#edf8f5 0%,#f4f7ff 55%,#fff8ec 100%)' }}
      >
        <div className="mx-auto max-w-3xl">
          <header className="mb-6 rounded-3xl border-2 border-white/80 bg-white/90 p-5 text-center shadow-xl">
            <Link
            to="/discover"
            className="group mb-5 inline-flex items-center gap-2.5 overflow-hidden rounded-2xl px-5 py-3 font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #2fb68c, #3aa0d9)',
              boxShadow: '0 10px 28px rgba(47,182,140,.40), inset 0 1px 0 rgba(255,255,255,.35)',
              fontSize: '1rem',
              letterSpacing: '.02em',
              textShadow: '0 1px 3px rgba(0,0,0,.25)',
            }}
          >
            {/* لمعة عابرة عند التحويم */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            {/* أيقونة الكرة الأرضية في دائرة شفافة */}
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-lg shadow-inner transition-transform duration-300 group-hover:rotate-12"
            >
              🌍
            </span>

            {/* النص */}
            <span className="relative z-10">العودة إلى الاكتشاف</span>

            {/* سهم صغير يتحرك */}
            <span className="relative z-10 text-lg transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </Link>
            <div className="text-6xl">🏆</div>
            <h1 className="mt-2 text-3xl font-extrabold text-gray-800">الاختبار الشامل</h1>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              ٣٠ سؤالًا في كل مستوى — هل تستطيع إكمال الرحلة كلها؟
            </p>
          </header>

          {complete ? (
            <section className="mb-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center shadow-lg">
              <div className="text-4xl">🌟</div>
              <h2 className="mt-1 text-xl font-extrabold text-emerald-800">أكملت المستويات الثلاثة!</h2>
              <p className="mt-2 text-sm text-emerald-700">نتيجتك الكلية في آخر نتائج المستويات المكتملة</p>
              <div className="mt-2 text-4xl font-black text-emerald-700">{overall}%</div>
            </section>
          ) : progress.finalTest.totalQuestions > 0 ? (
            <section className="mb-6 rounded-3xl border-2 border-blue-100 bg-white/85 p-4 text-center shadow">
              <p className="text-sm font-bold text-gray-600">
                النتيجة الكلية الحالية: <span className="text-blue-600">{overall}%</span>
              </p>
            </section>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            {LEVELS.map((level, index) => {
              const unlocked = isDiscoverTestLevelUnlocked(level.id)
              const result = progress.finalTest.levels[level.id]

              return (
                <button
                  key={level.id}
                  onClick={() => startLevel(level.id)}
                  disabled={!unlocked}
                  className={`relative rounded-3xl border-2 p-5 text-right shadow-lg transition ${
                    unlocked ? 'bg-white/90 hover:-translate-y-1 hover:shadow-xl' : 'cursor-not-allowed bg-gray-100/80 opacity-60'
                  }`}
                  style={{ borderColor: unlocked ? `${level.color}66` : '#d1d5db' }}
                >
                  {!unlocked && (
                    <span className="absolute left-4 top-4 text-xl">🔒</span>
                  )}
                  {result?.completed && (
                    <span className="absolute left-4 top-4 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                      ✓ {result.score}/{result.total}
                    </span>
                  )}
                  <div className="text-5xl">{level.emoji}</div>
                  <h2 className="mt-3 text-xl font-extrabold text-gray-800">{level.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-gray-500">{level.subtitle}</p>
                  <p className="mt-4 text-xs font-bold" style={{ color: level.color }}>
                    {unlocked ? 'ابدأ المستوى ←' : index === 1 ? 'أكمل السهل أولًا' : 'أكمل المتوسط أولًا'}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-white/80 bg-white/70 p-4 text-center text-sm font-semibold text-gray-500">
            💡 راجع كل المستويات لفتح المستوى التالي — لا يشترط نسبة معينة، فقط إكمال الأسئلة.
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════
  // شاشة النتيجة التحليلية
  // ═══════════════════════════════════════════════
  if (finished && lastResult) {
    const pct = Math.round((lastResult.score / lastResult.total) * 100)
    const passed = pct >= 80
    const analysis = analyzeAnswers(answers)

    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-8"
        dir="rtl"
        style={{ background: 'linear-gradient(160deg,#edf8f5,#f4f7ff,#fff8ec)' }}
      >
        <div className="w-full max-w-lg rounded-3xl border-4 border-white/80 bg-white/95 p-7 text-center shadow-2xl">
          <div className="text-7xl">{passed ? '🌟' : '💪'}</div>
          <h1 className="mt-2 text-3xl font-black text-gray-800">
            {passed ? 'أداء رائع!' : 'أحسنت، واصل المحاولة!'}
          </h1>
          <p className="mt-2 text-gray-500">{levelTitle(selectedLevel)}</p>

          <div className="my-6 text-5xl font-black text-blue-600">
            {lastResult.score} / {lastResult.total}
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-4 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg,#2fb68c,#3aa0d9,#8b5fbf)',
              }}
            />
          </div>
          <p className="mt-2 text-lg font-extrabold text-gray-700">{pct}%</p>

          {/* ——— تحليل الأخطاء ——— */}
          {analysis.strongestWorld && (
            <div className="mt-5 grid grid-cols-2 gap-3 text-right">
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-bold text-emerald-700">💪 أقوى عالم</p>
                <p className="mt-1 text-sm font-extrabold text-emerald-900">
                  {worldEmoji(analysis.strongestWorld.id)} {worldTitle(analysis.strongestWorld.id)}
                </p>
                <p className="text-xs text-emerald-700">
                  {analysis.strongestWorld.correct}/{analysis.strongestWorld.total}
                </p>
              </div>
              {analysis.weakestWorld && analysis.weakestWorld.id !== analysis.strongestWorld.id && (
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-700">📚 يحتاج تدريبًا</p>
                  <p className="mt-1 text-sm font-extrabold text-amber-900">
                    {worldEmoji(analysis.weakestWorld.id)} {worldTitle(analysis.weakestWorld.id)}
                  </p>
                  <p className="text-xs text-amber-700">
                    {analysis.weakestWorld.correct}/{analysis.weakestWorld.total}
                  </p>
                </div>
              )}
            </div>
          )}

          {analysis.message && (
            <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-800">
              {analysis.message}
            </p>
          )}

          {isDiscoverTestLevelUnlocked(
            selectedLevel === 'easy' ? 'medium' : selectedLevel === 'medium' ? 'hard' : 'hard',
          ) && selectedLevel !== 'hard' ? (
            <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-bold text-green-700">
              🔓 المستوى التالي أصبح متاحًا!
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => startLevel(selectedLevel)}
              className="rounded-2xl px-5 py-3 font-bold text-white shadow"
              style={{ background: '#3aa0d9' }}
            >
              🔄 إعادة المستوى
            </button>
            <button
              onClick={goToLevelSelector}
              className="rounded-2xl bg-gray-100 px-5 py-3 font-bold text-gray-700"
            >
              📚 المستويات
            </button>
            <Link
              to="/discover"
              className="rounded-2xl bg-emerald-100 px-5 py-3 font-bold text-emerald-700"
            >
              🌍 الاكتشاف
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!question) return null

  const options = getDiscoverQuizQuestionItems(question)
  const level = LEVELS.find((item) => item.id === selectedLevel)!
  const isTrueFalse = question.type === 'trueFalse'
  const showHintButton = selectedLevel === 'hard' && Boolean(question.hint)

  return (
    <div
      className="min-h-screen px-4 py-6"
      dir="rtl"
      style={{ background: `linear-gradient(160deg,${level.color}14,#f4f7ff,#fff8ec)` }}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={goToLevelSelector}
            className="rounded-2xl bg-white/85 px-4 py-2 text-sm font-bold text-gray-600 shadow"
          >
            ← المستويات
          </button>
          <div className="rounded-2xl bg-white/85 px-4 py-2 text-sm font-extrabold text-gray-700 shadow">
            {level.emoji} {level.title}
          </div>
        </div>

        <div className="mb-5 rounded-3xl bg-white/85 p-4 shadow-lg">
          <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-600">
            <span>السؤال {questionIndex + 1} / {questions.length}</span>
            <span>⭐ {score}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-3 rounded-full transition-all"
              style={{ width: `${(questionIndex / questions.length) * 100}%`, background: level.color }}
            />
          </div>
        </div>

        <section className="rounded-3xl border-2 border-white/80 bg-white/95 p-6 text-center shadow-xl">
          <div className="mb-4 text-5xl">{isTrueFalse ? '✅❌' : '🧩'}</div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-extrabold leading-relaxed text-gray-800">{question.prompt}</h2>
            <button
              onClick={() => speakArabic(question.prompt)}
              className="rounded-full bg-blue-50 p-2 text-blue-500"
              aria-label="استمع إلى السؤال"
            >
              🔊
            </button>
          </div>

          {/* زر التلميح */}
          {showHintButton && (
            <div className="mt-3">
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="rounded-2xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition hover:scale-105"
                >
                  💡 أظهر التلميح
                </button>
              ) : (
                <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
                  💡 {question.hint}
                </p>
              )}
            </div>
          )}

          {question.explanation && selectedId && (
            <p className="mt-3 rounded-2xl bg-blue-50 p-2 text-sm font-semibold text-blue-800">
              💡 {question.explanation}
            </p>
          )}
        </section>

        {/* ——— الخيارات ——— */}
        {isTrueFalse && options.length >= 2 ? (
          // صح أم خطأ: نعرض خياري صح / خطأ فقط
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              { id: 'true', label: '✅ صَحِيح', color: '#2fb68c' },
              { id: 'false', label: '❌ خَطَأ', color: '#e85d75' },
            ].map((opt) => {
              // نحدد أي زر هو الصحيح بناءً على correctId: إن كان يساوي optionIds[0] → صح، وإلا → خطأ
              const isCorrectAnswer = question.correctId === question.optionIds[0]
              const thisIsTrue = opt.id === 'true'
              
              const isSelectedThis = selectedId === opt.id
              const isThisCorrect = thisIsTrue ? isCorrectAnswer : !isCorrectAnswer

              let cls = 'border-white/70 bg-white/90 hover:-translate-y-1'
              if (selectedId) {
                if (isThisCorrect) cls = 'border-green-400 bg-green-50'
                else if (isSelectedThis) cls = 'border-red-400 bg-red-50'
                else cls = 'border-white/50 bg-white/60 opacity-70'
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    // نحوّل الاختيار إلى id الإجابة الصحيحة/الخاطئة الفعلي في بنك الأسئلة
                    const realId = thisIsTrue ? question.optionIds[0] : question.optionIds[1]
                    answer(realId)
                  }}
                  disabled={selectedId !== null}
                  className={`flex min-h-32 flex-col items-center justify-center gap-3 rounded-3xl border-2 p-5 shadow-lg transition ${cls}`}
                >
                  <span className="text-6xl">{opt.id === 'true' ? '✅' : '❌'}</span>
                  <span className="text-xl font-extrabold text-gray-800">{opt.label}</span>
                </button>
              )
            })}
          </div>
        ) : (
          // اختيار من متعدد عادي
          <div className="mt-5 grid grid-cols-2 gap-4">
            {options.map((option) => {
              const isSelected = selectedId === option.id
              const isCorrect = option.id === question.correctId
              let stateClass = 'border-white/70 bg-white/90 hover:-translate-y-1'

              if (selectedId) {
                if (isCorrect) stateClass = 'border-green-400 bg-green-50'
                else if (isSelected) stateClass = 'border-red-400 bg-red-50'
                else stateClass = 'border-white/50 bg-white/60 opacity-70'
              }

              return (
                <button
                  key={option.id}
                  onClick={() => answer(option.id)}
                  disabled={selectedId !== null}
                  className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 p-4 text-center shadow-lg transition ${stateClass}`}
                >
                  <span className="text-5xl">{option.emoji}</span>
                  <span className="text-base font-extrabold text-gray-800">{option.nameAr}</span>
                  <span className="text-xs font-semibold text-gray-500" dir="ltr">{option.nameEn}</span>
                </button>
              )
            })}
          </div>
        )}

        <p className="mt-5 text-center text-xs font-semibold text-gray-400">
          اختر إجابة واحدة فقط — لن ينتقل السؤال حتى تختار.
        </p>
      </div>
    </div>
  )
}