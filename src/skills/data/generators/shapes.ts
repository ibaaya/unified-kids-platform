// مولّدات الأشكال: تسمية، ظلّ، أضلاع، حجم، تطابق، مطابقة بالأشياء
import type { ChoiceQ, MatchQ, OrderQ, Token } from '../types';
import { COLORS, SHAPES, S, shuffle, sample, pickOne, toAr, type ColorKey, type ShapeKey } from '../kit';

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 7)}`;
const COLOR_KEYS = Object.keys(COLORS).filter((k) => k !== 'brown') as ColorKey[];
const NAMEABLE: ShapeKey[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'rect', 'crescent'];

export function shapeName(): ChoiceQ {
  const [a, b, c] = sample(NAMEABLE, 3);
  const list = shuffle([a, b, c]);
  return {
    type: 'choice', id: uid('sn'), prompt: 'مَا اسْمُ هَذَا الشَّكْلِ؟',
    pictureRows: [[S(a, pickOne(COLOR_KEYS))]],
    options: list.map((k, i) => ({ id: `o${i}`, label: SHAPES[k] })), answer: `o${list.indexOf(a)}`,
  };
}

export function silhouette(): ChoiceQ {
  const [a, b, c] = sample(NAMEABLE, 3);
  const list = shuffle([a, b, c]);
  return {
    type: 'choice', id: uid('sil'), prompt: 'أَيُّ شَكْلٍ يُطَابِقُ الظِّلَّ؟',
    pictureRows: [[S(a, '#475569')]],
    options: list.map((k, i) => ({ id: `o${i}`, visual: S(k, pickOne(COLOR_KEYS)) })), answer: `o${list.indexOf(a)}`,
  };
}

const SIDES: [ShapeKey, number][] = [['triangle', 3], ['square', 4], ['rect', 4], ['diamond', 4], ['hexagon', 6]];
export function sides(): ChoiceQ {
  const [shape, n] = pickOne(SIDES);
  const nums = shuffle([...new Set([n, 3, 4, 5, 6])]).slice(0, 4);
  if (!nums.includes(n)) nums[0] = n;
  const list = shuffle(nums);
  return {
    type: 'choice', id: uid('sd'), prompt: 'كَمْ ضِلْعًا لِهَذَا الشَّكْلِ؟',
    hint: 'عُدَّ الْجَوَانِبَ الْمُسْتَقِيمَةَ حَوْلَ الشَّكْلِ.',
    pictureRows: [[S(shape, pickOne(COLOR_KEYS))]],
    options: list.map((v, i) => ({ id: `o${i}`, label: toAr(v) })), answer: `o${list.indexOf(n)}`,
  };
}

export function sizeOrder(n: 3 | 4, ascending = true): OrderQ {
  const shape = pickOne(NAMEABLE.filter((s) => s !== 'rect' && s !== 'crescent'));
  const color = pickOne(COLOR_KEYS);
  const scales = n === 3 ? [0.6, 0.95, 1.3] : [0.5, 0.8, 1.1, 1.4];
  const seq = ascending ? scales : [...scales].reverse();
  return {
    type: 'order', id: uid('so'),
    prompt: ascending ? 'رَتِّبِ الْأَشْكَالَ مِنَ الْأَصْغَرِ إِلَى الْأَكْبَرِ.' : 'رَتِّبِ الْأَشْكَالَ مِنَ الْأَكْبَرِ إِلَى الْأَصْغَرِ.',
    items: seq.map((sc, i) => ({ id: `i${i}`, visual: S(shape, color), scale: sc })),
  };
}

export function identical(): ChoiceQ {
  const picks = sample(NAMEABLE, 4).map((s) => S(s, pickOne(COLOR_KEYS)));
  const dup = pickOne(picks);
  const row = shuffle([...picks, dup]);
  const outsider = S(pickOne(NAMEABLE.filter((s) => !picks.some((p) => p.includes(`:${s}:`)))), pickOne(COLOR_KEYS));
  const list = shuffle([dup, ...sample(picks.filter((p) => p !== dup), 2), outsider]);
  return {
    type: 'choice', id: uid('id'), prompt: 'أَيُّ شَكْلٍ ظَهَرَ مَرَّتَيْنِ؟',
    pictureRows: [row],
    options: list.map((t: Token, i) => ({ id: `o${i}`, visual: t })), answer: `o${list.indexOf(dup)}`,
  };
}

const LOOKALIKES: [ShapeKey, Token][] = [
  ['circle', '🌕'], ['crescent', '🌙'], ['star', '⭐'], ['triangle', '⛺'], ['rect', '🚪'], ['square', '🪟'], ['heart', '❤️'],
];
export function shapeObjectMatch(n = 4): MatchQ {
  const picked = sample(LOOKALIKES, n);
  return {
    type: 'match', id: uid('so'), prompt: 'صِلْ كُلَّ شَكْلٍ بِمَا يُشْبِهُهُ.',
    pairs: picked.map(([s, e]) => ({ left: { id: `l_${s}`, visual: S(s, pickOne(COLOR_KEYS)) }, right: { id: `r_${s}`, visual: e } })),
  };
}
