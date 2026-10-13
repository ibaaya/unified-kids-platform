/**
 * HarakatSyllablesWorld.tsx  ·  src/pages/Worlds/HarakatSyllablesWorld.tsx
 * ══════════════════════════════════════════════════════════════════════════
 * صفحة عالم الحركات والمقاطع الموحّد — تحل محل HarakatWorld و SyllablesWorld.
 *
 * التصميم:
 *  • 3 مجموعات واضحة بعناوين: الحركات الأساسية / التنوين / المدود
 *  • كل بطاقة: إيموجي + رمز الحركة (كبير) + اسمها + كلمة مثال
 *  • شريط تقدم كلي في الأعلى
 *  • علامة ✓ خضراء على الحركات المكتملة
 *  • تصميم ملوّن — كل مجموعة بلون خاص بها
 *
 * المسار: /arabic/world/harakat
 */

import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mascot } from '../../components/character/Mascot'
import { useChildProfile } from '../../hooks/useChildProfile'
import { HARAKA_WORLD_ORDER, HARAKAT_WORLD_MAP } from '../../data/harakatWorld'
import type { HarakaWorldId } from '../../data/harakatWorld'

// ─── تعريف المجموعات ──────────────────────────────────────────────────────────

interface Group {
  key: string
  label: string
  icon: string
  /** لون خلفية عنوان المجموعة */
  headingColor: string
  ids: HarakaWorldId[]
}

const GROUPS: Group[] = [
  {
    key: 'basic',
    label: 'الحركات الأساسية',
    icon: '✏️',
    headingColor: '#F59E0B',
    ids: ['fatha', 'damma', 'kasra', 'sukun', 'shadda'],
  },
  {
    key: 'tanween',
    label: 'التنوين',
    icon: '🔤',
    headingColor: '#F97316',
    ids: ['tanween_fath', 'tanween_damm', 'tanween_kasr'],
  },
  {
    key: 'madd',
    label: 'المدود',
    icon: '🔊',
    headingColor: '#7C3AED',
    ids: ['madd_alif', 'madd_waw', 'madd_yaa'],
  },
]

// ─── مكوّن بطاقة حركة واحدة ──────────────────────────────────────────────────

interface HarakaCardProps {
  id: HarakaWorldId
  isDone: boolean
  onClick: () => void
}

function HarakaCard({ id, isDone, onClick }: HarakaCardProps) {
  const entry = HARAKAT_WORLD_MAP.get(id)!
  const firstEx = entry.examples[0]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`تعلّم ${entry.label}`}
      className="group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border-2 border-white/70 px-2 pt-3 pb-2 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:scale-[1.05] focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-300"
      style={{
        backgroundColor: 'rgba(255,255,255,.92)',
        minHeight: '8.5rem',
        borderColor: entry.color + '55',
      }}
    >
      {/* ✓ إتمام */}
      {isDone && (
        <span
          className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black shadow-md"
          style={{ color: entry.color }}
          aria-label="تم إتقانها"
        >
          ✓
        </span>
      )}

      {/* إيموجي */}
      <span className="text-2xl mb-0.5 select-none" aria-hidden="true">
        {entry.emoji}
      </span>

      {/* رمز الحركة الكبير */}
      <span
        className="font-display font-black select-none leading-none drop-shadow-sm"
        style={{
          fontSize: 'clamp(2rem, 7vw, 2.8rem)',
          color: entry.color,
        }}
        aria-hidden="true"
      >
        {entry.symbol}
      </span>

      {/* اسم الحركة */}
      <span className="mt-1 font-display font-extrabold text-[var(--color-ink)] text-center leading-tight"
        style={{ fontSize: 'clamp(0.6rem, 2.5vw, 0.75rem)' }}>
        {entry.label}
      </span>

      {/* مثال كلمة + إيموجيها */}
      {firstEx && (
        <span className="mt-0.5 text-[var(--color-ink-soft)] font-display"
          style={{ fontSize: 'clamp(0.55rem, 2vw, 0.65rem)' }}
          aria-hidden="true">
          {firstEx.emoji} {firstEx.word}
        </span>
      )}

      {/* وميض خلفي عند hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: `radial-gradient(circle at 50% 30%, ${entry.color}33, transparent 70%)` }}
        aria-hidden="true"
      />
    </button>
  )
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────

export function HarakatSyllablesWorld() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { child } = useChildProfile()
  const selectedGroup = GROUPS.find((group) => group.key === searchParams.get('topic'))

  const completedIds = child?.completedLessonIds ?? []
  const isDone = (id: HarakaWorldId) =>
    completedIds.includes(`harakaworld_lesson_${id}`) ||
    completedIds.includes(`haraka_lesson_${id}`)

  const total = HARAKA_WORLD_ORDER.length
  const done  = HARAKA_WORLD_ORDER.filter((id) => isDone(id)).length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-8 pb-20" dir="rtl">
      <h1 className="mb-5 text-center font-display text-2xl font-black text-[var(--color-ink)]">
        عَالَمُ الْحَرَكَاتِ وَالْمَقَاطِعِ
      </h1>

      {/* الماسكوت */}
      <div className="flex justify-center mb-5">
        <Mascot
          message="اختر حركة لتتعرّف عليها في كلمات حقيقية! 🎧"
          size={80}
        />
      </div>

      {/* شريط التقدم */}
      <div className="mb-7 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow">
        <div className="flex justify-between items-center mb-1">
          <span className="font-display font-bold text-[var(--color-ink)] text-sm">
            تقدّمك في العالم
          </span>
          <span className="font-display font-black text-[var(--color-ink)] text-sm">
            {done} / {total}
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/25 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: '#34d399' }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        {pct === 100 && (
          <p className="mt-1.5 text-center text-xs font-bold text-green-700">
            🏆 أتقنت جميع الحركات!
          </p>
        )}
      </div>

      {!selectedGroup ? (
        <section aria-label="موضوعات العالم" className="grid gap-4 sm:grid-cols-3">
          {GROUPS.map((group) => {
            const groupDone = group.ids.filter(isDone).length
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => setSearchParams({ topic: group.key })}
                className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-3xl border-2 bg-white/90 p-5 text-center shadow-lg transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2"
                style={{ borderColor: `${group.headingColor}88`, outlineColor: group.headingColor }}
              >
                <span className="text-4xl" aria-hidden="true">{group.icon}</span>
                <span className="font-display text-xl font-black text-[var(--color-ink)]">{group.label}</span>
                <span className="font-display text-sm font-bold text-[var(--color-ink-soft)]">
                  {group.ids.length} دروس · {groupDone} مكتمل
                </span>
                <span className="rounded-full px-4 py-1 font-bold text-white" style={{ backgroundColor: group.headingColor }}>
                  افتح الموضوع ←
                </span>
              </button>
            )
          })}
        </section>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="mb-4 rounded-full border border-white/70 bg-white/90 px-4 py-2 font-display font-bold text-[var(--color-ink)] shadow"
          >
            ← كل الموضوعات
          </button>
          <section key={selectedGroup.key} className="mb-8">
          {/* عنوان المجموعة */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="h-7 w-1.5 rounded-full"
              style={{ backgroundColor: selectedGroup.headingColor }}
              aria-hidden="true"
            />
            <h2
              className="font-display font-extrabold text-[var(--color-ink)] text-base flex items-center gap-2"
            >
              <span aria-hidden="true">{selectedGroup.icon}</span>
              {selectedGroup.label}
            </h2>
            {/* عداد المجموعة */}
            <span className="mr-auto text-xs font-bold text-[var(--color-ink-soft)]">
              {selectedGroup.ids.filter((id) => isDone(id)).length} / {selectedGroup.ids.length}
            </span>
          </div>

          {/* شبكة البطاقات */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
            {selectedGroup.ids.map((id) => (
              <HarakaCard
                key={id}
                id={id}
                isDone={isDone(id)}
                onClick={() => navigate(`/arabic/world/harakat/${id}`)}
              />
            ))}
          </div>
          </section>
        </>
      )}
    </div>
  )
}
