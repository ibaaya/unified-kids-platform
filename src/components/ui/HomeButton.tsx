import { Link } from 'react-router-dom'

interface HomeButtonProps {
  label?: string
  className?: string
  to?: string
}

/** زر موحّد للعودة إلى الصفحة الرئيسية في صفحات العوالم والألعاب. */
export function HomeButton({ label = 'الرَّئِيسِيَّة', className = '', to = '/' }: HomeButtonProps) {
  return (
    <Link
      to={to}
      aria-label="العودة إلى الصفحة الرئيسية"
      className={`fixed app-shell-nav home-button-safe z-[60] inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white/90 px-3 py-2 font-display text-sm font-extrabold text-indigo-800 shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-lg sm:left-4 sm:top-4 ${className}`}
      dir="rtl"
    >
      <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-base">🏠</span>
      <span>{label}</span>
    </Link>
  )
}
