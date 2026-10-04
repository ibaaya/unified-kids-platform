/**
 * Home — الصفحة الرئيسية لتعلم اللغة العربية
 *
 * التحسينات البصرية (مع الحفاظ الكامل على الوظائف والهيكل):
 * - زر العودة للمنصة شريط كامل في أعلى الصفحة
 * - خلفية داكنة ذهبية عميقة مع طبقات ضوء وجسيمات عائمة
 * - ترويسة أوضح: عنوان shimmer ذهبي + بطاقة التاريخ + الماسكوت + صورة الطفل
 * - بطاقة الإنجازات: أرقام مضيئة بألوان واضحة على الخلفية الداكنة
 * - بطاقات عوالم المعرفة: خلفية زجاجية داكنة + ظل ملوّن + نص ثلاثي الأبعاد
 * - انيميشن ظهور تدريجي للبطاقات
 * - زر ولي الأمر ⚙️ ثابت أسفل اليسار (حُذف ParentButton المكرر)
 * - زر تبديل الطالب موحّد
 */

import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Mascot } from '../../components/character/Mascot'
import { ChildAvatar } from '../../components/character/AvatarPicker'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { LearningPath } from '../../components/ui/LearningPath'
import { useChildProfile } from '../../hooks/useChildProfile'
import { getWorldCompletion } from '../../engine/worldCompletionEngine'
import worldsData from '../../data/worlds.json'
import type { WorldDefinition } from '../../types/content'
import { WorldIllustration } from '../../components/ui/WorldIllustration'
import { VISUAL_ASSETS } from '../../config/visualAssets'

const worlds = worldsData as WorldDefinition[]

// ─────────────────────────────────────────────
// أنماط CSS المُدمَجة
// ─────────────────────────────────────────────
const ANIMATIONS = `
  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(22px) scale(.94); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
  }
  @keyframes floatStar {
    0%, 100% { transform: translateY(0)     rotate(0deg);  opacity: .75; }
    50%       { transform: translateY(-16px) rotate(12deg); opacity: 1;   }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0    rgba(255,183,47,.50); }
    70%  { box-shadow: 0 0 0 14px rgba(255,183,47,0);   }
    100% { box-shadow: 0 0 0 0    rgba(255,183,47,0);   }
  }
  @keyframes gearSpin {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
  }
`

// ─────────────────────────────────────────────
// دالة ربط كل عالم بمساره ولونه الرسمي (tokens.css)
// ─────────────────────────────────────────────
const getWorldConfig = (worldId: string) => {
  switch (worldId) {
    case 'letters':
    case 'letters-world':
      return { accent: 'var(--world-letters)', path: '/arabic/world/letters' }
    case 'harakat':
    case 'harakat-world':
      return { accent: 'var(--world-harakat)', path: '/arabic/world/harakat' }
    case 'syllables':
    case 'syllables-world':
      return { accent: 'var(--world-syllables)', path: '/arabic/world/syllables' }
    case 'words':
    case 'words-world':
      return { accent: 'var(--world-words)', path: '/arabic/world/words' }
    case 'sentences':
    case 'sentences-world':
      return { accent: 'var(--world-sentences)', path: '/arabic/world/sentences' }
    case 'stories':
    case 'stories-world':
      return { accent: 'var(--world-stories)', path: '/arabic/world/stories' }
    default:
      return { accent: 'var(--color-sun)', path: `/arabic/world/${worldId}` }
  }
}

// ─────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────
export function Home() {
  const { child, loading, hasAnyChildren } = useChildProfile()
  const [now, setNow] = useState(() => new Date())

  // تحديث الساعة كل دقيقة
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  // ─ حالة التحميل ─
  if (loading || (!child && hasAnyChildren === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span
          className="text-xl font-extrabold"
          style={{
            color: 'transparent',
            backgroundImage: 'linear-gradient(90deg, #fbbf24, #fff, #fbbf24)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            backgroundSize: '200% auto',
            animation: 'shimmer 2.4s infinite linear',
          }}
        >
          ✨ جارٍ تجهيز الرحلة السحرية...
        </span>
      </div>
    )
  }

  // ─ توجيه غير المسجّلين ─
  if (!child) {
    return <Navigate to={hasAnyChildren ? '/login' : '/onboarding'} replace />
  }

  // ─ حساب نسبة الإنجاز الإجمالية ─
  const measurableWorlds = worlds
    .map((world) => getWorldCompletion(world.id, child.completedLessonIds))
    .filter((completion) => completion.total > 0)
  const totalLessons    = measurableWorlds.reduce((sum, c) => sum + c.total, 0)
  const doneLessons     = measurableWorlds.reduce((sum, c) => sum + c.done,  0)
  const overallPercent  = totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0

  // ─ تنسيقات التاريخ والوقت ─
  const today         = now
  const weekday       = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(today)
  const gregorianDate = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(today)
  const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(today)
  const currentTime = new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit', minute: '2-digit',
  }).format(today)

  const simpleMode = child.settings?.homeDisplayMode === 'simple'

  return (
    <div className="relative isolate min-h-screen pb-28" dir="rtl">

      {/* ─── أنماط CSS المدمجة ─── */}
      <style>{ANIMATIONS}</style>

      {/* ══════════════════════════════════════
          خلفية الصفحة — صورة + تعتيم ذهبي داكن
      ══════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${VISUAL_ASSETS.ArabicBackground}")` }}
      />
      {/* طبقة تعتيم ذهبية/بنية داكنة — تناسب طابع اللغة العربية */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(165deg, rgba(38,14,4,.78) 0%, rgba(26,10,4,.84) 50%, rgba(8,20,38,.80) 100%)',
        }}
      />

      {/* ══════════════════════════════════════
          جسيمات زخرفية عائمة
      ══════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* دوائر ضوء ضبابية */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,159,69,.24) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -left-10 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,183,47,.16) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 right-1/4 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,95,191,.14) 0%, transparent 70%)' }} />

        {/* نجوم عائمة */}
        {[
          { top: '5%',  left: '5%',  size: '1.5rem', delay: '0s',   dur: '3.2s', icon: '⭐' },
          { top: '11%', left: '88%', size: '1.2rem', delay: '.5s',  dur: '2.7s', icon: '✨' },
          { top: '30%', left: '93%', size: '1rem',   delay: '1s',   dur: '3.7s', icon: '🌟' },
          { top: '47%', left: '2%',  size: '1.3rem', delay: '.3s',  dur: '2.5s', icon: '⭐' },
          { top: '64%', left: '94%', size: '1.1rem', delay: '.9s',  dur: '3s',   icon: '✨' },
          { top: '78%', left: '6%',  size: '1.2rem', delay: '1.4s', dur: '4s',   icon: '🌟' },
          { top: '88%', left: '84%', size: '1.4rem', delay: '.2s',  dur: '2.9s', icon: '⭐' },
        ].map((s, i) => (
          <span key={i} className="absolute select-none"
            style={{ top: s.top, left: s.left, fontSize: s.size,
              animation: `floatStar ${s.dur} ${s.delay} ease-in-out infinite` }}>
            {s.icon}
          </span>
        ))}

        {/* سحب زخرفية */}
        <span className="absolute bottom-24 right-8 text-3xl select-none"
          style={{ animation: 'floatStar 4.2s .5s ease-in-out infinite' }}>☁️</span>
        <span className="absolute top-52 left-6 text-2xl select-none"
          style={{ animation: 'floatStar 3.7s 1.2s ease-in-out infinite' }}>☁️</span>
      </div>

      {/* ══════════════════════════════════════
          المحتوى الرئيسي
      ══════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-4 pb-24">

        {/* ══════════════════════════════════════
            ① زر العودة للمنصة الرئيسية — شريط كامل في الأعلى
        ══════════════════════════════════════ */}
        <Link
          to="/"
          aria-label="العودة إلى المنصة الرئيسية"
          className="mb-4 flex w-full items-center gap-3 font-extrabold"
          style={{
            borderRadius: '18px',
            padding: '13px 20px',
            background: 'rgba(255,255,255,.10)',
            backdropFilter: 'blur(14px)',
            border: '2px solid rgba(255,255,255,.20)',
            color: '#fff',
            fontSize: '1rem',
            boxShadow: '0 10px 32px rgba(26,10,4,.55), inset 0 1px 0 rgba(255,255,255,.18)',
            transition: 'transform .22s ease, background .22s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(-3px)'
            el.style.background = 'rgba(255,255,255,.18)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(0)'
            el.style.background = 'rgba(255,255,255,.10)'
          }}
        >
          {/* أيقونة المنصة داخل دائرة ذهبية */}
          <span
            className="flex shrink-0 items-center justify-center rounded-full text-xl"
            style={{
              width: 46, height: 46,
              background: 'linear-gradient(135deg, #ff9f45, #e85d75)',
              boxShadow: '0 4px 14px rgba(255,159,69,.55)',
            }}
          >
            🏠
          </span>

          {/* نص الزر — سطران */}
          <span className="flex flex-col items-start leading-tight">
            <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.60)', fontWeight: 700 }}>
              العودة إلى
            </span>
            <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 800 }}>
              المنصة الرئيسية
            </span>
          </span>

          {/* سهم */}
          <span className="mr-auto text-2xl" style={{ color: 'rgba(255,255,255,.45)' }}>›</span>
        </Link>

        {/* ══════════════════════════════════════
            ② الترويسة — عنوان القسم وبيانات الطفل
        ══════════════════════════════════════ */}
        <header
          className="relative mb-4 overflow-hidden rounded-[var(--radius-lg)] border-2 p-2 backdrop-blur-[3px] sm:p-3"
          style={{
            borderColor: 'rgba(255,255,255,.16)',
            background: 'rgba(255,255,255,.08)',
            boxShadow: '0 22px 52px rgba(26,10,4,.55), inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 1px rgba(255,159,69,.14)',
          }}
          dir="rtl"
        >
          {/* شريط ألوان علوي */}
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: '4px',
              background: 'linear-gradient(90deg, var(--color-sun), var(--color-sky), var(--color-violet))',
              boxShadow: '0 1px 14px rgba(255,159,69,.55)',
            }}
          />

          {/* عنوان القسم — shimmer ذهبي */}
          <h1
            className="whitespace-nowrap mt-1 text-center font-display font-extrabold leading-tight"
            style={{
              fontSize: 'clamp(1rem, 4vw, 1.55rem)',
              color: 'transparent',
              backgroundImage: 'linear-gradient(90deg, #fbbf24, #fff, #fbbf24)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s infinite linear',
            }}
          >
            ✨ تَعَلُّمُ اللُّغَةِ الْعَرَبِيَّةِ ✨
          </h1>

          {/* شعار لغة الضاد */}
          <p
            className="mt-0.5 text-center font-display font-extrabold leading-tight"
            style={{
              fontSize: 'clamp(.8rem, 3vw, 1rem)',
              color: 'rgba(255,220,100,.88)',
              textShadow: '0 1px 4px rgba(0,0,0,.60)',
            }}
          >
            — لُغَةُ الضَّادِ —
          </p>

          {/* صف: التاريخ + الماسكوت + صورة الطفل */}
          <div className="mt-2 flex items-center justify-between gap-2">

            {/* ─ بطاقة التاريخ ─ */}
            <div
              className="w-32 shrink-0 rounded-[var(--radius-sm)] border px-2.5 py-2 text-center shadow-md backdrop-blur-md sm:w-48 sm:px-3 sm:py-2.5"
              style={{
                borderColor: 'rgba(255,255,255,.20)',
                background: 'rgba(255,255,255,.10)',
              }}
              dir="rtl"
            >
              <div className="font-extrabold text-xs sm:text-sm" style={{ color: '#fff' }}>
                {weekday}
              </div>
              <div className="text-[10px] font-bold sm:text-xs"
                style={{ color: 'rgba(120,240,190,.9)', textShadow: '0 1px 3px rgba(0,0,0,.50)' }}>
                🌙 {hijriDate}
              </div>
              <div className="text-[10px] sm:text-xs"
                style={{ color: 'rgba(210,210,210,.75)' }}>
                {gregorianDate}
              </div>
              <div className="text-xs font-extrabold sm:text-sm"
                style={{ color: 'rgba(130,195,255,.9)', textShadow: '0 1px 3px rgba(0,0,0,.50)' }}>
                🕒 {currentTime}
              </div>
            </div>

            {/* ─ الماسكوت ورسالة الترحيب ─ */}
            <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2">
              {/* هالة نابضة حول الماسكوت */}
              <div style={{
                borderRadius: '50%', padding: '3px',
                background: 'radial-gradient(circle, rgba(255,183,47,.22) 0%, transparent 70%)',
                animation: 'pulseRing 2.5s infinite',
                flexShrink: 0,
              }}>
                <Mascot size={64} />
              </div>
              <p
                className="max-w-40 text-center text-xs font-extrabold leading-snug sm:max-w-none sm:text-base"
                style={{
                  color: '#fff',
                  textShadow: '0 1px 4px rgba(0,0,0,.65)',
                }}
              >
                أَهْلًا يَا {child.name}!<br />
                <span style={{ fontSize: '.88em', color: 'rgba(130,210,255,.9)', fontWeight: 700 }}>
                  هَلْ أَنْتَ جَاهِزٌ لِلْمُغَامَرَةِ؟
                </span>
              </p>
            </div>

            {/* ─ صورة الطفل ─ */}
            <div
              className="flex shrink-0 flex-col items-center rounded-[var(--radius-sm)] border p-1 text-center shadow-md backdrop-blur-md"
              style={{
                borderColor: 'rgba(255,183,47,.38)',
                background: 'rgba(255,255,255,.10)',
                boxShadow: '0 0 18px rgba(255,183,47,.20)',
              }}
            >
              <ChildAvatar avatar={child.avatar} name={child.name} size={84} />
              <span
                className="max-w-16 truncate text-xs font-extrabold"
                style={{ color: '#ffe066', textShadow: '0 1px 3px rgba(0,0,0,.55)' }}
              >
                {child.name}
              </span>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════
            ③ بطاقة الإنجازات والتقدم
        ══════════════════════════════════════ */}
        <Card
          className="relative mb-4 overflow-hidden rounded-[var(--radius-lg)] border-2 p-3 backdrop-blur-[3px]"
          style={{
            borderColor: 'rgba(255,255,255,.15)',
            background: 'rgba(255,255,255,.08)',
            boxShadow: '0 18px 44px rgba(26,10,4,.45), inset 0 1px 0 rgba(255,255,255,.18)',
          }}
        >
          {/* شريط ذهبي علوي */}
          <div
            className="absolute top-0 left-0 right-0 rounded-t-[var(--radius-lg)]"
            style={{
              height: '3px',
              background: 'linear-gradient(90deg, var(--color-sun), var(--color-amber), var(--color-sun-dark))',
            }}
          />

          {/* شريط التقدم */}
          <div className="mb-3 mt-1">
            <ProgressBar
              percent={overallPercent}
              label="🚀 تقدمك السحري في الرحلة"
              colorVar="var(--color-leaf)"
            />
          </div>

          {/* إحصائيات ثلاثية — ألوان واضحة على الخلفية الداكنة */}
          <div
            className="grid grid-cols-3 gap-2 pt-2 text-center font-display font-bold"
            style={{ borderTop: '1px solid rgba(255,255,255,.12)' }}
          >
            {/* الأيام المتتالية */}
            <div
              className="flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] p-2 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
              style={{
                background: 'rgba(255,159,69,.16)',
                border: '1px solid rgba(255,159,69,.30)',
              }}
            >
              <span className="text-xl">🔥</span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,.65)' }}>
                الأيام المتتالية
              </span>
              <span
                className="text-sm font-extrabold"
                style={{ color: '#ffb347', textShadow: '0 0 10px rgba(255,179,71,.55)' }}
              >
                {child.streakDays} أيام
              </span>
            </div>

            {/* النجوم */}
            <div
              className="flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] p-2 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
              style={{
                background: 'rgba(255,224,102,.16)',
                border: '1px solid rgba(255,224,102,.30)',
              }}
            >
              <span className="text-xl">⭐</span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,.65)' }}>
                النجوم
              </span>
              <span
                className="text-sm font-extrabold"
                style={{ color: '#ffe066', textShadow: '0 0 10px rgba(255,224,102,.55)' }}
              >
                {child.stars}
              </span>
            </div>

            {/* النقاط */}
            <div
              className="flex flex-col items-center justify-center gap-0.5 rounded-[var(--radius-sm)] p-2 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
              style={{
                background: 'rgba(47,182,140,.14)',
                border: '1px solid rgba(47,182,140,.28)',
              }}
            >
              <span className="text-xl">🪙</span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,.65)' }}>
                النقاط
              </span>
              <span
                className="text-sm font-extrabold"
                style={{ color: '#6ddbb8', textShadow: '0 0 10px rgba(47,182,140,.55)' }}
              >
                {child.points}
              </span>
            </div>
          </div>
        </Card>

        {/* ══════════════════════════════════════
            ④ عنوان خريطة الرحلة
        ══════════════════════════════════════ */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h2
            className="flex items-center gap-2 font-display font-extrabold"
            style={{
              fontSize: 'clamp(1rem, 3.5vw, 1.25rem)',
              color: '#fff',
              textShadow: '0 2px 8px rgba(26,10,4,.80)',
            }}
          >
            🗺️ عوالم المعرفة المتنوعة
          </h2>
          <span
            className="rounded-full border px-3 py-1 text-xs font-bold shadow-sm backdrop-blur-md"
            style={{
              background: 'rgba(255,255,255,.12)',
              borderColor: 'rgba(255,255,255,.22)',
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,.55)',
            }}
          >
            اختر عالماً وابدأ المرح
          </span>
        </div>

        {/* ══════════════════════════════════════
            ⑤ مسار التعلّم (الوضع الكامل)
        ══════════════════════════════════════ */}
        {!simpleMode && (
          <Card
            className="relative mb-6 overflow-hidden rounded-[var(--radius-lg)] border-2 p-4 backdrop-blur-[3px] sm:p-5"
            style={{
              background: 'rgba(255,255,255,.08)',
              borderColor: 'rgba(255,255,255,.15)',
              boxShadow: '0 20px 48px rgba(26,10,4,.42), inset 0 1px 0 rgba(255,255,255,.18)',
            }}
          >
            {/* جسيمات ضوء */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,159,69,.20) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full blur-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(79,128,226,.16) 0%, transparent 70%)' }} />

            <div className="text-center mb-4 relative">
              <span
                className="inline-flex items-center gap-2 rounded-full border px-5 py-1.5 font-display font-extrabold shadow-sm backdrop-blur-md"
                style={{
                  background: 'rgba(255,255,255,.12)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,.22)',
                  textShadow: '0 1px 4px rgba(0,0,0,.55)',
                  fontSize: '.9rem',
                }}
              >
                ✍️ رحلة التعلّم: من الحروف إلى القصص 📔
              </span>
            </div>

            <div className="relative">
              <LearningPath worlds={worlds} unlockedWorldIds={child.unlockedWorldIds} />
            </div>
          </Card>
        )}

        {/* ══════════════════════════════════════
            ⑥ بطاقات العوالم (الوضع المبسّط)
        ══════════════════════════════════════ */}
        {simpleMode && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {worlds.map((world, idx) => {
              const isUnlocked = child.unlockedWorldIds.includes(world.id)
              const config     = getWorldConfig(world.id)
              const completion = getWorldCompletion(world.id, child.completedLessonIds)

              return (
                <div
                  key={world.id}
                  style={{
                    // انيميشن ظهور تدريجي لكل بطاقة
                    animation: `cardEnter .50s ${idx * .08}s cubic-bezier(.22,.68,0,1.2) both`,
                  }}
                >
                  <Link
                    to={isUnlocked ? config.path : '#'}
                    data-world-id={world.id}
                    className={`world-simple-card relative group flex flex-col items-center overflow-hidden rounded-[var(--radius-lg)] border-2 pt-6 p-5 text-center backdrop-blur-[3px] transition-all duration-300 ${
                      isUnlocked
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    }`}
                    style={{
                      borderColor: 'rgba(255,255,255,.15)',
                      background: 'rgba(255,255,255,.08)',
                      boxShadow: `
                        0 18px 44px rgba(26,10,4,.40),
                        0 6px 18px rgba(0,0,0,.25),
                        inset 0 1px 0 rgba(255,255,255,.18)
                      `,
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isUnlocked) return
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(-5px) scale(1.03)'
                      el.style.boxShadow = `
                        0 26px 54px rgba(26,10,4,.50),
                        0 0 0 2px ${world.id === 'words' ? '#2fb68c' : config.accent}55,
                        inset 0 1px 0 rgba(255,255,255,.26)
                      `
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(0) scale(1)'
                      el.style.boxShadow = `
                        0 18px 44px rgba(26,10,4,.40),
                        0 6px 18px rgba(0,0,0,.25),
                        inset 0 1px 0 rgba(255,255,255,.18)
                      `
                    }}
                  >
                    {/* شريط لوني علوي بلون العالم */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[5px]"
                      style={{
                        background: world.id === 'words' ? '#2fb68c' : config.accent,
                        boxShadow: `0 2px 12px ${world.id === 'words' ? 'rgba(47,182,140,.55)' : 'rgba(255,159,69,.45)'}`,
                      }}
                    />

                    {/* شارة القفل */}
                    {!isUnlocked && (
                      <div
                        className="absolute top-3 right-3 p-1.5 rounded-full text-xs"
                        style={{
                          background: 'rgba(0,0,0,.35)',
                          border: '1px solid rgba(255,255,255,.20)',
                          color: 'rgba(255,255,255,.70)',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        🔒
                      </div>
                    )}

                    {/* شارة الاكتمال */}
                    {isUnlocked && completion.isComplete && (
                      <div
                        className="absolute top-3 right-3 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-extrabold"
                        style={{
                          background: 'rgba(47,182,140,.25)',
                          border: '1.5px solid rgba(47,182,140,.45)',
                          color: '#6ddbb8',
                          backdropFilter: 'blur(4px)',
                          textShadow: '0 1px 3px rgba(0,0,0,.50)',
                        }}
                        title="عالم مكتمل — يمكنك إعادة اللعب متى شئت"
                      >
                        🏅 مكتمل
                      </div>
                    )}

                    {/* أيقونة العالم */}
                    <div
                      className="mb-4 flex h-28 w-28 items-center justify-center rounded-full shadow-inner"
                      style={{
                        background: `color-mix(in srgb, ${world.id === 'words' ? '#2fb68c' : config.accent} 28%, rgba(255,255,255,.55))`,
                        boxShadow: `0 8px 24px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.45)`,
                      }}
                    >
                      <WorldIllustration
                        worldId={world.id}
                        className="h-20 w-20 text-3xl transition-transform group-hover:scale-110 group-hover:rotate-6"
                      />
                    </div>

                    {/* اسم العالم — نص ثلاثي الأبعاد محفور */}
                    <h3
                      className="text-lg font-extrabold mb-1 leading-tight"
                      style={{
                        color: '#fff',
                        textShadow: `
                          0  1px 0   rgba(255,255,255,.18),
                          0 -1px 0   rgba(0,0,0,.55),
                          0  2px 7px rgba(0,0,0,.80)
                        `,
                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.50))',
                      }}
                    >
                      {world.title}
                    </h3>

                    {/* وصف العالم */}
                    <p
                      className="text-xs line-clamp-2 px-1"
                      style={{
                        color: 'rgba(255,255,255,.72)',
                        textShadow: '0 1px 4px rgba(0,0,0,.60)',
                      }}
                    >
                      اكتشف هذا العالم الممتع وتعلّم مهارات جديدة!
                    </p>

                    {/* زر الدخول */}
                    {isUnlocked && (
                      <span
                        className="mt-3 text-xs font-extrabold px-4 py-1.5 rounded-full text-white"
                        style={{
                          background: world.id === 'words'
                            ? 'linear-gradient(135deg, #2fb68c, #54cca8)'
                            : `linear-gradient(135deg, ${config.accent}, color-mix(in srgb, ${config.accent} 70%, white))`,
                          boxShadow: '0 4px 14px rgba(0,0,0,.28)',
                          textShadow: '0 1px 3px rgba(0,0,0,.40)',
                        }}
                      >
                        ابدأ المغامرة ✨
                      </span>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════════════════════════════════
            ⑦ بطاقة الاختبار الكلي
        ══════════════════════════════════════ */}
        <Link
          to="/arabic/test"
          className="mb-6 mt-5 flex items-center justify-between gap-4 overflow-hidden"
          style={{
            borderRadius: '22px',
            border: '2px solid rgba(139,95,191,.38)',
            background: 'rgba(139,95,191,.14)',
            backdropFilter: 'blur(14px)',
            padding: '18px 20px',
            boxShadow: '0 16px 40px rgba(139,95,191,.28), inset 0 1px 0 rgba(255,255,255,.16)',
            textDecoration: 'none',
            transition: 'transform .24s, box-shadow .24s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1.02)'
            el.style.boxShadow = '0 22px 50px rgba(139,95,191,.42), inset 0 1px 0 rgba(255,255,255,.22)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1)'
            el.style.boxShadow = '0 16px 40px rgba(139,95,191,.28), inset 0 1px 0 rgba(255,255,255,.16)'
          }}
        >
          <div>
            <span className="text-3xl">🏆</span>
            <h2
              className="mt-1 font-extrabold"
              style={{
                fontSize: 'clamp(1rem, 3.5vw, 1.2rem)',
                color: '#fff',
                textShadow: '0 1px 0 rgba(255,255,255,.16), 0 2px 8px rgba(0,0,0,.70)',
              }}
            >
              الاختبار الكلي في تعلم العربية
            </h2>
            <p
              className="mt-1 text-sm font-bold"
              style={{ color: 'rgba(255,255,255,.72)', textShadow: '0 1px 4px rgba(0,0,0,.55)' }}
            >
              ٣ مستويات متدرجة · ٣٠ سؤالًا من دروسك
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-4 py-2 font-extrabold text-white"
            style={{
              background: 'linear-gradient(135deg, #8b5fbf, #b07fe0)',
              boxShadow: '0 4px 14px rgba(139,95,191,.50)',
              textShadow: '0 1px 3px rgba(0,0,0,.40)',
            }}
          >
            ابدأ الاختبار ←
          </span>
        </Link>
      </div>

      {/* ══════════════════════════════════════
          أزرار ثابتة أسفل الشاشة
      ══════════════════════════════════════ */}

      {/* ─ زر تبديل الطالب ─ */}
      <Link
        to="/login"
        aria-label="تبديل الطالب"
        title="تبديل الطالب"
        className="fixed flex items-center justify-center text-xl"
        style={{
          bottom: 20, left: 80,
          width: 46, height: 46,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.13)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255,255,255,.24)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(26,10,4,.40)',
          zIndex: 50,
          transition: 'transform .2s',
          textDecoration: 'none',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.12)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
      >
        👥
      </Link>

      {/* ─ زر ولي الأمر ⚙️ — ثابت أسفل اليسار (موحّد مع بقية الصفحات) ─ */}
      <Link
        to="/parent"
        aria-label="منطقة ولي الأمر"
        title="منطقة ولي الأمر"
        className="fixed flex items-center justify-center"
        style={{
          bottom: 20, left: 20,
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.13)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,.26)',
          fontSize: '1.5rem',
          boxShadow: '0 8px 28px rgba(26,10,4,.45)',
          zIndex: 50,
          transition: 'transform .2s, background .2s',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'scale(1.12)'
          el.style.background = 'rgba(255,255,255,.24)'
          ;(el.querySelector('span') as HTMLElement).style.animation = 'gearSpin .8s linear infinite'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'scale(1)'
          el.style.background = 'rgba(255,255,255,.13)'
          ;(el.querySelector('span') as HTMLElement).style.animation = 'none'
        }}
      >
        <span style={{ display: 'block', lineHeight: 1 }}>⚙️</span>
      </Link>
    </div>
  )
}