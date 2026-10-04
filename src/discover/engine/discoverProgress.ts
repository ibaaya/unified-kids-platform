/**
 * discoverProgress.ts — نظام تقدم قسم «اكتشف ما حولك»
 *
 * ملاحظات:
 * - التخزين مستقل عن بقية المنصة لتقليل احتمال التعارض.
 * - تمت إضافة تقدم الاختبار الشامل مع الحفاظ على الحقول القديمة.
 * - لا نحذف بيانات الإصدار السابق؛ JSON القديم سيُحمّل مع القيم الجديدة الاختيارية.
 */

const STORAGE_KEY = 'discover-progress-v1'

export interface DiscoverWorldProgress {
  /** عناصر تمت مشاهدتها */
  seenItems: string[]
  /** أنشطة مكتملة */
  completedActivities: string[]
  /** عدد الإجابات الصحيحة في آخر اختبار للعالم */
  lastQuizScore?: number
  /** آخر دخول للعالم */
  lastVisited?: string
}

export type DiscoverTestLevel = 'easy' | 'medium' | 'hard'

export interface DiscoverTestLevelProgress {
  /** آخر عدد إجابات صحيحة */
  score: number
  /** عدد أسئلة المستوى */
  total: number
  /** هل أنهى الطفل المستوى بالكامل؟ */
  completed: boolean
  /** عدد المحاولات */
  attempts: number
  /** تاريخ آخر إكمال */
  completedAt?: string
}

export interface DiscoverFinalTestProgress {
  levels: Partial<Record<DiscoverTestLevel, DiscoverTestLevelProgress>>
  /** إجمالي آخر نتيجة مكتملة لكل المستويات المنجزة */
  totalScore: number
  totalQuestions: number
  lastCompletedAt?: string
}

export interface DiscoverProgress {
  worlds: Record<string, DiscoverWorldProgress>
  totalItemsSeen: number
  totalActivitiesDone: number
  /** التقدم الجديد للاختبار الشامل */
  finalTest: DiscoverFinalTestProgress
}

const EMPTY: DiscoverProgress = {
  worlds: {},
  totalItemsSeen: 0,
  totalActivitiesDone: 0,
  finalTest: {
    levels: {},
    totalScore: 0,
    totalQuestions: 0,
  },
}

function normalizeProgress(raw: Partial<DiscoverProgress>): DiscoverProgress {
  return {
    ...EMPTY,
    ...raw,
    worlds: raw.worlds ?? {},
    finalTest: {
      ...EMPTY.finalTest,
      ...(raw.finalTest ?? {}),
      levels: raw.finalTest?.levels ?? {},
    },
  }
}

/** تحميل التقدم من localStorage */
export function loadDiscoverProgress(): DiscoverProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return normalizeProgress({})
    return normalizeProgress(JSON.parse(raw) as Partial<DiscoverProgress>)
  } catch {
    return normalizeProgress({})
  }
}

/** حفظ التقدم داخليًا */
function saveProgress(progress: DiscoverProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

/** تسجيل مشاهدة عنصر */
export function markItemSeen(worldId: string, itemId: string): void {
  const progress = loadDiscoverProgress()
  const world = progress.worlds[worldId] ?? { seenItems: [], completedActivities: [] }

  if (!world.seenItems.includes(itemId)) {
    world.seenItems.push(itemId)
    progress.totalItemsSeen += 1
  }

  world.lastVisited = new Date().toISOString().slice(0, 10)
  progress.worlds[worldId] = world
  saveProgress(progress)
}

/** تسجيل إكمال نشاط */
export function markActivityCompleted(worldId: string, activityId: string, score?: number): void {
  const progress = loadDiscoverProgress()
  const world = progress.worlds[worldId] ?? { seenItems: [], completedActivities: [] }

  if (!world.completedActivities.includes(activityId)) {
    world.completedActivities.push(activityId)
    progress.totalActivitiesDone += 1
  }

  if (score !== undefined) world.lastQuizScore = score
  progress.worlds[worldId] = world
  saveProgress(progress)
}

/** نسبة إكمال عالم محدد */
export function getWorldCompletion(worldId: string, totalItems: number): number {
  const progress = loadDiscoverProgress()
  const world = progress.worlds[worldId]
  if (!world || totalItems === 0) return 0
  return Math.min(100, Math.round((world.seenItems.length / totalItems) * 100))
}

/** هل اكتمل العالم؟ */
export function isWorldComplete(worldId: string, totalItems: number): boolean {
  return getWorldCompletion(worldId, totalItems) >= 100
}

/** هل مستوى الاختبار متاح؟ */
export function isDiscoverTestLevelUnlocked(level: DiscoverTestLevel): boolean {
  if (level === 'easy') return true

  const progress = loadDiscoverProgress()
  if (level === 'medium') return Boolean(progress.finalTest.levels.easy?.completed)
  return Boolean(progress.finalTest.levels.medium?.completed)
}

/** تسجيل نتيجة مستوى من الاختبار الشامل */
export function saveDiscoverTestLevelResult(
  level: DiscoverTestLevel,
  score: number,
  total: number,
): DiscoverFinalTestProgress {
  const progress = loadDiscoverProgress()
  const previous = progress.finalTest.levels[level]

  progress.finalTest.levels[level] = {
    score,
    total,
    completed: true,
    attempts: (previous?.attempts ?? 0) + 1,
    completedAt: new Date().toISOString(),
  }

  const completedLevels = (['easy', 'medium', 'hard'] as DiscoverTestLevel[])
    .map((key) => progress.finalTest.levels[key])
    .filter((value): value is DiscoverTestLevelProgress => Boolean(value?.completed))

  progress.finalTest.totalScore = completedLevels.reduce((sum, value) => sum + value.score, 0)
  progress.finalTest.totalQuestions = completedLevels.reduce((sum, value) => sum + value.total, 0)
  progress.finalTest.lastCompletedAt = new Date().toISOString()

  saveProgress(progress)
  return progress.finalTest
}

/** نتيجة الاختبار الكلي كنسبة مئوية من المستويات المكتملة */
export function getDiscoverOverallTestPercentage(): number {
  const progress = loadDiscoverProgress()
  if (progress.finalTest.totalQuestions === 0) return 0
  return Math.round((progress.finalTest.totalScore / progress.finalTest.totalQuestions) * 100)
}

/** هل أكمل الطفل الاختبار الشامل بالمستويات الثلاثة؟ */
export function isDiscoverFinalTestComplete(): boolean {
  const progress = loadDiscoverProgress()
  return Boolean(
    progress.finalTest.levels.easy?.completed &&
    progress.finalTest.levels.medium?.completed &&
    progress.finalTest.levels.hard?.completed,
  )
}

/** إعادة ضبط كل تقدم قسم الاكتشاف */
export function resetDiscoverProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}
