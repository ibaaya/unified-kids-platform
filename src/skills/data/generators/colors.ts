// مولّدات الألوان: تسمية، أشياء ملونة، خلط، قوس قزح، درجات، مطابقة
import type { ChoiceQ, MatchQ, OrderQ, Token } from '../types';
import { COLORS, S, SW, shuffle, sample, pickOne, type ColorKey } from '../kit';

const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 7)}`;
const KEYS = Object.keys(COLORS) as ColorKey[];
const BASIC = KEYS.filter((k) => k !== 'brown');

const OBJECTS: [Token, ColorKey][] = [
  ['🍌', 'yellow'], ['🍎', 'red'], ['🥒', 'green'], ['🍊', 'orange'], ['🫐', 'blue'],
  ['🍇', 'purple'], ['🍅', 'red'], ['🌽', 'yellow'], ['🥕', 'orange'], ['🐸', 'green'], ['🌸', 'pink'],
];

export function colorName(): ChoiceQ {
  const [a, b, c] = sample(BASIC, 3);
  const shape = pickOne(['circle', 'square', 'star', 'heart'] as const);
  const list = shuffle([a, b, c]);
  return {
    type: 'choice', id: uid('cn'), prompt: 'مَا لَوْنُ هَذَا الشَّكْلِ؟',
    pictureRows: [[S(shape, a)]],
    options: list.map((k, i) => ({ id: `o${i}`, label: COLORS[k].name })), answer: `o${list.indexOf(a)}`,
  };
}

export function objectColor(): ChoiceQ {
  const [obj, col] = pickOne(OBJECTS);
  const wrong = sample(OBJECTS.filter(([, c]) => c !== col), 2).map(([t]) => t);
  const list = shuffle([obj, ...wrong]);
  return {
    type: 'choice', id: uid('oc'), prompt: `أَيُّ شَيْءٍ لَوْنُهُ ${COLORS[col].name}؟`,
    pictureRows: [[S('circle', col)]],
    options: list.map((t, i) => ({ id: `o${i}`, visual: t })), answer: `o${list.indexOf(obj)}`,
  };
}

const MIXES: [ColorKey, ColorKey, ColorKey][] = [
  ['red', 'yellow', 'orange'], ['blue', 'yellow', 'green'], ['red', 'blue', 'purple'],
];
export function colorMix(): ChoiceQ {
  const [a, b, r] = pickOne(MIXES);
  const others = sample(BASIC.filter((k) => k !== r && k !== a && k !== b), 2);
  const list = shuffle([r, ...others]);
  return {
    type: 'choice', id: uid('mix'), prompt: 'مَاذَا يَحْدُثُ عِنْدَ خَلْطِ هَذَيْنِ اللَّوْنَيْنِ؟',
    hint: 'تَخَيَّلْ أَنَّكَ تَخْلِطُ الدِّهَانَ فِي صَحْنِ الرَّسْمِ.',
    sequence: [S('circle', a), '➕', S('circle', b), '🟰', '?'],
    options: list.map((k, i) => ({ id: `o${i}`, visual: S('circle', k), label: COLORS[k].name })), answer: `o${list.indexOf(r)}`,
  };
}

const RAINBOW: ColorKey[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
export function rainbowOrder(n: number): OrderQ {
  const start = Math.floor(Math.random() * (RAINBOW.length - n + 1));
  const seg = RAINBOW.slice(start, start + n);
  return {
    type: 'order', id: uid('rb'), prompt: 'رَتِّبِ الْأَلْوَانَ كَمَا تَرَاهَا فِي قَوْسِ المَطَر.',
    hint: 'قَوْسُ المَطَر يَبْدَأُ بِالْأَحْمَرِ ثُمَّ الْبُرْتُقَالِيِّ ثُمَّ الْأَصْفَرِ.',
    items: seg.map((k, i) => ({ id: `i${i}`, visual: SW(COLORS[k].hex), label: COLORS[k].name })),
  };
}

const TINTS: Record<string, string[]> = {
  blue:   ['#dbeafe', '#93c5fd', '#3b82f6', '#1e3a8a'],
  green:  ['#dcfce7', '#86efac', '#22c55e', '#14532d'],
  red:    ['#fee2e2', '#fca5a5', '#ef4444', '#7f1d1d'],
  purple: ['#f3e8ff', '#d8b4fe', '#a855f7', '#581c87'],
};
export function tintOrder(n: number): OrderQ {
  const t = TINTS[pickOne(Object.keys(TINTS))];
  const picked = n === 4 ? t : [t[0], t[2], t[3]];
  return {
    type: 'order', id: uid('tn'), prompt: 'رَتِّبِ الْأَلْوَانَ مِنَ الْأَفْتَحِ إِلَى الْأَغْمَقِ.',
    items: picked.map((h, i) => ({ id: `i${i}`, visual: SW(h) })),
  };
}

export function colorMatch(n = 4): MatchQ {
  const ks = sample(BASIC, n);
  return {
    type: 'match', id: uid('cm'), prompt: 'صِلْ كُلَّ لَوْنٍ بِاسْمِهِ.',
    pairs: ks.map((k) => ({ left: { id: `l_${k}`, visual: SW(COLORS[k].hex) }, right: { id: `r_${k}`, label: COLORS[k].name } })),
  };
}
