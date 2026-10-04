import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Mascot } from '../../components/character/Mascot'
import { useChildProfile } from '../../hooks/useChildProfile'
import { HARAKA_ORDER, HARAKA_LABELS, HARAKA_SYMBOLS } from '../../data/harakaLabels'

export function HarakatWorld() {
  const navigate = useNavigate()
  const { child } = useChildProfile()

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 pb-16">
      <h1 className="sr-only">عَالَمُ الْحَرَكَاتِ</h1>

      <div className="flex justify-center mb-6">
        <Mascot message="اختر حركة لتتعرف عليها وتختبر نفسك فيها! 🎧" size={80} />
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {HARAKA_ORDER.map((harakaType) => {
          const isDone = child?.completedLessonIds.includes(`haraka_lesson_${harakaType}`) ?? false
          return (
            <Card
              key={harakaType}
              className="p-0 overflow-hidden hover:scale-[1.05] transition-transform cursor-pointer relative border-2 border-white/80 shadow-xl backdrop-blur-md"
              style={{ backgroundColor: 'rgba(255,255,255,.16)' }}
            >
              {isDone && (
                <span
                  className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full bg-white text-[var(--color-leaf)] text-sm shadow-md z-10"
                  title="تم إتقانها"
                  aria-label="تم إتقانها"
                >
                  ✓
                </span>
              )}
              <button
                type="button"
                onClick={() => navigate(`/world/harakat/${harakaType}`)}
                className="content-scale w-full h-30 flex flex-col items-center justify-center gap-1 px-2"
                style={{ backgroundColor: 'rgba(32, 111, 128, .58)' }}
              >
                {/* رمز الحركة — كبير جداً، بولد، وعريض */}
                <span
                  className="font-display font-black text-white select-none"
                  style={{
                    fontSize: '3rem',
                    lineHeight: '1.4',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    textShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    display: 'inline-block',
                    transform: 'translateY(-0.15em)',
                  }}
                  aria-hidden="true"
                >
                  {HARAKA_SYMBOLS[harakaType]}
                </span>

                {/* اسم الحركة — أصغر */}
                <span className="font-display font-bold text-white/95 text-center text-sm">
                  {HARAKA_LABELS[harakaType]}
                </span>
              </button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
