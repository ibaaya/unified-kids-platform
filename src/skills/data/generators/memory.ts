// مولّدات الذاكرة: بطاقات متطابقة + تذكّر الصور المعروضة/المختفية
import type { ChoiceQ, MemoryQ, Token } from '../types';
import { S, shuffle, sample, pickOne, type ColorKey, type ShapeKey } from '../kit';

const POOL: Token[] = [
  '🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🐱', '🐶', '🐪', '🐑', '🐦', '🐟',
  '🚗', '✈️', '⚽', '📘', '🌙', '⭐', '🌳', '🌹', '🏠', '🕌',
];
const SHAPE_POOL: Token[] = (['circle', 'square', 'triangle', 'star', 'heart', 'diamond'] as ShapeKey[])
  .map((s, i) => S(s, (['red', 'blue', 'yellow', 'green', 'purple', 'orange'] as ColorKey[])[i]));
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 7)}`;

export function memoryPairs(pairs: number, withShapes = false): MemoryQ {
  const src = withShapes ? [...sample(POOL, pairs - 2), ...sample(SHAPE_POOL, 2)] : sample(POOL, pairs);
  return {
    type: 'memory', id: uid('mem'),
    prompt: 'اقْلِبْ بِطَاقَتَيْنِ وَابْحَثْ عَنِ الصُّورَتَيْنِ الْمُتَشَابِهَتَيْنِ.',
    hint: 'تَذَكَّرْ مَكَانَ كُلِّ صُورَةٍ بَعْدَ أَنْ تَرَاهَا.',
    cards: src.map((t, i) => ({ id: `c${i}`, visual: t })),
  };
}

const opts = (tokens: Token[]) => tokens.map((t, i) => ({ id: `o${i}`, visual: t }));

/** أي صورة كانت بين الصور المعروضة؟ */
export function recallPresent(count: number, seconds: number): ChoiceQ {
  const shown = sample(POOL, count);
  const answer = pickOne(shown);
  const wrong = sample(POOL.filter((p) => !shown.includes(p)), 3);
  const list = shuffle([answer, ...wrong]);
  return {
    type: 'choice', id: uid('rec'),
    prompt: 'تَذَكَّرِ الصُّوَرَ جَيِّدًا. أَيُّ صُورَةٍ كَانَتْ بَيْنَهَا؟',
    flash: { items: shown, seconds },
    options: opts(list), answer: `o${list.indexOf(answer)}`,
  };
}

/** أي صورة اختفت؟ */
export function recallMissing(count: number, seconds: number): ChoiceQ {
  const shown = sample(POOL, count);
  const missing = pickOne(shown);
  const rest = shown.filter((t) => t !== missing);
  const outsider = pickOne(POOL.filter((p) => !shown.includes(p)));
  const list = shuffle([missing, ...sample(rest, 2), outsider]);
  return {
    type: 'choice', id: uid('mis'),
    prompt: 'تَذَكَّرِ الصُّوَرَ جَيِّدًا. أَيُّ صُورَةٍ اخْتَفَتْ؟',
    flash: { items: shown, seconds },
    pictureRows: [rest],
    options: opts(list), answer: `o${list.indexOf(missing)}`,
  };
}
