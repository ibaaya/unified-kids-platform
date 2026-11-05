// مولّدات الأسئلة: كل سؤال عشوائي حتى لا يحفظ الطفل الإجابات. أضف نوعًا جديدًا بإضافة دالة واحدة.
import { NAMES } from "./arabic";
export type Opt = { value: string | number; count?: number; label?: string };
export type Q = { prompt: string; say?: string; big?: number; groups?: number[]; emoji?: string; options: Opt[]; answer: string | number; skill: string; num?: number };
const comparisonOptions = (): Opt[] => shuffle([
  { value: "<", label: "أصغر من" },
  { value: ">", label: "أكبر من" },
  { value: "=", label: "يساوي" },
]);
const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const shuffle = <T,>(items: T[]) => { const result = [...items]; for (let i = result.length - 1; i > 0; i -= 1) { const j = r(0, i); [result[i], result[j]] = [result[j], result[i]]; } return result; };
const nums = (ans: number, lo: number, hi: number, k = 4) => { const s = new Set([ans]); k = Math.min(k, hi - lo + 1); while (s.size < k) s.add(r(lo, hi)); return shuffle([...s]); };
const numOpts = (v: number[]): Opt[] => v.map((x) => ({ value: x }));
type Gen = (lo: number, hi: number) => Q;
const recognize: Gen = (lo, hi) => { const n = r(lo, hi); return { prompt: "مَا هَذَا الرَّقْمُ؟", big: n, options: numOpts(nums(n, lo, hi)), answer: n, skill: "recognize", num: n }; };
const hear: Gen = (lo, hi) => { const n = r(lo, hi); const t = `أَيْنَ الرَّقْمُ ${NAMES[n]}؟`; return { prompt: t, say: t, options: numOpts(nums(n, lo, hi)), answer: n, skill: "hear", num: n }; };
const count: Gen = (lo, hi) => { const n = r(lo, hi); return { prompt: "كَمْ عَدَدُ الْأَشْيَاءِ؟", groups: [n], options: numOpts(nums(n, Math.max(1, lo - 3), Math.min(20, hi + 3))), answer: n, skill: "count", num: n }; };
const matchQty: Gen = (lo, hi) => { const n = r(lo, hi); return { prompt: "اخْتَرِ الْمَجْمُوعَةَ الَّتِي تُمَثِّلُ الرَّقْمَ", big: n, options: nums(n, lo, hi, 3).map((c) => ({ value: c, count: c })), answer: n, skill: "count", num: n }; };
const compare: Gen = (lo, hi) => {
  let a = r(lo, hi), b = r(lo, hi);
  while (a === b) b = r(lo, hi);

  return {
    prompt: "مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟",
    // ✅ نطق محايد لا يكشف الإجابة
    say: `قَارِنْ بَيْنَ ${NAMES[a]} وَ ${NAMES[b]}`,
    groups: [a, b],
    emoji: "⭐",
    options: comparisonOptions(),
    answer: a > b ? ">" : "<",
    skill: "compare",
  };
};
const equalCompare: Gen = (lo, hi) => {
  const a = r(lo, hi);
  return {
    prompt: "مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟",
    // ✅ نطق محايد
    say: `قَارِنْ بَيْنَ ${NAMES[a]} وَ ${NAMES[a]}`,
    groups: [a, a],
    emoji: "⭐",
    options: comparisonOptions(),
    answer: "=",
    skill: "compare",
  };
};
const neighbors: Gen = () => { const n = r(2, 19); const after = Math.random() < 0.5; const t = after ? `مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${NAMES[n]}؟` : `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${NAMES[n]}؟`;
  return { prompt: t, say: t, options: numOpts(nums(after ? n + 1 : n - 1, 1, 20)), answer: after ? n + 1 : n - 1, skill: "neighbors", num: n }; };
const add: Gen = () => { const a = r(1, 5), b = r(1, 4); return { prompt: `${a} + ${b} = ؟`, say: `${NAMES[a]} زَائِدُ ${NAMES[b]} يُسَاوِي كَمْ؟`, groups: [a, b], options: numOpts(nums(a + b, 2, 10)), answer: a + b, skill: "add" }; };
const missing: Gen = () => { const s = r(1, 16), h = r(1, 3), seq = [0, 1, 2, 3, 4].map((i) => s + i); return { prompt: `أَكْمِلْ: ${seq.map((x, i) => (i === h ? "؟" : x)).join(" – ")}`, say: "أَيُّ رَقْمٍ نَاقِص؟", options: numOpts(nums(seq[h], 1, 20)), answer: seq[h], skill: "missing" }; };
const bigger: Gen = () => { const a = r(1, 20); let b = r(1, 20); while (b === a) b = r(1, 20); return { prompt: "أَيُّ الْعَدَدَيْنِ أَكْبَرُ؟", options: numOpts(shuffle([a, b])), answer: Math.max(a, b), skill: "bigger" }; };
const oddeven: Gen = () => { const n = r(1, 20); return { prompt: `هَلِ الرَّقْمُ ${n} زَوْجِيٌّ أَمْ فَرْدِيٌّ؟`, say: `هَلِ الرَّقْمُ ${NAMES[n]} زَوْجِيٌّ أَمْ فَرْدِيٌّ؟`, options: shuffle([{ value: "even", label: "زَوْجِيّ" }, { value: "odd", label: "فَرْدِيّ" }]), answer: n % 2 ? "odd" : "even", skill: "oddeven", num: n }; };
const ADD_ITEMS = [{ plural: "تُفَّاحَاتٍ", singular: "تُفَّاحَةً", emoji: "🍎" }, { plural: "نُجُومٍ", singular: "نَجْمَةً", emoji: "⭐" }, { plural: "كُرَاتٍ", singular: "كُرَةً", emoji: "⚽" }];
const additionQuestion = (pool: number[], upper: number, style: number, requestedPair?: [number, number]): Q => {
  const valid = pool.filter((n) => n >= 1 && n <= upper); const pairs: [number, number][] = [];
  for (const a of valid) for (const b of valid) if (a + b <= upper) pairs.push([a, b]);
  const [a, b] = requestedPair ?? (pairs.length ? pairs[r(0, pairs.length - 1)] : [1, 1]); const sum = a + b; const item = ADD_ITEMS[style % ADD_ITEMS.length];
  if (style === 1) return { prompt: `مَعَ سَارَةَ ${NAMES[a]} ${item.plural}، وَأَضَافَتْ إِلَيْهَا ${NAMES[b]} ${item.plural}. كَمْ ${item.singular} أَصْبَحَتْ؟`, say: `مَعَ سَارَةَ ${NAMES[a]} ${item.plural}، وَأَضَافَتْ إِلَيْهَا ${NAMES[b]} ${item.plural}. كَمْ أَصْبَحَ الْعَدَدُ؟`, groups: [a, b], emoji: item.emoji, options: numOpts(nums(sum, 1, 20)), answer: sum, skill: "add", num: a };
  if (style === 2) return { prompt: `أَكْمِلِ الْجَمْعَ: كَمْ ${item.plural} نُضِيفُ؟`, say: `${NAMES[a]} زَائِدُ كَمْ يُسَاوِي ${NAMES[sum]}؟`, big: sum, groups: [a], emoji: item.emoji, options: numOpts(nums(b, 1, upper)), answer: b, skill: "add", num: a };
  if (style === 3) return { prompt: "اِخْتَرِ الْعَمَلِيَّةَ الَّتِي تُسَاوِي الْعَدَدَ الْمَطْلُوبَ", say: `مَا الْعَمَلِيَّةُ الَّتِي نَاتِجُهَا ${NAMES[sum]}؟`, big: sum, options: expressionOptions(a, b, upper), answer: `${a} + ${b}`, skill: "add", num: a };
  if (style === 4) return { prompt: `بَدَأْنَا بِـ ${NAMES[a]} ${item.plural}، ثُمَّ أَضَفْنَا ${NAMES[b]} ${item.plural}. كَمْ أَصْبَحَ الْمَجْمُوعُ؟`, say: `${NAMES[a]} زَائِدُ ${NAMES[b]} يُسَاوِي كَمْ؟`, groups: [a, b], emoji: item.emoji, options: numOpts(nums(sum, 1, 20)), answer: sum, skill: "add", num: a };
  if (style === 5) return { prompt: `اِجْمَعِ الْمَجْمُوعَتَيْنِ مِنَ ${item.plural} بِالصُّوَرِ`, say: `${NAMES[a]} زَائِدُ ${NAMES[b]} يُسَاوِي كَمْ؟`, groups: [a, b], emoji: item.emoji, options: numOpts(nums(sum, 1, 20)), answer: sum, skill: "add", num: a };
  if (style === 6) return { prompt: `عَدَدُ ${item.plural}: ${a} + ${b} = ؟`, say: `${NAMES[a]} زَائِدُ ${NAMES[b]} يُسَاوِي كَمْ؟`, groups: [a, b], emoji: item.emoji, options: numOpts(nums(sum, 1, 20)), answer: sum, skill: "add", num: a };
  return { prompt: `لَدَى لَيْلَى ${NAMES[a]} ${item.plural}، وَحَصَلَتْ عَلَى ${NAMES[b]} ${item.plural} أُخْرَى. كَمْ أَصْبَحَ عَدَدُهَا؟`, say: `${NAMES[a]} زَائِدُ ${NAMES[b]} يُسَاوِي كَمْ؟`, groups: [a, b], emoji: item.emoji, options: numOpts(nums(sum, 1, 20)), answer: sum, skill: "add", num: a };
};
function expressionOptions(a: number, b: number, upper: number): Opt[] {
  const candidates = [`${a} + ${b}`];
  for (let x = 1; x <= upper; x += 1) {
    for (let y = 1; y <= upper - x; y += 1) {
      // لا تعرض عملية صحيحة ثانية لمجرد تبديل ترتيب العددين.
      if (x + y === a + b) continue;
      const label = `${x} + ${y}`;
      if (!candidates.includes(label)) candidates.push(label);
    }
  }
  return shuffle(candidates.slice(0, 4)).map((label) => ({ value: label, label }));
}
export function makeAdditionSet(learned: number[] = [], size = 10): Q[] {
  const maxLearned = learned.length ? Math.max(...learned) : 0; const activeUpper = maxLearned <= 5 ? 5 : maxLearned <= 10 ? 10 : maxLearned <= 15 ? 15 : 20;
  const pool = Array.from({ length: activeUpper }, (_, i) => i + 1);
  // صعّد الناتج خطوة خطوة: ٢، ٣، ... حتى سقف المرحلة، مع تدوير الأنماط القصصية.
  return Array.from({ length: size }, (_, i) => {
    const targetSum = Math.min(activeUpper, 2 + Math.floor(i * Math.max(0, activeUpper - 2) / Math.max(1, size - 1)));
    const pairs = pool.flatMap((a) => pool.filter((b) => a + b === targetSum).map((b) => [a, b] as [number, number]));
    return ensureAnswerOption(additionQuestion(pool, activeUpper, i % 7, pairs.length ? pairs[i % pairs.length] : [1, 1]));
  });
}
const subtractionQuestion = (pool: number[], style: number, requestedStart?: number): Q => {
  const starts = pool.filter((n) => n > 1); const a = requestedStart ?? (starts.length ? starts[Math.floor(style / 5) % starts.length] : 2);
  const choices = pool.filter((n) => n > 0 && n < a); const b = choices.length ? choices[style % choices.length] : 1; const result = a - b; const item = ADD_ITEMS[style % ADD_ITEMS.length];
  const upper = Math.max(...pool); const optionsFor = (answer: number) => numOpts(nums(answer, Math.max(0, answer - 4), Math.min(upper, answer + 4)));
  if (style % 5 === 1) return { prompt: `مَعَ عُمَرَ ${NAMES[a]} ${item.plural}، أَعْطَى مِنْهَا ${NAMES[b]}. كَمْ ${item.singular} بَقِيَتْ؟`, say: `${NAMES[a]} نَاقِصُ ${NAMES[b]} يُسَاوِي كَمْ؟`, groups: [a, b], emoji: item.emoji, options: optionsFor(result), answer: result, skill: "subtract", num: a };
  if (style % 5 === 2) return { prompt: `أَكْمِلِ الطَّرْحَ: كَمْ مِنَ ${item.plural} نَأْخُذُ؟`, say: `${NAMES[a]} نَاقِصُ كَمْ يُسَاوِي ${NAMES[result]}؟`, big: a, options: optionsFor(b), answer: b, skill: "subtract", num: a };
  if (style % 5 === 3) return { prompt: `لَدَيْنَا ${NAMES[a]} ${item.plural}، وَأَخَذْنَا مِنْهَا ${NAMES[b]}. كَمْ بَقِيَ؟`, say: `${NAMES[a]} نَاقِصُ ${NAMES[b]} يُسَاوِي كَمْ؟`, groups: [a, b], emoji: item.emoji, options: optionsFor(result), answer: result, skill: "subtract", num: a };
  if (style % 5 === 4) return { prompt: `لَدَيْنَا ${NAMES[a]} ${item.plural}، وَنُرِيدُ أَنْ يَبْقَى ${NAMES[result]}. كَمْ نَأْخُذُ؟`, say: `${NAMES[a]} نَاقِصُ كَمْ يُسَاوِي ${NAMES[result]}؟`, options: optionsFor(b), answer: b, skill: "subtract", num: a };
  return { prompt: `عَدَدُ ${item.plural}: ${a} − ${b} = ؟`, say: `${NAMES[a]} نَاقِصُ ${NAMES[b]} يُسَاوِي كَمْ؟`, groups: [a, b], emoji: item.emoji, options: optionsFor(result), answer: result, skill: "subtract", num: a };
};
export function makeSubtractionSet(learned: number[] = [], size = 10): Q[] {
  const maxLearned = learned.length ? Math.max(...learned) : 0; const activeUpper = maxLearned <= 5 ? 5 : maxLearned <= 10 ? 10 : maxLearned <= 15 ? 15 : 20;
  const pool = Array.from({ length: activeUpper }, (_, i) => i + 1);
  // ابدأ بطرح أعداد صغيرة، ثم ارفع العدد الذي نبدأ به تدريجيًا.
  return Array.from({ length: size }, (_, i) => {
    const start = Math.min(activeUpper, 2 + Math.floor(i * Math.max(0, activeUpper - 2) / Math.max(1, size - 1)));
    return ensureAnswerOption(subtractionQuestion(pool, i, Math.max(2, start)));
  });
}
const TOPICS: Record<string, Gen[]> = { missing: [missing], bigger: [bigger], oddeven: [oddeven], count: [count, matchQty], compare: [compare], neighbors: [neighbors], add: [add], subtract: [() => subtractionQuestion(Array.from({ length: 20 }, (_, i) => i + 1), 0)], hear: [hear], final: [recognize, hear, count, matchQty, compare, neighbors, add] };
function ensureAnswerOption(q: Q): Q {
  const answerKey = String(q.answer);
  const exists = q.options.some((o) => String(o.value) === answerKey);
  if (exists) return q;
  const options = [...q.options];
  if (options.length === 0) options.push({ value: q.answer });
  else options[options.length - 1] = { value: q.answer };
  return { ...q, options: shuffle(options) };
}

export const makeSet = (topic: string, size = 7, learned: number[] = []): Q[] => {
  if (topic === "add") return makeAdditionSet(learned, size);
  if (topic === "subtract") return makeSubtractionSet(learned, size);
  if (topic === "compare") return shuffle([...Array.from({ length: Math.max(0, size - 2) }, () => ensureAnswerOption(compare(1, 20))), ensureAnswerOption(equalCompare(1, 20)), ensureAnswerOption(equalCompare(1, 20))]);
  const g = TOPICS[topic] ?? [recognize]; return Array.from({ length: size }, (_, i) => ensureAnswerOption(g[i % g.length](1, 20)));
};
export type FinalLevel = 0 | 1 | 2;

// مولّد الاختبار الكبير: 10 أسئلة مختلفة في كل مستوى، مع ضمان عدم تكرار
// السؤال نفسه (النص + الإجابة) داخل المستوى. تستخدم الصفحة النهائية makeFinalSets
// مرة واحدة لضمان عدم تكرار السؤال نفسه بين المستويات أيضًا.
const finalQuestionSignature = (q: Q) => `${q.prompt}|${String(q.answer)}|${q.skill}|${q.big ?? ""}|${(q.groups ?? []).join(",")}`;

function finalLevelQuestion(level: FinalLevel, index: number): Q {
  const easy = index + 1;
  const medium = [11, 12, 13, 14, 15, 6, 7, 8, 9, 10][index];
  const hard = [16, 17, 18, 19, 20, 11, 12, 13, 14, 15][index];
  const n = level === 0 ? easy : level === 1 ? medium : hard;
  const options = (answer: number, upper = 20): Opt[] => numOpts(nums(answer, Math.max(0, answer - 3), Math.min(upper, answer + 3)));
  if (level === 0) {
    switch (index % 5) {
      case 0: return { prompt: "مَا هَذَا الرَّقْمُ؟", big: n, options: options(n, 10), answer: n, skill: "recognize", num: n };
      case 1: return { prompt: "كَمْ عَدَدُ الْأَشْيَاءِ؟", groups: [n], emoji: "🍎", options: options(n, 10), answer: n, skill: "count", num: n };
      case 2: { const prompt = `أَيْنَ الرَّقْمُ ${NAMES[n]}؟`; return { prompt, say: prompt, options: options(n, 10), answer: n, skill: "hear", num: n }; }
      case 3: return { prompt: `مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${NAMES[n]}؟`, say: `مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${NAMES[n]}؟`, options: options(n + 1, 11), answer: n + 1, skill: "neighbors", num: n };
      default: return { prompt: `اخْتَرِ الْمَجْمُوعَةَ الَّتِي تُمَثِّلُ الرَّقْمَ ${NAMES[n]}`, big: n, options: nums(n, 1, 10, 4).map((v) => ({ value: v, count: v })), answer: n, skill: "count", num: n };
    }
  }
  if (level === 1) {
    switch (index % 5) {
      case 0: return { prompt: `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${NAMES[n]}؟`, say: `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${NAMES[n]}؟`, options: options(n - 1, 15), answer: n - 1, skill: "neighbors", num: n };
      case 1: return { prompt: `أَكْمِلِ التَّسَلْسُلَ: ${n - 1}، ؟، ${n + 1}`, say: "أَكْمِلِ التَّسَلْسُلَ، مَا الرَّقْمُ النَّاقِصُ؟", options: options(n, 15), answer: n, skill: "missing", num: n };
      case 2: return { prompt: "مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟", say: `مَا الْعَلَامَةُ الصَّحِيحَةُ؟ ${NAMES[n]} أَكْبَرُ مِنْ ${NAMES[n - 2]}؟`, groups: [n, n - 2], options: comparisonOptions(), answer: ">", skill: "compare", num: n };
      case 3: return { prompt: `لَدَيْنَا ${NAMES[n - 4]} تُفَّاحَاتٍ، وَأَضَفْنَا ${NAMES[4]}. كَمْ أَصْبَحَ الْعَدَدُ؟`, say: `${NAMES[n - 4]} زَائِدُ أَرْبَعَةٍ، كَمْ يُسَاوِي؟`, groups: [n - 4, 4], emoji: "🍎", options: options(n, 15), answer: n, skill: "add", num: n };
      default: return { prompt: `مَا الرَّقْمُ الَّذِي تُمَثِّلُهُ الْمَجْمُوعَةُ: ${NAMES[n - 5]} + ${NAMES[5]}؟`, say: `${NAMES[n - 5]} زَائِدُ خَمْسَةٍ، كَمْ يُسَاوِي؟`, groups: [n - 5, 5], options: options(n, 15), answer: n, skill: "add", num: n };
    }
  }
  switch (index % 5) {
    case 0: return { prompt: `أَكْمِلِ الْعَمَلِيَّةَ: ${n - 4} + 6 − 2 = ؟`, say: `${NAMES[n - 4]} زَائِدُ سِتَّةٍ، ثُمَّ نَاقِصُ اثْنَيْنِ. كَمْ يُسَاوِي؟`, options: options(n, 20), answer: n, skill: "add", num: n };
    case 1: return { prompt: `مَا الْعَدَدُ النَّاقِصُ؟ ${n - 2}، ${n - 1}، ؟، ${n + 1}`, say: "مَا الْعَدَدُ النَّاقِصُ فِي التَّرْتِيبِ؟", options: options(n, 20), answer: n, skill: "missing", num: n };
    case 2: return { prompt: "مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟", say: `قَارِنْ بَيْنَ ${NAMES[n]} وَ ${NAMES[n + 1]}`, groups: [n, n + 1], options: comparisonOptions(), answer: "<", skill: "compare", num: n };
    case 3: return { prompt: `كَانَ مَعَ سَارَةَ ${NAMES[n - 3]} نَجْمَاتٍ، وَأَضَافَتْ إِلَيْهَا ${NAMES[3]}. كَمْ أَصْبَحَ الْعَدَدُ؟`, say: `${NAMES[n - 3]} زَائِدُ ثَلَاثَةٍ، كَمْ يُسَاوِي؟`, groups: [n - 3, 3], emoji: "⭐", options: options(n, 20), answer: n, skill: "add", num: n };
    default: return { prompt: `قَفَزَ الْأَرْنَبُ مِنَ ${n - 3} ثَلَاثَ قَفَزَاتٍ. إِلَى أَيِّ رَقْمٍ وَصَلَ؟`, say: `بَدَأَ مِنْ ${NAMES[n - 3]}، وَقَفَزَ ثَلَاثَ قَفَزَاتٍ. أَيْنَ وَصَلَ؟`, options: options(n, 20), answer: n, skill: "numberline", num: n };
  }
}

function generateUniqueFinal(level: FinalLevel, size: number, used = new Set<string>()): Q[] {
  return Array.from({ length: size }, (_, index) => {
    const q = finalLevelQuestion(level, index);
    const signature = finalQuestionSignature(q);
    if (used.has(signature)) throw new Error(`Duplicate final-exam question: ${signature}`);
    used.add(signature);
    return ensureAnswerOption(q);
  });
}

export function makeFinalSet(level: FinalLevel, size = 10): Q[] {
  return generateUniqueFinal(level, size);
}

export function makeFinalSets(size = 10): [Q[], Q[], Q[]] {
  const used = new Set<string>();
  return [
    generateUniqueFinal(0, size, used),
    generateUniqueFinal(1, size, used),
    generateUniqueFinal(2, size, used),
  ];
}

// أسئلة درس رقم واحد
export const learnSet = (n: number, size = 7): Q[] => {
  const lo = Math.max(1, n - 3), hi = Math.min(20, n + 3);
  const targetOptions = () => numOpts(nums(n, lo, hi));
  const before = n > 1 ? n - 1 : 0;
  const after = n < 20 ? n + 1 : n - 1;
  const adjacentOptions = (answer: number) => numOpts(nums(answer, n === 1 ? 0 : Math.max(1, answer - 3), Math.min(20, answer + 3)));
  const groups = [n];
  for (let distance = 1; groups.length < 4 && distance <= 20; distance += 1) {
    for (const candidate of [n - distance, n + distance]) if (candidate >= 1 && candidate <= 20 && !groups.includes(candidate)) groups.push(candidate);
  }
  const compareA = Math.max(1, n - 1);
  const compareB = Math.min(20, n + 2);
  const base: Q[] = [
    count(n, n),
    { ...recognize(lo, hi), big: n, options: targetOptions(), answer: n, num: n },
    { ...hear(n, n), options: targetOptions(), answer: n },
    { prompt: n === 1 ? "مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ١؟" : "مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ هَذَا الرَّقْمِ؟", say: n === 1 ? "مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ وَاحِد؟" : `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${NAMES[n]}؟`, big: n, options: n === 1 ? numOpts([0, 1, 2, 3]) : adjacentOptions(before), answer: before, skill: "neighbors", num: n },
    { prompt: n < 20 ? "مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ هَذَا الرَّقْمِ؟" : "مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ هَذَا الرَّقْمِ؟", say: n < 20 ? `مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${NAMES[n]}؟` : `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${NAMES[n]}؟`, big: n, options: adjacentOptions(after), answer: after, skill: "neighbors", num: n },
    { prompt: "اخْتَرِ الْمَجْمُوعَةَ الَّتِي تُمَثِّلُ هَذَا الرَّقْمَ", big: n, options: shuffle(groups).map((c) => ({ value: c, count: c })), answer: n, skill: "count", num: n },
    { prompt: `${NAMES[n < 20 ? n : n - 1]} + ${NAMES[1]} = ؟`, say: `${NAMES[n < 20 ? n : n - 1]} + ${NAMES[1]} = ؟`, groups: [n < 20 ? n : n - 1, 1], options: numOpts(nums(Math.min(20, n + 1), 1, 20)), answer: Math.min(20, n + 1), skill: "add", num: n },
    { prompt: `${NAMES[Math.min(20, n + 2)]} − ${NAMES[1]} = ؟`, say: `${NAMES[Math.min(20, n + 2)]} − ${NAMES[1]} = ؟`, groups: [Math.min(20, n + 2), 1], options: numOpts(nums(Math.min(20, n + 1), 1, Math.min(20, n + 4))), answer: Math.min(20, n + 1), skill: "subtract", num: n },
    { prompt: `أَيُّ الْعَدَدَيْنِ أَكْبَرُ: ${NAMES[compareA]} أَمْ ${NAMES[compareB]}؟`, options: numOpts(shuffle([compareA, compareB])), answer: Math.max(compareA, compareB), skill: "bigger", num: n },
    { prompt: "مَا الْعَلَامَةُ الصَّحِيحَةُ الَّتِي يَجِبُ وَضْعُهَا؟", say: `مَا الْعَلَامَةُ الصَّحِيحَةُ؟ ${NAMES[compareA]} أَصْغَرُ مِنْ ${NAMES[compareB]}؟`, groups: [compareA, compareB], options: comparisonOptions(), answer: "<", skill: "compare", num: n },
  ];
  return Array.from({ length: Math.max(1, size) }, (_, i) => ensureAnswerOption(base[i % base.length]));
};

// مراجعة ختامية مركزة لأرقام المرحلة: تعرّف، استماع، تسلسل، قبل/بعد، مقارنة وعدّ.
export const rangeChallengeSet = (lo: number, hi: number, size = 7): Q[] => {
  const pick = () => r(lo, hi);
  const options = (answer: number) => numOpts(nums(answer, lo, hi));
  const base: Q[] = [
    (() => { const n = pick(); return { prompt: "مَا هَذَا الرَّقْمُ؟", big: n, options: options(n), answer: n, skill: "recognize", num: n }; })(),
    (() => { const n = pick(); return { prompt: `أَيْنَ الرَّقْمُ ${NAMES[n]}؟`, say: `أَيْنَ الرَّقْمُ ${NAMES[n]}؟`, options: options(n), answer: n, skill: "hear", num: n }; })(),
    (() => { const n = pick(); return { prompt: "كَمْ عَدَدُ الْأَشْيَاءِ؟", groups: [n], options: options(n), answer: n, skill: "count", num: n }; })(),
    (() => { const start = r(lo, Math.max(lo, hi - 2)); const seq = [start,start+1,start+2]; const missing = r(0,2); return { prompt: `أَكْمِلِ التَّسَلْسُلَ: ${seq.map((v,i)=>i===missing?"؟":v).join(" – ")}`, say: "أَيُّ رَقْمٍ نَاقِصٌ فِي التَّسَلْسُل؟", options: options(seq[missing]), answer: seq[missing], skill: "missing", num: seq[missing] }; })(),
    (() => { const n = r(lo + 1, hi); return { prompt: `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${NAMES[n]}؟`, say: `مَا الرَّقْمُ الَّذِي يَأْتِي قَبْلَ ${NAMES[n]}؟`, options: options(n-1), answer: n-1, skill: "neighbors", num: n }; })(),
    (() => { const n = r(lo, Math.max(lo, hi - 1)); return { prompt: `مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${NAMES[n]}؟`, say: `مَا الرَّقْمُ الَّذِي يَأْتِي بَعْدَ ${NAMES[n]}؟`, options: options(n+1), answer: n+1, skill: "neighbors", num: n }; })(),
    (() => { const a = pick(); let b = pick(); while (b === a) b = pick(); return { prompt: `أَيُّ الْعَدَدَيْنِ أَكْبَرُ: ${a} أَمْ ${b}؟`, say: `أَيُّ الْعَدَدَيْنِ أَكْبَرُ: ${NAMES[a]} أَمْ ${NAMES[b]}؟`, options: numOpts(shuffle([a,b])), answer: Math.max(a,b), skill: "bigger" }; })(),
    (() => { const n = pick(); return { prompt: "اخْتَرِ الْمَجْمُوعَةَ الَّتِي تُمَثِّلُ الرَّقْمَ", big: n, options: nums(n,lo,hi,4).map((value)=>({value,count:value})), answer:n, skill:"count", num:n }; })(),
    (() => { const a = r(lo, Math.max(lo, hi-1)); const b = r(1, Math.max(1, Math.min(hi-a,4))); return { prompt: `${a} + ${b} = ؟`, groups:[a,b], options: options(a+b), answer:a+b, skill:"add", num:a }; })(),
    (() => { const a = r(Math.max(lo,2),hi); const b = r(1,Math.min(a-1,4)); return { prompt: `${a} − ${b} = ؟`, groups:[a,b], options: options(a-b), answer:a-b, skill:"subtract", num:a }; })(),
  ];
  return Array.from({length: Math.max(1,size)}, (_,i) => ensureAnswerOption(base[i % base.length]));
};
