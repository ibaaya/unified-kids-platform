import { Link } from 'react-router-dom'

interface HomeButtonProps {
  label?: string
  className?: string
  to?: string
}

/** زر موحّد للعودة إلى الصفحة الرئيسية في صفحات العوالم والألعاب. */
export function HomeButton({ label = 'الرَّئِيسِيَّة', className = '', to = '/' }: HomeButtonProps) {
  return (
    <Link
      to={to}
      aria-label="العودة إلى الصفحة الرئيسية"
      dir="rtl"
      className={`group fixed app-shell-nav home-button-safe z-[60] inline-flex min-h-11 shrink-0 items-center gap-2.5 overflow-hidden rounded-full border border-white/60 bg-white/95 px-4 py-2.5 font-display text-sm font-extrabold text-indigo-800 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl active:scale-95 sm:left-4 sm:top-4 ${className}`}
      style={{
        boxShadow: '0 8px 22px rgba(79,70,229,.18), inset 0 1px 0 rgba(255,255,255,.9)',
      }}
    >
      {/* لمعة عابرة */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-indigo-200/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {/* أيقونة البيت */}
      <span
        aria-hidden="true"
        className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-200 text-base shadow-inner transition-transform duration-300 group-hover:rotate-12"
      >
        🏠
      </span>

      {/* النص */}
      <span className="relative z-10">{label}</span>
    </Link>
  )
}