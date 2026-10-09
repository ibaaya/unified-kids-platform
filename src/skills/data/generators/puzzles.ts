// مولّدات ألغاز الصور: الاختلاف، الانتماء، الفرق بين صفّين، العدّ
import type { ChoiceQ, Token } from '../types';
import { shuffle, sample, pickOne, toAr } from '../kit';

export const PICTURE_CATEGORIES: Record<string, Token[]> = {
  fruits:   ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍐'],
  animals:  ['🐱', '🐶', '🐪', '🐑', '🐄', '🐴', '🐘'],
  vehicles: ['🚗', '✈️', '🚲', '🚂', '🚌', '⛵'],
  clothes:  ['👕', '🧥', '👟', '🧢', '👖'],
  birds:    ['🐦', '🦅', '🦆', '🦉', '🐓'],
  sea:      ['🐟', '🐠', '🐙', '🐳', '🦀'],
  school:   ['✏️', '📘', '📏', '🎒', '🖍️'],
};
const CAT_KEYS = Object.keys(PICTURE_CATEGORIES);
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 7)}`;

const asOptions = (tokens: Token[]) => tokens.map((t, i) => ({ id: `o${i}`, visual: t }));

/** أي صورة تختلف عن الباقي؟ ثلاث صور من مجموعة وواحدة من مجموعة أخرى */
export function generateOddOneOut(): ChoiceQ {
  const [a, b] = sample(CAT_KEYS, 2);
  const odd = pickOne(PICTURE_CATEGORIES[b]);
  const same = sample(PICTURE_CATEGORIES[a], 3);
  const tokens = shuffle([...same, odd]);
  return {
    type: 'choice', id: uid('odd'),
    prompt: 'أَيُّ صُورَةٍ تَخْتَلِفُ عَنِ الصُّوَرِ الْأُخْرَى؟',
    options: asOptions(tokens), answer: `o${tokens.indexOf(odd)}`,
    hint: 'اُنْظُرْ إِلَى الصُّوَرِ: ثَلَاثٌ مِنْهَا مِنْ نَفْسِ النَّوْعِ.',
  };
}

/** أي صورة تنتمي إلى هذه المجموعة؟ */
export function generateBelongs(): ChoiceQ {
  const a = pickOne(CAT_KEYS);
  const pool = PICTURE_CATEGORIES[a];
  const rows = sample(pool, 3);
  const member = pickOne(pool.filter((p) => !rows.includes(p)));
  const others = sample(CAT_KEYS.filter((k) => k !== a), 3).map((k) => pickOne(PICTURE_CATEGORIES[k]));
  const tokens = shuffle([member, ...others]);
  return {
    type: 'choice', id: uid('bel'),
    prompt: 'أَيُّ صُورَةٍ تَنْتَمِي إِلَى هَذِهِ الْمَجْمُوعَةِ؟',
    pictureRows: [rows],
    options: asOptions(tokens), answer: `o${tokens.indexOf(member)}`,
  };
}

/** أي صورة ظهرت في الصف الثاني ولم تكن في الصف الأول؟ */
export function generateDifference(): ChoiceQ {
  const all = shuffle(Object.values(PICTURE_CATEGORIES).flat());
  const n = 5;
  const rowA = all.slice(0, n);
  const idx = Math.floor(Math.random() * n);
  const newItem = all[n];
  const rowB = rowA.map((t, i) => (i === idx ? newItem : t));
  const extras = all.slice(n + 1, n + 3);
  const tokens = shuffle([newItem, rowA[idx], ...extras]);
  return {
    type: 'choice', id: uid('diff'),
    prompt: 'أَيُّ صُورَةٍ ظَهَرَتْ فِي الصَّفِّ الثَّانِي وَلَمْ تَكُنْ فِي الصَّفِّ الْأَوَّلِ؟',
    pictureRows: [rowA, rowB],
    options: asOptions(tokens), answer: `o${tokens.indexOf(newItem)}`,
  };
}

const COUNTABLE: [Token, string][] = [
  ['🍎', 'التُّفَّاحَاتِ'], ['⭐', 'النُّجُومِ'], ['🐟', 'الْأَسْمَاكِ'],
  ['🎈', 'الْبَالُونَاتِ'], ['🐦', 'الْعَصَافِيرِ'], ['🌹', 'الْوُرُودِ'],
];

/** عدّ عنصر محدد بين عناصر مختلفة */
export function generateCount(max = 6): ChoiceQ {
  const [target, name] = pickOne(COUNTABLE);
  const n = 2 + Math.floor(Math.random() * (max - 1));
  const fillers = sample(COUNTABLE.map((c) => c[0]).filter((t) => t !== target), 3);
  const row: Token[] = [...Array(n).fill(target)];
  for (let i = 0; i < 4; i++) row.push(pickOne(fillers));
  const nums = new Set<number>([n]);
  [n + 1, n - 1, n + 2, n - 2].forEach((v) => { if (v >= 1 && nums.size < 4) nums.add(v); });
  const list = shuffle([...nums]);
  return {
    type: 'choice', id: uid('cnt'),
    prompt: `كَمْ عَدَدُ ${name}؟`,
    pictureRows: [shuffle(row)],
    options: list.map((v, i) => ({ id: `o${i}`, label: toAr(v) })),
    answer: `o${list.indexOf(n)}`,
    hint: 'عُدَّ الصُّوَرَ وَاحِدَةً وَاحِدَةً، وَلَا تَعُدَّ غَيْرَ الْمَطْلُوبِ.',
  };
}
