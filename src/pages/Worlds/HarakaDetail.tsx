import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { HighlightedWord } from '../../components/ui/HighlightedWord'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { useChildProfile } from '../../hooks/useChildProfile'
import harakatData from '../../data/harakat.json'
import { HARAKA_ORDER, HARAKA_LABELS } from '../../data/harakaLabels'
import type { HarakaVariant, HarakaType } from '../../types/content'

const harakat = harakatData as HarakaVariant[]

export function HarakaDetail() {
  const { harakaType } = useParams<{ harakaType: HarakaType }>()
  const navigate = useNavigate()
  const { child } = useChildProfile()

  const isValid = harakaType && HARAKA_ORDER.includes(harakaType)
  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center">
          <p className="mb-4">لم يتم العثور على هذه الحركة.</p>
          <Button onClick={() => navigate('/world/harakat')}>عالم الحركات</Button>
        </Card>
      </div>
    )
  }

  const examples = harakat.filter((h) => h.haraka === harakaType)
  const isLessonDone = child?.completedLessonIds.includes(`haraka_lesson_${harakaType}`) ?? false

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/world/harakat')}>
          ← عالم الحركات
        </Button>
      </div>

      <Card className="p-8 text-center mb-6 relative border-2 border-white/80 shadow-xl backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,.17)' }}>
        {isLessonDone && (
          <span
            className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-white text-[var(--color-leaf)] text-lg shadow-md"
            title="تم إتقان هذه الحركة"
          >
            ✓
          </span>
        )}
        <div className="content-scale text-4xl font-display font-extrabold text-[var(--color-ink)]">
          {HARAKA_LABELS[harakaType]}
        </div>
      </Card>

      <div className="flex justify-center mb-6">
        <Mascot message="استمع لكل شكل، ولاحظ كيف تُغيّر الحركة صوت الحرف 🎧" size={95} />
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {examples.map((ex) => (
          <Card key={ex.soundId} className="min-h-24 p-3 flex flex-row-reverse items-center justify-center gap-3 border-2 border-white/80 shadow-lg backdrop-blur-md sm:min-h-28 sm:p-4" style={{ backgroundColor: 'rgba(255,255,255,.17)' }}>
            <SpeakButton text={ex.form} audioId={`haraka:${ex.soundId}`} label={`استمع لـ ${ex.form}`} />
            <HighlightedWord text={ex.form} letterId={ex.letterId} position="start" className="content-scale text-7xl sm:text-8xl" />
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" onClick={() => navigate(`/world/harakat/${harakaType}/play`)}>
          🎮 العب واختبر نفسك
        </Button>
      </div>
    </div>
  )
}
