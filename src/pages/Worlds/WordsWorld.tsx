import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Mascot } from '../../components/character/Mascot'
import { useChildProfile } from '../../hooks/useChildProfile'
import { isWordsForLetterDone } from '../../engine/worldCompletionEngine'
import lettersData from '../../data/letters.json'
import wordsData from '../../data/words.json'
import type { Letter, Word } from '../../types/content'

const letters = lettersData as Letter[]
const words = wordsData as Word[]

/**
 * كل حرف أصبح صفحة مستقلة لكلماته (بدل عرض كل الكلمات في صفحة واحدة طويلة)
 * — بنفس أسلوب عالم الحروف، مع علامة ✓ على الحرف الذي أنهى الطفل كل كلماته.
 */
export function WordsWorld() {
  const navigate = useNavigate()
  const { child } = useChildProfile()
  const sortedLetters = [...letters].sort((a, b) => a.order - b.order)
  const lettersWithWords = sortedLetters.filter((l) => words.some((w) => w.letterId === l.id))

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="sr-only">عَالَمُ الْكَلِمَاتِ</h1>
      </div>

      <div className="flex justify-center mb-5">
        <Mascot message="اختر حرفًا لتتعلم كلماته وتلعب لعبة بناء الكلمة! 🧱" size={80} />
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {lettersWithWords.map((letter) => {
          const isDone = isWordsForLetterDone(letter.id, child?.completedLessonIds ?? [])
          return (
            <Card
              key={letter.id}
              className="p-0 overflow-hidden hover:scale-[1.05] transition-transform cursor-pointer relative border-2 border-white/85 shadow-lg backdrop-blur-md"
              style={{ backgroundColor: 'rgba(255,255,255,.18)' }}
            >
              {isDone && (
                <span
                  className="absolute top-2 left-2 z-10 inline-flex items-center justify-center rounded-full border-2 border-white bg-emerald-700 px-2 py-1 text-xs font-extrabold text-white shadow-md"
                  title="أنهى كل كلمات هذا الحرف"
                >
                  ✓ أُنجز
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate(`/world/words/letter/${encodeURIComponent(letter.id)}`)}
                className="w-full h-24 flex flex-col items-center justify-center gap-1"
                style={{ backgroundColor: 'rgba(53, 133, 101, .78)' }}
                aria-label={`كلمات حرف ${letter.name}، ${isDone ? 'مكتمل' : 'لم يكتمل بعد'}`}
              >
                <span className="text-3xl font-display font-extrabold text-white">{letter.id}</span>
                <span className="text-xs font-semibold text-white/90">{letter.name}</span>
              </button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
