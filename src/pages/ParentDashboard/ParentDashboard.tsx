import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { HomeButton } from '../../components/ui/HomeButton'
import { AvatarPicker, ChildAvatar } from '../../components/character/AvatarPicker'
import { useChildProfile } from '../../hooks/useChildProfile'
import { db } from '../../services/storage/db'
import {
  listChildren,
  switchActiveChild,
  deleteChildProfile,
  updateChildSettings,
  updateChildAvatar,
} from '../../services/progressService'
import type { ChildProfile, UnlockMode, SkillMastery } from '../../types/progress'
import lettersData from '../../data/letters.json'
import wordsData from '../../data/words.json'
import worldsData from '../../data/worlds.json'
import type { Letter, Word } from '../../types/content'
import { STUDIO_ENABLED } from '../../config/features'
import { DedicationCard } from '../../components/Dedication'
import audioManifest from '../../data/audio-manifest.json'
import { isNativeApp } from '../../platform/initPlatform'

const letters = lettersData as Letter[]
const words = wordsData as Word[]

function skillReviewTarget(skillId: string): { label: string; path: string } {
  if (skillId.startsWith('letter_location_')) {
    const letterId = skillId.slice('letter_location_'.length)
    const letter = letters.find((item) => item.id === letterId)
    return { label: `موضع حرف ${letter?.name ?? letterId}`, path: `/world/words/letter/${encodeURIComponent(letterId)}/location-game` }
  }
  if (skillId.startsWith('letter_')) {
    const letterId = skillId.slice('letter_'.length)
    const letter = letters.find((item) => item.id === letterId)
    return { label: `حرف ${letter?.name ?? letterId}`, path: `/world/letters/${encodeURIComponent(letterId)}/play` }
  }
  if (skillId.startsWith('word_')) {
    const wordId = skillId.slice('word_'.length)
    const word = words.find((item) => item.id === wordId)
    return { label: word ? `بناء كلمة ${word.text}` : 'لعبة الكلمات', path: `/world/words/${encodeURIComponent(wordId)}/play` }
  }
  if (skillId.startsWith('harakaworld_') || skillId.startsWith('haraka_')) {
    const prefix = skillId.startsWith('harakaworld_') ? 'harakaworld_' : 'haraka_'
    const harakaId = skillId.slice(prefix.length).split('_')[0]
    return { label: 'تدريب الحركات والمقاطع', path: `/arabic/world/harakat/${encodeURIComponent(harakaId)}/play` }
  }
  return { label: 'عالم الحركات والمقاطع', path: '/arabic/world/harakat' }
}

export function ParentDashboard() {
  const { child, refresh } = useChildProfile()
  const navigate = useNavigate()
  const [masteredCount, setMasteredCount] = useState(0)
  const [needsReviewSkills, setNeedsReviewSkills] = useState<SkillMastery[]>([])
  const [allChildren, setAllChildren] = useState<ChildProfile[]>([])
  const [offlineProgress, setOfflineProgress] = useState<{ done: number; total: number } | null>(null)

  useEffect(() => {
    if (!child?.id) return
    db.skillMastery
      .where('childId')
      .equals(child.id)
      .toArray()
      .then((rows) => {
        setMasteredCount(rows.filter((r) => r.masteryLevel === 3).length)
        setNeedsReviewSkills(rows
          .filter((row) => row.needsReview || row.masteryLevel <= 1)
          .sort((a, b) => a.masteryLevel - b.masteryLevel || b.lastSeenAt.localeCompare(a.lastSeenAt))
          .slice(0, 5))
      })
  }, [child?.id])

  useEffect(() => {
    listChildren().then(setAllChildren)
  }, [child])

  async function handleModeChange(mode: UnlockMode) {
    if (!child?.id) return
    await updateChildSettings(child.id, { unlockMode: mode })
    await refresh()
  }

  async function handleThresholdChange(percent: number) {
    if (!child?.id) return
    await updateChildSettings(child.id, { sequentialThresholdPercent: percent })
    await refresh()
  }

  async function handleAutoReadChange(value: boolean) {
    if (!child?.id) return
    await updateChildSettings(child.id, { autoReadQuestions: value })
    await refresh()
  }

  async function handleHomeDisplayChange(mode: 'journey' | 'simple') {
    if (!child?.id) return
    await updateChildSettings(child.id, { homeDisplayMode: mode })
    await refresh()
  }

  async function handleAvatarChange(avatar: string) {
    if (!child?.id) return
    await updateChildAvatar(child.id, avatar)
    await refresh()
    setAllChildren(await listChildren())
  }

  async function handleSwitch(id?: number) {
    if (!id) return
    await switchActiveChild(id)
    await refresh()
  }

  async function handleDelete(id?: number) {
    if (!id) return
    if (!confirm('هل أنت متأكد من حذف بيانات هذا الطالب نهائيًا؟ لا يمكن التراجع.')) return
    const wasActive = id === child?.id
    await deleteChildProfile(id)
    setAllChildren(await listChildren())
    if (wasActive) {
      navigate('/login', { replace: true })
    } else {
      await refresh()
    }
  }

  const unlockMode = child?.settings?.unlockMode ?? 'free'
  const threshold = child?.settings?.sequentialThresholdPercent ?? 20

  async function downloadOfflineAudio() {
    const urls = [...new Set(Object.values(audioManifest)
      .map((entry) => entry.relativePath)
      .filter((url): url is string => typeof url === 'string' && url.startsWith('/audio/')))]
    setOfflineProgress({ done: 0, total: urls.length })
    let done = 0
    // طلبات متوازية محدودة حتى لا تثقل الذاكرة أو الشبكة على الهاتف.
    for (let i = 0; i < urls.length; i += 8) {
      await Promise.all(urls.slice(i, i + 8).map(async (url) => {
        try { await fetch(url, { cache: 'no-cache' }) } catch { /* يمكن إعادة المحاولة لاحقًا */ }
        done += 1
        setOfflineProgress({ done, total: urls.length })
      }))
    }
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl font-extrabold">لوحة ولي الأمر</h1>
        <HomeButton label="صَفْحَةُ الطِّفْلِ" />
      </div>

      {!child ? (
        <p className="text-[var(--color-ink-soft)] mb-6">لا يوجد ملف طفل نشط حاليًا.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard label="الاسم" value={child.name} />
            <StatCard label="سلسلة التعلم" value={`${child.streakDays} أيام`} />
            <StatCard label="النقاط" value={child.points} />
            <StatCard label="النجوم" value={child.stars} />
            <StatCard label="العوالم المفتوحة" value={unlockMode === 'free' ? worldsData.length : child.unlockedWorldIds.length} />
            <StatCard label="الدروس المكتملة" value={child.completedLessonIds.length} />
            <StatCard label="مهارات متقنة تمامًا" value={masteredCount} />
          </div>

          {!isNativeApp && <Card className="p-5 mb-6 text-right">
            <h2 className="font-display font-bold mb-2">📥 تنزيل للاستخدام دون إنترنت</h2>
            <p className="text-sm text-[var(--color-ink-soft)] mb-3">ينزّل التسجيلات الصوتية المتاحة في المنصة ويحفظها على هذا الجهاز. قد يحتاج التنزيل وقتًا ومساحة بحسب الاتصال.</p>
            <Button onClick={() => void downloadOfflineAudio()} disabled={offlineProgress !== null && offlineProgress.done < offlineProgress.total}>
              {offlineProgress && offlineProgress.done < offlineProgress.total
                ? `جارٍ التنزيل ${offlineProgress.done} / ${offlineProgress.total}`
                : offlineProgress ? 'اكتمل تنزيل الصوتيات' : 'تنزيل المحتوى الصوتي'}
            </Button>
          </Card>}

          <Card className="p-5 mb-6">
            <AvatarPicker value={child.avatar ?? 'moon'} onChange={(avatar) => void handleAvatarChange(avatar)} />
          </Card>

          <Card className="p-5 mb-6 text-right">
            <h2 className="font-display font-bold mb-3">🔓 طريقة فتح العوالم لـ{child.name}</h2>

            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer justify-end">
                <span>فتح جميع العوالم (تنقّل حر بينها)</span>
                <input
                  type="radio"
                  name="unlockMode"
                  checked={unlockMode === 'free'}
                  onChange={() => handleModeChange('free')}
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer justify-end">
                <span>تسلسل العوالم (كل عالم يُقفل حتى يُنهي الطفل العالم السابق)</span>
                <input
                  type="radio"
                  name="unlockMode"
                  checked={unlockMode === 'sequential'}
                  onChange={() => handleModeChange('sequential')}
                />
              </label>
            </div>

            {unlockMode === 'sequential' && (
              <div>
                <p className="text-sm font-semibold mb-2">
                  النسبة المطلوب إنجازها من العالم السابق لفتح العالم التالي
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-display font-extrabold w-14 text-center">
                    {threshold}%
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={threshold}
                    onChange={(e) => handleThresholdChange(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-[var(--color-ink-soft)] mt-2">
                  هذا الشرط يعمل الآن فعليًا بين كل العوالم المتتالية (الحروف ← الحركات ←
                  المقاطع ← الكلمات) بعد بناء ألعاب الحركات والمقاطع. عالما الجمل والقصص
                  سيُفتحان تلقائيًا فور فتح ما قبلهما ريثما تُبنى ألعابهما التفاعلية.
                </p>
              </div>
            )}
          </Card>

          <Card className="p-5 mb-6 text-right">
            <h2 className="font-display font-bold mb-3">🏠 طريقة عرض الصفحة الرئيسية</h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer justify-end">
                <span>مسار الرحلة التعليمية</span>
                <input type="radio" name="homeDisplay" checked={(child.settings?.homeDisplayMode ?? 'simple') === 'journey'} onChange={() => handleHomeDisplayChange('journey')} />
              </label>
              <label className="flex items-center gap-2 cursor-pointer justify-end">
                <span>عرض العوالم ببساطة</span>
                <input type="radio" name="homeDisplay" checked={(child.settings?.homeDisplayMode ?? 'simple') === 'simple'} onChange={() => handleHomeDisplayChange('simple')} />
              </label>
            </div>
          </Card>

          <Card className="p-5 mb-6 text-right">
            <h2 className="font-display font-bold mb-3">🔊 قراءة الأسئلة صوتيًا</h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer justify-end">
                <span>قراءة تلقائية فور ظهور كل سؤال</span>
                <input
                  type="radio"
                  name="autoRead"
                  checked={child.settings?.autoReadQuestions ?? true}
                  onChange={() => handleAutoReadChange(true)}
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer justify-end">
                <span>فقط عند الضغط على أيقونة الصوت 🔊</span>
                <input
                  type="radio"
                  name="autoRead"
                  checked={!(child.settings?.autoReadQuestions ?? true)}
                  onChange={() => handleAutoReadChange(false)}
                />
              </label>
            </div>
            <p className="text-xs text-[var(--color-ink-soft)] mt-2">
              في الحالتين تبقى أيقونة 🔊 متاحة دائمًا لإعادة الاستماع للسؤال أو الكلمة يدويًا.
            </p>
          </Card>
        </>
      )}

      {needsReviewSkills.length > 0 && (
        <Card className="p-5 mb-6">
          <h2 className="font-display font-bold mb-2">🔁 تدريبات نقترح مراجعتها</h2>
          <p className="text-sm text-[var(--color-ink-soft)] mb-4">هذه الأنشطة تحتاج بعض التدريب الإضافي.</p>
          <div className="flex flex-col gap-2">
            {needsReviewSkills.map((skill) => {
              const target = skillReviewTarget(skill.skillId)
              return (
                <div key={skill.skillId} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--color-bg)] p-3">
                  <Button size="md" variant="secondary" onClick={() => navigate(target.path)}>تدرّب الآن</Button>
                  <span className="font-bold text-sm">{target.label}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {STUDIO_ENABLED && <Card className="p-5 mb-6 text-right border-2 border-[var(--color-sky)]/15">
        <h2 className="font-display font-bold mb-2">🎙️ استوديوهات التسجيل</h2>
        <p className="text-sm text-[var(--color-ink-soft)] mb-4">
          سجّل أصواتاً مخصصة للمحتوى العربي أو الإنجليزي لتحل محل صوت المتصفح.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate('/voice-studio')}>🌙 استوديو العربية</Button>
          <Button onClick={() => navigate('/english/voice-studio')}>🔤 English Voice Studio</Button>
          <Button onClick={() => navigate('/islamic/voice-studio')}>🌙 استوديو أخلاقي الجميلة</Button>
          <Button onClick={() => navigate('/skills/voice-studio')}>🧠 استوديو مدينة المهارات</Button>
        </div>
      </Card>}

      <Card className="p-5 mb-6 text-right">
        <h2 className="font-display font-bold mb-3">👨‍👩‍👧 الطلاب على هذا الجهاز</h2>
        <div className="flex flex-col gap-2 mb-4">
          {allChildren.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                {c.id !== child?.id && (
                  <Button variant="ghost" size="md" onClick={() => handleSwitch(c.id)}>
                    تفعيل
                  </Button>
                )}
                <Button variant="ghost" size="md" onClick={() => handleDelete(c.id)}>
                  🗑️ حذف
                </Button>
              </div>
              <span className={`flex items-center gap-2 ${c.id === child?.id ? 'font-extrabold' : ''}`}>
                <ChildAvatar avatar={c.avatar} name={c.name} size={38} />
                {c.name} {c.id === child?.id && '(النشط الآن)'}
              </span>
            </div>
          ))}
        </div>
        <Button variant="secondary" onClick={() => navigate('/onboarding')}>
          + إضافة طالب جديد
        </Button>
      </Card>

      <DedicationCard />

    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4 text-center">
      <div className="text-2xl font-display font-extrabold text-[var(--color-ink)]">{value}</div>
      <div className="text-sm text-[var(--color-ink-soft)]">{label}</div>
    </Card>
  )
}
