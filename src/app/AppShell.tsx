import { useEffect } from 'react'
import { AppRoutes } from './routes'
import { useChildProfile } from '../hooks/useChildProfile'
import { updateChildSettings } from '../services/progressService'
import type { ChildSettings } from '../types/progress'
import { Mascot } from '../components/character/Mascot'
import { Link, useLocation } from 'react-router-dom'
import { HomeButton } from '../components/ui/HomeButton'
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
  const isEnglishPage = pathname.startsWith('/english/')
  const isNumbersPage = pathname.startsWith('/numbers/')

  const currentArabicWorld = ARABIC_WORLD_NAV.find(
    (w) => pathname.startsWith(`${w.prefix}/`) || pathname === w.prefix
  )

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
        className="fixed left-3 z-[70] flex items-center sm:left-5"
        style={{ top: 'calc(var(--safe-top, 0px) + .25rem)' }}
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
            className="relative h-16 w-16 rounded-full object-contain drop-shadow-lg sm:h-20 sm:w-20"
          />
        </Link>
      </div>
      <AppRoutes />

      {isArabicWorldPage && <HomeButton to="/arabic" />}
      {currentArabicWorld && (
        <Link
          to={currentArabicWorld.path}
          aria-label={`العودة إلى ${currentArabicWorld.label}`}
          className="fixed app-shell-nav app-shell-nav-end z-[60] inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-white/90 bg-sky-800/90 px-3 py-2 font-display text-sm font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-sky-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          dir="rtl"
        >
          <span aria-hidden="true">{currentArabicWorld.icon}</span>
          <span>{currentArabicWorld.label}</span>
        </Link>
      )}

      {isEnglishPage && (
        <Link
          to="/english"
          className="fixed app-shell-nav app-shell-nav-end z-[60] inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-white/90 bg-blue-800/90 px-3 py-2 text-sm font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5"
        >
          🔤 English Menu
        </Link>
      )}

      {isNumbersPage && (
        <Link
          to="/numbers"
          dir="rtl"
          className="group fixed app-shell-nav app-shell-nav-start z-[60] inline-flex items-center gap-2.5 overflow-hidden rounded-full px-4 py-2.5 font-extrabold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            boxShadow: '0 10px 28px rgba(124,58,237,.55), inset 0 1px 0 rgba(255,255,255,.30)',
            fontSize: '.95rem',
            letterSpacing: '.02em',
            textShadow: '0 1px 3px rgba(0,0,0,.30)',
          }}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 text-base shadow-inner transition-transform duration-300 group-hover:rotate-12">
            🔢
          </span>
          <span className="relative z-10">الأرقام</span>
        </Link>
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