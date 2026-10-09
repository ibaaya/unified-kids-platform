// src/skills/data/games.ts
// نقطة التجميع الوحيدة: لإضافة لعبة جديدة اكتب ملفها في content/ ثم أضفها هنا.
import type { SkillGame, GameLevel, LevelNo } from './types';
import { solveGame } from './content/solve';
import { detectiveGame } from './content/detective';
import { memoryGame } from './content/memory';
import { patternGame } from './content/pattern';
import { decisionGame } from './content/decision';
import { buildGame } from './content/build';
import { pathGame } from './content/path';
import { explorerGame } from './content/explorer';
import { colorsGame } from './content/colors';
import { shapesGame } from './content/shapes';
import { puzzlesGame } from './content/puzzles';
import { creativeGame } from './content/creative';
import { helpGame } from './content/help';

export const SKILLS_GAMES: SkillGame[] = [
  solveGame, detectiveGame, memoryGame, patternGame, puzzlesGame, colorsGame, shapesGame,
  buildGame, pathGame, decisionGame, helpGame, explorerGame, creativeGame,
];

export const getGame = (id?: string): SkillGame | undefined => SKILLS_GAMES.find((g) => g.id === id);
export const getLevel = (game: SkillGame | undefined, n: number): GameLevel | undefined =>
  game?.levels.find((l) => l.level === n);
export const LEVELS: LevelNo[] = [1, 2, 3];
export * from './types';
