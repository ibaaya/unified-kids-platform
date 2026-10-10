import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { HighlightedWord } from '../../components/ui/HighlightedWord'
import { SpeakButton } from '../../components/ui/SpeakButton'
import { useChildProfile } from '../../hooks/useChildProfile'
import lettersData from '../../data/letters.json'
import syllablesData from '../../data/syllables.json'
import type { Letter, Syllable, SyllableType } from '../../types/content'

const letters = lettersData as Letter[]
const syllables = syllablesData as Syllable[]

export function SyllableDetail() {
  const { letterId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { child } = useChildProfile()
  const [tab, setTab] = useState<SyllableType>(() => (location.state as { openType?: SyllableType } | null)?.openType === 'madd' ? 'madd' : 'short')
  const [navigationMessage, setNavigationMessage] = useState('')

  const sortedLetters = [...letters].sort((a, b) => a.order - b.order)
  const activeLetters = sortedLetters.filter((letter) =>
    syllables.some((s: Syllable) => s.letterId === letter.id)
  )

  const currentIndex = activeLetters.findIndex((l) => l.id === letterId)
  const currentLetter = activeLetters[currentIndex]
  const hasMadd = currentLetter ? syllables.some((item) => item.letterId === currentLetter.id && item.type === 'madd') : false
  const shortDone = child?.completedLessonIds.includes(`syllable_lesson_short_${currentLetter?.id}`) ?? false
  const maddDone = child?.completedLessonIds.includes(`syllable_lesson_madd_${currentLetter?.id}`) ?? false
  if (!currentLetter) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 text-center">
          <p className="mb-4">لم يتم العثور على هذا الحرف.</p>
          <Button onClick={() => navigate('/world/syllables')}>عالم المقاطع</Button>
        </Card>
      </div>
    )
  }

  const currentSyllables = syllables.filter(
    (s) => s.letterId === currentLetter.id && s.type === tab
  )
  const isDone =
    child?.completedLessonIds.includes(`syllable_lesson_${tab}_${currentLetter.id}`) ?? false
  const canOpenMadd = shortDone && hasMadd
  const canOpenNextLetter = shortDone && (!hasMadd || maddDone)
  const handlePrev = () => {
    if (currentIndex > 0) navigate(`/world/syllables/${activeLetters[currentIndex - 1].id}`)
  }
  const handleNext = () => {
    if (!canOpenNextLetter) {
      setNavigationMessage('أَكْمِلِ الْمَقَاطِعَ الْمَطْلُوبَةَ لِهَذَا الْحَرْفِ قَبْلَ الِانْتِقَالِ.')
      return
    }
    if (currentIndex < activeLetters.length - 1) navigate(`/world/syllables/${activeLetters[currentIndex + 1].id}`)
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 pb-16 pt-36" dir="rtl">
      <div className="mb-6 flex justify-center gap-2">
        {hasMadd && <button
          type="button"
          onClick={() => setTab('short')}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition shadow-sm ${
            tab === 'short' ? 'text-white shadow' : 'bg-black/5 text-[var(--color-ink-soft)] hover:bg-black/10'
          }`}
          style={tab === 'short' ? { backgroundColor: 'var(--world-syllables)' } : undefined}
        >
          مقاطع قصيرة
        </button>}
        <button
          type="button"
          disabled={!canOpenMadd}
          onClick={() => setTab('madd')}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
            tab === 'madd' ? 'text-white shadow' : 'bg-black/5 text-[var(--color-ink-soft)] hover:bg-black/10'
          }`}
          style={tab === 'madd' ? { backgroundColor: 'var(--world-syllables)' } : undefined}
        >
          مقاطع ممدودة
        </button>
      </div>

      <Card className="relative rounded-3xl border-2 border-white/85 p-6 text-center shadow-2xl backdrop-blur-md" style={{ background: 'rgba(255,255,255,.16)' }}>
        {isDone && (
          <span
            className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-leaf)]/10 text-[var(--color-leaf)] text-base shadow-sm"
            title="تم إتقان مقاطع هذا الحرف"
          >
            ✓
          </span>
        )}

        <div className="flex items-center justify-center gap-3 mb-6">
          <span
            className="w-14 h-14 shrink-0 flex items-center justify-center rounded-full text-2xl font-display font-extrabold text-white shadow-md"
            style={{ backgroundColor: 'var(--world-letters)' }}
          >
            {currentLetter.id}
          </span>
          <h1 className="text-xl font-bold text-gray-800">حرف ({currentLetter.name || currentLetter.id})</h1>
        </div>

        {!hasMadd && tab === 'madd' ? (
          <p className="text-lg font-bold text-[var(--color-ink-soft)] mb-6">لا توجد مقاطع ممدودة لهذا الحرف. بعد إكمال المقاطع القصيرة يمكنك متابعة الحرف التالي.</p>
        ) : currentSyllables.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)] mb-6">
            لا توجد مقاطع من هذا النوع لهذا الحرف بعد.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {currentSyllables.map((syl) => (
              <div
                key={syl.id}
                className="flex items-center gap-2 rounded-2xl border border-white/85 px-5 py-3 shadow-md backdrop-blur-sm transition-transform hover:scale-105"
                style={{ background: 'rgba(255,255,255,.18)' }}
              >
                <SpeakButton text={syl.text} audioId={`syllable:${syl.id}`} size="md" label={`استمع لـ ${syl.text}`} />
                <HighlightedWord
                text={syl.text}
                letterId={currentLetter.id}
                position="start"
                className="font-extrabold"
                style={{ fontSize: 'clamp(2.75rem, 7vw, 3.75rem)' }}
                highlightMadd={tab === 'madd'}
              />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mb-4">
          <Button
            onClick={() => navigate(`/world/syllables/${currentLetter.id}/${tab}/play`)}
            disabled={currentSyllables.length === 0}
          >
            🎮 اختبرني على هذا الحرف
          </Button>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Button onClick={handlePrev} variant="secondary" disabled={currentIndex === 0}>
            ← الحرف السابق
          </Button>
          <span className="text-sm font-bold text-gray-500">
            حرف {currentIndex + 1} من {activeLetters.length}
          </span>
          <Button onClick={handleNext} variant="primary" disabled={currentIndex === activeLetters.length - 1}>
            الحرف التالي →
          </Button>
        </div>
        {navigationMessage && <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 font-bold text-amber-900">{navigationMessage}</p>}
      </Card>
    </div>
  )
}
