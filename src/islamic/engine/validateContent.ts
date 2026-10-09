import { islamicValues, familyValues } from '../data/values';
import { islamicManners } from '../data/manners';
import { worshipLessons } from '../data/worship';
import { islamPillars, imanPillars } from '../data/islamPillars';
import { islamicStories } from '../data/stories';
import { islamicQuizzes } from '../data/quizzes';
import { islamicBadges } from '../data/badges';
import { stepTopics } from '../data/stepByStep';
import { collectItems, gameCatalog, orderGames, picturePuzzles, scenarioSets } from '../data/games';

/** يفحص سلامة بيانات القسم ويعيد قائمة بالمشاكل (فارغة = سليم) */
export const validateIslamicContent = (): string[] => {
  const issues: string[] = [];
  const unique = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    ids.forEach((id) => {
      if (seen.has(id)) issues.push(`${label}: معرّف مكرر ${id}`);
      seen.add(id);
    });
  };

  unique('values', [...islamicValues, ...familyValues].map((v) => v.id));
  unique('manners', islamicManners.map((m) => m.id));
  unique('worship', worshipLessons.map((l) => l.id));
  unique('pillars', [...islamPillars, ...imanPillars].map((p) => p.id));
  unique('stories', islamicStories.map((s) => s.id));
  unique('quizzes', islamicQuizzes.map((q) => q.id));
  unique('badges', islamicBadges.map((b) => b.id));
  unique('games', gameCatalog.map((g) => g.id));

  const badgeIds = new Set(islamicBadges.map((b) => b.id));
  [...islamicValues, ...familyValues].forEach((v) => !badgeIds.has(v.badgeId) && issues.push(`شارة مفقودة: ${v.badgeId}`));
  islamicManners.forEach((m) => !badgeIds.has(m.badgeId) && issues.push(`شارة مفقودة: ${m.badgeId}`));
  worshipLessons.forEach((l) => !badgeIds.has(l.badgeId) && issues.push(`شارة مفقودة: ${l.badgeId}`));

  islamicQuizzes.forEach((q) => {
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) issues.push(`${q.id}: correctIndex خارج الخيارات`);
  });
  const worlds = ['values', 'family', 'manners', 'worship', 'faith', 'stories', 'culture'];
  worlds.forEach((w) => {
    if (!islamicQuizzes.some((q) => q.worldId === w)) issues.push(`لا أسئلة للعالم ${w}`);
  });

  islamicStories.forEach((s) => {
    s.scenes.forEach((sc) => {
      if (sc.choices && sc.choices.filter((c) => c.isCorrect).length !== 1) issues.push(`${s.id}/${sc.id}: يجب وجود خيار صحيح واحد`);
    });
    if (s.activity && s.activity.correctIndex >= s.activity.options.length) issues.push(`${s.id}: نشاط correctIndex خارج الخيارات`);
  });

  stepTopics.forEach((t) => !t.steps.length && issues.push(`${t.id}: لا خطوات`));
  Object.values(orderGames).forEach((g) => g.items.length < 2 && issues.push(`${g.id}: عناصر الترتيب قليلة`));
  Object.entries(scenarioSets).forEach(([k, list]) =>
    list.forEach((s) => s.correctIndex >= s.options.length && issues.push(`${k}/${s.id}: correctIndex خارج الخيارات`)),
  );
  picturePuzzles.forEach((p) => p.correctIndex >= p.options.length && issues.push(`${p.id}: correctIndex خارج الخيارات`));
  if (collectItems.filter((c) => c.good).length < 3) issues.push('collectItems: عناصر خير قليلة');
  gameCatalog.forEach((g) => {
    if (g.kind === 'order' && !(g.dataId && orderGames[g.dataId])) issues.push(`${g.id}: بيانات الترتيب مفقودة`);
    if (g.kind === 'scenario' && !(g.dataId && scenarioSets[g.dataId])) issues.push(`${g.id}: بيانات المواقف مفقودة`);
  });

  return issues;
};
