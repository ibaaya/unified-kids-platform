// src/skills/data/kit.ts
// أدوات مساعدة لكتابة الأسئلة بسرعة وبشكل موحّد
import type { ChoiceQ, OrderQ, Opt, Token } from './types';

export const COLORS = {
  red:    { hex: '#ef4444', name: 'أَحْمَرُ' },
  blue:   { hex: '#3b82f6', name: 'أَزْرَقُ' },
  yellow: { hex: '#facc15', name: 'أَصْفَرُ' },
  green:  { hex: '#22c55e', name: 'أَخْضَرُ' },
  orange: { hex: '#fb923c', name: 'بُرْتُقَالِيٌّ' },
  purple: { hex: '#a855f7', name: 'بَنَفْسَجِيٌّ' },
  pink:   { hex: '#f472b6', name: 'وَرْدِيٌّ' },
  brown:  { hex: '#92400e', name: 'بُنِّيٌّ' },
} as const;
export type ColorKey = keyof typeof COLORS;

export const SHAPES = {
  circle:   'دَائِرَةٌ',
  square:   'مُرَبَّعٌ',
  triangle: 'مُثَلَّثٌ',
  star:     'نَجْمَةٌ',
  heart:    'قَلْبٌ',
  diamond:  'مُعَيَّنٌ',
  hexagon:  'سُدَاسِيٌّ',
  crescent: 'هِلَالٌ',
  oval:     'بَيْضَوِيٌّ',
  rect:     'مُسْتَطِيلٌ',
} as const;
export type ShapeKey = keyof typeof SHAPES;

/** رمز شكل ملوّن */
export const S = (shape: ShapeKey, color: ColorKey | string): Token =>
  `shape:${shape}:${color in COLORS ? COLORS[color as ColorKey].hex : color}`;
/** رمز عيّنة لون */
export const SW = (hex: string): Token => `color:${hex}`;

export const toAr = (n: number): string =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export function shuffle<T>(a: readonly T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
export const sample = <T,>(a: readonly T[], n: number): T[] => shuffle(a).slice(0, n);
export const pickOne = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

/** يسحب n سؤالًا عشوائيًا من البنك (أو كلّه إن كان أصغر) */
export const draw = <T,>(bank: readonly T[], n = 5): T[] => sample(bank, Math.min(n, bank.length));

export const o = (id: string, label?: string, visual?: Token, scale?: number): Opt => ({ id, label, visual, scale });

type Extra = Partial<Omit<ChoiceQ, 'type' | 'id' | 'prompt' | 'options' | 'answer'>>;

/** سؤال اختيار نصّي: labels مشكَّلة، correct = رقم الإجابة الصحيحة */
export function choice(id: string, prompt: string, labels: string[], correct: number, extra: Extra = {}): ChoiceQ {
  return {
    type: 'choice', id, prompt,
    options: labels.map((l, i) => ({ id: `o${i}`, label: l })),
    answer: `o${correct}`, ...extra,
  };
}
/** سؤال اختيار بالصور: كل عنصر [صورة, نص اختياري] */
export function vchoice(id: string, prompt: string, items: [Token, string?][], correct: number, extra: Extra = {}): ChoiceQ {
  return {
    type: 'choice', id, prompt,
    options: items.map(([v, l], i) => ({ id: `o${i}`, visual: v, label: l })),
    answer: `o${correct}`, ...extra,
  };
}
/** اختيار متعدد: correct = أرقام كل الإجابات الصحيحة */
export function multi(id: string, prompt: string, items: [string, Token?][], correct: number[], extra: Extra = {}): ChoiceQ {
  return {
    type: 'choice', id, prompt, multi: true,
    options: items.map(([l, v], i) => ({ id: `o${i}`, label: l, visual: v })),
    answer: correct.map((i) => `o${i}`), ...extra,
  };
}
/** سؤال ترتيب: العناصر بالترتيب الصحيح؛ كل عنصر نص، أو [نص, صورة]، أو [undefined, صورة, حجم] */
export function order(
  id: string, prompt: string,
  items: (string | [string, Token] | [undefined, Token, number])[],
  extra: Partial<OrderQ> = {},
): OrderQ {
  return {
    type: 'order', id, prompt,
    items: items.map((it, i) =>
      typeof it === 'string'
        ? { id: `i${i}`, label: it }
        : { id: `i${i}`, label: it[0], visual: it[1], scale: (it as [undefined, Token, number])[2] }),
    ...extra,
  };
}
