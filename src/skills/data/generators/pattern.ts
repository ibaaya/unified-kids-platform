// مولّدات الأنماط: ألوان، أشكال، أعداد، وخاصيتان معًا
import type { ChoiceQ, Token } from '../types';
import { COLORS, S, shuffle, sample, pickOne, toAr, type ColorKey, type ShapeKey } from '../kit';

const COLOR_KEYS = Object.keys(COLORS).filter((k) => !['brown'].includes(k)) as ColorKey[];
const SHAPE_KEYS: ShapeKey[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
const EMOJI_PAIRS: Token[][] = [['🍎', '🍌', '🍇'], ['🐱', '🐶', '🐑'], ['⚽', '🚗', '📘'], ['🌙', '⭐', '☁️']];
const uid = () => `pat_${Math.random().toString(36).slice(2, 7)}`;
const PROMPT_SHAPE = 'أَيُّ صُورَةٍ تُكْمِلُ النَّمَطَ؟';
const HINT_SHAPE = 'اُنْظُرْ إِلَى الْجُزْءِ الَّذِي يَتَكَرَّرُ.';

const repeatUnit = (unit: Token[], total: number): Token[] => Array.from({ length: total }, (_, i) => unit[i % unit.length]);

function build(seq: Token[], answerIndex: number, pool: Token[], blank: boolean): ChoiceQ {
  const answer = seq[answerIndex];
  const shown = blank ? seq.map((t, i) => (i === answerIndex ? '?' : t)) : seq.slice(0, answerIndex);
  const wrong = sample(pool.filter((p) => p !== answer), 2);
  const opts = shuffle([answer, ...wrong]);
  return {
    type: 'choice', id: uid(), prompt: PROMPT_SHAPE, hint: HINT_SHAPE,
    sequence: shown,
    options: opts.map((t, i) => ({ id: `o${i}`, visual: t })),
    answer: `o${opts.indexOf(answer)}`,
  };
}

/** المستوى 1: AB / AAB بألوان أو أشكال أو صور */
export function patternLevel1(): ChoiceQ {
  const kind = pickOne(['color', 'shape', 'emoji'] as const);
  let a: Token, b: Token, pool: Token[];
  if (kind === 'color') {
    const [c1, c2, c3] = sample(COLOR_KEYS, 3); const sh = pickOne(SHAPE_KEYS);
    [a, b] = [S(sh, c1), S(sh, c2)]; pool = [a, b, S(sh, c3)];
  } else if (kind === 'shape') {
    const [s1, s2, s3] = sample(SHAPE_KEYS, 3); const c = pickOne(COLOR_KEYS);
    [a, b] = [S(s1, c), S(s2, c)]; pool = [a, b, S(s3, c)];
  } else {
    const trio = pickOne(EMOJI_PAIRS); [a, b] = [trio[0], trio[1]]; pool = trio;
  }
  const unit = pickOne([[a, b], [a, a, b]]);
  const seq = repeatUnit(unit, unit.length * 2 + 1); // دورتان كاملتان + عنصر، ثم نسأل عن التالي
  return build(seq, seq.length - 1, pool, false);
}

/** المستوى 2: ABC أو خانة ناقصة في الوسط */
export function patternLevel2(): ChoiceQ {
  const kind = pickOne(['color', 'shape', 'emoji'] as const);
  let unit: Token[], pool: Token[];
  if (kind === 'color') {
    const cs = sample(COLOR_KEYS, 4); const sh = pickOne(SHAPE_KEYS);
    unit = cs.slice(0, 3).map((c) => S(sh, c)); pool = cs.map((c) => S(sh, c));
  } else if (kind === 'shape') {
    const ss = sample(SHAPE_KEYS, 4); const c = pickOne(COLOR_KEYS);
    unit = ss.slice(0, 3).map((s) => S(s, c)); pool = ss.map((s) => S(s, c));
  } else {
    unit = pickOne(EMOJI_PAIRS); pool = [...unit, '🏠'];
  }
  const seq = repeatUnit(unit, 7);
  const blank = Math.random() < 0.5;
  const idx = blank ? 2 + Math.floor(Math.random() * 4) : 6;
  return build(seq, idx, pool, blank);
}

function numberOptions(answer: number, step: number): { options: ChoiceQ['options']; id: string } {
  const set = new Set<number>([answer]);
  [answer + step, answer - step, answer + 1, answer - 1, answer + 2].forEach((v) => { if (v >= 0 && set.size < 3) set.add(v); });
  const list = shuffle([...set]);
  return { options: list.map((v, i) => ({ id: `o${i}`, label: toAr(v) })), id: `o${list.indexOf(answer)}` };
}

/** المستوى 3: أنماط أعداد (زيادة/نقصان) أو خاصيتان معًا */
export function patternLevel3(): ChoiceQ {
  const type = pickOne(['up', 'down', 'both'] as const);
  if (type === 'both') {
    const [s1, s2] = sample(SHAPE_KEYS, 2); const [c1, c2, c3] = sample(COLOR_KEYS, 3);
    const seq: Token[] = Array.from({ length: 7 }, (_, i) => S(i % 2 ? s2 : s1, [c1, c2, c3][i % 3]));
    const answer = seq[6];
    const wrong = shuffle([S(s1, c2), S(s2, c3), S(s2, c1), S(s1, c3)].filter((t) => t !== answer)).slice(0, 2);
    const opts = shuffle([answer, ...wrong]);
    return {
      type: 'choice', id: uid(), prompt: PROMPT_SHAPE,
      hint: 'الشَّكْلُ يَتَغَيَّرُ بِطَرِيقَةٍ، وَاللَّوْنُ يَتَغَيَّرُ بِطَرِيقَةٍ أُخْرَى.',
      sequence: seq.slice(0, 6),
      options: opts.map((t, i) => ({ id: `o${i}`, visual: t })), answer: `o${opts.indexOf(answer)}`,
    };
  }
  const step = pickOne([1, 2, 3, 5, 10]);
  const start = type === 'up' ? Math.floor(Math.random() * 6) : step * 5 + Math.floor(Math.random() * 3);
  const nums = Array.from({ length: 5 }, (_, i) => (type === 'up' ? start + step * i : start - step * i));
  const answer = nums[4];
  const o = numberOptions(answer, step);
  const blank = Math.random() < 0.4;
  const idx = blank ? 1 + Math.floor(Math.random() * 3) : 4;
  const ans = nums[idx];
  const oo = numberOptions(ans, step);
  return {
    type: 'choice', id: uid(),
    prompt: 'أَيُّ عَدَدٍ يُكْمِلُ النَّمَطَ؟',
    hint: type === 'up' ? 'اُنْظُرْ كَمْ يَزِيدُ الْعَدَدُ فِي كُلِّ خُطْوَةٍ.' : 'اُنْظُرْ كَمْ يَنْقُصُ الْعَدَدُ فِي كُلِّ خُطْوَةٍ.',
    sequence: blank ? nums.map((n, i) => (i === idx ? '?' : `num:${toAr(n)}`)) : nums.slice(0, 4).map((n) => `num:${toAr(n)}`),
    options: blank ? oo.options : o.options, answer: blank ? oo.id : o.id,
  };
}
