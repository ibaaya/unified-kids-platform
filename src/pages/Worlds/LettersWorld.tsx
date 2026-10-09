import { useNavigate } from 'react-router-dom'
import lettersData from '../../data/letters.json'
import type { Letter } from '../../types/content'

const letters = lettersData as Letter[]

export function LettersWorld() {
  const navigate = useNavigate()
  const sorted = [...letters].sort((a, b) => a.order - b.order)

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-16 pt-14 sm:pt-16">
      <h1 className="sr-only">عالم الحروف</h1>
      <p className="mb-6 text-center font-display text-lg font-extrabold text-white drop-shadow-[0_2px_4px_rgba(12,60,79,.95)] sm:mb-7 sm:text-xl">
        اختر لؤلؤةً لتتعرف على الحرف وكلماته 🌟
      </p>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 sm:gap-4 md:grid-cols-7">
        {sorted.map((letter) => (
          <button
            key={letter.id}
            type="button"
            onClick={() => navigate(`/world/letters/${encodeURIComponent(letter.id)}/words/start`)}
            className="group relative flex min-h-24 flex-col items-center justify-center gap-1 overflow-hidden rounded-[1.35rem] border-2 border-white/90 px-2 py-3 text-center shadow-[0_12px_24px_rgba(11,74,98,.2),inset_0_2px_0_rgba(255,255,255,.95),inset_0_-5px_12px_rgba(76,157,178,.12)] backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_18px_30px_rgba(11,74,98,.28),inset_0_2px_0_rgba(255,255,255,1)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:min-h-28"
            style={{ background: 'radial-gradient(ellipse at 30% 12%, rgba(255,255,255,.92), rgba(255,255,255,.50) 48%, rgba(231,250,255,.38))' }}
            aria-label={`حرف ${letter.name}`}
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-5 h-12 w-12 rounded-full bg-white/60 blur-md transition group-hover:bg-white/90" />
            <span className="relative text-4xl font-display font-extrabold text-sky-800 drop-shadow-[0_2px_1px_rgba(255,255,255,.95)] sm:text-5xl">{letter.id}</span>
            <span className="relative text-xs font-extrabold text-emerald-900 sm:text-sm">{letter.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
