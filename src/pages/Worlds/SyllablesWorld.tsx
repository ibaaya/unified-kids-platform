import { useNavigate } from 'react-router-dom'
import { useChildProfile } from '../../hooks/useChildProfile'
import lettersData from '../../data/letters.json'
import syllablesData from '../../data/syllables.json'
import type { Letter, Syllable } from '../../types/content'

const letters = lettersData as Letter[]
const syllables = syllablesData as Syllable[]

export function SyllablesWorld() {
  const navigate = useNavigate()
  const { child } = useChildProfile()

  const sortedLetters = [...letters].sort((a, b) => a.order - b.order)
  const activeLetters = sortedLetters.filter((letter) =>
    syllables.some((s: Syllable) => s.letterId === letter.id)
  )

  const completedIds = child?.completedLessonIds ?? []
  // بعض الحروف لا تملك بيانات للمقاطع الممدودة، مثل الألف؛ فلا ننتظر قسمًا غير موجود.
  const hasMadd = (letterId: string) => syllables.some((item) => item.letterId === letterId && item.type === 'madd')
  const isLetterDone = (letterId: string) =>
    completedIds.includes(`syllable_lesson_short_${letterId}`) &&
    (!hasMadd(letterId) || completedIds.includes(`syllable_lesson_madd_${letterId}`))

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-16 pt-28" dir="rtl">
      <h1 className="sr-only">عالم المقاطع</h1>

      <p className="mb-5 text-center font-display text-lg font-extrabold text-emerald-950 drop-shadow-[0_1px_2px_rgba(255,255,255,.95)] sm:mb-7 sm:text-xl">
        اختر حرفًا لنكتشف مقاطعه معًا! 🧩
      </p>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 sm:gap-4 md:grid-cols-7">
        {activeLetters.map((letter) => {
          const done = isLetterDone(letter.id)
          return (
            <button
              key={letter.id}
              type="button"
              onClick={() => navigate(`/world/syllables/${letter.id}`)}
              className="group relative flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-[1.5rem] border-2 border-white/90 px-2 text-center font-display shadow-[0_12px_24px_rgba(10,73,77,.24),inset_0_2px_0_rgba(255,255,255,.9)] backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_18px_30px_rgba(10,73,77,.3)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              style={{ background: 'radial-gradient(ellipse at 30% 12%, rgba(255,255,255,.19), rgba(255,255,255,.16) 52%, rgba(186,245,223,.14))' }}
              aria-label={`مقاطع حرف ${letter.name || letter.id}`}
            >
              <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-5 h-12 w-12 rounded-full bg-white/40 blur-md transition group-hover:bg-white/75" />
              <span className="relative text-4xl font-extrabold text-emerald-950 drop-shadow-[0_2px_1px_rgba(255,255,255,.8)] sm:text-5xl">{letter.id}</span>
              <span className="relative text-xs font-bold text-teal-950 sm:text-sm">{letter.name || 'حرف'}</span>
              {done && (
                <span
                  className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-emerald-100 text-xs text-emerald-800 shadow"
                  title="تم إتقان مقاطع هذا الحرف"
                  aria-label="تم إتقان مقاطع هذا الحرف"
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
