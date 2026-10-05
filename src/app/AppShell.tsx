import { useEffect } from 'react'
import { AppRoutes } from './routes'
import { useChildProfile } from '../hooks/useChildProfile'
import { updateChildSettings } from '../services/progressService'
import type { ChildSettings } from '../types/progress'
import { Mascot } from '../components/character/Mascot'
import { Link, useLocation } from 'react-router-dom'
import { HomeButton } from '../components/ui/HomeButton'
import { primeEnglishVoices } from '../english/engine/soundManager'

const ARABIC_WORLD_NAV: Array<{ prefix: string; path: string; label: string; icon: string }> = [
  { prefix: '/arabic/world/letters', path: '/arabic/world/letters', label: 'عالم الحروف', icon: '🔤' },
  { prefix: '/arabic/world/harakat', path: '/arabic/world/harakat', label: 'عالم الحركات', icon: '🎵' },
  { prefix: '/arabic/world/syllables', path: '/arabic/world/syllables', label: 'عالم المقاطع', icon: '🧩' },
  { prefix: '/arabic/world/words', path: '/arabic/world/words', label: 'عالم الكلمات', icon: '✨' },
  { prefix: '/arabic/world/sentences', path: '/arabic/world/sentences', label: 'عالم الجمل', icon: '💬' },
  { prefix: '/arabic/world/stories', path: '/arabic/world/stories', label: 'عالم القصص', icon: '📚' },
  // backward compat
  { prefix: '/world/letters', path: '/world/letters', label: 'عالم الحروف', icon: '🔤' },
  { prefix: '/world/harakat', path: '/world/harakat', label: 'عالم الحركات', icon: '🎵' },
  { prefix: '/world/syllables', path: '/world/syllables', label: 'عالم المقاطع', icon: '🧩' },
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

  // Prime English TTS on mount
  useEffect(() => { primeEnglishVoices() }, [])

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
      <AppRoutes />

      {/* Arabic world — Home button + world breadcrumb */}
      {isArabicWorldPage && <HomeButton to="/arabic" />}
      {currentArabicWorld && (
        <Link
          to={currentArabicWorld.path}
          aria-label={`العودة إلى ${currentArabicWorld.label}`}
          className="fixed app-shell-nav app-shell-nav-end z-[60] inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-white/90 bg-sky-800/90 px-3 py-2 font-display text-sm font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-sky-900 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 "
          dir="rtl"
        >
          <span aria-hidden="true">{currentArabicWorld.icon}</span>
          <span>{currentArabicWorld.label}</span>
        </Link>
      )}

      {/* English module — hub nav */}
      {isEnglishPage && (
        <Link
          to="/english"
          className="fixed app-shell-nav app-shell-nav-end z-[60] inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-white/90 bg-blue-800/90 px-3 py-2 text-sm font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 "
        >
          🔤 English Menu
        </Link>
      )}

      {/* Numbers module — hub nav */}
      {isNumbersPage && (
        <Link
          to="/numbers"
          className="fixed app-shell-nav app-shell-nav-start z-[60] inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 border-white/90 bg-violet-800/90 px-3 py-2 text-sm font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 "
          dir="rtl"
        >
          🔢 الأرقام
        </Link>
      )}

      {/* Mascot + text-size button (Arabic only) */}
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
