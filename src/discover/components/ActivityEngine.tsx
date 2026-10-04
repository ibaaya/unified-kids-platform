/**
 * ActivityEngine — محرك الأنشطة التعليمية
 *
 * 5 أنواع أنشطة قابلة لإعادة الاستخدام في جميع عوالم الاكتشاف:
 * 1. findIt      — "أين الكرسي؟" (اختار الصورة الصحيحة)
 * 2. whatIsThis  — "ما هذا؟" (صورة + 4 كلمات)
 * 3. listenPick  — "اسمع واختر" (صوت + 4 صور)
 * 4. match       — "طابق الكلمة مع الصورة"
 * 5. quiz        — "اختبر نفسك" (5 أسئلة مختلطة)
 */
import { useState, useEffect, useCallback } from 'react'
import type { DiscoverItem, DiscoverWorld } from '../data/discoverData'
import { getRandomItemsExcept } from '../data/discoverData'
import { speakArabic } from '../../engine/soundManager'
import { speakEnglish } from '../../english/engine/soundManager'
import { markActivityCompleted } from '../engine/discoverProgress'

// ——— نوع السؤال ———
interface ActivityQuestion {
  type: 'ar' | 'en'
  target: DiscoverItem
  options: DiscoverItem[]  // الخيارات الثابتة (لا تتغير بعد البناء)
}

// ——— بناء أسئلة لنشاط ———
function buildQuestions(world: DiscoverWorld, count: number): ActivityQuestion[] {
  const qs: ActivityQuestion[] = []
  const shuffled = [...world.items].sort(() => Math.random() - 0.5)
  for (let i = 0; i < Math.min(count, world.items.length); i++) {
    const target = shuffled[i]
    const wrongs = getRandomItemsExcept(target, world.id, 3)
    // نبني الخيارات مرة واحدة ونثبّتها
    const options = [target, ...wrongs].sort(() => Math.random() - 0.5)
    qs.push({ type: i % 2 === 0 ? 'ar' : 'en', target, options })
  }
  return qs
}

// ——— Props ———
interface ActivityEngineProps {
  world: DiscoverWorld
  activityType: 'findIt' | 'whatIsThis' | 'listenPick' | 'quiz'
  questionsCount?: number
  onComplete: (score: number, total: number) => void
  onBack: () => void
}

// ══════════════════════════════════════════════
// المكوّن الرئيسي
// ══════════════════════════════════════════════
export function ActivityEngine({
  world,
  activityType,
  questionsCount = 5,
  onComplete,
  onBack,
}: ActivityEngineProps) {
  // بناء الأسئلة مرة واحدة فقط
  const [questions] = useState<ActivityQuestion[]>(() =>
    buildQuestions(world, questionsCount)
  )
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  // selected: id الخيار المختار — ثابت حتى الانتقال
  const [selected, setSelected] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[step]
  const TOTAL = questions.length

  // ——— قراءة السؤال تلقائياً ———
  useEffect(() => {
    if (!q) return
    const timer = setTimeout(() => {
      if (activityType === 'listenPick') {
        // اسمع واختر: اقرأ الاسم بالعربية أولاً
        speakArabic(q.target.nameAr)
      } else if (activityType === 'whatIsThis') {
        speakArabic('مَا هَذَا؟')
      } else if (activityType === 'findIt') {
        q.type === 'ar'
          ? speakArabic(`اخْتَرْ ${q.target.nameAr}`)
          : speakEnglish(`Choose the ${q.target.nameEn}`)
      } else if (q.type === 'ar') {
        speakArabic(`أَيْنَ ${q.target.nameAr}؟`)
      } else {
        speakEnglish(`Where is the ${q.target.nameEn}?`)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [step, q?.target.id])

  // ——— اختيار إجابة ———
  const handleSelect = useCallback((itemId: string) => {
    if (selected !== null) return  // منع الضغط المزدوج
    setSelected(itemId)
    const correct = itemId === q.target.id
    setIsCorrect(correct)

    if (correct) {
      setScore((s) => s + 1)
      // تشجيع صوتي متنوع
      const phrases = ['أَحْسَنْتَ!', 'رَائِع!', 'مُمْتَاز!', 'صَحِيح!']
      setTimeout(() => speakArabic(phrases[Math.floor(Math.random() * phrases.length)]), 200)
      // الانتقال للسؤال التالي
      setTimeout(() => {
        setSelected(null)
        setIsCorrect(null)
        setRetryCount(0)
        if (step + 1 >= TOTAL) {
          setDone(true)
          markActivityCompleted(world.id, activityType, Math.round(((score + 1) / TOTAL) * 100))
        } else {
          setStep((s) => s + 1)
        }
      }, 1200)
    } else {
      // إجابة خاطئة: لا تكشف الصحيح، اسمح بإعادة المحاولة
      setTimeout(() => speakArabic('حَاوِلْ مَرَّةً أُخْرَى!'), 100)
      setTimeout(() => {
        setSelected(null)
        setIsCorrect(null)
        setRetryCount((r) => r + 1)
      }, 1400)
    }
  }, [selected, q, step, score, TOTAL, world.id, activityType])

  // ——— قراءة يدوية للسؤال ———
  const readQuestion = () => {
    if (activityType === 'listenPick') {
      speakArabic(q.target.nameAr)
      setTimeout(() => speakEnglish(q.target.nameEn), 1000)
    } else if (activityType === 'whatIsThis') {
      speakArabic('مَا هَذَا؟')
    } else if (activityType === 'findIt') {
      q.type === 'ar'
        ? speakArabic(`اخْتَرْ ${q.target.nameAr}`)
        : speakEnglish(`Choose the ${q.target.nameEn}`)
    } else if (q.type === 'ar') {
      speakArabic(`أَيْنَ ${q.target.nameAr}؟`)
    } else {
      speakEnglish(`Where is the ${q.target.nameEn}?`)
    }
  }

  // ——— شاشة النتيجة ———
  if (done) {
    const pct = Math.round((score / TOTAL) * 100)
    const star = pct >= 80 ? '🌟' : pct >= 60 ? '🎉' : '💪'
    return (
      <div className="flex min-h-screen items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${world.color}22, ${world.colorEnd}22)` }}>
        <div className="mx-auto w-full max-w-sm rounded-3xl border-4 border-white/80 bg-white/90 p-8 text-center shadow-2xl">
          <div className="mb-2 text-7xl">{star}</div>
          <h2 className="text-3xl font-extrabold text-gray-800">
            {pct >= 80 ? 'مُمْتَاز! 🌟' : pct >= 60 ? 'أَحْسَنْتَ! 🎉' : 'اسْتَمِرَّ! 💪'}
          </h2>
          <p className="mt-2 text-xl text-gray-600">{score} / {TOTAL} إِجَابَة صَحِيحَة</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-3 rounded-full transition-all"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${world.color}, ${world.colorEnd})` }} />
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => { setStep(0); setScore(0); setSelected(null); setIsCorrect(null); setDone(false) }}
              className="rounded-2xl px-5 py-3 font-bold text-white shadow transition hover:scale-105"
              style={{ background: world.color }}
            >
              🔄 مُجَدَّداً
            </button>
            <button
              onClick={() => onComplete(score, TOTAL)}
              className="rounded-2xl px-5 py-3 font-bold text-white shadow transition hover:scale-105"
              style={{ background: world.colorEnd }}
            >
              ← رُجُوع
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!q) return null

  // ——— نص السؤال ———
  const questionText =
    activityType === 'listenPick'
      ? '🔊 اسْمَعْ وَاخْتَرْ'
      : activityType === 'whatIsThis'
      ? '❓ مَا هَذَا؟'
      : activityType === 'findIt'
      ? q.type === 'ar'
        ? `اخْتَرْ ${q.target.nameAr}`
        : `Choose the ${q.target.nameEn}`
      : q.type === 'ar'
      ? `أَيْنَ ${q.target.nameAr}؟`
      : `Where is the ${q.target.nameEn}?`

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${world.color}15, ${world.colorEnd}15)` }}>
      <div className="mx-auto w-full max-w-lg">

        {/* ——— شريط التقدم ——— */}
        <div className="mb-6">
          <div className="mb-1 flex items-center justify-between text-sm font-bold text-gray-600">
            <span>سُؤَال {step + 1} / {TOTAL}</span>
            <span>⭐ {score}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/60">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(step / TOTAL) * 100}%`,
                background: `linear-gradient(90deg, ${world.color}, ${world.colorEnd})`,
              }}
            />
          </div>
        </div>

        {/* ——— بطاقة السؤال ——— */}
        <div className="mb-6 overflow-hidden rounded-3xl border-2 border-white/70 bg-white/85 p-5 text-center shadow-xl backdrop-blur-sm">

          {/* في نشاط "اسمع واختر" يُظهر رمز الصوت فقط بدون الصورة */}
          {activityType === 'listenPick' ? (
            <button
              onClick={() => { speakArabic(q.target.nameAr); setTimeout(() => speakEnglish(q.target.nameEn), 1000) }}
              className="mb-3 text-8xl transition hover:scale-110 active:scale-95"
            >
              🔊
            </button>
          ) : activityType === 'whatIsThis' ? (
            <button
              onClick={() => { speakArabic(q.target.nameAr); setTimeout(() => speakEnglish(q.target.nameEn), 900) }}
              className="mb-3 text-8xl transition hover:scale-110 active:scale-95"
              aria-label="استمع إلى اسم العنصر"
            >
              {q.target.emoji}
            </button>
          ) : (
            <div className="mb-3 text-5xl">❓</div>
          )}

          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-800">{questionText}</h2>
            <button
              onClick={readQuestion}
              className="rounded-full bg-blue-50 p-2 text-blue-500 transition hover:scale-110"
              title="اسمع السؤال"
            >🔊</button>
          </div>

          {retryCount > 0 && (
            <p className="mt-2 text-sm font-bold text-orange-500">
              🔄 حَاوِلْ مَرَّةً أُخْرَى! ({retryCount})
            </p>
          )}
        </div>

        {/* ——— خيارات 2×2 ——— */}
        <div className="grid grid-cols-2 gap-4">
          {q.options.map((opt) => {
            // تحديد لون الخيار بعد الاختيار
            let borderColor = 'border-white/50'
            let bg = 'bg-white/80'
            if (selected !== null) {
              if (opt.id === q.target.id) {
                borderColor = 'border-green-400'
                bg = 'bg-green-50'
              } else if (opt.id === selected && opt.id !== q.target.id) {
                borderColor = 'border-red-400'
                bg = 'bg-red-50'
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={selected !== null && isCorrect === true}
                className={`flex flex-col items-center justify-center gap-2 rounded-3xl border-3 p-5 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed ${bg} ${borderColor} border-2`}
                style={{ minHeight: '120px' }}
              >
                <span className="text-5xl">{opt.emoji}</span>
                <span className="text-sm font-extrabold text-gray-800">{opt.nameAr}</span>
                <span className="text-xs font-semibold text-gray-500" dir="ltr">{opt.nameEn}</span>
              </button>
            )
          })}
        </div>

        {/* زر العودة */}
        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-sm text-gray-400 underline">
            ← العودة
          </button>
        </div>
      </div>
    </div>
  )
}
