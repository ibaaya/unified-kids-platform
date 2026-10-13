import { db } from './storage/db'
import type { ChildProfile, ChildSettings } from '../types/progress'
import { DEFAULT_AVATAR_ID } from '../types/progress'

const ACTIVE_CHILD_KEY = 'activeChildId'
const ARABIC_FINAL_TEST_KEY = (childId: number) => `arabic-final-test:${childId}`

export interface ArabicFinalTestProgress {
  scores: number[]
  completedAt?: string
}

export async function getArabicFinalTestProgress(childId: number): Promise<ArabicFinalTestProgress> {
  const row = await db.appState.get(ARABIC_FINAL_TEST_KEY(childId))
  if (!row) return { scores: [] }
  try {
    const value = JSON.parse(row.value) as ArabicFinalTestProgress
    const scores = Array.isArray(value.scores) ? value.scores.slice(0, 3).map((score) => Math.max(0, Math.min(10, Math.floor(Number(score) || 0)))) : []
    return { scores, ...(scores.length === 3 && value.completedAt ? { completedAt: value.completedAt } : {}) }
  } catch {
    return { scores: [] }
  }
}

export async function saveArabicFinalTestLevel(childId: number, levelIndex: number, score: number): Promise<ArabicFinalTestProgress> {
  const progress = await getArabicFinalTestProgress(childId)
  if (levelIndex !== progress.scores.length || levelIndex > 2 || score < 0 || score > 10) {
    throw new Error('ترتيب مستوى الاختبار العربي أو نتيجته غير صالح.')
  }
  const scores = [...progress.scores, Math.floor(score)]
  const next = { scores, ...(scores.length === 3 ? { completedAt: new Date().toISOString() } : {}) }
  await db.appState.put({ key: ARABIC_FINAL_TEST_KEY(childId), value: JSON.stringify(next) })
  if (scores.length === 3) await markLessonComplete(childId, 'arabic_final_test')
  return next
}

/** الإعدادات الافتراضية لأي طفل جديد، ولأي ملف طفل قديم لا يملك settings محفوظة. */
export const DEFAULT_CHILD_SETTINGS: ChildSettings = {
  unlockMode: 'free',
  sequentialThresholdPercent: 20,
  autoReadQuestions: true,
  textSize: 'normal',
  homeDisplayMode: 'journey',
}

function withDefaultSettings(child: ChildProfile): ChildProfile {
  return { ...child, settings: { ...DEFAULT_CHILD_SETTINGS, ...(child.settings ?? {}) } }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** معرّف الطالب المسجّل دخوله حاليًا على هذا الجهاز (أو undefined إن لم يسجّل أحد بعد). */
export async function getActiveChildId(): Promise<number | undefined> {
  const row = await db.appState.get(ACTIVE_CHILD_KEY)
  return row ? Number(row.value) : undefined
}

export async function setActiveChildId(childId: number): Promise<void> {
  await db.appState.put({ key: ACTIVE_CHILD_KEY, value: String(childId) })
}

export async function clearActiveChild(): Promise<void> {
  await db.appState.delete(ACTIVE_CHILD_KEY)
}

/** يرجع الطالب المسجّل دخوله حاليًا فقط (لا يفترض تلقائيًا "أول طفل محفوظ" كما في السابق). */
export async function getActiveChild(): Promise<ChildProfile | undefined> {
  const activeId = await getActiveChildId()
  if (activeId == null) return undefined
  const child = await db.children.get(activeId)
  if (!child) {
    await clearActiveChild()
    return undefined
  }
  return withDefaultSettings(child)
}

export async function getChildById(childId: number): Promise<ChildProfile | undefined> {
  const child = await db.children.get(childId)
  return child ? withDefaultSettings(child) : undefined
}

/** كل ملفات الطلاب المحفوظة على هذا الجهاز — تُستخدم في شاشة "اختر اسمك". */
export async function listChildren(): Promise<ChildProfile[]> {
  const rows = await db.children.toArray()
  return rows.map(withDefaultSettings)
}

export async function createChildProfile(name: string, avatar = DEFAULT_AVATAR_ID): Promise<ChildProfile> {
  const profile: ChildProfile = {
    name: name.trim() || 'بطل',
    avatar,
    createdAt: new Date().toISOString(),
    points: 0,
    stars: 0,
    streakDays: 0,
    lastActiveDate: null,
    unlockedWorldIds: ['letters'],
    completedLessonIds: [],
    achievementIds: [],
    settings: { ...DEFAULT_CHILD_SETTINGS },
  }
  const id = await db.children.add(profile)
  await setActiveChildId(id)
  return { ...profile, id }
}

export async function updateChildAvatar(childId: number, avatar: string): Promise<ChildProfile | undefined> {
  await db.children.update(childId, { avatar })
  return getChildById(childId)
}

/** تسجيل دخول طالب موجود مسبقًا (من شاشة "اختر اسمك" أو من لوحة ولي الأمر). */
export async function switchActiveChild(childId: number): Promise<ChildProfile | undefined> {
  const child = await db.children.get(childId)
  if (!child) return undefined
  await setActiveChildId(childId)
  return withDefaultSettings(child)
}

export async function updateChildSettings(
  childId: number,
  settings: Partial<ChildSettings>,
): Promise<ChildProfile | undefined> {
  const child = await getChildById(childId)
  if (!child) return undefined
  const merged: ChildSettings = { ...(child.settings ?? DEFAULT_CHILD_SETTINGS), ...settings }
  await db.children.update(childId, { settings: merged })
  return getChildById(childId)
}

/** حذف نهائي لملف طالب وكل بياناته (تقدّم، إتقان، سجلّ نشاط). */
export async function deleteChildProfile(childId: number): Promise<void> {
  await db.children.delete(childId)
  await db.skillMastery.where('childId').equals(childId).delete()
  await db.activityLog.where('childId').equals(childId).delete()
  await db.appState.delete(ARABIC_FINAL_TEST_KEY(childId))
  const activeId = await getActiveChildId()
  if (activeId === childId) await clearActiveChild()
}

/**
 * تُستدعى عند فتح التطبيق: تحدّث سلسلة التعلم (Streak) بناءً على تاريخ آخر نشاط.
 * - نفس اليوم: لا تغيير.
 * - أمس: streak += 1.
 * - أقدم من أمس: streak تُعاد إلى 1.
 */
export async function touchDailyStreak(childId: number): Promise<ChildProfile | undefined> {
  const child = await db.children.get(childId)
  if (!child) return undefined

  const today = todayISO()
  if (child.lastActiveDate === today) return child

  const newStreak = child.lastActiveDate === yesterdayISO() ? child.streakDays + 1 : 1

  await db.children.update(childId, {
    lastActiveDate: today,
    streakDays: newStreak,
  })
  return db.children.get(childId)
}

export async function addPointsAndStars(
  childId: number,
  points: number,
  stars: number,
): Promise<void> {
  const child = await db.children.get(childId)
  if (!child) return
  await db.children.update(childId, {
    points: child.points + points,
    stars: child.stars + stars,
  })
}

export async function unlockWorld(childId: number, worldId: string): Promise<void> {
  const child = await db.children.get(childId)
  if (!child || child.unlockedWorldIds.includes(worldId)) return
  await db.children.update(childId, {
    unlockedWorldIds: [...child.unlockedWorldIds, worldId],
  })
}

export async function markLessonComplete(childId: number, lessonId: string): Promise<void> {
  const child = await db.children.get(childId)
  if (!child || child.completedLessonIds.includes(lessonId)) return
  await db.children.update(childId, {
    completedLessonIds: [...child.completedLessonIds, lessonId],
  })
}

export async function resetAllProgress(): Promise<void> {
  await db.children.clear()
  await db.skillMastery.clear()
  await db.activityLog.clear()
  await db.appState.clear()
}
