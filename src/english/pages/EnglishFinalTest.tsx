/**
 * EnglishFinalTest — الاختبار الشامل للغة الإنجليزية
 *
 * 3 مستويات متدرجة فعلياً (كل مستوى أصعب من السابق):
 *  ⭐ Easy   (8 أسئلة)  — كلمات قصيرة، 3 خيارات: صورة ← كلمة، كلمة ← صورة، أول حرف، تبدأ بحرف
 *  ⭐⭐ Medium (10 أسئلة) — 4 خيارات: تبدأ/تنتهي/تحتوي، الحرف الناقص، آخر حرف، أين الحرف
 *  ⭐⭐⭐ Hard  (12 سؤالاً) — كلمات أطول ومشتّتات خادعة: إملاء، عدّ الحروف، حرف علة ناقص، حرف في الوسط
 *
 * كل الأسئلة تُبنى وتُتحقق عبر quizEngine:
 *  - لا صورة داخل خيارات "This picture is..."
 *  - لا تظهر الإجابة الصحيحة عند الخطأ (يُطلب إعادة المحاولة فقط)
 *  - لا توجد كلمتان صحيحتان (مثل كلمتين تبدآن بنفس الحرف المسؤول عنه)
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QuizRunner } from '../components/QuizRunner'
import { buildFinalTest, LEVEL_CONFIG } from '../engine/quizEngine'
import type { TestLevel } from '../engine/quizEngine'

const LEVEL_COLORS: Record<TestLevel, string> = { 1: '#2fb68c', 2: '#ff9f45', 3: '#e85d75' }
const LEVEL_BG = 'linear-gradient(135deg, #e8f0fe 0%, #f3e8ff 100%)'

const LEVEL_CARDS: { l: TestLevel; label: string; emoji: string; desc: string }[] = [
  { l: 1, label: 'Easy', emoji: '⭐', desc: '8 questions · 3 choices · Pictures & first letters' },
  { l: 2, label: 'Medium', emoji: '⭐⭐', desc: '10 questions · 4 choices · Letter positions & missing letters' },
  { l: 3, label: 'Hard', emoji: '⭐⭐⭐', desc: '12 questions · Spelling, counting letters & tricky choices' },
]

export function EnglishFinalTest() {
  const [level, setLevel] = useState<TestLevel | null>(null)
  // يتغير عند كل بدء مستوى لإعادة بناء الأسئلة من جديد
  const [runId, setRunId] = useState(0)

  const startLevel = (l: TestLevel) => {
    setLevel(l)
    setRunId((r) => r + 1)
  }

  // ——— اختيار المستوى ———
  if (!level) {
    return (
      <div className="min-h-screen" style={{ background: LEVEL_BG }} dir="ltr">
        
        <div className="mx-auto max-w-2xl px-4 py-8">
          <header className="mb-8 rounded-3xl border-2 bg-white/85 p-5 text-center shadow-xl" style={{ borderColor: 'rgba(79,128,226,0.3)' }}>
            <div className="text-5xl">🏆</div>
            <h1 className="mt-2 text-3xl font-extrabold" style={{ color: '#1e3a8a' }}>English Final Test</h1>
            <p className="mt-1 text-sm text-gray-500">Test everything you've learned! Choose your level.</p>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {LEVEL_CARDS.map(({ l, label, emoji, desc }) => (
              <button key={l} onClick={() => startLevel(l)}
                className="flex flex-col items-center rounded-3xl border-2 bg-white/85 p-6 text-center shadow-xl transition-all hover:scale-105"
                style={{ borderColor: LEVEL_COLORS[l] }}>
                <div className="text-4xl">{emoji}</div>
                <h2 className="mt-2 text-xl font-extrabold" style={{ color: LEVEL_COLORS[l] }}>{label}</h2>
                <p className="mt-1 text-xs text-gray-500">{desc}</p>
                <div className="mt-4 rounded-full px-4 py-2 text-sm font-bold text-white shadow" style={{ background: LEVEL_COLORS[l] }}>
                  Start →
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/english"
              className="inline-flex items-center gap-2 rounded-2xl border-2 bg-white/80 px-4 py-2 text-sm font-bold shadow transition hover:scale-105"
              style={{ borderColor: '#4f80e2', color: '#1e3a8a' }}>
              🌍 English Menu
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const color = LEVEL_COLORS[level]

  return (
    <QuizRunner
      key={`${level}-${runId}`}
      build={() => buildFinalTest(level)}
      accent={color}
      background={LEVEL_BG}
      badge={{ label: `Level ${level}`, color }}
      onExit={() => setLevel(null)}
      exitLabel="Exit test"
      renderResult={({ score, total }) => {
        const percent = Math.round((score / total) * 100)
        const passed = percent >= 70
        return (
          <div className="flex min-h-screen items-center justify-center p-4" style={{ background: LEVEL_BG }} dir="ltr">
            <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
              <div className="text-7xl">{percent >= 90 ? '🌟' : passed ? '🎉' : '💪'}</div>
              <h2 className="mt-4 text-3xl font-extrabold" style={{ color: '#1e3a8a' }}>
                {percent >= 90 ? 'Amazing!' : passed ? 'Well Done!' : 'Keep Practicing!'}
              </h2>
              <p className="mt-2 text-xl text-gray-600">Score: {score} / {total} ({percent}%)</p>
              <div className="mt-3 h-3 rounded-full bg-gray-100">
                <div className="h-3 rounded-full transition-all"
                  style={{ width: `${percent}%`, background: passed ? '#2fb68c' : '#ff9f45' }} />
              </div>

              {/* عند النجاح: الانتقال للمستوى الأصعب */}
              {passed && level < 3 && (
                <button onClick={() => startLevel((level + 1) as TestLevel)}
                  className="mt-5 w-full rounded-2xl px-5 py-3 font-bold text-white shadow-md"
                  style={{ background: '#4f80e2' }}>
                  ⬆️ Try Level {level + 1} →
                </button>
              )}

              <div className="mt-3 flex justify-center gap-3">
                <button onClick={() => startLevel(level)}
                  className="rounded-2xl px-4 py-2 text-sm font-bold text-white shadow" style={{ background: '#2fb68c' }}>
                  🔄 Retry
                </button>
                <button onClick={() => setLevel(null)}
                  className="rounded-2xl px-4 py-2 text-sm font-bold text-white shadow" style={{ background: '#8b5fbf' }}>
                  ← Levels
                </button>
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}

// تصدير الإعدادات للاستخدام الخارجي عند الحاجة (عدد الأسئلة لكل مستوى)
export const FINAL_TEST_QUESTION_COUNTS = {
  1: LEVEL_CONFIG[1].count,
  2: LEVEL_CONFIG[2].count,
  3: LEVEL_CONFIG[3].count,
} as const
