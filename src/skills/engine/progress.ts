// src/skills/engine/progress.ts
import type { LevelNo } from '../data/types';
import type { Stars } from './scoring';

const KEY = 'skills-progress-v3';

export interface LevelProgress {
  completed: boolean;
  stars: Stars;
  bestScore: number;
  attempts: number;
  bestMistakes: number | null; // null بدلًا من Infinity لأن JSON لا يحفظ Infinity
  lastScore: number;
}
export type SkillsProgress = Record<string, LevelProgress>;

const empty = (): LevelProgress => ({ completed: false, stars: 0, bestScore: 0, attempts: 0, bestMistakes: null, lastScore: 0 });

function read(): SkillsProgress {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') as SkillsProgress; } catch { return {}; }
}
function write(data: SkillsProgress): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* التخزين غير متاح */ }
}
const key = (g: string, l: LevelNo) => `${g}:${l}`;

export const getLevelProgress = (g: string, l: LevelNo): LevelProgress => read()[key(g, l)] ?? empty();

export const isLevelUnlocked = (g: string, l: LevelNo): boolean =>
  l === 1 || getLevelProgress(g, (l - 1) as LevelNo).completed;

export function saveLevelResult(g: string, l: LevelNo, r: { score: number; stars: Stars; mistakes: number }): LevelProgress {
  const data = read();
  const prev = data[key(g, l)] ?? empty();
  const next: LevelProgress = {
    completed: true,
    stars: Math.max(prev.stars, r.stars) as Stars,
    bestScore: Math.max(prev.bestScore, Math.round(r.score)),
    attempts: prev.attempts + 1,
    bestMistakes: prev.bestMistakes === null ? r.mistakes : Math.min(prev.bestMistakes, r.mistakes),
    lastScore: Math.round(r.score),
  };
  data[key(g, l)] = next;
  write(data);
  return next;
}

export const getGameStars = (g: string): number =>
  ([1, 2, 3] as LevelNo[]).reduce((s, l) => s + getLevelProgress(g, l).stars, 0);

export const getTotalStars = (): number => Object.values(read()).reduce((s, p) => s + p.stars, 0);

export function clearSkillsProgress(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
