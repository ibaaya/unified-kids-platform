/**
 * HarakaWorldGamePage.tsx  ·  src/pages/LessonPage/HarakaWorldGamePage.tsx
 * ══════════════════════════════════════════════════════════════════════════
 * صفحة لعبة حركة/مقطع واحد.
 * تحل محل HarakaGamePage و SyllableGamePage.
 *
 * المسار: /arabic/world/harakat/:harakaId/play
 */

import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Mascot } from '../../components/character/Mascot'
import { HarakaWorldGame } from '../../games/templates/HarakaWorldGame'
import { useChildProfile } from '../../hooks/useChildProfile'
import { awardLessonComplete } from '../../engine/rewardsEngine'
import { markLessonComplete } from '../../services/progressService'
import { checkWorldUnlocks } from '../../engine/curriculumEngine'
import { HARAKA_WORLD_ORDER, HARAKAT_WORLD_MAP } from '../../data/harakatWorld'
import type { HarakaWorldId } from '../../data/harakatWorld'

const PASS_THRESHOLD = 0.6

export function HarakaWorldGamePage() {
  const { harakaId } = useParams<{ harakaId: HarakaWorldId }>()
  const navigate = useNavigate()
  const { child, loading, refresh } = useChildProfile()
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)

  const entry = harakaId ? HARAKAT_WORLD_MAP.get(harakaId) : undefined
  const currentIndex = harakaId ? HARAKA_WORLD_ORDER.indexOf(harakaId) : -1
  const nextId = currentIndex >= 0 ? HARAKA_WORLD_ORDER[currentIndex + 1] : undefined

  if (loading) return null
  if (!child?.id) return <Navigate to="/onboarding" replace />
  if (!entry) return <Navigate to="/arabic/world/harakat" replace />

  async function handleFinished(correct: number, total: number) {
    const lessonId = `harakaworld_lesson_${harakaId}`
    if (correct / total >= PASS_THRESHOLD) {
      await awardLessonComplete(child!.id!, lessonId)
    } else {
      await markLessonComplete(child!.id!, lessonId)
    }
    await checkWorldUnlocks(child!.id!)
    await refresh()
    setResult({ correct, total })
  }

  const passed = result !== null && result.correct / result.total >= PASS_THRESHOLD

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-8 pb-16" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">
          {entry.emoji} اختبار {entry.label}
        </h1>
        <Button variant="ghost" onClick={() => navigate(`/arabic/world/harakat/${harakaId}`)}>
          ← رجوع
        </Button>
      </div>

      {result === null ? (
        <HarakaWorldGame
          harakaId={harakaId!}
          childId={child.id}
          autoRead={child.settings?.autoReadQuestions ?? true}
          onFinished={handleFinished}
        />
      ) : (
        /* شاشة النتيجة */
        <Card
          className="p-8 text-center border-2 border-white/80 shadow-xl backdrop-blur-md"
          style={{ backgroundColor: 'rgba(255,255,255,.18)' }}
        >
          <div className="flex justify-center mb-4">
            <Mascot
              message={
                passed
                  ? `لقد أتقنتَ ${entry.label}! ${entry.emoji} 🏆`
                  : 'أَحْسَنْتَ على المحاولة! جرّب مرة أخرى 🌟'
              }
              size={90}
            />
          </div>

          {/* النتيجة */}
          <div className="text-2xl font-display font-black mb-1" style={{ color: entry.color }}>
            {result.correct} / {result.total}
          </div>
          <p className="text-sm text-[var(--color-ink-soft)] mb-6">
            {passed ? '🎉 اجتزت الاختبار!' : 'حاول مرة أخرى لتحقيق نتيجة أفضل'}
          </p>

          {/* أزرار التنقل */}
          <div className="flex flex-col items-center gap-3">
            {passed && nextId && (
              <Button
                size="lg"
                className="w-full sm:max-w-md"
                onClick={() => navigate(`/arabic/world/harakat/${nextId}`)}
              >
                {HARAKAT_WORLD_MAP.get(nextId)?.emoji} الحركة التالية:{' '}
                {HARAKAT_WORLD_MAP.get(nextId)?.label} ←
              </Button>
            )}
            {passed && !nextId && (
              <Button
                size="lg"
                className="w-full sm:max-w-md"
                onClick={() => navigate('/arabic/world/harakat')}
              >
                🏆 العودة إلى العالم
              </Button>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="secondary"
                className="!min-h-10 !px-3 !py-2 !text-sm"
                onClick={() => setResult(null)}
              >
                العب مرة أخرى 🔁
              </Button>
              <Button
                variant="ghost"
                className="!min-h-10 !px-3 !py-2 !text-sm"
                onClick={() => navigate('/arabic/world/harakat')}
              >
                قائمة الحركات
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
