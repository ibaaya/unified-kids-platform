/**
 * ParentHub — نقطة دخول لوحة ولي الأمر الموحّدة
 * يعرض اختيار القسم (عربية / إنجليزية / أرقام)
 * ثم يوجّه إلى صفحة الإعدادات الخاصة بكل قسم
 */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ParentDashboard } from '../ParentDashboard/ParentDashboard'
import { EnglishParentDashboard } from '../../english/pages/EnglishParentDashboard'
import { NumbersParentPage } from '../../numbers/pages/NumbersParentPage'
import { DiscoverParentSettings } from '../../discover/pages/DiscoverParentSettings'
import { STUDIO_ENABLED } from '../../config/features'
import { DedicationCard } from '../../components/Dedication'

// القسم النشط حالياً
type Section = 'arabic' | 'english' | 'numbers' | null

const SECTIONS = [
  {
    id: 'arabic' as Section,
    emoji: '🌙',
    title: 'تعلم العربية',
    subtitle: 'إعدادات رحلة اللغة العربية',
    gradient: 'from-orange-400 to-rose-500',
    border: '#ff9f45',
    dir: 'rtl',
  },
  {
    id: 'english' as Section,
    emoji: '🔤',
    title: 'Learn English',
    subtitle: 'English learning settings',
    gradient: 'from-blue-500 to-violet-600',
    border: '#4f80e2',
    dir: 'ltr',
  },
  {
    id: 'numbers' as Section,
    emoji: '🔢',
    title: 'مغامرة الأرقام',
    subtitle: 'إعدادات تعلم الأرقام',
    gradient: 'from-violet-500 to-teal-500',
    border: '#8b5fbf',
    dir: 'rtl',
  },
  {
    id: 'discover' as Section,
    emoji: '🌍',
    title: 'اكتشف ما حولك',
    subtitle: 'إعدادات الاكتشاف',
    gradient: 'from-emerald-500 to-sky-500',
    border: '#2fb68c',
    dir: 'rtl',
  },
]

export function ParentHub() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // إذا جاء مقطع من الـ URL نفتحه مباشرة
  const initialSection = (searchParams.get('section') as Section) ?? null
  const [activeSection, setActiveSection] = useState<Section>(initialSection)

  // ————— إذا اختار ولي الأمر قسماً، يعرض لوحته —————
  if (activeSection === 'arabic') {
    return (
      <div className="relative min-h-screen">
        {/* زر العودة لاختيار القسم */}
        <button
          onClick={() => setActiveSection(null)}
          className="app-shell-nav-center fixed z-[70] flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-orange-500/90 px-3 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-105"
        >
          ← اختيار القسم
        </button>
        <ParentDashboard />
      </div>
    )
  }

  if (activeSection === 'english') {
    return (
      <div className="relative min-h-screen">
        <button
          onClick={() => setActiveSection(null)}
          className="app-shell-nav-center fixed z-[70] flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-blue-600/90 px-3 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-105"
        >
          ← Back to sections
        </button>
        <EnglishParentDashboard />
        <div className="mx-auto mb-8 w-full max-w-2xl px-4"><DedicationCard /></div>
      </div>
    )
  }

  if (activeSection === 'numbers') {
    return (
      <div className="relative min-h-screen">
        <button
          onClick={() => setActiveSection(null)}
          className="app-shell-nav-center fixed z-[70] flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-violet-600/90 px-3 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-105"
        >
          ← اختيار القسم
        </button>
        <NumbersParentPage />
        <div className="mx-auto mb-8 w-full max-w-2xl px-4"><DedicationCard /></div>
      </div>
    )
  }

  if (activeSection === 'discover') {
    return (
      <div className="relative min-h-screen" style={{ background: 'linear-gradient(160deg,#edf8f5,#f4f7ff)' }}>
        <button
          onClick={() => setActiveSection(null)}
          className="app-shell-nav-center fixed z-[70] flex items-center gap-2 rounded-2xl border-2 border-white/80 bg-emerald-600/90 px-3 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:scale-105"
        >
          ← اختيار القسم
        </button>
        <DiscoverParentSettings />
        <div className="mx-auto mb-8 w-full max-w-2xl px-4"><DedicationCard /></div>
      </div>
    )
  }

  // ————— شاشة اختيار القسم —————
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' }}
    >
      {/* رأس الصفحة */}
      <div className="mb-8 text-center">
        <div className="mb-2 text-5xl">⚙️</div>
        <h1 className="text-3xl font-extrabold text-white">لوحة ولي الأمر</h1>
        <p className="mt-1 text-sm text-indigo-200">اختر القسم الذي تريد ضبط إعداداته</p>
      </div>

      {/* بطاقات الأقسام */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            dir={sec.dir}
            className={`
              group relative flex flex-col items-center overflow-hidden
              rounded-3xl border-2 border-white/20 p-6 text-center
              bg-gradient-to-br ${sec.gradient}
              shadow-xl transition-all duration-300
              hover:scale-105 hover:-translate-y-1 hover:border-white/50
            `}
            style={{ boxShadow: `0 8px 32px ${sec.border}55` }}
          >
            {/* بريق */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />

            <span className="mb-3 text-5xl">{sec.emoji}</span>
            <h2 className="text-lg font-extrabold text-white">{sec.title}</h2>
            <p className="mt-1 text-xs text-white/75">{sec.subtitle}</p>
            <div className="mt-4 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white">
              فتح الإعدادات ←
            </div>
          </button>
        ))}
      </div>

      {STUDIO_ENABLED && (
        <div className="mt-5 flex w-full max-w-2xl flex-wrap justify-center gap-3">
          <button onClick={() => navigate('/islamic/voice-studio')} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-white/20">🎙️ استوديو أخلاقي الجميلة</button>
          <button onClick={() => navigate('/skills/voice-studio')} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-white/20">🎙️ استوديو مدينة المهارات</button>
        </div>
      )}

      {/* زر العودة للمنصة */}
      <button
        onClick={() => navigate('/')}
        className="mt-10 flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:scale-105 hover:bg-white/20"
      >
        🏠 العودة للمنصة
      </button>
      <div className="mt-6 w-full max-w-2xl"><DedicationCard /></div>
    </div>
  )
}
