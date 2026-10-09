import type { IslamicProgress } from '../data/types';
import { islamicValues, familyValues } from '../data/values';
import { islamicManners } from '../data/manners';
import { worshipLessons } from '../data/worship';
import { islamicStories } from '../data/stories';
import { gameCatalog } from '../data/games';

// =====================================================
// نظام التقدم - أخلاقي الجميلة
// مفتاح localStorage مستقل (مثل adad-progress-v1 للأرقام).
// يمكن ربطه بملف الطفل عبر setIslamicProfile(childId).
// =====================================================

const BASE_KEY = 'islamic-progress-v1';
let profileId = '';

/** استدعِها عند تغيير ملف الطفل النشط ليحصل كل طفل على تقدمه الخاص */
export const setIslamicProfile = (id?: string | null): void => {
  profileId = id ?? '';
};

const storageKey = (): string => (profileId ? `${BASE_KEY}:${profileId}` : BASE_KEY);

export const FAITH_IDS = {
  islam: 'faith_islam_pillars',
  iman: 'faith_iman_pillars',
  prophet: 'faith_prophet',
} as const;

const defaultProgress = (): IslamicProgress => ({
  completedValues: [],
  completedManners: [],
  completedStories: [],
  completedWorshipLessons: [],
  completedFaith: [],
  completedGames: [],
  completedQuizzes: {},
  earnedBadges: [],
  todayActivities: 0,
  totalActivities: 0,
  lastVisited: new Date().toDateString(),
});

export const getIslamicProgress = (): IslamicProgress => {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return defaultProgress();
    const parsed = { ...defaultProgress(), ...(JSON.parse(raw) as Partial<IslamicProgress>) };
    if (parsed.lastVisited !== new Date().toDateString()) {
      parsed.todayActivities = 0;
      parsed.lastVisited = new Date().toDateString();
    }
    return parsed;
  } catch {
    return defaultProgress();
  }
};

const save = (p: IslamicProgress): void => {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(p));
  } catch {
    /* التخزين غير متاح: نتجاهل بهدوء */
  }
};

/** يحسب الشارات المستحقة ويعيد الجديد منها فقط */
const evaluateBadges = (p: IslamicProgress): string[] => {
  const earned = new Set(p.earnedBadges);
  const before = earned.size;
  const fresh: string[] = [];
  const add = (id: string) => {
    if (!earned.has(id)) {
      earned.add(id);
      fresh.push(id);
    }
  };

  [...islamicValues, ...familyValues].forEach((v) => p.completedValues.includes(v.id) && add(v.badgeId));
  islamicManners.forEach((m) => p.completedManners.includes(m.id) && add(m.badgeId));
  worshipLessons.forEach((l) => p.completedWorshipLessons.includes(l.id) && add(l.badgeId));
  if (p.completedFaith.includes(FAITH_IDS.islam)) add('badge_islam_pillars');
  if (p.completedFaith.includes(FAITH_IDS.iman)) add('badge_iman_pillars');
  if (p.completedFaith.includes(FAITH_IDS.prophet)) add('badge_prophet');
  if (p.completedStories.length >= 3) add('badge_stories');
  if (p.completedStories.length >= islamicStories.length) add('badge_all_stories');
  if (p.totalActivities >= 20) add('badge_superstar');

  if (earned.size !== before) p.earnedBadges = Array.from(earned);
  return fresh;
};

type ListKey =
  | 'completedValues'
  | 'completedManners'
  | 'completedStories'
  | 'completedWorshipLessons'
  | 'completedFaith'
  | 'completedGames';

/** يسجّل إكمالاً جديداً ويعيد الشارات الجديدة (إن وُجدت) */
const complete = (field: ListKey, id: string): string[] => {
  const p = getIslamicProgress();
  if (!p[field].includes(id)) {
    p[field].push(id);
    p.totalActivities += 1;
    p.todayActivities += 1;
  }
  const fresh = evaluateBadges(p);
  save(p);
  return fresh;
};

export const markValueComplete = (id: string) => complete('completedValues', id);
export const markMannerComplete = (id: string) => complete('completedManners', id);
export const markStoryComplete = (id: string) => complete('completedStories', id);
export const markWorshipComplete = (id: string) => complete('completedWorshipLessons', id);
export const markFaithComplete = (id: string) => complete('completedFaith', id);
export const markGameComplete = (id: string) => complete('completedGames', id);

export const saveQuizResult = (quizId: string, score: number, level: string): string[] => {
  const p = getIslamicProgress();
  const isNew = !p.completedQuizzes[quizId];
  const best = Math.max(score, p.completedQuizzes[quizId]?.score ?? 0);
  p.completedQuizzes[quizId] = { score: best, level };
  if (isNew) {
    p.totalActivities += 1;
    p.todayActivities += 1;
  }
  const fresh = evaluateBadges(p);
  save(p);
  return fresh;
};

export const resetIslamicProgress = (): void => {
  try {
    localStorage.removeItem(storageKey());
  } catch {
    /* ignore */
  }
};

/** عدد الأنشطة القابلة للإكمال (للشريط في الصفحة الرئيسية) */
export const TOTAL_TRACKABLE =
  islamicValues.length +
  familyValues.length +
  islamicManners.length +
  worshipLessons.length +
  islamicStories.length +
  3 +
  gameCatalog.length;

export const getTotalCompleted = (): number => {
  const p = getIslamicProgress();
  return (
    p.completedValues.length +
    p.completedManners.length +
    p.completedStories.length +
    p.completedWorshipLessons.length +
    p.completedFaith.length +
    p.completedGames.length
  );
};
