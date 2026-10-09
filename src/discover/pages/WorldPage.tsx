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
import { ActivityEngine, type ActivityType } from '../components/ActivityEngine'
import { markItemSeen, getWorldCompletion } from '../engine/discoverProgress'
import { speakArabic } from '../../engine/soundManager'
import { speakEnglish } from '../../english/engine/soundManager'


type Mode = 'explore' | 'chooseActivity' | 'playing'

// ——— الأنشطة المتاحة — مع لون ووصف واضح ———
interface ActivityMeta {
  id: ActivityType
  titleAr: string
  titleEn: string
  emoji: string
  desc: string
  color: string
  colorEnd: string
}

const ACTIVITIES: ActivityMeta[] = [
  {
    id: 'discover',
    titleAr: 'اِكْتَشِفْ وَاعْرِفْ',
    titleEn: 'Discover & Learn',
    emoji: '🔍',
    desc: 'اختر الشيء الصحيح',
    color: '#3aa0d9',
    colorEnd: '#2fb68c',
  },
  {
    id: 'listenPick',
    titleAr: 'اسْمَعْ وَاخْتَرْ',
    titleEn: 'Listen & Pick',
    emoji: '👂',
    desc: 'اسمع الكلمة واختر الصورة',
    color: '#8b5fbf',
    colorEnd: '#3aa0d9',
  },
  {
    id: 'riddle',
    titleAr: 'خَمِّنْ مِنَ الْوَصْفِ',
    titleEn: 'Guess from Description',
    emoji: '🧩',
    desc: 'اقرأ الوصف وخمّن',
    color: '#f59e0b',
    colorEnd: '#e85d75',
  },
  {
    id: 'whatMissing',
    titleAr: 'مَا النَّاقِصُ؟',
    titleEn: 'What Is Missing?',
    emoji: '🎨',
    desc: 'اكتشف الشيء المفقود',
    color: '#e85d75',
    colorEnd: '#8b5fbf',
  },
  {
    id: 'sort',
    titleAr: 'صَنِّفِ الأَشْيَاءَ',
    titleEn: 'Sort Things',
    emoji: '🔗',
    desc: 'صنّف كل شيء لمجموعته',
    color: '#2fb68c',
    colorEnd: '#3aa0d9',
  },
  {
    id: 'quiz',
    titleAr: 'اخْتَبِرْ نَفْسَكَ',
    titleEn: 'Quiz Yourself',
    emoji: '🏆',
    desc: 'اختبار شامل سريع',
    color: '#fbbf24',
    colorEnd: '#f97316',
  },
]

export function WorldPage() {
  const { worldId } = useParams<{ worldId: string }>()
  const world = getWorldById(worldId ?? '')
  const [mode, setMode] = useState<Mode>('explore')
  const [selectedItem, setSelectedItem] = useState<DiscoverItem | null>(null)
  const [activeActivity, setActiveActivity] = useState<ActivityType | null>(null)
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null)

  const speakItem = (item: DiscoverItem) => {
    speakArabic(item.nameAr)
    const arabicDuration = Math.max(850, Math.min(1800, 420 + item.nameAr.replace(/[^\u0600-\u06FF]/g, '').length * 95))
    window.setTimeout(() => speakEnglish(item.nameEn, { rate: 0.82 }), arabicDuration)
  }

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
        questionsCount={activeActivity === 'quiz' ? 10 : 6}
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
        <div className="mx-auto max-w-3xl">

          {/* رأس الصفحة — زر اكتشف فقط */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              to={`/discover/${world.id}`}
              onClick={(e) => { e.preventDefault(); setMode('explore') }}
              className="flex items-center gap-2 rounded-2xl border-2 border-white/70 bg-white/80 px-4 py-2 text-sm font-bold text-gray-700 shadow backdrop-blur-sm transition hover:scale-105"
            >
              ← الاستكشاف
            </Link>
            <div
              className="flex items-center gap-2 rounded-2xl border-2 border-white/70 bg-white/85 px-4 py-2 shadow backdrop-blur-sm"
              style={{ boxShadow: `0 8px 24px ${world.color}25` }}
            >
              <span className="text-2xl">{world.emoji}</span>
              <span className="text-base font-extrabold text-gray-800">{world.titleAr}</span>
            </div>
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

          {/* عنوان القسم */}
          <div className="mb-5 text-center">
            <h2 className="text-3xl font-extrabold text-gray-800">
              🎯 اخْتَرْ نَشَاطًا
            </h2>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              ألعاب متنوعة لتعلّم أفضل
            </p>
          </div>

          {/* شبكة الأنشطة المحسّنة — بطاقة لكل نشاط بلونه */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {ACTIVITIES.map((act) => {
              // إخفاء "صنّف الأشياء" إذا لم تكن هناك مجموعات لهذا العالم
              if (act.id === 'sort') {
                // فحص سريع: هل هذا العالم يدعم التصنيف؟ (نتركه للـActivityEngine)
                // لا نخفيه الآن، الـActivityEngine سيتعامل مع الحالة الفارغة
              }
              return (
                <button
                  key={act.id}
                  onClick={() => { setActiveActivity(act.id); setMode('playing') }}
                  className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border-2 border-white/70 bg-white/90 p-5 text-center shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1 backdrop-blur-sm active:scale-95"
                  style={{ boxShadow: `0 10px 28px ${act.color}30` }}
                >
                  {/* شريط لوني علوي */}
                  <div
                    className="absolute top-0 inset-x-0 h-1.5"
                    style={{ background: `linear-gradient(90deg, ${act.color}, ${act.colorEnd})` }}
                  />

                  {/* أيقونة النشاط */}
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full text-5xl shadow-inner transition-transform group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${act.color}22, ${act.colorEnd}22)`,
                      border: `2px solid ${act.color}44`,
                    }}
                  >
                    {act.emoji}
                  </div>

                  <h3 className="text-base font-extrabold text-gray-800 leading-tight">{act.titleAr}</h3>
                  <p className="text-xs font-bold text-gray-500" dir="ltr">{act.titleEn}</p>
                  <p className="text-xs text-gray-400 leading-snug">{act.desc}</p>

                  {/* شارة "ابدأ" */}
                  <span
                    className="mt-1 rounded-full px-3 py-1 text-xs font-extrabold text-white"
                    style={{
                      background: `linear-gradient(90deg, ${act.color}, ${act.colorEnd})`,
                      boxShadow: `0 3px 10px ${act.color}55`,
                    }}
                  >
                    ابدأ ←
                  </span>
                </button>
              )
            })}
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

        {/* ——— الترويسة — زر اكتشف فقط ——— */}
        <header className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <Link
            to="/discover"
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-5 py-3 font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${world.color}, ${world.colorEnd})`,
              boxShadow: `0 10px 28px ${world.color}55, inset 0 1px 0 rgba(255,255,255,.35)`,
              fontSize: '1.05rem',
              letterSpacing: '.02em',
              textShadow: '0 1px 3px rgba(0,0,0,.25)',
            }}
          >
            {/* لمعة علوية ديناميكية */}
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />

            {/* أيقونة الكرة الأرضية في دائرة شفافة */}
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-lg shadow-inner transition-transform duration-300 group-hover:rotate-12"
            >
              🌍
            </span>

            {/* النص */}
            <span className="relative z-10">اكتشف</span>

            {/* سهم صغير يتحرك عند التحويم */}
            <span className="relative z-10 text-base transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </Link>
          </div>

          {/* ——— العنوان الرئيسي في الوسط (محسَّن) ——— */}
          <div
            className="mt-4 flex flex-col items-center gap-2 rounded-3xl border-2 border-white/70 bg-white/90 px-4 py-5 text-center shadow-2xl backdrop-blur-sm"
            style={{ boxShadow: `0 14px 38px ${world.color}30, inset 0 1px 0 rgba(255,255,255,.5)` }}
          >
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-6xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${world.color}30, ${world.colorEnd}30)`,
                border: `3px solid ${world.color}66`,
              }}
            >
              {world.emoji}
            </div>
            <h1
              className="mt-1 font-extrabold leading-tight"
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 2.1rem)',
                color: '#1f2937',
                textShadow: `0 2px 8px ${world.color}33`,
              }}
            >
              {world.titleAr}
            </h1>
            <p
              className="text-sm font-bold text-gray-500"
              dir="ltr"
              style={{ letterSpacing: '.02em' }}
            >
              {world.titleEn}
            </p>
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