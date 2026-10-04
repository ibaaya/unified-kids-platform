/**
 * NumbersHome — الصفحة الرئيسية لمغامرة الأرقام
 *
 * التحسينات:
 * - زر العودة للمنصة في أعلى الصفحة مباشرة
 * - ترويسة أكبر وأوضح مع شريط التاريخ
 * - بطاقات grid-cols-2 بأيقونات كبيرة ونصوص واضحة
 * - متغير حجم الخط (p.fontSize) يُطبَّق على كامل الصفحة عبر CSS variable
 * - زر ولي الأمر ⚙️ ثابت أسفل اليسار موحّد مع بقية الصفحات
 * - خلفية داكنة بنفشية مع طبقات ضوء
 * - نجوم وأرقام عائمة زخرفية
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress, GAME_IDS } from '../lib/progress'
import { pathState } from '../lib/path'
import { fmt, speak } from '../lib/arabic'
import { NumbersPageFrame } from '../components/NumbersPageFrame'

// ─────────────────────────────────────────────
// بيانات بطاقات الأنشطة
// ─────────────────────────────────────────────
const TILES = [
  {
    icon: '🗺️',
    ar: { title: 'مَسَارُ الرِّحْلَة', sub: 'ابدأ رحلتك مع الأرقام' },
    en: { title: 'Adventure Path',   sub: 'Start your number journey' },
    href: '/numbers/map',
    gradient:    'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
    shadowColor: 'rgba(249,115,22,.50)',
    iconBg:      'linear-gradient(145deg, #fff3e0, #fbbf24)',
    glowColor:   'rgba(249,115,22,.55)',
    border:      '#f97316',
  },
  {
    icon: '🎮',
    ar: { title: 'الْأَلْعَاب',       sub: 'العب وتعلم الأرقام' },
    en: { title: 'Fun Games',         sub: 'Play and learn numbers' },
    href: '/numbers/games',
    gradient:    'linear-gradient(135deg, #e85d75 0%, #f4869a 100%)',
    shadowColor: 'rgba(232,93,117,.48)',
    iconBg:      'linear-gradient(145deg, #fce7f3, #f4869a)',
    glowColor:   'rgba(232,93,117,.55)',
    border:      '#e85d75',
  },
  {
    icon: '🔢',
    ar: { title: 'الْعَد',            sub: 'تعلّم عد الأشياء' },
    en: { title: 'Counting',          sub: 'Count the objects' },
    href: '/numbers/practice/count',
    gradient:    'linear-gradient(135deg, #2fb68c 0%, #54cca8 100%)',
    shadowColor: 'rgba(47,182,140,.48)',
    iconBg:      'linear-gradient(145deg, #d1fae5, #6ddbb8)',
    glowColor:   'rgba(47,182,140,.55)',
    border:      '#2fb68c',
  },
  {
    icon: '➕',
    ar: { title: 'الْجَمْع',          sub: 'اجمع الأرقام بالصور' },
    en: { title: 'Addition',          sub: 'Add with pictures' },
    href: '/numbers/practice/add',
    gradient:    'linear-gradient(135deg, #3aa0d9 0%, #60c0f0 100%)',
    shadowColor: 'rgba(58,160,217,.48)',
    iconBg:      'linear-gradient(145deg, #dbeafe, #72c8f0)',
    glowColor:   'rgba(58,160,217,.55)',
    border:      '#3aa0d9',
  },
  {
    icon: '➖',
    ar: { title: 'الطَّرْح',          sub: 'تعلّم الطرح' },
    en: { title: 'Subtraction',       sub: 'Learn to subtract' },
    href: '/numbers/practice/subtract',
    gradient:    'linear-gradient(135deg, #ff9f45 0%, #ffc06a 100%)',
    shadowColor: 'rgba(255,159,69,.48)',
    iconBg:      'linear-gradient(145deg, #fff7ed, #ffb347)',
    glowColor:   'rgba(255,159,69,.55)',
    border:      '#ff9f45',
  },
  {
    icon: '⚖️',
    ar: { title: 'الْمُقَارَنَة',     sub: 'أكبر، أصغر، يساوي' },
    en: { title: 'Comparing',         sub: 'Greater, less, equal' },
    href: '/numbers/practice/compare',
    gradient:    'linear-gradient(135deg, #c94070 0%, #e85d75 100%)',
    shadowColor: 'rgba(201,64,112,.48)',
    iconBg:      'linear-gradient(145deg, #fce7f3, #f08aaa)',
    glowColor:   'rgba(201,64,112,.55)',
    border:      '#c94070',
  },
  {
    icon: '🐇',
    ar: { title: 'خَطُّ الْأَعْدَاد', sub: 'الأرنب على خط الأعداد' },
    en: { title: 'Number Line',       sub: 'Jump on the number line' },
    href: '/numbers/numberline',
    gradient:    'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
    shadowColor: 'rgba(6,182,212,.48)',
    iconBg:      'linear-gradient(145deg, #cffafe, #67e8f9)',
    glowColor:   'rgba(6,182,212,.55)',
    border:      '#06b6d4',
  },
  {
    icon: '🏆',
    ar: { title: 'الِاخْتِبَار الْكَبِير', sub: 'اختبر معلوماتك' },
    en: { title: 'Big Quiz',          sub: 'Test yourself!' },
    href: '/numbers/practice/final',
    gradient:    'linear-gradient(135deg, #8b5fbf 0%, #b07fe0 100%)',
    shadowColor: 'rgba(139,95,191,.48)',
    iconBg:      'linear-gradient(145deg, #ede9fe, #c4a3ef)',
    glowColor:   'rgba(139,95,191,.55)',
    border:      '#8b5fbf',
  },
]

// ─────────────────────────────────────────────
// أنماط CSS المُدمَجة
// ─────────────────────────────────────────────
const ANIMATIONS = `
  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(24px) scale(.93); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
  }
  @keyframes floatStar {
    0%, 100% { transform: translateY(0)     rotate(0deg);  opacity: .75; }
    50%       { transform: translateY(-18px) rotate(14deg); opacity: 1;   }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes rabbitBounce {
    0%, 100% { transform: translateY(0)    scale(1);    }
    50%       { transform: translateY(-9px) scale(1.10); }
  }
  @keyframes gearSpin {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
  }
`

// ─────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────
export function NumbersHome() {
  const [p, up] = useProgress()
  const [now, setNow] = useState(new Date())

  // تحديث الساعة كل 30 ثانية
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  // إعداد اللغة (عربي افتراضياً)
  const useArabicLabels = true

  // ─ حجم الخط الأساسي من إعدادات المستخدم (الافتراضي 1 = 100%)
  // يُطبَّق كـ CSS variable على الحاوية الجذر فيُورَث لكل العناصر
  const fontScale = p.textScale ?? 1

  // ─ تنسيقات التاريخ ─
  const weekday   = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(now)
  const hijri     = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(now)
  const gregorian = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(now)
  const time = new Intl.DateTimeFormat('ar', {
    hour: '2-digit', minute: '2-digit',
  }).format(now)

  // ─ فحص اكتمال كل نشاط ─
  const isFinished = (href: string) => {
    if (href === '/numbers/map')   return pathState(p).done.every(Boolean)
    if (href === '/numbers/games') return GAME_IDS.every((id) => p.completed.includes(`game:${id}`))
    const topic = href.split('/').at(-1)
    return !!topic && p.completed.includes(`practice:${topic}`)
  }

  return (
    <NumbersPageFrame background="/images/numbers-bg.webp">

      {/* ─── أنماط CSS المدمجة ─── */}
      <style>{ANIMATIONS}</style>

      {/* ══════════════════════════════════════
          طبقة تعتيم بنفشية داكنة فوق الخلفية
      ══════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(160deg, rgba(18,6,52,.78) 0%, rgba(28,8,68,.83) 50%, rgba(12,18,58,.79) 100%)',
        }}
      />

      {/* ══════════════════════════════════════
          جسيمات زخرفية عائمة
      ══════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* دوائر ضوء ضبابية */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,95,191,.24) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 -left-16 h-80 w-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(58,160,217,.18) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-10 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,.14) 0%, transparent 70%)' }} />

        {/* نجوم عائمة */}
        {[
          { top: '4%',  left: '5%',  size: '1.5rem', delay: '0s',   dur: '3.2s', icon: '⭐' },
          { top: '9%',  left: '88%', size: '1.2rem', delay: '.5s',  dur: '2.8s', icon: '✨' },
          { top: '30%', left: '93%', size: '1rem',   delay: '1s',   dur: '3.7s', icon: '🌟' },
          { top: '48%', left: '2%',  size: '1.3rem', delay: '.3s',  dur: '2.6s', icon: '⭐' },
          { top: '65%', left: '95%', size: '1.1rem', delay: '.9s',  dur: '3.1s', icon: '✨' },
          { top: '78%', left: '5%',  size: '1.2rem', delay: '1.4s', dur: '4s',   icon: '🌟' },
          { top: '88%', left: '84%', size: '1.4rem', delay: '.2s',  dur: '2.9s', icon: '⭐' },
        ].map((s, i) => (
          <span key={i} className="absolute select-none"
            style={{ top: s.top, left: s.left, fontSize: s.size,
              animation: `floatStar ${s.dur} ${s.delay} ease-in-out infinite` }}>
            {s.icon}
          </span>
        ))}

        {/* أرقام عربية عائمة زخرفية */}
        {['١', '٢', '٣', '٤', '٥'].map((n, i) => (
          <span key={n} className="absolute select-none font-extrabold"
            style={{ top: `${14 + i * 16}%`, left: `${6 + i * 18}%`,
              fontSize: '3.5rem', color: '#fff', opacity: .08,
              animation: `floatStar ${3.2 + i * .45}s ${i * .55}s ease-in-out infinite` }}>
            {n}
          </span>
        ))}

        {/* سحب زخرفية */}
        <span className="absolute bottom-28 right-6 text-3xl select-none"
          style={{ animation: 'floatStar 4.2s .4s ease-in-out infinite' }}>☁️</span>
        <span className="absolute top-56 left-5 text-2xl select-none"
          style={{ animation: 'floatStar 3.6s 1.2s ease-in-out infinite' }}>☁️</span>
      </div>

      {/* ══════════════════════════════════════
          الحاوية الجذر — تُطبَّق هنا CSS variable لحجم الخط
          فيرثها كل عنصر نصي داخل الصفحة
      ══════════════════════════════════════ */}
      <div
        className="relative z-10 mx-auto max-w-4xl px-3 pb-28"
        dir="rtl"
        style={{
          // تكبير الصفحة ككل يشمل النصوص ذات الأحجام المحددة بوحدات rem.
          fontSize: '1rem',
          zoom: fontScale,
          paddingTop: '1rem',
        }}
      >

        {/* ══════════════════════════════════════
            ① زر العودة للمنصة الرئيسية — أعلى الصفحة
        ══════════════════════════════════════ */}
        <Link
          to="/"
          className="mb-4 flex w-full items-center gap-3 font-extrabold"
          style={{
            borderRadius: '18px',
            padding: '14px 20px',
            background: 'rgba(255,255,255,.11)',
            backdropFilter: 'blur(14px)',
            border: '2px solid rgba(255,255,255,.22)',
            color: '#fff',
            fontSize: '1em',           /* يرث من CSS variable */
            boxShadow: '0 10px 32px rgba(14,6,44,.50), inset 0 1px 0 rgba(255,255,255,.20)',
            transition: 'transform .22s, background .22s',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(-3px)'
            el.style.background = 'rgba(255,255,255,.20)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(0)'
            el.style.background = 'rgba(255,255,255,.11)'
          }}
        >
          {/* أيقونة المنصة داخل دائرة ملوّنة */}
          <span
            className="flex shrink-0 items-center justify-center rounded-full text-xl"
            style={{
              width: 46, height: 46,
              background: 'linear-gradient(135deg, #8b5fbf, #3aa0d9)',
              boxShadow: '0 4px 14px rgba(139,95,191,.55)',
            }}
          >
            🏠
          </span>

          {/* نص الزر — سطران */}
          <span className="flex flex-col items-start leading-tight">
            <span style={{ fontSize: '.9em', color: 'rgba(255,255,255,.60)', fontWeight: 700 }}>
              العودة إلى
            </span>
            <span style={{ fontSize: '1.5em', color: '#fff', fontWeight: 900 }}>
              المنصة الرئيسية
            </span>
          </span>

          {/* سهم للأمام */}
          <span className="mr-auto text-2xl" style={{ color: 'rgba(255,255,255,.45)' }}>›</span>
        </Link>

        {/* ══════════════════════════════════════
            ② الترويسة — عنوان كبير + شريط الأدوات + التاريخ
        ══════════════════════════════════════ */}
        <header
          className="relative mb-5 overflow-hidden"
          style={{
            borderRadius: '28px',
            border: '2px solid rgba(255,255,255,.16)',
            background: 'rgba(255,255,255,.09)',
            backdropFilter: 'blur(18px)',
            boxShadow:
              '0 28px 60px rgba(14,6,44,.60), inset 0 1px 0 rgba(255,255,255,.24), 0 0 0 1px rgba(139,95,191,.18)',
          }}
        >
          {/* شريط ألوان علوي */}
          <div
            className="absolute top-0 inset-x-0"
            style={{
              height: '5px',
              background: 'linear-gradient(90deg, #f97316, #e85d75, #8b5fbf, #3aa0d9, #2fb68c)',
              boxShadow: '0 2px 16px rgba(139,95,191,.60)',
            }}
          />

          <div className="px-4 pb-4 pt-6">

            {/* صف: خريطة + عنوان + نجوم/صوت */}
            <div className="flex items-center gap-3">

              {/* زر الخريطة */}
              <Link
                to="/numbers/map"
                className="flex shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{
                  width: 52, height: 52,
                  background: 'rgba(249,115,22,.22)',
                  border: '2px solid rgba(249,115,22,.45)',
                  boxShadow: '0 4px 16px rgba(249,115,22,.32)',
                }}
                title="الخريطة"
              >
                🗺️
              </Link>

              {/* العنوان الرئيسي — shimmer بنفشي كبير */}
              <h1
                className="flex-1 text-center font-extrabold leading-tight"
                style={{
                  fontSize: 'clamp(1.35rem, 5vw, 1.9rem)',
                  color: 'transparent',
                  backgroundImage: 'linear-gradient(90deg, #c4a3ef, #fff, #ffe066, #fff, #c4a3ef)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  backgroundSize: '200% auto',
                  animation: 'shimmer 3s infinite linear',
                  textShadow: 'none',
                }}
              >
                مُغَامَرَةُ الْأَرْقَامِ 🔢
              </h1>

              {/* نجوم + صوت */}
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="flex h-10 items-center rounded-2xl px-3 font-extrabold"
                  style={{
                    fontSize: '1em',
                    background: 'rgba(255,183,47,.20)',
                    border: '2px solid rgba(255,183,47,.42)',
                    color: '#997d0c',
                    textShadow: '0 1px 5px rgba(0,0,0,.55)',
                  }}
                >
                  ⭐ {fmt(p.stars, p.eastern)}
                </span>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-2xl text-xl"
                  style={{
                    width: 44, height: 44,
                    background: 'rgba(255,255,255,.13)',
                    border: '2px solid rgba(255,255,255,.25)',
                    color: '#fff',
                    backdropFilter: 'blur(6px)',
                    cursor: 'pointer',
                  }}
                  onClick={() => up(s => ({ ...s, sound: !s.sound }))}
                  aria-label={p.sound ? 'إيقاف الصوت' : 'تشغيل الصوت'}
                >
                  {p.sound ? '🔊' : '🔇'}
                </button>
              </div>
            </div>

            {/* شريط التاريخ والوقت — chips واضحة ومضيئة */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {[
                { label: weekday,   color: '#280359', icon: '📅' },
                { label: hijri,     color: '#025909', icon: '🌙' },
                { label: gregorian, color: '#0443a8', icon: '📆' },
                { label: time,      color: '#735d06', icon: '🕒' },
              ].map(({ label, color, icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-bold"
                  style={{
                    fontSize: '.82em',
                    background: `${color}22`,
                    border: `1.5px solid ${color}50`,
                    color: '#fff',
                    textShadow: '0 1px 5px rgba(0,0,0,.65)',
                    backdropFilter: 'blur(5px)',
                  }}
                >
                  <span>{icon}</span>
                  <span style={{ color }}>{label}</span>
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════
            ③ الأرنب التفاعلي
        ══════════════════════════════════════ */}
        <section className="mb-5 flex flex-col items-center">
          <button
            type="button"
            aria-label="تحدث"
            onClick={() =>
              speak('مَرْحَبًا بِكَ فِي مُغَامَرَةِ الْأَرْقَامِ! هَلْ أَنْتَ مُسْتَعِدٌّ؟', p.sound)
            }
            className="flex items-center justify-center"
            style={{
              width: 88, height: 88,
              borderRadius: '50%',
              fontSize: '3.2rem',
              background: 'rgba(139,95,191,.22)',
              border: '2.5px solid rgba(139,95,191,.50)',
              animation: 'rabbitBounce 2.2s ease-in-out infinite',
              boxShadow: '0 0 0 10px rgba(139,95,191,.12), 0 0 32px rgba(139,95,191,.40)',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            🐰
          </button>
          <p
            className="mt-2 text-center font-extrabold"
            style={{
              fontSize: '1em',
              color: '#fff',
              textShadow:
                '0 1px 0 rgba(255,255,255,.16), 0 -1px 0 rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.75)',
            }}
          >
            اضْغَطْ عَلَيَّ لِأَتَحَدَّثْ!
          </p>
        </section>

        {/* ══════════════════════════════════════
            ④ شبكة بطاقات الأنشطة
            grid-cols-2 دائماً لضمان الأيقونات كبيرة
        ══════════════════════════════════════ */}
        <main>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {TILES.map((tile, idx) => {
              const done  = isFinished(tile.href)
              const label = useArabicLabels ? tile.ar : tile.en

              return (
                <div
                  key={tile.href}
                  style={{
                    animation: `cardEnter .52s ${idx * .06}s cubic-bezier(.22,.68,0,1.2) both`,
                  }}
                >
                  <Link
                    to={tile.href}
                    className="relative flex flex-col items-center overflow-hidden text-center"
                    style={{
                      borderRadius: '22px',
                      background: 'rgba(255,255,255,.09)',
                      backdropFilter: 'blur(16px)',
                      border: '2px solid rgba(255,255,255,.16)',
                      minHeight: '11rem',
                      padding: '0 10px 18px',
                      boxShadow: `
                        0 20px 48px ${tile.shadowColor},
                        0 6px 20px rgba(14,6,44,.40),
                        inset 0 1px 0 rgba(255,255,255,.18)
                      `,
                      textDecoration: 'none',
                      transition: 'transform .25s cubic-bezier(.22,.68,0,1.2), box-shadow .25s ease',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(-6px) scale(1.04)'
                      el.style.boxShadow = `
                        0 28px 58px ${tile.shadowColor},
                        0 0 0 2.5px ${tile.border}66,
                        inset 0 1px 0 rgba(255,255,255,.26)
                      `
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'translateY(0) scale(1)'
                      el.style.boxShadow = `
                        0 20px 48px ${tile.shadowColor},
                        0 6px 20px rgba(14,6,44,.40),
                        inset 0 1px 0 rgba(255,255,255,.18)
                      `
                    }}
                  >
                    {/* شريط لوني علوي */}
                    <div
                      className="absolute top-0 inset-x-0"
                      style={{
                        height: '5px',
                        background: tile.gradient,
                        boxShadow: `0 2px 12px ${tile.glowColor}`,
                      }}
                    />

                    {/* شارة الاكتمال */}
                    {done && (
                      <div
                        className="absolute end-2 top-2 flex items-center gap-0.5 rounded-full px-2 py-0.5"
                        style={{
                          fontSize: '.72em',
                          fontWeight: 800,
                          background: 'rgba(47,182,140,.28)',
                          border: '1.5px solid rgba(47,182,140,.50)',
                          color: '#6ddbb8',
                          backdropFilter: 'blur(5px)',
                          textShadow: '0 1px 3px rgba(0,0,0,.50)',
                        }}
                      >
                        ✅ مُنْجَز
                      </div>
                    )}

                    {/* ─ أيقونة النشاط — مربع كبير مضيء ─ */}
                    <div
                      className="mt-5 flex items-center justify-center"
                      style={{
                        width: 76, height: 76,
                        borderRadius: '20px',
                        background: tile.iconBg,
                        /* حجم الأيقونة كبير — يرث font-size من الحاوية */
                        fontSize: '2.6rem',
                        lineHeight: 1,
                        boxShadow: `
                          0 8px 24px ${tile.glowColor},
                          0 2px 6px rgba(0,0,0,.22),
                          inset 0 1px 0 rgba(255,255,255,.55)
                        `,
                      }}
                    >
                      {tile.icon}
                    </div>

                    {/* ─ عنوان النشاط — نص ثلاثي الأبعاد محفور ─ */}
                    <h2
                      className="mt-3 px-2 font-extrabold leading-snug"
                      style={{
                        /* em = نسبة من CSS variable في الحاوية الجذر */
                        fontSize: '1.05em',
                        color: '#fff',
                        textShadow: `
                          0  1px 0   rgba(255,255,255,.18),
                          0 -1px 0   rgba(0,0,0,.60),
                          0  2px 7px rgba(0,0,0,.80),
                          0  0  14px ${tile.glowColor}
                        `,
                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.55))',
                      }}
                    >
                      {label.title}
                    </h2>

                    {/* ─ وصف النشاط ─ */}
                    <p
                      className="mt-1 px-2 font-bold leading-tight"
                      style={{
                        fontSize: '.82em',
                        color: 'rgba(255,255,255,.78)',
                        textShadow: '0 1px 5px rgba(0,0,0,.65)',
                      }}
                    >
                      {label.sub}
                    </p>
                  </Link>
                </div>
              )
            })}
          </div>
        </main>
      </div>

    </NumbersPageFrame>
  )
}
