import { db } from '../services/storage/db'
import type { MasteryLevel, ActivityLogEntry } from '../types/progress'

/**
 * محرك الإتقان (نسخة محسّنة).
 * ------------------------------------------------------------------
 * التحسين الأساسي عن النسخة الأولى: بدل الاعتماد على "نسبة النجاح منذ
 * البداية" (والتي تُخفي التحسّن الأخير للطفل)، نعتمد على "نافذة متحركة"
 * من آخر N محاولة (RECENT_WINDOW) — هذا يعني أن إتقان الطفل يُحسب بناءً
 * على أدائه الحالي، لا تاريخه الكامل. طفل أخطأ كثيرًا في البداية ثم تحسّن
 * سيظهر "متقنًا" بسرعة معقولة، بدل أن يظل عالقًا بسبب أخطاء قديمة.
 *
 * needsReview تعتمد الآن على اتجاه الأداء في آخر 3 محاولات (وليس آخر محاولة
 * فقط) لتفادي وضع مهارة في "تحتاج مراجعة" بسبب خطأ عابر واحد.
 */

const RECENT_WINDOW = 5
const REVIEW_WINDOW = 3
const REVIEW_ACCURACY_THRESHOLD = 0.5

function computeMasteryLevel(recentAttempts: number, recentCorrect: number): MasteryLevel {
  if (recentAttempts < 2) return recentCorrect > 0 ? 1 : 0
  const accuracy = recentCorrect / recentAttempts
  if (accuracy >= 0.85) return 3
  if (accuracy >= 0.6) return 2
  return 1
}

async function getRecentLog(
  childId: number,
  skillId: string,
  limit: number,
): Promise<ActivityLogEntry[]> {
  const all = await db.activityLog.where({ childId, skillId }).toArray()
  return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit)
}

export async function recordAttempt(
  childId: number,
  skillId: string,
  isCorrect: boolean,
  responseTimeMs = 0,
): Promise<void> {
  await db.activityLog.add({
    childId,
    skillId,
    isCorrect,
    responseTimeMs,
    timestamp: new Date().toISOString(),
  })

  const recent = await getRecentLog(childId, skillId, RECENT_WINDOW)
  const recentAttempts = recent.length
  const recentCorrect = recent.filter((r) => r.isCorrect).length
  const masteryLevel = computeMasteryLevel(recentAttempts, recentCorrect)

  const reviewWindow = recent.slice(0, REVIEW_WINDOW)
  const reviewAccuracy =
    reviewWindow.length > 0
      ? reviewWindow.filter((r) => r.isCorrect).length / reviewWindow.length
      : 1
  const needsReview = reviewWindow.length >= 2 && reviewAccuracy < REVIEW_ACCURACY_THRESHOLD

  const existing = await db.skillMastery.where({ childId, skillId }).first()
  const totalAttempts = (existing?.attempts ?? 0) + 1
  const totalCorrect = (existing?.correct ?? 0) + (isCorrect ? 1 : 0)

  if (existing?.id) {
    await db.skillMastery.update(existing.id, {
      attempts: totalAttempts,
      correct: totalCorrect,
      masteryLevel,
      needsReview,
      lastSeenAt: new Date().toISOString(),
    })
  } else {
    await db.skillMastery.add({
      childId,
      skillId,
      attempts: totalAttempts,
      correct: totalCorrect,
      masteryLevel,
      needsReview,
      lastSeenAt: new Date().toISOString(),
    })
  }
}

export async function getMastery(childId: number, skillId: string) {
  return db.skillMastery.where({ childId, skillId }).first()
}

/** يرجع كل سجلات الإتقان لطفل معيّن — تُستخدم في لوحة ولي الأمر ومحرك المنهج */
export async function getAllMasteryForChild(childId: number) {
  return db.skillMastery.where('childId').equals(childId).toArray()
}

/**
 * نسبة إتمام مجموعة مهارات معيّنة (مثلًا كل الحروف الـ28) — تُستخدم لتحديد
 * هل يستحق الطفل فتح العالم التالي.
 */
export async function computeSkillGroupMasteryPercent(
  childId: number,
  skillIds: string[],
  minLevel: MasteryLevel = 2,
): Promise<number> {
  if (skillIds.length === 0) return 0
  const rows = await getAllMasteryForChild(childId)
  const bySkill = new Map(rows.map((r) => [r.skillId, r]))
  const masteredCount = skillIds.filter((id) => (bySkill.get(id)?.masteryLevel ?? 0) >= minLevel)
    .length
  return Math.round((masteredCount / skillIds.length) * 100)
}

/** أضعف N مهارة (الأقل إتقانًا) — أساس "المراجعة الذكية" القادمة */
export async function getWeakSkills(childId: number, limit = 5) {
  const rows = await getAllMasteryForChild(childId)
  return rows
    .filter((r) => r.needsReview || r.masteryLevel <= 1)
    .sort((a, b) => a.masteryLevel - b.masteryLevel)
    .slice(0, limit)
}
