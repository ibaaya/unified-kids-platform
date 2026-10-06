/**
 * DiscoverHome — الصفحة الرئيسية لقسم "اكتشف ما حولك"
 *
 * التحسينات البصرية (مع الحفاظ الكامل على الوظائف والهيكل):
 * - زر العودة للمنصة شريط كامل في أعلى الصفحة
 * - خلفية داكنة خضراء/زرقاء عميقة مع طبقات ضوء وجسيمات عائمة
 * - ترويسة أكبر وأوضح: أيقونة مضيئة + shimmer + chips الإحصائيات
 * - بطاقات العوالم: خلفية زجاجية داكنة + ظل ملوّن + نص ثلاثي الأبعاد
 * - شريط التقدم محسّن + شارة الاكتمال glass
 * - بطاقة الاختبار الشامل محسّنة
 * - زر ولي الأمر ⚙️ ثابت أسفل اليسار (موحّد مع بقية الصفحات)
 * - انيميشن ظهور تدريجي للبطاقات
 */

import { Link } from 'react-router-dom'
import { DISCOVER_WORLDS } from '../data/discoverData'
import {
  getWorldCompletion,
  isWorldComplete,
  loadDiscoverProgress,
  getDiscoverOverallTestPercentage,
  isDiscoverFinalTestComplete,
} from '../engine/discoverProgress'

// ─────────────────────────────────────────────
// أنماط CSS المُدمَجة
// ─────────────────────────────────────────────
const ANIMATIONS = `
  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(22px) scale(.94); }
    to   { opacity: 1; transform: translateY(0)    scale(1);   }
  }
  @keyframes floatItem {
    0%, 100% { transform: translateY(0)     rotate(0deg);  opacity: .18; }
    50%       { transform: translateY(-18px) rotate(12deg); opacity: .28; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0    rgba(47,182,140,.50); }
    50%       { box-shadow: 0 0 0 16px rgba(47,182,140,0);  }
  }
  @keyframes gearSpin {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
  }
`

// ─────────────────────────────────────────────
// المكوّن الرئيسي
// ─────────────────────────────────────────────
export function DiscoverHome() {
  const progress = loadDiscoverProgress()

  // حساب عدد العوالم المكتملة
  const completedWorldsCount = DISCOVER_WORLDS.filter(
    (w) => isWorldComplete(w.id, w.items.length)
  ).length

  return (
    <div className="relative isolate min-h-screen pb-28" dir="rtl" style={{ backgroundImage: 'linear-gradient(160deg, rgba(4,30,25,.58) 0%, rgba(7,26,38,.64) 55%, rgba(5,16,28,.68) 100%), url("/images/discover_bg.webp")', backgroundPosition: 'center', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>

      {/* ─── أنماط CSS المدمجة ─── */}
      <style>{ANIMATIONS}</style>


      {/* طبقة تعتيم شفافة إضافية للعمق */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 15% 15%, rgba(47,182,140,.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(58,160,217,.15) 0%, transparent 55%)',
        }}
      />

      {/* ══════════════════════════════════════
          جسيمات زخرفية عائمة — أيقونات من عالم الاكتشاف
      ══════════════════════════════════════ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* دوائر ضوء ضبابية */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(47,182,140,.20) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -left-10 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(58,160,217,.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 right-1/4 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,159,69,.12) 0%, transparent 70%)' }} />

        {/* أيقونات عائمة من عالم الاكتشاف */}
        {[
          { em: '🏠', top: '5%',  left: '5%',  size: '2.2rem', delay: '0s',   dur: '3.2s' },
          { em: '🚗', top: '10%', left: '87%', size: '1.8rem', delay: '.5s',  dur: '2.8s' },
          { em: '🌙', top: '28%', left: '93%', size: '1.6rem', delay: '1s',   dur: '3.7s' },
          { em: '🐈', top: '46%', left: '2%',  size: '1.8rem', delay: '.3s',  dur: '2.5s' },
          { em: '🌳', top: '62%', left: '94%', size: '1.6rem', delay: '.9s',  dur: '3s'   },
          { em: '☀️', top: '75%', left: '5%',  size: '1.8rem', delay: '1.4s', dur: '4s'   },
          { em: '⭐', top: '87%', left: '85%', size: '1.5rem', delay: '.2s',  dur: '2.9s' },
          { em: '🌊', top: '20%', left: '48%', size: '1.4rem', delay: '1.7s', dur: '3.5s' },
        ].map((s, i) => (
          <span key={i} className="absolute select-none"
            style={{
              top: s.top, left: s.left, fontSize: s.size,
              animation: `floatItem ${s.dur} ${s.delay} ease-in-out infinite`,
            }}>
            {s.em}
          </span>
        ))}
      </div>

      {/* ══════════════════════════════════════
          المحتوى الرئيسي
      ══════════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-5">

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
            background: 'rgba(255,255,255,.09)',
            backdropFilter: 'blur(14px)',
            border: '2px solid rgba(255,255,255,.18)',
            color: '#fff',
            fontSize: '1rem',
            boxShadow: '0 10px 32px rgba(6,24,16,.55), inset 0 1px 0 rgba(255,255,255,.16)',
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
            el.style.background = 'rgba(255,255,255,.09)'
          }}
        >
          {/* أيقونة المنصة داخل دائرة خضراء/زرقاء */}
          <span
            className="flex shrink-0 items-center justify-center rounded-full text-xl"
            style={{
              width: 46, height: 46,
              background: 'linear-gradient(135deg, #2fb68c, #3aa0d9)',
              boxShadow: '0 4px 14px rgba(47,182,140,.55)',
            }}
          >
            🏠
          </span>

          {/* نص الزر */}
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
            ② الترويسة — عنوان + إحصائيات
        ══════════════════════════════════════ */}
        <header
          className="relative mb-5 overflow-hidden"
          style={{
            borderRadius: '26px',
            border: '2px solid rgba(255,255,255,.14)',
            background: 'rgba(255,255,255,.08)',
            backdropFilter: 'blur(18px)',
            boxShadow:
              '0 26px 58px rgba(6,24,16,.55), inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 1px rgba(47,182,140,.16)',
          }}
        >
          {/* شريط ألوان علوي */}
          <div
            className="absolute top-0 inset-x-0"
            style={{
              height: '5px',
              background: 'linear-gradient(90deg, #ff9f45, #2fb68c, #3aa0d9, #8b5fbf, #e85d75)',
              boxShadow: '0 2px 16px rgba(47,182,140,.55)',
            }}
          />

          <div className="px-5 pb-5 pt-7">
            {/* أيقونة القسم المضيئة */}
            <div className="mb-3 flex justify-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 92, height: 92,
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #c8f7e4, #6ddbb8)',
                  fontSize: '3.2rem',
                  boxShadow: '0 8px 28px rgba(47,182,140,.55), 0 0 0 6px rgba(47,182,140,.14)',
                  animation: 'pulseGlow 2.8s ease-in-out infinite',
                }}
              >
                🌍
              </div>
            </div>

            {/* عنوان القسم — shimmer أخضر */}
            <h1
              className="text-center font-extrabold leading-tight"
              style={{
                fontSize: 'clamp(1.3rem, 5vw, 1.9rem)',
                color: 'transparent',
                backgroundImage: 'linear-gradient(90deg, #6ddbb8, #fff, #6ddbb8)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                backgroundSize: '200% auto',
                animation: 'shimmer 3s infinite linear',
              }}
            >
              اكْتَشِفْ مَا حَوْلَكَ
            </h1>
            <p
              className="mt-1 text-center font-semibold"
              style={{ fontSize: '.9rem', color: 'rgba(180,240,210,.75)', letterSpacing: '.04em' }}
            >
              Discover the World Around You
            </p>

            {/* إحصائيات إجمالية — chips مضيئة */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {[
                {
                  value: progress.totalItemsSeen,
                  label: 'شيء تعلَّمته',
                  color: '#fbbf24',
                  icon: '📚',
                },
                {
                  value: progress.totalActivitiesDone,
                  label: 'نشاط أكملته',
                  color: '#6ddbb8',
                  icon: '✅',
                },
                {
                  value: `${completedWorldsCount} / ${DISCOVER_WORLDS.length}`,
                  label: 'عالم مكتمل',
                  color: '#5392f6',
                  icon: '🌐',
                },
              ].map(({ value, label, color, icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center rounded-2xl px-5 py-2.5"
                  style={{
                    background: `${color}18`,
                    border: `1.5px solid ${color}40`,
                    backdropFilter: 'blur(6px)',
                    minWidth: 80,
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                  <span
                    className="mt-0.5 font-extrabold"
                    style={{
                      fontSize: '1.2rem',
                      color,
                      textShadow: `0 0 12px ${color}66`,
                    }}
                  >
                    {value}
                  </span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: 'rgba(255,255,255,.60)' }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════
            دعوة للاستكشاف
        ══════════════════════════════════════ */}
        <p
          className="mb-5 text-center font-bold"
          style={{
            fontSize: '1rem',
            color: '#fff',
            textShadow: '0 2px 8px rgba(6,24,16,.80)',
          }}
        >
          اضغط على أيّ عالم لتبدأ رحلة الاكتشاف! 🚀
        </p>

        {/* ══════════════════════════════════════
            ③ شبكة بطاقات العوالم
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {DISCOVER_WORLDS.map((world, idx) => {
            const completion = getWorldCompletion(world.id, world.items.length)
            const complete   = isWorldComplete(world.id, world.items.length)

            return (
              <div
                key={world.id}
                style={{
                  // انيميشن ظهور تدريجي لكل بطاقة
                  animation: `cardEnter .50s ${idx * .05}s cubic-bezier(.22,.68,0,1.2) both`,
                }}
              >
                <Link
                  to={`/discover/${world.id}`}
                  className="group relative flex flex-col items-center overflow-hidden text-center"
                  style={{
                    borderRadius: '22px',
                    border: '2px solid rgba(255,255,255,.13)',
                    background: 'rgba(255,255,255,.07)',
                    backdropFilter: 'blur(14px)',
                    padding: '0 10px 16px',
                    minHeight: '13rem',
                    boxShadow: `
                      0 18px 44px ${world.color}33,
                      0 6px 18px rgba(6,24,16,.35),
                      inset 0 1px 0 rgba(255,255,255,.16)
                    `,
                    textDecoration: 'none',
                    transition: 'transform .25s cubic-bezier(.22,.68,0,1.2), box-shadow .25s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(-6px) scale(1.04)'
                    el.style.boxShadow = `
                      0 26px 54px ${world.color}55,
                      0 0 0 2.5px ${world.color}66,
                      inset 0 1px 0 rgba(255,255,255,.24)
                    `
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.transform = 'translateY(0) scale(1)'
                    el.style.boxShadow = `
                      0 18px 44px ${world.color}33,
                      0 6px 18px rgba(6,24,16,.35),
                      inset 0 1px 0 rgba(255,255,255,.16)
                    `
                  }}
                >
                  {/* شريط لوني علوي بلون العالم */}
                  <div
                    className="absolute top-0 inset-x-0"
                    style={{
                      height: '5px',
                      background: `linear-gradient(90deg, ${world.color}, ${world.colorEnd})`,
                      boxShadow: `0 2px 12px ${world.color}66`,
                    }}
                  />

                  {/* شارة الاكتمال */}
                  {complete && (
                    <div
                      className="absolute end-2 top-2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
                      style={{
                        fontSize: '.7rem',
                        fontWeight: 800,
                        background: 'rgba(47,182,140,.28)',
                        border: '1.5px solid rgba(47,182,140,.50)',
                        color: '#6ddbb8',
                        backdropFilter: 'blur(5px)',
                        textShadow: '0 1px 3px rgba(0,0,0,.50)',
                      }}
                    >
                      ✅
                    </div>
                  )}

                  {/* أيقونة العالم — دائرة مضيئة كبيرة */}
                  <div
                    className="mx-auto mt-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{
                      width: 80, height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${world.color}30, ${world.colorEnd}30)`,
                      fontSize: '2.8rem',
                      lineHeight: 1,
                      boxShadow: `
                        0 8px 22px ${world.color}44,
                        0 2px 6px rgba(0,0,0,.22),
                        inset 0 1px 0 rgba(255,255,255,.30)
                      `,
                      border: `2px solid ${world.color}44`,
                    }}
                  >
                    {world.emoji}
                  </div>

                  {/* عنوان العالم — نص ثلاثي الأبعاد محفور */}
                  <h3
                    className="mt-3 px-1 font-extrabold leading-snug"
                    style={{
                      fontSize: 'clamp(.85rem, 2.8vw, 1rem)',
                      color: '#fff',
                      textShadow: `
                        0  1px 0   rgba(255,255,255,.18),
                        0 -1px 0   rgba(0,0,0,.55),
                        0  2px 7px rgba(0,0,0,.80),
                        0  0  12px ${world.color}55
                      `,
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.50))',
                    }}
                  >
                    {world.titleAr}
                  </h3>

                  {/* العنوان بالإنجليزية */}
                  <p
                    className="mt-0.5 text-xs"
                    dir="ltr"
                    style={{
                      color: 'rgba(255,255,255,.55)',
                      textShadow: '0 1px 3px rgba(0,0,0,.55)',
                    }}
                  >
                    {world.titleEn}
                  </p>

                  {/* عدد عناصر العالم */}
                  <p
                    className="mt-0.5 text-xs font-bold"
                    style={{ color: 'rgba(255,255,255,.45)' }}
                  >
                    {world.items.length} عنصر
                  </p>

                  {/* شريط التقدم */}
                  {completion > 0 && (
                    <div className="mt-2 w-full px-1">
                      <div
                        className="h-2 w-full overflow-hidden rounded-full"
                        style={{ background: 'rgba(255,255,255,.12)' }}
                      >
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{
                            width: `${completion}%`,
                            background: `linear-gradient(90deg, ${world.color}, ${world.colorEnd})`,
                            boxShadow: `0 1px 6px ${world.color}66`,
                          }}
                        />
                      </div>
                      <p
                        className="mt-0.5 text-right font-bold"
                        style={{
                          fontSize: '.65rem',
                          color: world.color,
                          textShadow: '0 1px 3px rgba(0,0,0,.50)',
                        }}
                      >
                        {completion}%
                      </p>
                    </div>
                  )}

                  {/* زر ابدأ إذا لم يبدأ بعد */}
                  {completion === 0 && (
                    <div
                      className="mt-3 rounded-full px-4 py-1.5 text-xs font-extrabold text-white"
                      style={{
                        background: `linear-gradient(90deg, ${world.color}, ${world.colorEnd})`,
                        boxShadow: `0 4px 14px ${world.color}55`,
                        textShadow: '0 1px 3px rgba(0,0,0,.40)',
                      }}
                    >
                      ابدأ ✨
                    </div>
                  )}
                </Link>
              </div>
            )
          })}
        </div>

        {/* ══════════════════════════════════════
            ④ بطاقة الاختبار الشامل
        ══════════════════════════════════════ */}
        <Link
          to="/discover/test"
          className="mt-6 flex items-center gap-4 overflow-hidden"
          style={{
            borderRadius: '22px',
            border: '2px solid rgba(139,95,191,.38)',
            background: 'rgba(139,95,191,.14)',
            backdropFilter: 'blur(14px)',
            padding: '18px 20px',
            boxShadow: '0 16px 40px rgba(139,95,191,.28), inset 0 1px 0 rgba(255,255,255,.14)',
            textDecoration: 'none',
            transition: 'transform .24s, box-shadow .24s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(-3px) scale(1.01)'
            el.style.boxShadow = '0 22px 50px rgba(139,95,191,.42), inset 0 1px 0 rgba(255,255,255,.22)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(0) scale(1)'
            el.style.boxShadow = '0 16px 40px rgba(139,95,191,.28), inset 0 1px 0 rgba(255,255,255,.14)'
          }}
        >
          {/* أيقونة الاختبار */}
          <div
            className="flex shrink-0 items-center justify-center rounded-2xl text-4xl"
            style={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg, rgba(47,182,140,.25), rgba(139,95,191,.25))',
              border: '2px solid rgba(139,95,191,.35)',
              boxShadow: '0 4px 16px rgba(139,95,191,.30)',
            }}
          >
            🏆
          </div>

          {/* تفاصيل الاختبار */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2
                className="font-extrabold"
                style={{
                  fontSize: 'clamp(.95rem, 3vw, 1.1rem)',
                  color: '#fff',
                  textShadow: '0 1px 0 rgba(255,255,255,.16), 0 2px 8px rgba(0,0,0,.70)',
                }}
              >
                الاختبار الشامل
              </h2>
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-extrabold"
                style={{
                  background: 'rgba(139,95,191,.30)',
                  border: '1.5px solid rgba(139,95,191,.50)',
                  color: '#c4a3ef',
                  textShadow: '0 1px 3px rgba(0,0,0,.50)',
                }}
              >
                ٣ مستويات
              </span>
            </div>
            <p
              className="mt-1 text-xs font-semibold"
              style={{ color: 'rgba(255,255,255,.65)', textShadow: '0 1px 4px rgba(0,0,0,.55)' }}
            >
              سهل · متوسط · صعب — ٢٥ سؤالًا في كل مستوى
            </p>
            <p
              className="mt-1 text-xs font-bold"
              style={{
                color: isDiscoverFinalTestComplete() ? '#6ddbb8' : 'rgba(255,255,255,.55)',
                textShadow: '0 1px 3px rgba(0,0,0,.50)',
              }}
            >
              {isDiscoverFinalTestComplete()
                ? `🌟 مكتمل · النتيجة الكلية ${getDiscoverOverallTestPercentage()}%`
                : 'ابدأ التحدي وافتح المستويات بالتدريج ←'}
            </p>
          </div>
        </Link>

        {/* ══════════════════════════════════════
            ⑤ رسالة تشجيعية
        ══════════════════════════════════════ */}
        <div
          className="mt-6 text-center"
          style={{
            borderRadius: '20px',
            border: '1.5px solid rgba(255,255,255,.12)',
            background: 'rgba(255,255,255,.07)',
            backdropFilter: 'blur(12px)',
            padding: '16px 20px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14)',
          }}
        >
          <p
            className="font-bold"
            style={{
              fontSize: '1rem',
              color: '#fff',
              textShadow: '0 1px 6px rgba(0,0,0,.65)',
            }}
          >
            🌟 كلما استكشفت أكثر، تعلّمت أكثر! استمر في رحلتك.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════
          زر ولي الأمر ⚙️ — ثابت أسفل اليسار (موحّد مع بقية الصفحات)
      ══════════════════════════════════════ */}
      <Link
        to="/parent"
        aria-label="منطقة ولي الأمر"
        title="منطقة ولي الأمر"
        className="fixed flex items-center justify-center"
        style={{
          bottom: 20, left: 20,
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'rgba(255,255,255,.12)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,.24)',
          fontSize: '1.5rem',
          boxShadow: '0 8px 28px rgba(6,24,16,.45)',
          zIndex: 50,
          transition: 'transform .2s, background .2s',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'scale(1.12)'
          el.style.background = 'rgba(255,255,255,.22)'
          ;(el.querySelector('span') as HTMLElement).style.animation = 'gearSpin .8s linear infinite'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'scale(1)'
          el.style.background = 'rgba(255,255,255,.12)'
          ;(el.querySelector('span') as HTMLElement).style.animation = 'none'
        }}
      >
        <span style={{ display: 'block', lineHeight: 1 }}>⚙️</span>
      </Link>
    </div>
  )
}