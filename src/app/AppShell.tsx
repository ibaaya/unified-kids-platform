import { useEffect } from 'react'
import { AppRoutes } from './routes'
import { useChildProfile } from '../hooks/useChildProfile'
import { updateChildSettings } from '../services/progressService'
import type { ChildSettings } from '../types/progress'
import { Mascot } from '../components/character/Mascot'
import { Link, useLocation } from 'react-router-dom'
import { lockParentSession } from './parentSession'
// ✅ حذف primeEnglishVoices من هنا — انتقل إلى AudioUnlockProvider

const ARABIC_WORLD_NAV: Array<{ prefix: string; path: string; label: string; icon: string }> = [
  { prefix: '/arabic/world/letters', path: '/arabic/world/letters', label: 'عالم الحروف', icon: '🔤' },
  { prefix: '/arabic/world/harakat', path: '/arabic/world/harakat', label: 'الحركات والمقاطع', icon: '🎵' },
  { prefix: '/arabic/world/words', path: '/arabic/world/words', label: 'عالم الكلمات', icon: '✨' },
  { prefix: '/arabic/world/sentences', path: '/arabic/world/sentences', label: 'عالم الجمل', icon: '💬' },
  { prefix: '/arabic/world/stories', path: '/arabic/world/stories', label: 'عالم القصص', icon: '📚' },
  { prefix: '/world/letters', path: '/world/letters', label: 'عالم الحروف', icon: '🔤' },
  { prefix: '/world/harakat', path: '/world/harakat', label: 'عالم الحركات', icon: '🎵' },
  { prefix: '/world/words', path: '/world/words', label: 'عالم الكلمات', icon: '✨' },
  { prefix: '/world/sentences', path: '/world/sentences', label: 'عالم الجمل', icon: '💬' },
  { prefix: '/world/stories', path: '/world/stories', label: 'عالم القصص', icon: '📚' },
]

const SIZE_ORDER: ChildSettings['textSize'][] = ['normal', 'large', 'xlarge']
const SIZE_BUTTON_LABEL: Record<ChildSettings['textSize'], string> = { normal: 'A', large: 'A+', xlarge: 'A++' }

export function AppShell() {
  const { pathname } = useLocation()
  const { child, refresh } = useChildProfile()
  const textSize = child?.settings?.textSize ?? 'normal'

  const isArabicWorldPage = pathname.startsWith('/world/') || pathname.startsWith('/arabic/world/')

  const currentArabicWorld = ARABIC_WORLD_NAV.find(
    (w) => pathname.startsWith(`${w.prefix}/`) || pathname === w.prefix
  )
  const isNestedArabicWorld = Boolean(currentArabicWorld && pathname !== currentArabicWorld.path)
  const sectionNavigation: Array<{ to: string; label: string; icon: string; variant?: string }> = (() => {
    if (pathname === '/arabic') return []
    if (pathname.startsWith('/arabic/') || pathname.startsWith('/world/')) {
      return [
        { to: '/arabic', label: 'العربية', icon: '🔤' },
        ...(isNestedArabicWorld && currentArabicWorld ? [{ to: currentArabicWorld.path, label: currentArabicWorld.label, icon: currentArabicWorld.icon }] : []),
      ]
    }
    const sections = [
      { prefix: '/english', home: '/english', label: 'الإنجليزية', icon: '🔤' },
      { prefix: '/numbers', home: '/numbers', label: 'مغامرة الأرقام', icon: '🔢' },
      { prefix: '/discover', home: '/discover', label: 'عالم الاكتشاف', icon: '🌍' },
      { prefix: '/skills', home: '/skills', label: 'مدينة المهارات', icon: '🎯' },
      { prefix: '/islamic', home: '/islamic', label: 'أخلاقي الجميلة', icon: '🌙' },
    ]
    const section = sections.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    if (!section) return []
    if (pathname === section.home) {
      return section.prefix === '/islamic'
        ? [{ to: '/', label: 'العودة إلى المنصة الرئيسية', icon: '⬅️', variant: 'islamic-home' }]
        : []
    }
    return [{ to: section.home, label: section.label, icon: section.icon }]
  })()

  useEffect(() => {
    const isParentArea = pathname.startsWith('/parent')
      || pathname === '/login'
      || pathname === '/numbers/parent'
      || /(?:^|\/)voice-studio(?:\/|$)/.test(pathname)
    if (!isParentArea) lockParentSession()
  }, [pathname])

  useEffect(() => {
    if (child) {
      document.documentElement.setAttribute('data-text-size', textSize)
    } else {
      document.documentElement.removeAttribute('data-text-size')
    }
    return () => { document.documentElement.removeAttribute('data-text-size') }
  }, [child, textSize])

  async function cycleTextSize() {
    if (!child?.id) return
    const next = SIZE_ORDER[(SIZE_ORDER.indexOf(textSize) + 1) % SIZE_ORDER.length]
    await updateChildSettings(child.id, { textSize: next })
    await refresh()
  }

  return (
    <>
      <div
        className="fixed right-3 z-[70] flex items-center sm:right-5"
        style={{ top: 'calc(var(--safe-top, 0px) + .25rem)', right: 'max(1rem, env(safe-area-inset-right))', left: 'auto' }}
      >
        <Link
          to="/"
          aria-label="العودة إلى الصفحة الرئيسية لمنصة رحلتي"
          className="group relative inline-flex rounded-full transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full opacity-70 blur-md transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'conic-gradient(from 0deg, rgba(255,214,133,0), rgba(255,214,133,.85), rgba(58,160,217,.75), rgba(139,95,191,.7), rgba(255,214,133,0))',
              animation: 'logo-glow-spin 6s linear infinite',
            }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          >
            <span
              className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              style={{ animation: 'logo-shine-sweep 3.5s ease-in-out infinite' }}
            />
          </span>
          <img
            src="/images/Rehlati_Logo_Clean.webp"
            alt="رحلتي — تعلّم، نكتشف، نلعب"
            className="relative h-20 w-20 rounded-full object-contain drop-shadow-lg sm:h-24 sm:w-24"
          />
        </Link>
      </div>
      <AppRoutes />

      {sectionNavigation.length > 0 && (
        <nav aria-label="التنقل بين المنصة والأقسام" className="app-shell-nav-center fixed z-[65] flex max-w-[calc(100vw-7rem)] items-center justify-center gap-2">
          {sectionNavigation.map((item) => (
            <Link key={item.to} to={item.to} dir="rtl" className={item.variant === 'islamic-home'
              ? 'inline-flex min-h-12 min-w-60 items-center justify-center gap-3 whitespace-nowrap rounded-full border-2 border-white/90 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-7 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(16,100,75,.3)] backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:min-w-72 sm:text-base'
              : 'inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-white/90 bg-slate-900/85 px-3 py-2 text-xs font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:gap-2 sm:px-4 sm:text-sm'}>
              <span aria-hidden="true">{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}

      {child && isArabicWorldPage && (
        <>
          <div className="fixed bottom-20 left-2 sm:left-4 z-30 pointer-events-none select-none" aria-hidden="true">
            <Mascot size={54} />
          </div>
          <button
            type="button"
            onClick={cycleTextSize}
            aria-label="تكبير حجم النص والصور"
            title="حجم النص"
            className="fixed bottom-4 right-4 w-11 h-11 flex items-center justify-center rounded-full bg-white text-indigo-900 text-sm font-extrabold shadow-lg border-2 border-indigo-200 hover:bg-indigo-50 transition-all hover:scale-110 z-50"
          >
            {SIZE_BUTTON_LABEL[textSize]}
          </button>
        </>
      )}
    </>
  )
}
