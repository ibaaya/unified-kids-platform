import { useId } from 'react'

interface MascotProps {
  message?: string
  size?: number
}

/** الهلال الودود الذي يرافق الطفل في صفحات التعلّم. */
export function Mascot({ message, size = 96 }: MascotProps) {
  const gradientId = useId().replace(/:/g, '')

  return (
    <div className="flex items-start gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        role="img"
        aria-label="الهلال صديق رحلة التعلّم"
        className="mascot-moon shrink-0 drop-shadow-md"
      >
        <defs>
          <radialGradient id={`${gradientId}-body`} cx="28%" cy="24%" r="78%">
            <stop offset="0%" stopColor="#fff4bf" />
            <stop offset="42%" stopColor="#ffd76e" />
            <stop offset="100%" stopColor="#f49a32" />
          </radialGradient>
          <linearGradient id={`${gradientId}-shine`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".8" />
            <stop offset="100%" stopColor="#fff3c4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gradientId}-edge`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d77d27" />
            <stop offset="48%" stopColor="#fff0a2" />
            <stop offset="100%" stopColor="#c66e20" />
          </linearGradient>
          <filter id={`${gradientId}-shadow`} x="-30%" y="-25%" width="170%" height="170%">
            <feDropShadow dx="1" dy="4" stdDeviation="3" floodColor="#70451e" floodOpacity=".3" />
          </filter>
          <clipPath id={`${gradientId}-clip`}>
            <path d="M77 9 A49 49 0 1 0 77 111 A39 39 0 1 1 77 9 Z" />
          </clipPath>
        </defs>
        <path
          d="M77 9 A49 49 0 1 0 77 111 A39 39 0 1 1 77 9 Z"
          fill={`url(#${gradientId}-body)`}
          stroke={`url(#${gradientId}-edge)`}
          strokeWidth="4"
          strokeLinejoin="round"
          filter={`url(#${gradientId}-shadow)`}
        />
        <ellipse cx="39" cy="35" rx="20" ry="25" fill={`url(#${gradientId}-shine)`} clipPath={`url(#${gradientId}-clip)`} />
        <path d="M19 44 Q23 30 36 27" fill="none" stroke="#fff9dc" strokeWidth="3" strokeLinecap="round" opacity=".82" />
        <path d="M22 91 Q40 108 57 102" fill="none" stroke="#d9822d" strokeWidth="2" strokeLinecap="round" opacity=".45" />
        <path d="M23 30 27 20 31 30 41 34 31 38 27 48 23 38 13 34Z" fill="#fff9dd" stroke="#f5c85e" strokeWidth="1.5" />
        <circle cx="47" cy="56" r="7.5" fill="#fffdf2" />
        <circle cx="69" cy="56" r="7.5" fill="#fffdf2" />
        <ellipse cx="48" cy="57" rx="4.1" ry="5.5" fill="#344354" />
        <ellipse cx="70" cy="57" rx="4.1" ry="5.5" fill="#344354" />
        <circle cx="49.2" cy="55" r="1.6" fill="white" />
        <circle cx="71.2" cy="55" r="1.6" fill="white" />
        <ellipse cx="39" cy="70" rx="6" ry="3.2" fill="#f28b83" opacity=".72" />
        <ellipse cx="79" cy="70" rx="6" ry="3.2" fill="#f28b83" opacity=".72" />
        <path d="M51 71 Q59 80 68 71" fill="none" stroke="#70451e" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M56 72 Q59 75 62 72" fill="none" stroke="#fff4bd" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {message && (
        <div className="relative bg-white rounded-2xl px-4 py-3 shadow-[var(--shadow-card)] max-w-xs mt-2 font-display font-semibold text-[var(--color-ink)]">
          {message}
          <span className="absolute -right-2 top-4 w-4 h-4 bg-white rotate-45" />
        </div>
      )}
    </div>
  )
}
