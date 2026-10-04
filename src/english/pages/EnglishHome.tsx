/**
 * EnglishHome — الصفحة الرئيسية لتعلم الإنجليزية
 *
 * التحسينات البصرية:
 * - خلفية داكنة عميقة مع طبقات ضوء وعمق (نفس روح HubPage)
 * - زر العودة للمنصة أكبر وأوضح — شريط كامل بدل زر صغير
 * - أيقونات محسّنة في الترويسة
 * - بطاقات عوالم بظلال ملوّنة وأيقونات مضيئة
 * - انيميشن ظهور تدريجي للبطاقات
 * - نجوم عائمة وجسيمات احتفالية
 * - الحفاظ الكامل على كل الوظائف والـ props والـ imports
 */

import { Link } from 'react-router-dom'
import { useChildProfile } from '../../hooks/useChildProfile'
import { loadEnglishProgress } from './EnglishParentDashboard'
import { ParentButton } from '../../components/ui/ParentButton'
import worldsData from '../data/worlds.json'

// ─────────────────────────────────────────────
// أنواع البيانات
// ─────────────────────────────────────────────
const worlds = worldsData as Array<{
  id: string
  title: string
  emoji: string
  colorVar: string
  order: number
}>

// ─────────────────────────────────────────────
// مسارات التنقل لكل عالم
// ─────────────────────────────────────────────
const worldPaths: Record<string, string> = {
  'en-letters':   '/english/letters',
  'en-phonics':   '/english/phonics',
  'en-words':     '/english/words',
  'en-sentences': '/english/sentences',
  'en-stories':   '/english/stories',
  'en-test':      '/english/test',
}

// ─────────────────────────────────────────────
// أنماط CSS المُدمَجة — انيميشن البطاقات والنجوم
// ─────────────────────────────────────────────
const ANIMATIONS = `
  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(24px) scale(.95); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
  }
  @keyframes floatStar {
    0%, 100% { transform: translateY(0)     rotate(0deg);  opacity: .7; }
    50%       { transform: translateY(-16px) rotate(12deg); opacity: 1;  }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(79,128,226,.45); }
    50%       { box-shadow: 0 0 0 12px rgba(79,128,226,0); }
  }
`

// ─────────────────────────────────────────────
// بيانات مرئية مُخصَّصة لكل عالم
// تُعطي كل بطاقة شخصية بصرية مستقلة
// ─────────────────────────────────────────────
const WORLD_VISUALS: Record<string, {
  gradient: string
  shadowColor: string
  iconBg: string
  glowColor: string
}> = {
  'en-letters': {
    gradient:    'linear-gradient(135deg, #4f80e2 0%, #6fa0f5 100%)',
    shadowColor: 'rgba(79,128,226,.42)',
    iconBg:      'linear-gradient(145deg, #dce8ff, #7baaf7)',
    glowColor:   'rgba(79,128,226,.50)',
  },
  'en-phonics': {
    gradient:    'linear-gradient(135deg, #e85d75 0%, #f4869a 100%)',
    shadowColor: 'rgba(232,93,117,.40)',
    iconBg:      'linear-gradient(145deg, #ffe5eb, #f4869a)',
    glowColor:   'rgba(232,93,117,.48)',
  },
  'en-words': {
    gradient:    'linear-gradient(135deg, #2fb68c 0%, #54cca8 100%)',
    shadowColor: 'rgba(47,182,140,.40)',
    iconBg:      'linear-gradient(145deg, #c8f7e4, #6ddbb8)',
    glowColor:   'rgba(47,182,140,.48)',
  },
  'en-sentences': {
    gradient:    'linear-gradient(135deg, #ff9f45 0%, #ffc06a 100%)',
    shadowColor: 'rgba(255,159,69,.40)',
    iconBg:      'linear-gradient(145deg, #ffe5cb, #ffb347)',
    glowColor:   'rgba(255,159,69,.48)',
  },
  'en-stories': {
    gradient:    'linear-gradient(135deg, #8b5fbf 0%, #b07fe0 100%)',
    shadowColor: 'rgba(139,95,191,.40)',
    iconBg:      'linear-gradient(145deg, #e8daff, #c4a3ef)',
    glowColor:   'rgba(139,95,191,.48)',
  },
  'en-test': {
    gradient:    'linear-gradient(135deg, #3aa0d9 0%, #60c0f0 100%)',
    shadowColor: 'rgba(58,160,217,.40)',
    iconBg:      'linear-gradient(145deg, #ceeeff, #72c8f0)',
    glowColor:   'rgba(58,160,217,.48)',
  },
}

// مرئيات افتراضية إذا لم يُعثَر على العالم في الخريطة
const DEFAULT_VISUAL = {
  gradient:    'linear-gradient(135deg, #4f80e2 0%, #8b5fbf 100%)',
  shadowColor: 'rgba(79,128,226,.38)',
  iconBg:      'linear-gradient(145deg, #dce8ff, #a0b8f5)',
  glowColor:   'rgba(79,128,226,.45)',
}

// ─────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────
export function EnglishHome() {
  const { child } = useChildProfile()
  const progress = loadEnglishProgress()

  // ─ فحص اكتمال كل عالم ─
  const isWorldComplete = (worldId: string) => {
    if (worldId === 'en-letters')   return progress.completedLetters?.length   >= 26
    if (worldId === 'en-words')     return progress.completedWords?.length     >= 80
    if (worldId === 'en-sentences') return progress.completedSentences?.length >= 20
    if (worldId === 'en-stories')   return progress.completedStories?.length   >= 5
    return false
  }

  return (
    <div
      className="relative min-h-screen pb-28"
      dir="ltr"
    >
      {/* ─── أنماط CSS المدمجة ─── */}
      <style>{ANIMATIONS}</style>

      {/* ══════════════════════════════════════
          الخلفية — طبقتان: صورة + تعتيم داكن
      ══════════════════════════════════════ */}
      {/* الصورة الخلفية */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/backgrounds/english-home.webp")',
          // لون احتياطي إذا لم تُحمَّل الصورة
          backgroundColor: '#0d1a3a',
        }}
      />
      {/* طبقة تعتيم زرقاء داكنة للعمق */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(165deg, rgba(8,16,50,.78) 0%, rgba(14,10,48,.82) 50%, rgba(6,28,44,.78) 100%)',
        }}
      />

      {/* ══════════════════════════════════════
          جسيمات زخرفية عائمة
      ══════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* دوائر ضوء ضبابية */}
        <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,128,226,.20) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 -left-10 h-64 w-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(47,182,140,.16) 0%, transparent 70%)' }} />

        {/* نجوم عائمة بتوزيع متناسق */}
        {[
          { top: '5%',  left: '6%',  size: '1.5rem', delay: '0s',   dur: '3.1s', icon: '⭐' },
          { top: '10%', left: '88%', size: '1.2rem', delay: '.5s',  dur: '2.7s', icon: '✨' },
          { top: '30%', left: '93%', size: '1rem',   delay: '1s',   dur: '3.6s', icon: '🌟' },
          { top: '48%', left: '2%',  size: '1.3rem', delay: '.3s',  dur: '2.5s', icon: '⭐' },
          { top: '65%', left: '94%', size: '1.1rem', delay: '.8s',  dur: '3s',   icon: '✨' },
          { top: '78%', left: '7%',  size: '1.2rem', delay: '1.3s', dur: '3.8s', icon: '🌟' },
          { top: '88%', left: '82%', size: '1.4rem', delay: '.2s',  dur: '2.9s', icon: '⭐' },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute select-none"
            style={{
              top: s.top, left: s.left, fontSize: s.size,
              animation: `floatStar ${s.dur} ${s.delay} ease-in-out infinite`,
            }}
          >
            {s.icon}
          </span>
        ))}

        {/* سحب زخرفية */}
        <span className="absolute bottom-20 right-6 text-3xl"
          style={{ animation: 'floatStar 4s .4s ease-in-out infinite' }}>☁️</span>
        <span className="absolute top-48 left-5 text-2xl"
          style={{ animation: 'floatStar 3.5s 1.1s ease-in-out infinite' }}>☁️</span>
      </div>

      {/* ══════════════════════════════════════
          المحتوى الرئيسي
      ══════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-5">

        {/* ══════════════════════════════════════
            زر العودة للمنصة الرئيسية — شريط كامل وواضح
        ══════════════════════════════════════ */}
        <Link
          to="/"
          className="mb-4 flex w-full items-center justify-center gap-3 font-extrabold"
          style={{
            borderRadius: '18px',
            padding: '13px 20px',
            background: 'rgba(255,255,255,.12)',
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(255,255,255,.22)',
            color: '#fff',
            fontSize: '1rem',
            boxShadow:
              '0 8px 28px rgba(8,16,50,.40), inset 0 1px 0 rgba(255,255,255,.20)',
            transition: 'transform .2s, background .2s, box-shadow .2s',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(-2px)'
            el.style.background = 'rgba(255,255,255,.20)'
            el.style.boxShadow = '0 14px 36px rgba(8,16,50,.50), inset 0 1px 0 rgba(255,255,255,.28)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(0)'
            el.style.background = 'rgba(255,255,255,.12)'
            el.style.boxShadow = '0 8px 28px rgba(8,16,50,.40), inset 0 1px 0 rgba(255,255,255,.20)'
          }}
        >
          {/* سهم العودة */}
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
            style={{
              background: 'linear-gradient(135deg, #4f80e2, #8b5fbf)',
              boxShadow: '0 4px 12px rgba(79,128,226,.50)',
            }}
          >
            🏠
          </span>

          {/* نص الزر */}
          <span className="flex flex-col items-start leading-tight">
            <span style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.65)', fontWeight: 700 }}>
              Back to
            </span>
            <span style={{ fontSize: '1rem', color: '#fff' }}>
              Main Platform
            </span>
          </span>

          {/* سهم اتجاه */}
          <span
            className="mr-auto text-xl"
            style={{ color: 'rgba(255,255,255,.55)' }}
          >
            ‹
          </span>
        </Link>

        {/* ══════════════════════════════════════
            ترويسة القسم
        ══════════════════════════════════════ */}
        <header
          className="relative mb-5 overflow-hidden"
          style={{
            borderRadius: '26px',
            border: '2px solid rgba(255,255,255,.16)',
            background: 'rgba(255,255,255,.09)',
            backdropFilter: 'blur(16px)',
            boxShadow:
              '0 24px 56px rgba(8,16,50,.52), inset 0 1px 0 rgba(255,255,255,.24), 0 0 0 1px rgba(79,128,226,.14)',
          }}
        >
          {/* شريط ألوان علوي */}
          <div
            className="absolute top-0 inset-x-0"
            style={{
              height: '4px',
              background: 'linear-gradient(90deg, #4f80e2, #8b5fbf, #2fb68c, #e85d75)',
              boxShadow: '0 1px 14px rgba(79,128,226,.55)',
            }}
          />

          <div className="p-5 pt-6">
            {/* أيقونة القسم المركزية المضيئة */}
            <div className="mb-3 flex justify-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #dce8ff, #7baaf7)',
                  fontSize: '3rem',
                  boxShadow: '0 8px 28px rgba(79,128,226,.55), 0 0 0 6px rgba(79,128,226,.14)',
                  animation: 'pulseGlow 2.8s ease-in-out infinite',
                }}
              >
                🔤
              </div>
            </div>

            {/* عنوان القسم بتأثير shimmer */}
            <h1
              className="text-center font-extrabold leading-tight"
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                color: 'transparent',
                backgroundImage: 'linear-gradient(90deg, #7baaf7, #fff, #7baaf7)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                backgroundSize: '200% auto',
                animation: 'shimmer 3.2s infinite linear',
              }}
            >
              Learn English
            </h1>

            {/* وصف القسم — ألوان واضحة مع ظل للإبراز */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
              {[
                { icon: '📖', label: 'Letters',  color: '#317aef' },
                { icon: '🔊', label: 'Phonics',  color: '#f4728a' },
                { icon: '📝', label: 'Words',    color: '#57d6ae' },
                { icon: '📚', label: 'Stories',  color: '#ab78ee' },
              ].map(({ icon, label, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-1 font-extrabold"
                  style={{
                    fontSize: '.88rem',
                    color: '#fff',
                    background: `${color}28`,
                    border: `1.5px solid ${color}55`,
                    // ظل نصي يجعل الكتابة واضحة على أي خلفية
                    textShadow: '0 1px 4px rgba(0,0,0,.65)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{icon}</span>
                  <span style={{ color }}>{label}</span>
                </span>
              ))}
            </div>

            {/* رسالة ترحيب شخصية بالطفل */}
            {child && (
              <div
                className="mx-auto mt-3 w-fit rounded-2xl px-4 py-1.5 text-center"
                style={{
                  background: 'rgba(79,128,226,.18)',
                  border: '1px solid rgba(79,128,226,.30)',
                }}
              >
                <p
                  className="font-bold"
                  style={{ fontSize: '.9rem', color: '#064eba' }}
                >
                  Welcome, <span style={{ color: '#fcfcfc', fontWeight: 1000 }}>{child.name}</span> 🌍✨
                </p>
              </div>
            )}
          </div>
        </header>

        {/* ══════════════════════════════════════
            عنوان الأقسام
        ══════════════════════════════════════ */}
        <h2
          className="mb-5 text-center font-extrabold"
          style={{
            fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
            color: '#fff',
            textShadow: '0 2px 12px rgba(8,16,50,.8)',
          }}
        >
          🗺️ Choose Your World
        </h2>

        {/* ══════════════════════════════════════
            شبكة بطاقات العوالم التعليمية
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world, idx) => {
            const path     = worldPaths[world.id] ?? '/english'
            const complete = isWorldComplete(world.id)
            const vis      = WORLD_VISUALS[world.id] ?? DEFAULT_VISUAL

            return (
              <div
                key={world.id}
                className="group relative"
                style={{
                  // ظهور تدريجي مرحلي لكل بطاقة
                  animation: `cardEnter .5s ${idx * .08}s cubic-bezier(.22,.68,0,1.2) both`,
                }}
              >
                <Link
                  to={path}
                  className="relative flex flex-col items-center overflow-hidden text-center block"
                  style={{
                    borderRadius: '22px',
                    border: '2px solid rgba(255,255,255,.14)',
                    background: 'rgba(255,255,255,.07)',
                    backdropFilter: 'blur(14px)',
                    padding: '0 0 18px',
                    boxShadow: `
                      0 20px 48px ${vis.shadowColor},
                      0 6px 20px rgba(8,16,50,.32),
                      inset 0 1px 0 rgba(255,255,255,.18)
                    `,
                    transition: 'transform .26s cubic-bezier(.22,.68,0,1.2), box-shadow .26s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-5px) scale(1.03)'
                    el.style.boxShadow = `
                      0 28px 58px ${vis.shadowColor},
                      0 0 0 2px ${world.colorVar}55,
                      inset 0 1px 0 rgba(255,255,255,.26)
                    `
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0) scale(1)'
                    el.style.boxShadow = `
                      0 20px 48px ${vis.shadowColor},
                      0 6px 20px rgba(8,16,50,.32),
                      inset 0 1px 0 rgba(255,255,255,.18)
                    `
                  }}
                >
                  {/* شريط لوني علوي لكل عالم */}
                  <div
                    className="w-full"
                    style={{
                      height: '5px',
                      background: vis.gradient,
                      boxShadow: `0 2px 12px ${vis.glowColor}`,
                    }}
                  />

                  {/* شارة الاكتمال */}
                  {complete && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-extrabold"
                      style={{
                        background: 'rgba(47,182,140,.25)',
                        border: '1px solid rgba(47,182,140,.45)',
                        color: '#6ddbb8',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      ✅ Done
                    </div>
                  )}

                  {/* أيقونة العالم — دائرة مضيئة */}
                  <div
                    className="mx-auto mt-5 flex items-center justify-center"
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: '50%',
                      background: vis.iconBg,
                      fontSize: '2.8rem',
                      lineHeight: 1,
                      boxShadow: `0 8px 24px ${vis.glowColor}, 0 2px 6px rgba(0,0,0,.18)`,
                      transition: 'transform .28s cubic-bezier(.22,.68,0,1.2)',
                    }}
                  >
                    {world.emoji}
                  </div>

                  {/* اسم العالم — حجم أكبر وتأثير ثلاثي الأبعاد محفور */}
                  <h3
                    className="mt-3 px-3 font-extrabold leading-tight"
                    style={{
                      fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)',
                      // التأثير ثلاثي الأبعاد: ظل داكن أسفل + ضوء فاتح أعلى = يبدو محفوراً للداخل
                      color: '#fff',
                      textShadow: `
                        0  1px 0 rgba(255,255,255,.18),
                        0 -1px 0 rgba(0,0,0,.55),
                        0  2px 6px rgba(0,0,0,.70),
                        0  0  14px ${vis.glowColor}
                      `,
                      // حرف الكلمة يبدو وكأنه مدفون في الخلفية
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.55))',
                    }}
                  >
                    {world.title}
                  </h3>

                  {/* زر الدخول — أكبر وأوضح */}
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 font-extrabold text-white"
                    style={{
                      borderRadius: '999px',
                      padding: '8px 20px',
                      fontSize: '.85rem',
                      background: vis.gradient,
                      boxShadow: `0 5px 18px ${vis.glowColor}, 0 2px 4px rgba(0,0,0,.25)`,
                      textShadow: '0 1px 3px rgba(0,0,0,.40)',
                    }}
                  >
                    Start Learning ✨
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── زر ولي الأمر (أسفل اليسار) ─── */}
      <ParentButton section="english" />
    </div>
  )
}