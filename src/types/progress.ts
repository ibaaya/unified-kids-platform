// أنواع بيانات تتبع تقدم الطفل — يُحفظ محليًا عبر IndexedDB

/**
 * طريقة فتح العوالم يتحكم بها ولي الأمر من لوحته:
 * - free: تنقّل حر بين كل العوالم دون قيود.
 * - sequential: كل عالم يُقفل حتى يُنهي الطفل نسبة معيّنة من العالم السابق.
 */
export type UnlockMode = 'free' | 'sequential'
export type HomeDisplayMode = 'journey' | 'simple'
export const DEFAULT_AVATAR_ID = 'moon'

export interface ChildSettings {
  unlockMode: UnlockMode
  /** النسبة المئوية (0-100) المطلوب إنجازها من العالم السابق لفتح التالي، في وضع "تسلسل". */
  sequentialThresholdPercent: number
  /** هل تُقرأ الأسئلة صوتيًا تلقائيًا عند ظهورها في كل الألعاب، أم يحتاج الطفل للضغط على أيقونة الصوت؟ */
  autoReadQuestions: boolean
  /** حجم النص/الصور في شاشات المحتوى (الحرف، الكلمة، الصورة) — يُطبَّق على كل الصفحات. */
  textSize: 'normal' | 'large' | 'xlarge'
  homeDisplayMode: HomeDisplayMode
}

export interface ChildProfile {
  id?: number
  name: string
  /** preset avatar ID or a locally stored image data URL; optional for older profiles. */
  avatar?: string
  createdAt: string
  points: number
  stars: number
  streakDays: number
  lastActiveDate: string | null
  unlockedWorldIds: string[]
  completedLessonIds: string[]
  achievementIds: string[]
  /** اختياري للتوافق مع ملفات أطفال أُنشئت قبل إضافة هذا الحقل — يُطبَّق افتراضي عند القراءة. */
  settings?: ChildSettings
}

/** سجل حالة عامة للتطبيق (مثل هوية الطالب الحالي المسجّل دخوله) — صف واحد لكل مفتاح. */
export interface AppStateEntry {
  key: string
  value: string
}

export type MasteryLevel = 0 | 1 | 2 | 3 // 0=جديد 1=يحتاج تدريب 2=جيد 3=ممتاز

export interface SkillMastery {
  id?: number
  childId: number
  skillId: string // مثال: "letter_ض" أو "word_قمر"
  attempts: number
  correct: number
  lastSeenAt: string
  masteryLevel: MasteryLevel
  needsReview: boolean
}

export interface ActivityLogEntry {
  id?: number
  childId: number
  skillId: string
  isCorrect: boolean
  responseTimeMs: number
  timestamp: string
}
