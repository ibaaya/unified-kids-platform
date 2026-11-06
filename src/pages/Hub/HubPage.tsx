/**
 * HubPage — الصفحة الرئيسية الموحّدة للمنصة
 *
 * التحسينات المُضافة:
 * - فيديو تشويقي لكل قسم (يُشغَّل عند الضغط على زر ▶)
 * - زر ولي الأمر واضح في أسفل اليسار
 * - زر تبديل الطالب في أسفل الشاشة
 * - تصميم احترافي جذّاب للأطفال (6–8 سنوات):
 *   • بطاقات بظلال ملوّنة وحدود متوهّجة خاصة بكل قسم
 *   • خلفية متحركة بنجوم وجسيمات عائمة
 *   • شريط عنوان المنصة بتدرج احتفالي ومتوهّج
 *   • إحصائيات الطفل بأيقونات مضاءة
 *   • انيميشن ظهور البطاقات عند التحميل
 */

import { useEffect, useRef, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useChildProfile } from '../../hooks/useChildProfile'
import { ChildAvatar } from '../../components/character/AvatarPicker'
import { Mascot } from '../../components/character/Mascot'
import { VISUAL_ASSETS } from '../../config/visualAssets'
import { ParentButton } from '../../components/ui/ParentButton'
import { isNativeApp } from '../../platform/initPlatform'

// ─────────────────────────────────────────────
// ثوابت CSS المُدمَجة — تُحدَّد هنا مرة واحدة
// ─────────────────────────────────────────────
const CARD_ENTER_STYLE = `
  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(28px) scale(.94); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes floatStar {
    0%, 100% { transform: translateY(0)    rotate(0deg);   opacity: .7; }
    50%       { transform: translateY(-18px) rotate(15deg);  opacity: 1;  }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 rgba(255,183,47,.5); }
    70%  { box-shadow: 0 0 0 14px rgba(255,183,47,0); }
    100% { box-shadow: 0 0 0 0 rgba(255,183,47,0);  }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
  }
`

// ─────────────────────────────────────────────
// بيانات الأقسام التعليمية
// ─────────────────────────────────────────────
const MODULES = [
  {
    id: 'arabic',
    title: 'تعلم العربية',
    subtitle: 'Learn Arabic',
    desc: 'الحروف · الحركات · المقاطع · الكلمات · القصص',
    emoji: '🌙',
    path: '/arabic',
    gradient: 'linear-gradient(135deg, #ff9f45 0%, #e85d75 100%)',
    glowColor: 'rgba(255,159,69,.55)',
    border: '#ff9f45',
    textColor: '#7c2d12',
    dir: 'rtl' as const,
    flag: '',
    video: '/video/LearnArabic_Intro.mp4',
    // لون ظل البطاقة الخارجي
    shadowColor: 'rgba(232,93,117,.40)',
    // لون خلفية الأيقونة
    iconBg: 'linear-gradient(145deg, #ffe5cb, #ffb347)',
  },
  {
    id: 'islamic',
    title: 'أخلاقي الجميلة',
    subtitle: 'Beautiful Morals',
    desc: 'الأخلاق · الآداب · الوضوء · الصلاة · القصص',
    emoji: '🕌',
    path: '/islamic',
    gradient: 'linear-gradient(135deg, #16a085 0%, #f5b82e 100%)',
    glowColor: 'rgba(245,184,46,.50)',
    border: '#f5c84c',
    textColor: '#064e3b',
    dir: 'rtl' as const,
    flag: '',
    video: '/video/islamic_intro.mp4', // لا يوجد فيديو تعريفي بعد: عند توفره ضع مساره هنا مثل '/video/islamic_intro.mp4'
    shadowColor: 'rgba(22,160,133,.40)',
    iconBg: 'linear-gradient(145deg, #d1fae5, #f5c84c)',
  },
  {
    id: 'english',
    title: 'Learn English',
    subtitle: 'تعلم الإنجليزية',
    desc: 'Letters · Phonics · Words · Sentences · Stories',
    emoji: '🔤',
    path: '/english',
    gradient: 'linear-gradient(135deg, #4f80e2 0%, #8b5fbf 100%)',
    glowColor: 'rgba(79,128,226,.50)',
    border: '#4f80e2',
    textColor: '#1e3a8a',
    dir: 'ltr' as const,
    flag: ' ',
    video: '/video/LearnEnglish_Intro.mp4',
    shadowColor: 'rgba(79,128,226,.40)',
    iconBg: 'linear-gradient(145deg, #dce8ff, #7baaf7)',
  },
  {
    id: 'numbers',
    title: 'مغامرة الأرقام',
    subtitle: 'Number Adventure',
    desc: 'العد · الجمع · الطرح · الألعاب · المسابقات',
    emoji: '🔢',
    path: '/numbers',
    gradient: 'linear-gradient(135deg, #8b5fbf 0%, #3aa0d9 100%)',
    glowColor: 'rgba(139,95,191,.50)',
    border: '#8b5fbf',
    textColor: '#3b0764',
    dir: 'rtl' as const,
    flag: '',
    video: '/video/LearnNumbers_Intro.mp4',
    shadowColor: 'rgba(139,95,191,.40)',
    iconBg: 'linear-gradient(145deg, #e8daff, #c4a3ef)',
  },
  {
    id: 'discover',
    title: 'اكتشف ما حولك',
    subtitle: 'Discover the World',
    desc: 'البيت · الألوان · الحيوانات · الطبيعة · المهن',
    emoji: '🌍',
    path: '/discover',
    gradient: 'linear-gradient(135deg, #2fb68c 0%, #3aa0d9 100%)',
    glowColor: 'rgba(47,182,140,.50)',
    border: '#2fb68c',
    textColor: '#e8fff7',
    dir: 'rtl' as const,
    flag: '',
    video: '/video/discover_intro.mp4',
    shadowColor: 'rgba(47,182,140,.40)',
    iconBg: 'linear-gradient(145deg, #c8f7e4, #6ddbb8)',
  },
  {
    id: 'skills',
    title: 'مدينة المهارات',
    subtitle: 'Skills Adventure',
    desc: 'ألعب · أفكر · أكتشف · أقرر · أبدع',
    emoji: '🧠',
    path: '/skills',
    gradient: 'linear-gradient(135deg, #e85d75 0%, #8b5fbf 100%)',
    glowColor: 'rgba(232,93,117,.50)',
    border: '#e85d75',
    textColor: '#fff',
    dir: 'rtl' as const,
    flag: '',
    shadowColor: 'rgba(232,93,117,.40)',
    iconBg: 'linear-gradient(145deg, #ffd1d9, #e85d75)',
  },
]

// ─────────────────────────────────────────────
// مكوّن مشغّل الفيديو المنبثق
// ─────────────────────────────────────────────
function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // تشغيل الفيديو تلقائياً عند الفتح
    videoRef.current?.play().catch(() => {})

    // إغلاق النافذة عند الضغط على Escape
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,12,28,.85)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      {/* حاوية الفيديو */}
      <div
        className="relative w-full max-w-2xl overflow-hidden"
        style={{
          borderRadius: '28px',
          background: '#000',
          boxShadow: '0 32px 80px rgba(0,0,0,.7), 0 0 0 2px rgba(255,183,47,.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* شريط علوي للنافذة */}
        <div
          className="absolute top-0 inset-x-0 h-1 z-10"
          style={{ background: 'linear-gradient(90deg, #ff9f45, #4f80e2, #8b5fbf, #2fb68c)' }}
        />

        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center text-xl text-white transition hover:scale-110"
          style={{
            background: 'rgba(255,255,255,.18)',
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          ✕
        </button>

        {/* الفيديو */}
        <video
          ref={videoRef}
          src={src}
          className="w-full"
          controls
          playsInline
          style={{ maxHeight: '62vh', display: 'block' }}
        >
          <p className="p-6 text-center text-white text-sm">
            سيتوفر الفيديو قريباً ✨
          </p>
        </video>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// المكوّن الرئيسي — HubPage
// ─────────────────────────────────────────────
export function HubPage() {
  const { child, loading, hasAnyChildren } = useChildProfile()
  const [now, setNow] = useState(() => new Date())
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  // تحديث الساعة كل دقيقة
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  // ─── حالة التحميل ───
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="text-center text-2xl font-extrabold"
          style={{
            color: 'transparent',
            backgroundImage: 'linear-gradient(90deg, #ff9f45, #e85d75, #4f80e2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            animation: 'shimmer 2.4s infinite linear',
            backgroundSize: '200% auto',
          }}
        >
          ✨ جارٍ التحضير...
        </div>
      </div>
    )
  }

  // ─── توجيه غير المسجّلين ───
  if (!child) {
    return <Navigate to={hasAnyChildren ? '/login' : '/onboarding'} replace />
  }

  // ─── التاريخ والوقت ───
  const weekday = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(now)
  const hijri   = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(now)
  const time = new Intl.DateTimeFormat('ar-SA', {
    hour: '2-digit', minute: '2-digit',
  }).format(now)

  // ─────────────────────────────────────────────
  // الواجهة الرئيسية
  // ─────────────────────────────────────────────
  return (
    <div className="relative isolate min-h-screen pb-28" dir="rtl">

      {/* ─── أنماط CSS المدمجة ─── */}
      <style>{CARD_ENTER_STYLE}</style>

      {/* ─── خلفية المنصة ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${VISUAL_ASSETS.homeBackground}")`,
        }}
      />
      {/* طبقة تعتيم للخلفية لتحسين قراءة المحتوى */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(165deg, rgba(12,22,55,.72) 0%, rgba(22,14,58,.78) 50%, rgba(8,38,44,.74) 100%)',
        }}
      />

      {/* ─── جسيمات زخرفية عائمة ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* دوائر ضوء ضبابية */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,159,69,.22) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -left-10 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,128,226,.18) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 right-1/4 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(47,182,140,.18) 0%, transparent 70%)' }} />

        {/* نجوم عائمة متحركة */}
        {[
          { top: '6%',  left: '5%',  size: '1.6rem', delay: '0s',    dur: '3.2s'  },
          { top: '12%', left: '88%', size: '1.2rem', delay: '.6s',   dur: '2.7s'  },
          { top: '28%', left: '92%', size: '1rem',   delay: '1.1s',  dur: '3.8s'  },
          { top: '45%', left: '3%',  size: '1.4rem', delay: '.3s',   dur: '2.5s'  },
          { top: '62%', left: '95%', size: '1.1rem', delay: '.9s',   dur: '3s'    },
          { top: '72%', left: '8%',  size: '1.3rem', delay: '1.4s',  dur: '4s'    },
          { top: '85%', left: '80%', size: '1.5rem', delay: '.2s',   dur: '2.9s'  },
          { top: '20%', left: '50%', size: '.9rem',  delay: '1.7s',  dur: '3.5s'  },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute select-none"
            style={{
              top: s.top, left: s.left, fontSize: s.size,
              animation: `floatStar ${s.dur} ${s.delay} ease-in-out infinite`,
            }}
          >
            {i % 3 === 0 ? '⭐' : i % 3 === 1 ? '✨' : '🌟'}
          </span>
        ))}

        {/* سحب زخرفية */}
        <span className="absolute bottom-24 right-8 text-3xl"
          style={{ animation: 'floatStar 4.2s 0.5s ease-in-out infinite' }}>☁️</span>
        <span className="absolute top-52 left-6 text-2xl"
          style={{ animation: 'floatStar 3.7s 1.2s ease-in-out infinite' }}>☁️</span>
      </div>

      {/* ─── المحتوى الرئيسي ─── */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-28 pt-16 sm:py-5">

        {/* ══════════════════════════════════════
            ترويسة الصفحة — عنوان المنصة وبيانات الطفل
        ══════════════════════════════════════ */}
        <header
          className="relative mb-5 overflow-hidden"
          style={{
            borderRadius: '26px',
            border: '2px solid rgba(255,255,255,.18)',
            background: 'linear-gradient(145deg, rgba(255,255,255,.11) 0%, rgba(255,255,255,.06) 100%)',
            backdropFilter: 'blur(16px)',
            boxShadow:
              '0 24px 56px rgba(8,12,28,.50), inset 0 1px 0 rgba(255,255,255,.28), 0 0 0 1px rgba(255,183,47,.12)',
          }}
        >
          {/* شريط ألوان متدرّج علوي */}
          <div
            className="absolute top-0 inset-x-0 h-[3px]"
            style={{
              background: 'linear-gradient(90deg, #ff9f45, #e85d75, #4f80e2, #8b5fbf, #2fb68c)',
              boxShadow: '0 1px 12px rgba(255,183,47,.6)',
            }}
          />

          <div className="p-4">
            {/* عنوان المنصة */}
            <h1
              className="mt-1 text-center font-extrabold leading-tight"
              style={{
                fontSize: 'clamp(1.15rem, 4vw, 1.55rem)',
                color: 'transparent',
                backgroundImage: 'linear-gradient(90deg, #ffe066, #fff, #ffe066)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                backgroundSize: '200% auto',
                animation: 'shimmer 3.5s infinite linear',
                textShadow: 'none',
              }}
            >
              ✨ منصة التعلم الشاملة ✨
            </h1>
            {/* معلومات الطفل والوقت بصفوف منفصلة لتناسب عرض الهاتف */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-amber-300/30 bg-white/[.08] p-2 sm:flex-col sm:gap-1 sm:px-4">
                <span className="text-sm font-extrabold text-white">{weekday}</span>
                <span className="text-xs font-bold text-emerald-200">🌙 {hijri}</span>
                <span className="text-xs font-extrabold text-sky-200">🕒 {time}</span>
              </div>
              <div className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-white/[.06] p-2 sm:order-2">
                <Mascot size={48} />
                <p className="min-w-0 text-center text-sm font-extrabold leading-relaxed text-white">
                  أَهْلًا يَا {child.name}! 🎉
                  <span className="mt-1 block text-xs font-bold text-sky-200">اختر ما تريد تعلمه اليوم</span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-white/[.08] p-2 sm:order-3 sm:flex-col">
                <ChildAvatar avatar={child.avatar} name={child.name} size={54} />
                <span className="max-w-24 truncate text-sm font-extrabold text-amber-200">{child.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════
            عنوان قسم الأقسام التعليمية
        ══════════════════════════════════════ */}
        <h2
          className="mb-5 text-center font-extrabold"
          style={{
            fontSize: 'clamp(1.15rem, 4.5vw, 1.45rem)',
            color: '#fff',
            textShadow: '0 2px 12px rgba(8,12,28,.8)',
            letterSpacing: '.01em',
          }}
        >
          🌍 اختر رحلة التعلم
        </h2>

        {/* ══════════════════════════════════════
            شبكة البطاقات التعليمية
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {MODULES.map((mod, idx) => (
            <div
              key={mod.id}
              className="group relative"
              style={{
                // انيميشن ظهور تدريجي عند تحميل الصفحة
                animation: `cardEnter .55s ${idx * .10}s cubic-bezier(.22,.68,0,1.2) both`,
              }}
            >
              {/* ══ البطاقة الرئيسية — الضغط للانتقال ══ */}
              <Link
                to={mod.path}
                dir={mod.dir}
                className="relative flex flex-col items-center overflow-hidden text-center block"
                style={{
                  borderRadius: '24px',
                  border: `2px solid rgba(255,255,255,.15)`,
                  background: mod.id === 'discover' ? 'rgba(5,34,42,.58)' : 'rgba(255,255,255,.07)',
                  backdropFilter: 'blur(14px)',
                  // ظل خارجي ملوّن يعطي شخصية لكل بطاقة
                  boxShadow: `
                    0 24px 56px ${mod.shadowColor},
                    0 8px 24px rgba(8,12,28,.35),
                    inset 0 1px 0 rgba(255,255,255,.22)
                  `,
                  transition: 'transform .28s cubic-bezier(.22,.68,0,1.2), box-shadow .28s ease',
                  padding: '0 0 20px',
                }}
                // تأثيرات التحويم عبر style مباشر بدل Tailwind لتجنب التضارب
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.03)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `
                    0 32px 64px ${mod.shadowColor},
                    0 0 0 2px ${mod.border}55,
                    inset 0 1px 0 rgba(255,255,255,.30)
                  `
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `
                    0 24px 56px ${mod.shadowColor},
                    0 8px 24px rgba(8,12,28,.35),
                    inset 0 1px 0 rgba(255,255,255,.22)
                  `
                }}
              >
                {/* شريط لوني متدرج علوي لكل بطاقة */}
                <div
                  className="w-full"
                  style={{
                    height: '6px',
                    background: mod.gradient,
                    boxShadow: `0 2px 14px ${mod.glowColor}`,
                  }}
                />

                {/* علم / رمز القسم */}
                <div
                  className="mt-2 text-lg leading-none sm:mt-4 sm:text-2xl"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.3))' }}
                >
                  {mod.flag}
                </div>

                {/* أيقونة القسم — دائرة مضيئة */}
                <div
                  className="mx-auto mt-2 flex items-center justify-center sm:mt-3"
                  style={{
                    width: 'clamp(52px, 15vw, 100px)',
                    height: 'clamp(52px, 15vw, 100px)',
                    borderRadius: '50%',
                    background: mod.iconBg,
                    boxShadow: `0 8px 28px ${mod.glowColor}, 0 2px 6px rgba(0,0,0,.2)`,
                    fontSize: 'clamp(1.6rem, 6vw, 3rem)',
                    lineHeight: 1,
                    transition: 'transform .3s cubic-bezier(.22,.68,0,1.2)',
                  }}
                >
                  {mod.emoji}
                </div>

                {/* اسم القسم */}
                <h3
                  className="mt-2 px-1 font-extrabold leading-tight sm:mt-3"
                  style={{
                    fontSize: 'clamp(.72rem, 2.9vw, 1.25rem)',
                    color: mod.border,
                    textShadow: '0 1px 3px rgba(0,0,0,.35)',
                  }}
                >
                  {mod.title}
                </h3>

                {/* الاسم الثانوي (اللغة الأخرى) */}
                <p
                  className="mt-0.5 px-1 text-[10px] font-semibold sm:text-xs"
                  style={{ color: 'rgba(255,255,255,.65)' }}
                >
                  {mod.subtitle}
                </p>

                {/* وصف محتوى القسم */}
                <p
                  className="mx-4 mt-2 hidden text-xs leading-relaxed sm:block"
                  style={{ color: 'rgba(255,255,255,.78)' }}
                >
                  {mod.desc}
                </p>

                {/* زر الدخول */}
                <div
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-white sm:mt-4 sm:text-sm"
                  style={{
                    borderRadius: '999px',
                    padding: 'clamp(5px, 1.5vw, 7px) clamp(10px, 3.5vw, 20px)',
                    background: mod.gradient,
                    boxShadow: `0 4px 16px ${mod.glowColor}`,
                    transition: 'transform .18s, box-shadow .18s',
                  }}
                >
                  ابدأ الآن ✨
                </div>
              </Link>

              {/* ══ زر تشغيل الفيديو التعريفي ══ */}
              {mod.video && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActiveVideo(mod.video)
                  }}
                  aria-label={`شاهد مقدمة ${mod.title}`}
                  title="شاهد الفيديو التعريفي"
                  className="absolute right-2 top-3 flex items-center justify-center text-white sm:bottom-3.5 sm:right-3.5 sm:top-auto"
                  style={{
                    width: 'clamp(26px, 7vw, 36px)',
                    height: 'clamp(26px, 7vw, 36px)',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,.50)',
                    border: `1.5px solid ${mod.border}88`,
                    backdropFilter: 'blur(6px)',
                    fontSize: '1rem',
                    boxShadow: `0 4px 14px rgba(0,0,0,.3)`,
                    transition: 'transform .2s, background .2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLElement).style.transform = 'scale(1.18)')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')
                  }
                >
                  ▶
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            شريط إحصائيات الطفل
        ══════════════════════════════════════ */}
        <div
          className="relative mt-6 overflow-hidden"
          style={{
            borderRadius: '22px',
            border: '1.5px solid rgba(255,255,255,.14)',
            background: 'rgba(255,255,255,.07)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 16px 40px rgba(8,12,28,.35), inset 0 1px 0 rgba(255,255,255,.14)',
          }}
        >
          {/* شريط تدرج علوي رفيع */}
          <div
            className="absolute top-0 inset-x-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, #ffb347, transparent, #4f80e2)' }}
          />

          <div className="grid grid-cols-3 gap-0 p-3">
            {/* ─ الأيام المتتالية (Streak) ─ */}
            <div
              className="flex flex-col items-center gap-1 py-2"
              style={{
                borderLeft: '1px solid rgba(255,255,255,.10)',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🔥</span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,.6)' }}>
                أيام متتالية
              </span>
              <span
                className="font-extrabold text-lg leading-none"
                style={{
                  color: '#ffb347',
                  textShadow: '0 0 12px rgba(255,179,71,.5)',
                }}
              >
                {child.streakDays}
              </span>
            </div>

            {/* ─ النجوم ─ */}
            <div className="flex flex-col items-center gap-1 py-2">
              <span style={{ fontSize: '1.5rem' }}>⭐</span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,.6)' }}>
                النجوم
              </span>
              <span
                className="font-extrabold text-lg leading-none"
                style={{
                  color: '#ffe066',
                  textShadow: '0 0 12px rgba(255,224,102,.5)',
                }}
              >
                {child.stars}
              </span>
            </div>

            {/* ─ النقاط ─ */}
            <div
              className="flex flex-col items-center gap-1 py-2"
              style={{
                borderRight: '1px solid rgba(255,255,255,.10)',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🪙</span>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,.6)' }}>
                النقاط
              </span>
              <span
                className="font-extrabold text-lg leading-none"
                style={{
                  color: '#6ddbb8',
                  textShadow: '0 0 12px rgba(47,182,140,.5)',
                }}
              >
                {child.points}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          أزرار ثابتة أسفل الشاشة
      ══════════════════════════════════════ */}

      {/* ─ زر تبديل الطالب ─ */}
      <Link
        to="/login"
        aria-label="تبديل الطالب"
        className={`fixed flex items-center justify-center text-xl ${isNativeApp ? 'hidden' : ''}`}
        style={{
          bottom: 16,
          left: 80,
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.15)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255,255,255,.25)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(8,12,28,.35)',
          zIndex: 50,
          transition: 'transform .2s, background .2s',
        }}
        onMouseEnter={e =>
          ((e.currentTarget as HTMLElement).style.transform = 'scale(1.12)')
        }
        onMouseLeave={e =>
          ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')
        }
      >
        👥
      </Link>

      {/* ─ زر ولي الأمر (يأتي من مكوّن ParentButton) ─ */}
      <ParentButton showOnNativeHome />

      <Link to="/privacy" className="fixed bottom-4 right-4 z-40 rounded-full border border-white/30 bg-slate-950/60 px-3 py-2 text-xs font-bold text-white/90 backdrop-blur hover:bg-slate-950/80">
        سياسة الخصوصية
      </Link>

      {/* ══════════════════════════════════════
          نافذة الفيديو المنبثقة
      ══════════════════════════════════════ */}
      {activeVideo && (
        <VideoModal src={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  )
}
