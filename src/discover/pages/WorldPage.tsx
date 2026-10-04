/**
 * WorldPage — صفحة العالم التفاعلي
 *
 * المراحل:
 * 1. explore: استكشاف العناصر (ضغط على بطاقة → popup)
 * 2. activity: اختيار نشاط
 * 3. playing: تشغيل النشاط
 */
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getWorldById } from '../data/discoverData'
import type { DiscoverItem } from '../data/discoverData'
import { ItemCard } from '../components/ItemCard'
import { ActivityEngine } from '../components/ActivityEngine'
import { markItemSeen, getWorldCompletion } from '../engine/discoverProgress'
import { speakArabic } from '../../engine/soundManager'
import { speakEnglish } from '../../english/engine/soundManager'


type Mode = 'explore' | 'chooseActivity' | 'playing'
type ActivityId = 'findIt' | 'whatIsThis' | 'listenPick' | 'quiz'

// الأنشطة المتاحة لكل عالم
const ACTIVITIES: { id: ActivityId; titleAr: string; titleEn: string; emoji: string; desc: string }[] = [
  { id: 'findIt',     titleAr: 'أَيْنَ هُوَ؟',       titleEn: 'Find It!',       emoji: '🔍', desc: 'ابحث عن الشيء الصحيح' },
  { id: 'whatIsThis', titleAr: 'مَا هَذَا؟',          titleEn: 'What Is This?',  emoji: '❓', desc: 'خمّن اسم الشيء' },
  { id: 'listenPick', titleAr: 'اسْمَعْ وَاخْتَرْ',   titleEn: 'Listen & Pick',  emoji: '👂', desc: 'اسمع الكلمة واختر الصورة' },
  { id: 'quiz',       titleAr: 'اخْتَبِرْ نَفْسَكَ',  titleEn: 'Quiz Yourself',  emoji: '🏆', desc: 'اختبار شامل سريع' },
]

export function WorldPage() {
  const { worldId } = useParams<{ worldId: string }>()
  const world = getWorldById(worldId ?? '')
  const [mode, setMode] = useState<Mode>('explore')
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null)
  const [activeActivity, setActiveActivity] = useState<ActivityId | null>(null)
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null)

  // نطق العنصر بالعربية أولًا ثم الإنجليزية، مع مهلة قصيرة تمنع تداخل الصوتين.
  const speakItem = (item: DiscoverItem) => {
    speakArabic(item.nameAr)
    const arabicDuration = Math.max(850, Math.min(1800, 420 + item.nameAr.replace(/[^\u0600-\u06FF]/g, '').length * 95))
    window.setTimeout(() => speakEnglish(item.nameEn, { rate: 0.82 }), arabicDuration)
  }

  // قراءة اسم العالم عند الدخول
  useEffect(() => {
    if (world) {
      const t = setTimeout(() => speakArabic(`مَرْحَبًا بِكَ فِي ${world.titleAr}`), 600)
      return () => clearTimeout(t)
    }
  }, [world?.id])

  if (!world) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-600">العالم غير موجود</p>
          <Link to="/discover" className="mt-4 inline-block rounded-xl bg-blue-500 px-4 py-2 text-white">
            ← رجوع
          </Link>
        </div>
      </div>
    )
  }

  const completion = getWorldCompletion(world.id, world.items.length)

  // ——— وضع اللعب ———
  if (mode === 'playing' && activeActivity) {
    return (
      <ActivityEngine
        world={world}
        activityType={activeActivity}
        questionsCount={activeActivity === 'quiz' ? 10 : 8}
        onComplete={(score, total) => {
          setQuizResult({ score, total })
          setMode('chooseActivity')
        }}
        onBack={() => setMode('chooseActivity')}
      />
    )
  }

  // ——— اختيار النشاط ———
  if (mode === 'chooseActivity') {
    return (
      <div
        className="min-h-screen p-4 pb-16"
        style={{
          background: `linear-gradient(160deg, ${world.color}18 0%, ${world.colorEnd}18 100%)`,
        }}
      >
        <div className="mx-auto max-w-2xl">
          {/* رأس الصفحة */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setMode('explore')}
              className="flex items-center gap-2 rounded-2xl border-2 border-white/70 bg-white/80 px-4 py-2 text-sm font-bold text-gray-700 shadow backdrop-blur-sm transition hover:scale-105"
            >
              ← الاستكشاف
            </button>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-white/70 bg-white/80 px-4 py-2 shadow backdrop-blur-sm">
              <span className="text-2xl">{world.emoji}</span>
              <span className="text-base font-extrabold text-gray-800">{world.titleAr}</span>
            </div>
            <Link
              to="/discover"
              className="flex items-center gap-1 rounded-2xl border-2 border-white/70 bg-white/80 px-3 py-2 text-sm font-bold text-gray-700 shadow backdrop-blur-sm transition hover:scale-105"
            >
              🏠
            </Link>
          </div>

          {/* نتيجة آخر اختبار */}
          {quizResult && (
            <div className="mb-5 rounded-3xl border-2 border-green-200 bg-green-50 p-4 text-center shadow-lg">
              <p className="text-lg font-extrabold text-green-700">
                🎉 نَتِيجَتُكَ: {quizResult.score} / {quizResult.total}
              </p>
              <div className="mt-2 h-2 rounded-full bg-green-100">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all"
                  style={{ width: `${(quizResult.score / quizResult.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <h2 className="mb-4 text-center text-2xl font-extrabold text-gray-800">
            🎯 اخْتَرْ نَشَاطًا
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {ACTIVITIES.map((act) => (
              <button
                key={act.id}
                onClick={() => { setActiveActivity(act.id); setMode('playing') }}
                className="flex flex-col items-center gap-2 overflow-hidden rounded-3xl border-2 border-white/70 bg-white/85 p-5 text-center shadow-xl transition-all hover:scale-105 hover:-translate-y-1 backdrop-blur-sm"
                style={{ boxShadow: `0 8px 24px ${world.color}22` }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-4xl shadow-inner"
                  style={{ background: `${world.color}22` }}
                >
                  {act.emoji}
                </div>
                <h3 className="text-base font-extrabold text-gray-800">{act.titleAr}</h3>
                <p className="text-xs text-gray-500" dir="ltr">{act.titleEn}</p>
                <p className="text-xs text-gray-400">{act.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ——— وضع الاستكشاف (الافتراضي) ———
  return (
    <div
      className="relative min-h-screen pb-16"
      style={{
        background: `linear-gradient(160deg, ${world.color}18 0%, ${world.colorEnd}18 100%)`,
      }}
    >
      {/* خلفية زخرفية */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {world.sceneEmojis.map((em, i) => (
          <span
            key={i}
            className="absolute text-4xl opacity-10"
            style={{
              top: `${10 + i * 20}%`,
              [i % 2 === 0 ? 'left' : 'right']: `${5 + (i * 7) % 15}%`,
              fontSize: `${4 + (i % 3)}rem`,
            }}
          >
            {em}
          </span>
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-5">

        {/* ——— الترويسة ——— */}
        <header className="mb-5">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/discover"
              className="flex items-center gap-2 rounded-2xl border-2 border-white/70 bg-white/80 px-3 py-2 text-sm font-bold text-gray-700 shadow backdrop-blur-sm transition hover:scale-105"
            >
              🌍 اكتشف
            </Link>

            <div
              className="flex items-center gap-3 rounded-3xl border-2 border-white/70 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-sm"
              style={{ boxShadow: `0 8px 24px ${world.color}25` }}
            >
              <span className="text-3xl">{world.emoji}</span>
              <div>
                <h1 className="text-lg font-extrabold text-gray-800">{world.titleAr}</h1>
                <p className="text-xs text-gray-500" dir="ltr">{world.titleEn}</p>
              </div>
            </div>

            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white/70 bg-white/80 text-lg shadow backdrop-blur-sm transition hover:scale-105"
            >
              🏠
            </Link>
          </div>

          {/* شريط التقدم */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/50">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${completion}%`, background: `linear-gradient(90deg, ${world.color}, ${world.colorEnd})` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-600">{completion}%</span>
          </div>
        </header>

        {/* ——— شبكة العناصر ——— */}
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {world.items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedItem(item)
                markItemSeen(world.id, item.id)
                speakItem(item)
              }}
              className="group flex flex-col items-center gap-1 rounded-2xl border-2 border-white/60 bg-white/75 p-3 text-center shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              <span className="text-5xl transition-transform group-hover:scale-110">{item.emoji}</span>
              <span className="text-sm font-extrabold text-gray-800">{item.nameAr}</span>
              <span className="text-xs text-gray-500" dir="ltr">{item.nameEn}</span>
            </button>
          ))}
        </div>

        {/* ——— زر الأنشطة ——— */}
        <div className="text-center">
          <button
            onClick={() => setMode('chooseActivity')}
            className="inline-flex items-center gap-3 rounded-3xl px-8 py-4 text-lg font-extrabold text-white shadow-xl transition-all hover:scale-105 hover:-translate-y-1 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${world.color}, ${world.colorEnd})`, boxShadow: `0 8px 32px ${world.color}55` }}
          >
            🎮 الأنشطة والألعاب
          </button>
        </div>
      </div>

      {/* ——— Popup بطاقة العنصر ——— */}
      {selectedItem && (() => {
        const selectedIndex = world.items.findIndex((item) => item.id === selectedItem.id)
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-md sm:p-5"
            onClick={() => setSelectedItem(null)}
          >
            <div className="flex w-full justify-center" onClick={(e) => e.stopPropagation()}>
              <ItemCard
                item={selectedItem}
                isPopup
                size="large"
                itemIndex={selectedIndex}
                itemCount={world.items.length}
                onClose={() => setSelectedItem(null)}
                onPrevious={() => {
                  if (selectedIndex > 0) {
                    const previous = world.items[selectedIndex - 1]
                    setSelectedItem(previous)
                    markItemSeen(world.id, previous.id)
                    speakItem(previous)
                  }
                }}
                onNext={() => {
                  if (selectedIndex < world.items.length - 1) {
                    const next = world.items[selectedIndex + 1]
                    setSelectedItem(next)
                    markItemSeen(world.id, next.id)
                    speakItem(next)
                  }
                }}
              />
            </div>
          </div>
        )
      })()}
    </div>
  )
}
