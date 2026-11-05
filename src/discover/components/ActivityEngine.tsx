/**
 * ActivityEngine — محرك الأنشطة التعليمية المتنوع
 *
 * الأنشطة المتاحة:
 * 1. discover    — "اكتشف واعرف" (دمج findIt + whatIsThis بتبديل تلقائي)
 * 2. listenPick  — "اسمع واختر"
 * 3. riddle      — "خمّن من الوصف" (وصف بدون صورة → اختر العنصر)
 * 4. whatMissing — "ما الناقص؟" (مجموعة عناصر ناقصها واحد)
 * 5. sort        — "صنّف الأشياء" (صنّف كل عنصر لمجموعته)
 * 6. quiz        — "اختبر نفسك" (أسئلة مختلطة)
 *
 * ملاحظات:
 * - الأسماء القديمة findIt و whatIsThis مدعومة كـ alias داخلي (توافق خلفي).
 * - الخيارات تُبنى مرة واحدة وتُثبَّت لمنع إعادة الترتيب.
 */

import { useState, useEffect, useCallback} from 'react'
import type { DiscoverItem, DiscoverWorld } from '../data/discoverData'
import { getRandomItemsExcept } from '../data/discoverData'
import { speakArabic } from '../../engine/soundManager'
import { speakEnglish } from '../../english/engine/soundManager'
import { markActivityCompleted } from '../engine/discoverProgress'

// ——— نوع النشاط (يدعم الأسماء القديمة) ———
export type ActivityType =
  | 'discover'
  | 'listenPick'
  | 'riddle'
  | 'whatMissing'
  | 'sort'
  | 'quiz'
  | 'findIt'      // alias قديم → discover
  | 'whatIsThis'  // alias قديم → discover

// ——— نوع السؤال ———
interface ActivityQuestion {
  type: 'ar' | 'en' | 'riddle' | 'missing' | 'sort'
  target: DiscoverItem
  options: DiscoverItem[]
  /** للغز: النص الوصفي */
  riddleText?: string
  /** للتصنيف: المجموعة الصحيحة */
  correctGroup?: string
  /** للتصنيف: المجموعات المتاحة */
  groups?: string[]
}

// ══════════════════════════════════════════════
// بناء الأسئلة حسب نوع النشاط
// ══════════════════════════════════════════════

function buildDiscoverQuestions(world: DiscoverWorld, count: number): ActivityQuestion[] {
  const qs: ActivityQuestion[] = []
  const shuffled = [...world.items].sort(() => Math.random() - 0.5)
  for (let i = 0; i < Math.min(count, world.items.length); i++) {
    const target = shuffled[i]
    const wrongs = getRandomItemsExcept(target, world.id, 3)
    const options = [target, ...wrongs].sort(() => Math.random() - 0.5)
    qs.push({ type: i % 2 === 0 ? 'ar' : 'en', target, options })
  }
  return qs
}

function buildListenQuestions(world: DiscoverWorld, count: number): ActivityQuestion[] {
  return buildDiscoverQuestions(world, count)
}

function buildRiddleQuestions(world: DiscoverWorld, count: number): ActivityQuestion[] {
  // نستخدم العناصر التي لها وصف
  const withDesc = world.items.filter((i) => i.descAr)
  const pool = withDesc.length >= 4 ? withDesc : world.items
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const qs: ActivityQuestion[] = []
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const target = shuffled[i]
    const wrongs = getRandomItemsExcept(target, world.id, 3)
    const options = [target, ...wrongs].sort(() => Math.random() - 0.5)
    const riddleText = target.descAr
      ? `أَنَا ${target.descAr}. مَنْ أَنَا؟`
      : `مَنْ أَنَا؟ ${target.emoji}`
    qs.push({ type: 'riddle', target, options, riddleText })
  }
  return qs
}

function buildWhatMissingQuestions(world: DiscoverWorld, count: number): ActivityQuestion[] {
  const qs: ActivityQuestion[] = []
  const items = world.items
  if (items.length < 4) return qs

  for (let i = 0; i < Math.min(count, 6); i++) {
    // نختار 3 عناصر لعرضها + 1 مفقود
    const shuffled = [...items].sort(() => Math.random() - 0.5)
    const shown = shuffled.slice(0, 3)
    const missing = shuffled[3]
    // الخيارات: المفقود + 3 مشتتات من خارج المجموعة المعروضة
    const shownIds = new Set(shown.map((s) => s.id))
    const distractors = items
      .filter((it) => !shownIds.has(it.id) && it.id !== missing.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const options = [missing, ...distractors].sort(() => Math.random() - 0.5)
    qs.push({ type: 'missing', target: missing, options })
  }
  return qs
}

// ——— التصنيف: مجموعات حسب العالم ———
interface SortGroup {
  id: string
  label: string
  emoji: string
  matcher: (item: DiscoverItem) => boolean
}

function getSortGroups(worldId: string): SortGroup[] | null {
  // نستخدم مجموعات مخصصة حسب العالم
  if (worldId === 'animals') {
    const seaIds = new Set(['fish', 'dolphin', 'whale', 'octopus', 'shark', 'crab', 'penguin', 'turtle'])
    const insectIds = new Set(['butterfly', 'ant', 'spider', 'snail', 'bee'])
    return [
      { id: 'sea', label: 'حيوانات البحر', emoji: '🌊', matcher: (i) => seaIds.has(i.id) },
      { id: 'land', label: 'حيوانات البر', emoji: '🌳', matcher: (i) => !seaIds.has(i.id) && !insectIds.has(i.id) },
    ]
  }
  if (worldId === 'food') {
    const fruitIds = new Set(['apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon', 'dates'])
    const drinkIds = new Set(['milk', 'water', 'juice', 'tea'])
    const sweetIds = new Set(['cake', 'icecream', 'chocolate', 'honey'])
    return [
      { id: 'fruit', label: 'فواكه', emoji: '🍎', matcher: (i) => fruitIds.has(i.id) },
      { id: 'drink', label: 'مشروبات', emoji: '🥤', matcher: (i) => drinkIds.has(i.id) },
      { id: 'sweet', label: 'حلويات', emoji: '🍰', matcher: (i) => sweetIds.has(i.id) },
    ]
  }
  if (worldId === 'weather') {
    const seasons = new Set(['spring', 'summer', 'autumn', 'winter'])
    const phenomena = new Set(['lightning', 'thunder', 'fog', 'dew', 'rainbow2'])
    return [
      { id: 'seasons', label: 'الفصول', emoji: '🌸', matcher: (i) => seasons.has(i.id) },
      { id: 'phenomena', label: 'ظواهر طبيعية', emoji: '⚡', matcher: (i) => phenomena.has(i.id) },
    ]
  }
  if (worldId === 'time') {
    const units = new Set(['second', 'minute', 'hour', 'day', 'week', 'month', 'year'])
    const partsOfDay = new Set(['morning', 'noon', 'evening', 'night'])
    return [
      { id: 'units', label: 'وحدات الوقت', emoji: '⏱️', matcher: (i) => units.has(i.id) },
      { id: 'dayparts', label: 'أوقات اليوم', emoji: '🌅', matcher: (i) => partsOfDay.has(i.id) },
    ]
  }
  if (worldId === 'transport') {
    const landIds = new Set(['car', 'bus', 'truck', 'train', 'bicycle', 'motorcycle', 'ambulance', 'firetruck', 'taxi', 'scooter', 'subway'])
    const airIds = new Set(['airplane', 'helicopter', 'hotairballoon'])
    const waterIds = new Set(['ship', 'boat'])
    return [
      { id: 'land', label: 'بر', emoji: '🛣️', matcher: (i) => landIds.has(i.id) },
      { id: 'air', label: 'جو', emoji: '☁️', matcher: (i) => airIds.has(i.id) },
      { id: 'water', label: 'بحر', emoji: '🌊', matcher: (i) => waterIds.has(i.id) },
    ]
  }
  if (worldId === 'shapes') {
    const flat = new Set(['circle', 'square', 'triangle', 'rectangle', 'oval', 'diamond', 'parallelogram', 'trapezoid', 'arrow', 'starshape', 'heartshape'])
    const solid = new Set(['cube'])
    return [
      { id: 'flat', label: 'أشكال مسطحة', emoji: '⬜', matcher: (i) => flat.has(i.id) },
      { id: 'solid', label: 'أشكال مجسّمة', emoji: '🧊', matcher: (i) => solid.has(i.id) },
    ]
  }
  if (worldId === 'clothes') {
    const summer = new Set(['tshirt', 'sandals', 'hat'])
    const winter = new Set(['coat', 'gloves', 'scarf', 'rainboots'])
    return [
      { id: 'summer', label: 'ملابس صيف', emoji: '☀️', matcher: (i) => summer.has(i.id) },
      { id: 'winter', label: 'ملابس شتاء', emoji: '❄️', matcher: (i) => winter.has(i.id) },
    ]
  }
  // لا توجد مجموعات معرّفة لهذا العالم
  return null
}

function buildSortQuestions(world: DiscoverWorld, count: number): ActivityQuestion[] {
  const groups = getSortGroups(world.id)
  if (!groups || groups.length < 2) return []

  // نجمع عناصر كل مجموعة
  const buckets = groups.map((g) => ({
    group: g,
    items: world.items.filter((i) => g.matcher(i)),
  })).filter((b) => b.items.length > 0)

  if (buckets.length < 2) return []

  const qs: ActivityQuestion[] = []
  const total = Math.min(count, world.items.length)
  const pool = [...world.items].sort(() => Math.random() - 0.5).slice(0, total)

  for (const item of pool) {
    const correctGroup = groups.find((g) => g.matcher(item))
    if (!correctGroup) continue
    qs.push({
      type: 'sort',
      target: item,
      options: [item], // لا نستخدم options في sort لكن نبقيه للاتساق
      correctGroup: correctGroup.id,
      groups: groups.map((g) => g.id),
    })
  }
  return qs
}

function buildQuizQuestions(world: DiscoverWorld, count: number): ActivityQuestion[] {
  const types: ActivityQuestion['type'][] = ['ar', 'en', 'riddle', 'missing']
  const qs: ActivityQuestion[] = []
  const shuffled = [...world.items].sort(() => Math.random() - 0.5)

  const usedIds = new Set<string>()
  let i = 0
  while (qs.length < count && i < shuffled.length * 2) {
    const target = shuffled[i % shuffled.length]
    i++
    if (usedIds.has(target.id)) continue
    usedIds.add(target.id)

    const kind = types[qs.length % types.length]
    if (kind === 'riddle') {
      const wrongs = getRandomItemsExcept(target, world.id, 3)
      const options = [target, ...wrongs].sort(() => Math.random() - 0.5)
      const riddleText = target.descAr ? `أَنَا ${target.descAr}. مَنْ أَنَا؟` : `مَنْ أَنَا؟ ${target.emoji}`
      qs.push({ type: 'riddle', target, options, riddleText })
    } else if (kind === 'missing') {
      const wrongs = getRandomItemsExcept(target, world.id, 3)
      const options = [target, ...wrongs].sort(() => Math.random() - 0.5)
      qs.push({ type: 'missing', target, options })
    } else {
      const wrongs = getRandomItemsExcept(target, world.id, 3)
      const options = [target, ...wrongs].sort(() => Math.random() - 0.5)
      qs.push({ type: kind, target, options })
    }
  }
  return qs
}

function buildQuestions(world: DiscoverWorld, activityType: ActivityType, count: number): ActivityQuestion[] {
  switch (activityType) {
    case 'discover':
    case 'findIt':
    case 'whatIsThis':
      return buildDiscoverQuestions(world, count)
    case 'listenPick':
      return buildListenQuestions(world, count)
    case 'riddle':
      return buildRiddleQuestions(world, count)
    case 'whatMissing':
      return buildWhatMissingQuestions(world, count)
    case 'sort':
      return buildSortQuestions(world, count)
    case 'quiz':
      return buildQuizQuestions(world, count)
    default:
      return buildDiscoverQuestions(world, count)
  }
}

// ——— Props ———
interface ActivityEngineProps {
  world: DiscoverWorld
  activityType: ActivityType
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
  questionsCount = 6,
  onComplete,
  onBack,
}: ActivityEngineProps) {
  const normalizedType: ActivityType =
    activityType === 'findIt' || activityType === 'whatIsThis' ? 'discover' : activityType

  const [questions] = useState<ActivityQuestion[]>(() =>
    buildQuestions(world, normalizedType, questionsCount)
  )
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
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
      if (q.type === 'riddle' && q.riddleText) {
        speakArabic(q.riddleText)
      } else if (normalizedType === 'listenPick') {
        speakArabic(q.target.nameAr)
      } else if (normalizedType === 'whatMissing') {
        speakArabic('مَا الشَّيْءُ النَّاقِصُ؟')
      } else if (normalizedType === 'sort') {
        speakArabic(`أَيْنَ يَنْتَمِي ${q.target.nameAr}؟`)
   } else if (q.type === 'missing') {
        speakArabic(`مَا الشَّيْءُ النَّاقِصُ؟ اِخْتَرْ ${q.target.nameAr}`)
      } else if (q.type === 'ar') {
        speakArabic(`اخْتَرْ ${q.target.nameAr}`)
      } else if (q.type === 'en') {
        speakEnglish(`Choose the ${q.target.nameEn}`)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [step, q?.target.id, normalizedType])

  // ——— اختيار إجابة (MCQ) ———
  const handleSelect = useCallback((itemId: string) => {
    if (selected !== null) return
    setSelected(itemId)
    const correct = itemId === q.target.id
    setIsCorrect(correct)

    if (correct) {
      setScore((s) => s + 1)
      const phrases = ['أَحْسَنْتَ!', 'رَائِع!', 'مُمْتَاز!', 'صَحِيح!']
      setTimeout(() => speakArabic(phrases[Math.floor(Math.random() * phrases.length)]), 200)
      setTimeout(() => {
        setSelected(null)
        setIsCorrect(null)
        setRetryCount(0)
        if (step + 1 >= TOTAL) {
          setDone(true)
          markActivityCompleted(world.id, normalizedType, Math.round(((score + 1) / TOTAL) * 100))
        } else {
          setStep((s) => s + 1)
        }
      }, 1200)
    } else {
      setTimeout(() => speakArabic('حَاوِلْ مَرَّةً أُخْرَى!'), 100)
      setTimeout(() => {
        setSelected(null)
        setIsCorrect(null)
        setRetryCount((r) => r + 1)
      }, 1400)
    }
  }, [selected, q, step, score, TOTAL, world.id, normalizedType])

  // ——— اختيار تصنيف (Sort) ———
  const handleSortSelect = useCallback((groupId: string) => {
    if (selected !== null) return
    setSelected(groupId)
    const correct = groupId === q.correctGroup
    setIsCorrect(correct)

    if (correct) {
      setScore((s) => s + 1)
      setTimeout(() => speakArabic('أَحْسَنْتَ!'), 150)
      setTimeout(() => {
        setSelected(null)
        setIsCorrect(null)
        if (step + 1 >= TOTAL) {
          setDone(true)
          markActivityCompleted(world.id, normalizedType, Math.round(((score + 1) / TOTAL) * 100))
        } else {
          setStep((s) => s + 1)
        }
      }, 1100)
    } else {
      setTimeout(() => speakArabic('حَاوِلْ مَرَّةً أُخْرَى!'), 100)
      setTimeout(() => {
        setSelected(null)
        setIsCorrect(null)
        setRetryCount((r) => r + 1)
      }, 1300)
    }
  }, [selected, q, step, score, TOTAL, world.id, normalizedType])

  // ——— قراءة يدوية للسؤال ———
  const readQuestion = () => {
    if (q.type === 'riddle' && q.riddleText) {
      speakArabic(q.riddleText)
    } else if (normalizedType === 'listenPick') {
      speakArabic(q.target.nameAr)
      setTimeout(() => speakEnglish(q.target.nameEn), 1000)
    } else if (q.type === 'missing') {
      speakArabic(`مَا الشَّيْءُ النَّاقِصُ؟ اِخْتَرْ ${q.target.nameAr}`)
    } else if (q.type === 'ar') {
      speakArabic(`اخْتَرْ ${q.target.nameAr}`)
    } else if (q.type === 'en') {
      speakEnglish(`Choose the ${q.target.nameEn}`)
    } else {
      speakArabic('اسْتَمِعْ إِلَى السُّؤَالِ')
    }
  }

  // ——— شاشة النتيجة ———
  if (done) {
    const pct = TOTAL > 0 ? Math.round((score / TOTAL) * 100) : 0
    const star = pct >= 80 ? '🌟' : pct >= 60 ? '🎉' : '💪'
    return (
      <div className="discover-activity-engine flex min-h-screen items-center justify-center p-4"
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

  if (!q) {
    return (
      <div className="discover-activity-engine flex min-h-screen items-center justify-center p-4">
        <div className="rounded-3xl bg-white/90 p-8 text-center shadow-xl">
          <p className="text-lg text-gray-600">لا توجد أسئلة كافية في هذا النشاط.</p>
          <button onClick={onBack} className="mt-4 rounded-2xl bg-gray-800 px-5 py-2 font-bold text-white">
            ← رُجُوع
          </button>
        </div>
      </div>
    )
  }

  // ——— نص السؤال ———
  const questionText = (() => {
    if (q.type === 'riddle') return '🧩 خَمِّنْ مِنَ الْوَصْفِ'
    if (normalizedType === 'listenPick') return '🔊 اسْمَعْ وَاخْتَرْ'
    if (normalizedType === 'whatMissing') return '❓ مَا الشَّيْءُ النَّاقِصُ؟'
    if (normalizedType === 'sort') return `🔗 أَيْنَ يَنْتَمِي ${q.target.nameAr}؟`
    if (q.type === 'ar') return `اخْتَرْ ${q.target.nameAr}`
    if (q.type === 'en') return `Choose the ${q.target.nameEn}`
    return '❓ اخْتَرْ'
  })()

  // ——— مجموعات التصنيف ———
  const sortGroups = normalizedType === 'sort' ? getSortGroups(world.id) ?? [] : []

  return (
    <div className="discover-activity-engine flex min-h-screen flex-col items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${world.color}15, ${world.colorEnd}15)` }}>
      <div className="mx-auto w-full max-w-lg">

        {/* شريط التقدم */}
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

        {/* بطاقة السؤال */}
        <div className="mb-6 overflow-hidden rounded-3xl border-2 border-white/70 bg-white/85 p-5 text-center shadow-xl backdrop-blur-sm">

          {/* منطقة العرض حسب النوع */}
                    {/* ——— في نشاط التصنيف: السؤال أولاً ثم الصورة ——— */}
          {normalizedType === 'sort' ? (
            <>
              <div className="mb-3 flex items-center justify-center gap-2">
                <h2 className="text-xl font-extrabold text-gray-800">{questionText}</h2>
                <button
                  onClick={readQuestion}
                  className="rounded-full bg-blue-50 p-2 text-blue-500 transition hover:scale-110"
                  title="اسمع السؤال"
                >🔊</button>
              </div>
              <div className="mb-3 text-8xl">{q.target.emoji}</div>
            </>
          ) : (
            <>
              {normalizedType === 'listenPick' ? (
                <button
                  onClick={() => { speakArabic(q.target.nameAr); setTimeout(() => speakEnglish(q.target.nameEn), 1000) }}
                  className="mb-3 text-8xl transition hover:scale-110 active:scale-95"
                >
                  🔊
                </button>
              ) : q.type === 'riddle' ? (
                <div className="mb-3 text-7xl">🧩</div>
              ) : (normalizedType === 'whatMissing' || q.type === 'missing') ? (
                <div className="mb-3 flex justify-center gap-3">
                  {world.items
                    .filter((it) => it.id !== q.target.id)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3)
                    .map((it) => (
                      <span key={it.id} className="text-4xl opacity-80">{it.emoji}</span>
                    ))}
                  <span className="text-5xl">❓</span>
                </div>
              ) : (
                <div className="mb-3 text-5xl">❓</div>
              )}

              {q.type === 'riddle' && q.riddleText ? (
                <p className="mb-3 text-xl font-extrabold leading-relaxed text-gray-800">{q.riddleText}</p>
              ) : null}

              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-extrabold text-gray-800">{questionText}</h2>
                <button
                  onClick={readQuestion}
                  className="rounded-full bg-blue-50 p-2 text-blue-500 transition hover:scale-110"
                  title="اسمع السؤال"
                >🔊</button>
              </div>
            </>
          )}

          {retryCount > 0 && (
            <p className="mt-2 text-sm font-bold text-orange-500">
              🔄 حَاوِلْ مَرَّةً أُخْرَى! ({retryCount})
            </p>
          )}
        </div>

        {/* منطقة الخيارات */}
        {normalizedType === 'sort' && sortGroups.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sortGroups.map((g) => {
              const isPicked = selected === g.id
              const isRight = g.id === q.correctGroup
              let cls = 'border-white/60 bg-white/90 hover:scale-105'
              if (selected !== null) {
                if (isRight) cls = 'border-green-400 bg-green-50'
                else if (isPicked) cls = 'border-red-400 bg-red-50'
                else cls = 'border-white/40 bg-white/60 opacity-70'
              }
              return (
                <button
                  key={g.id}
                  onClick={() => handleSortSelect(g.id)}
                  disabled={selected !== null}
                  className={`flex flex-col items-center gap-2 rounded-3xl border-2 p-5 shadow-lg transition-all duration-200 ${cls}`}
                >
                  <span className="text-5xl">{g.emoji}</span>
                  <span className="text-base font-extrabold text-gray-800">{g.label}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {q.options.map((opt) => {
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
        )}

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-sm text-gray-400 underline">← العودة</button>
        </div>
      </div>
    </div>
  )
}
