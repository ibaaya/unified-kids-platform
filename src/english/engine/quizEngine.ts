/**
 * quizEngine — محرك الأسئلة المشترك لقسم Learn English
 *
 * يُستخدم في: Letters World · Sounds World · Words World · Final Test
 *
 * القواعد التي يضمنها هذا المحرك:
 *  1) السؤال يطابق الخيارات دائماً (سؤال عن كلمة ← خيارات كلمات، سؤال عن حرف ← خيارات حروف...)
 *  2) توجد إجابة صحيحة واحدة فقط — لا يمكن أن تظهر كلمتان تبدآن بنفس الحرف
 *     المسؤول عنه، لأن كل مشتّت يُفحص بنفس الشرط الذي تُفحص به الإجابة الصحيحة
 *  3) لا تكرار للكلمة (أو الصورة) نفسها في خيارات السؤال الواحد
 *  4) الخيارات تُبنى مرة واحدة وتبقى ثابتة (لا إعادة ترتيب بعد الإجابة)
 *  5) كل سؤال يمر عبر validateQuestion() قبل أن يصل للطفل
 */
import lettersData from '../data/letters.json'
import wordsData from '../data/words.json'

// ═══════════════════════════════════════════════════
// الأنواع
// ═══════════════════════════════════════════════════
export type EnglishLetter = {
  id: string; name: string; uppercase: string; lowercase: string
  phonicSound: string; imageEmoji: string; exampleWord: string; order: number
}
export type EnglishWord = {
  id: string; text: string; letterId: string; position: 'start' | 'middle' | 'end'
  imageEmoji: string; soundId: string; difficulty: number
}

/** كيف تُعرض الخيارات */
export type OptionDisplay = 'wordWithPicture' | 'pictureOnly' | 'textOnly' | 'letter'

export type QuizOption = {
  id: string
  label: string
  emoji?: string
  isCorrect: boolean
}

/** ما يظهر فوق الخيارات */
export type QuizPrompt = {
  /** حرف كبير (مثل "B b") */
  big?: string
  /** صورة (إيموجي) */
  emoji?: string
  /** كلمة تُعرض نصاً */
  word?: string
  /** حرف يُلوَّن داخل الكلمة */
  highlight?: string
  /** نص يُنطق عند الضغط على الكلمة/الصورة (إن لم يُحدد لا يكون قابلاً للضغط) */
  speak?: string
}

export type LetterRuleKind = 'start' | 'middle' | 'end' | 'contains'

export type QuizQuestion = {
  /** مفتاح لمنع تكرار نفس السؤال */
  key: string
  kind: string
  text: string
  voice: string
  prompt?: QuizPrompt
  display: OptionDisplay
  options: QuizOption[]
  /** عدد أعمدة العرض (اختياري) */
  columns?: 1 | 2 | 3
  /** قاعدة الحرف — تُستخدم للتحقق المستقل من عدم وجود إجابتين صحيحتين */
  rule?: { kind: LetterRuleKind; letter: string }
}

// ═══════════════════════════════════════════════════
// البيانات
// ═══════════════════════════════════════════════════
export const allLetters = lettersData as EnglishLetter[]
const rawWords = wordsData as EnglishWord[]

/** مجموعة كلمات فريدة (بدون تكرار نفس النص) */
export const wordPool: EnglishWord[] = (() => {
  const map = new Map<string, EnglishWord>()
  for (const w of rawWords) {
    const k = w.text.toLowerCase()
    if (!map.has(k)) map.set(k, w)
  }
  return [...map.values()]
})()

// ═══════════════════════════════════════════════════
// أدوات عامة
// ═══════════════════════════════════════════════════
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickOne<T>(arr: readonly T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined
}

// ═══════════════════════════════════════════════════
// شروط الحروف — تُحسب من نص الكلمة نفسه (لا نثق بحقل position)
// ═══════════════════════════════════════════════════
export const startsWithLetter = (t: string, L: string) => t.charAt(0).toUpperCase() === L
export const endsWithLetter = (t: string, L: string) => t.charAt(t.length - 1).toUpperCase() === L
export const hasInMiddle = (t: string, L: string) => t.slice(1, -1).toUpperCase().includes(L)
export const hasLetter = (t: string, L: string) => t.toUpperCase().includes(L)
export const countLetter = (t: string, L: string) =>
  [...t.toUpperCase()].filter((c) => c === L).length

const RULES: Record<LetterRuleKind, (t: string, L: string) => boolean> = {
  start: startsWithLetter,
  middle: hasInMiddle,
  end: endsWithLetter,
  contains: hasLetter,
}

function letterPosition(t: string, L: string): 'start' | 'middle' | 'end' {
  const i = t.toUpperCase().indexOf(L)
  if (i === 0) return 'start'
  if (i === t.length - 1) return 'end'
  return 'middle'
}

// ═══════════════════════════════════════════════════
// التحقق من صحة السؤال
// ═══════════════════════════════════════════════════
export function validateQuestion(q: QuizQuestion): string[] {
  const errs: string[] = []
  const correct = q.options.filter((o) => o.isCorrect)
  if (correct.length !== 1) errs.push(`expected exactly 1 correct option, got ${correct.length}`)
  if (q.options.length < 3) errs.push('fewer than 3 options')

  if (new Set(q.options.map((o) => o.label.toLowerCase())).size !== q.options.length)
    errs.push('duplicate option text')
  if (new Set(q.options.map((o) => o.id)).size !== q.options.length)
    errs.push('duplicate option id')

  const showsPicture = q.display === 'wordWithPicture' || q.display === 'pictureOnly'
  if (showsPicture) {
    const emojis = q.options.map((o) => o.emoji ?? '')
    if (emojis.some((e) => !e)) errs.push('option without picture')
    if (new Set(emojis).size !== emojis.length) errs.push('duplicate picture')
  } else if (q.options.some((o) => o.emoji)) {
    // الصورة في الخيارات تكشف الإجابة (مثل: This picture is...)
    errs.push('picture must not appear in options for this question type')
  }

  if (q.rule) {
    const pred = RULES[q.rule.kind]
    const matching = q.options.filter((o) => pred(o.label, q.rule!.letter))
    if (matching.length !== 1 || !matching[0].isCorrect)
      errs.push(`letter rule "${q.rule.kind} ${q.rule.letter}" matches ${matching.length} options`)
  }
  return errs
}

// ═══════════════════════════════════════════════════
// اختيار المشتّتات
// ═══════════════════════════════════════════════════
function pickDistractors(
  pool: readonly EnglishWord[],
  target: EnglishWord,
  count: number,
  reject: (w: EnglishWord) => boolean,
  prefer?: (w: EnglishWord) => boolean,
): EnglishWord[] {
  let cand = shuffle(pool).filter(
    (w) =>
      w.text.toLowerCase() !== target.text.toLowerCase() &&
      w.imageEmoji !== target.imageEmoji &&
      !reject(w),
  )
  if (prefer) cand = [...cand.filter(prefer), ...cand.filter((w) => !prefer(w))]
  const out: EnglishWord[] = []
  const emojis = new Set<string>([target.imageEmoji])
  const texts = new Set<string>([target.text.toLowerCase()])
  for (const w of cand) {
    if (out.length >= count) break
    if (emojis.has(w.imageEmoji) || texts.has(w.text.toLowerCase())) continue
    emojis.add(w.imageEmoji)
    texts.add(w.text.toLowerCase())
    out.push(w)
  }
  return out
}

const asWordOption = (w: EnglishWord, isCorrect: boolean, withPicture: boolean): QuizOption => ({
  id: w.id,
  label: w.text,
  emoji: withPicture ? w.imageEmoji : undefined,
  isCorrect,
})

// ═══════════════════════════════════════════════════
// أسئلة الحروف: start / middle / end / contains / whereIs
// ═══════════════════════════════════════════════════
export type LetterQKind = LetterRuleKind | 'whereIs'

type LetterQOpts = {
  /** عدد الخيارات (3 أو 4) */
  optionCount?: number
  /** صعب: المشتّتات تحتوي الحرف في مكان آخر (أكثر خداعاً) */
  hard?: boolean
  /** كلمات استُخدمت سابقاً (لتجنب التكرار) */
  used?: Set<string>
  /** مجموعة الكلمات المسموح اختيار الإجابة الصحيحة منها */
  pool?: readonly EnglishWord[]
  /** مجموعة الكلمات المسموح اختيار المشتّتات منها */
  distractorPool?: readonly EnglishWord[]
  /** إجبار كلمة صحيحة بعينها */
  correct?: EnglishWord
}

const QUESTION_TEXT: Record<LetterRuleKind, (L: string) => string> = {
  start: (L) => `Which word STARTS with letter "${L}"?`,
  middle: (L) => `Which word has letter "${L}" in the MIDDLE?`,
  end: (L) => `Which word ENDS with letter "${L}"?`,
  contains: (L) => `Which word CONTAINS the letter "${L}"?`,
}
const QUESTION_VOICE: Record<LetterRuleKind, (n: string) => string> = {
  start: (n) => `Which word starts with the letter ${n}?`,
  middle: (n) => `Which word has the letter ${n} in the middle?`,
  end: (n) => `Which word ends with the letter ${n}?`,
  contains: (n) => `Which word has the letter ${n} in it?`,
}

export function makeLetterQuestion(
  letter: EnglishLetter,
  kind: LetterQKind,
  o: LetterQOpts = {},
): QuizQuestion | null {
  const L = letter.id.toUpperCase()
  const optionCount = o.optionCount ?? 4
  const pool = o.pool ?? wordPool
  const dPool = o.distractorPool ?? wordPool
  const used = o.used ?? new Set<string>()

  // ——— أين الحرف في الكلمة؟ ———
  if (kind === 'whereIs') {
    const word =
      o.correct ??
      pickOne(pool.filter((w) => countLetter(w.text, L) === 1 && !used.has(w.text.toLowerCase())))
    if (!word || countLetter(word.text, L) !== 1) return null
    const pos = letterPosition(word.text, L)
    const q: QuizQuestion = {
      key: `whereIs:${L}:${word.text.toLowerCase()}`,
      kind,
      text: `Where is the letter "${L}" in this word?`,
      voice: `Where is the letter ${letter.name} in the word ${word.text}?`,
      prompt: {
        emoji: word.imageEmoji,
        word: word.text,
        highlight: o.hard ? undefined : L,
        speak: word.text,
      },
      display: 'textOnly',
      columns: 1,
      // ترتيب ثابت منطقي (بداية ← وسط ← نهاية)
      options: [
        { id: 'start', label: 'At the beginning', isCorrect: pos === 'start' },
        { id: 'middle', label: 'In the middle', isCorrect: pos === 'middle' },
        { id: 'end', label: 'At the end', isCorrect: pos === 'end' },
      ],
    }
    return validateQuestion(q).length ? null : q
  }

  // ——— أسئلة الكلمات (الخيارات كلمات دائماً) ———
  const pred = RULES[kind]
  const word =
    o.correct ??
    pickOne(pool.filter((w) => pred(w.text, L) && !used.has(w.text.toLowerCase())))
  if (!word || !pred(word.text, L)) return null

  // المشتّت يجب أن يفشل في نفس الشرط → لا توجد إجابتان صحيحتان
  // في السهل: المشتّت لا يحتوي الحرف إطلاقاً
  const reject = (w: EnglishWord) => pred(w.text, L) || (!o.hard && hasLetter(w.text, L))
  // في الصعب: نفضّل مشتّتات تحتوي الحرف في موضع آخر
  const prefer = o.hard ? (w: EnglishWord) => hasLetter(w.text, L) : undefined

  let dist = pickDistractors(dPool, word, optionCount - 1, reject, prefer)
  if (dist.length < optionCount - 1) {
    dist = pickDistractors(wordPool, word, optionCount - 1, reject, prefer)
  }
  if (dist.length < optionCount - 1) return null

  const q: QuizQuestion = {
    key: `${kind}:${L}:${word.text.toLowerCase()}`,
    kind,
    text: QUESTION_TEXT[kind](L),
    voice: QUESTION_VOICE[kind](letter.name),
    prompt: { big: `${letter.uppercase} ${letter.lowercase}` },
    display: 'wordWithPicture',
    options: shuffle([asWordOption(word, true, true), ...dist.map((d) => asWordOption(d, false, true))]),
    rule: { kind, letter: L },
  }
  return validateQuestion(q).length ? null : q
}

/** اختبار حرف واحد: يدور على الأنواع المطلوبة ويتخطى ما لا تتوفر له كلمات */
export function buildLetterQuiz(
  letter: EnglishLetter,
  cfg: { kinds: LetterQKind[]; total: number; optionCount?: number; hard?: boolean },
): QuizQuestion[] {
  const out: QuizQuestion[] = []
  const keys = new Set<string>()
  const used = new Set<string>()
  const maxTries = cfg.total * 4

  for (let i = 0; out.length < cfg.total && i < maxTries; i++) {
    const kind = cfg.kinds[i % cfg.kinds.length]
    const base = { optionCount: cfg.optionCount, hard: cfg.hard }
    // أولاً بكلمة جديدة، وإن لم تتوفر نسمح بإعادة استخدام كلمة في سؤال من نوع مختلف
    const q = makeLetterQuestion(letter, kind, { ...base, used }) ?? makeLetterQuestion(letter, kind, base)
    if (!q || keys.has(q.key)) continue
    keys.add(q.key)
    const correct = q.options.find((x) => x.isCorrect)
    if (correct && q.display === 'wordWithPicture') used.add(correct.label.toLowerCase())
    out.push(q)
  }
  return out
}

// ═══════════════════════════════════════════════════
// الاختبار النهائي — 3 مستويات متدرجة الصعوبة
// ═══════════════════════════════════════════════════
export type TestLevel = 1 | 2 | 3

type FinalKind =
  | LetterQKind
  | 'pictureIs' | 'findPicture' | 'firstLetter' | 'lastLetter'
  | 'missingLetter' | 'spelling' | 'countLetter'

type LevelConfig = {
  count: number
  optionCount: number
  hard: boolean
  /** الكلمات المسموحة في هذا المستوى */
  pool: (w: EnglishWord) => boolean
  kinds: FinalKind[]
}

export const LEVEL_CONFIG: Record<TestLevel, LevelConfig> = {
  // المستوى 1: كلمات قصيرة وسهلة، 3 خيارات، أسئلة صورة وأول حرف
  1: {
    count: 8, optionCount: 3, hard: false,
    pool: (w) => w.difficulty <= 1 && w.text.length <= 5,
    kinds: ['pictureIs', 'findPicture', 'start', 'firstLetter', 'pictureIs', 'findPicture', 'start', 'firstLetter'],
  },
  // المستوى 2: كلمات أطول، 4 خيارات، مواضع الحروف والحرف الناقص
  2: {
    count: 10, optionCount: 4, hard: false,
    pool: (w) => w.difficulty <= 2,
    kinds: ['pictureIs', 'start', 'findPicture', 'end', 'missingLetter', 'contains', 'lastLetter', 'whereIs', 'pictureIs', 'middle'],
  },
  // المستوى 3: كل الكلمات، 4 خيارات بمشتّتات خادعة، إملاء وعدّ حروف
  3: {
    count: 12, optionCount: 4, hard: true,
    pool: (w) => w.difficulty >= 2 || w.text.length >= 5,
    kinds: ['spelling', 'middle', 'countLetter', 'missingLetter', 'end', 'whereIs', 'spelling', 'contains', 'lastLetter', 'middle', 'spelling', 'end'],
  },
}

const VOWELS = ['A', 'E', 'I', 'O', 'U']
const ALPHABET = allLetters.map((l) => l.id.toUpperCase())

/** أخطاء إملائية معقولة لكلمة (تبديل، حذف، تكرار، تغيير حرف علة) */
function misspellings(word: string): string[] {
  const w = word.toLowerCase()
  const real = new Set(wordPool.map((x) => x.text.toLowerCase()))
  const out = new Set<string>()
  for (let i = 0; i < w.length - 1; i++)
    if (w[i] !== w[i + 1]) out.add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2))
  for (let i = 1; i < w.length; i++) out.add(w.slice(0, i) + w.slice(i + 1))
  for (let i = 1; i < w.length; i++) out.add(w.slice(0, i) + w[i] + w.slice(i))
  for (let i = 0; i < w.length; i++)
    if ('aeiou'.includes(w[i]))
      for (const v of 'aeiou') if (v !== w[i]) out.add(w.slice(0, i) + v + w.slice(i + 1))
  return [...out]
    .filter((m) => m !== w && m.length >= 3 && !real.has(m))
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
}

function letterOptions(correct: string, count: number, hard: boolean): QuizOption[] | null {
  const C = correct.toUpperCase()
  let others = shuffle(ALPHABET.filter((l) => l !== C))
  // في الصعب: مشتّتات من نفس النوع (حرف علة ↔ حروف علة)
  if (hard) {
    const sameKind = VOWELS.includes(C) ? VOWELS : ALPHABET.filter((l) => !VOWELS.includes(l))
    const near = shuffle(sameKind.filter((l) => l !== C))
    others = [...near, ...others.filter((l) => !near.includes(l))]
  }
  const dist = others.slice(0, count - 1)
  if (dist.length < count - 1) return null
  return shuffle([
    { id: `L-${C}`, label: C, isCorrect: true },
    ...dist.map((l) => ({ id: `L-${l}`, label: l, isCorrect: false })),
  ])
}

function makeFinalQuestion(
  kind: FinalKind,
  cfg: LevelConfig,
  usedWords: Set<string>,
  usedLetters: Set<string>,
): QuizQuestion | null {
  const levelPool = wordPool.filter(cfg.pool)
  const fresh = (list: EnglishWord[]) => list.filter((w) => !usedWords.has(w.text.toLowerCase()))
  const candidates = (list: EnglishWord[]) => {
    const f = fresh(list)
    return f.length ? f : list
  }
  const dPool = levelPool.length >= 12 ? levelPool : wordPool
  const letterOf = (c: string) => allLetters.find((l) => l.id.toUpperCase() === c.toUpperCase())

  // ——— أسئلة حروف (الخيارات كلمات) ———
  if (kind === 'start' || kind === 'end' || kind === 'middle' || kind === 'contains' || kind === 'whereIs') {
    // نختار كلمة ثم الحرف المناسب لها، ونفضّل حرفاً لم يظهر في الاختبار
    let list = levelPool
    if (kind === 'middle') list = levelPool.filter((w) => w.text.length >= 3)
    if (kind === 'whereIs') list = levelPool.filter((w) => [...new Set(w.text.toUpperCase())].some((c) => countLetter(w.text, c) === 1))
    list = candidates(list)
    const ordered = shuffle(list)
    const preferred = [...ordered.filter((w) => {
      const L = kind === 'start' ? w.text[0] : kind === 'end' ? w.text[w.text.length - 1] : ''
      return !L || !usedLetters.has(L.toUpperCase())
    }), ...ordered]

    for (const word of preferred.slice(0, 25)) {
      let L: string | undefined
      if (kind === 'start') L = word.text[0]
      else if (kind === 'end') L = word.text[word.text.length - 1]
      else if (kind === 'middle') L = pickOne(shuffle([...word.text.slice(1, -1)]).filter((c) => !usedLetters.has(c.toUpperCase())))
        ?? pickOne([...word.text.slice(1, -1)])
      else {
        const single = [...new Set(word.text.toUpperCase())].filter((c) => countLetter(word.text, c) === 1)
        L = pickOne(single.filter((c) => !usedLetters.has(c))) ?? pickOne(single)
      }
      const letter = L ? letterOf(L) : undefined
      if (!letter) continue
      const q = makeLetterQuestion(letter, kind, {
        optionCount: cfg.optionCount, hard: cfg.hard, correct: word, distractorPool: dPool,
      })
      if (q) { usedLetters.add(letter.id.toUpperCase()); usedWords.add(word.text.toLowerCase()); return q }
    }
    return null
  }

  // ——— أسئلة الصور والكلمات ———
  const pickWord = (list: EnglishWord[]) => pickOne(shuffle(candidates(list)))

  if (kind === 'pictureIs') {
    const word = pickWord(levelPool)
    if (!word) return null
    // في الصعب/المتوسط: كلمات تبدأ بنفس الحرف أو بنفس الطول (أكثر خداعاً)
    const prefer = cfg.hard ? (w: EnglishWord) => w.text[0].toLowerCase() === word.text[0].toLowerCase()
      : cfg.optionCount === 4 ? (w: EnglishWord) => w.text.length === word.text.length : undefined
    const dist = pickDistractors(dPool, word, cfg.optionCount - 1, () => false, prefer)
    if (dist.length < cfg.optionCount - 1) return null
    const q: QuizQuestion = {
      key: `pictureIs:${word.text.toLowerCase()}`, kind,
      text: 'This picture is...',
      voice: 'What is this picture?',
      prompt: { emoji: word.imageEmoji, speak: word.text },
      display: 'textOnly',
      // الصورة تظهر في السؤال فقط — لا تظهر في الخيارات أبداً
      options: shuffle([asWordOption(word, true, false), ...dist.map((d) => asWordOption(d, false, false))]),
    }
    if (validateQuestion(q).length) return null
    usedWords.add(word.text.toLowerCase())
    return q
  }

  if (kind === 'findPicture') {
    const word = pickWord(levelPool)
    if (!word) return null
    const dist = pickDistractors(dPool, word, cfg.optionCount - 1, () => false)
    if (dist.length < cfg.optionCount - 1) return null
    const q: QuizQuestion = {
      key: `findPicture:${word.text.toLowerCase()}`, kind,
      text: `Which picture is "${word.text}"?`,
      voice: `Find the picture of ${word.text}`,
      prompt: { word: word.text, speak: word.text },
      display: 'pictureOnly',
      options: shuffle([asWordOption(word, true, true), ...dist.map((d) => asWordOption(d, false, true))]),
    }
    if (validateQuestion(q).length) return null
    usedWords.add(word.text.toLowerCase())
    return q
  }

  if (kind === 'firstLetter' || kind === 'lastLetter') {
    const word = pickWord(levelPool)
    if (!word) return null
    const target = kind === 'firstLetter' ? word.text[0] : word.text[word.text.length - 1]
    const opts = letterOptions(target, cfg.optionCount, cfg.hard)
    if (!opts) return null
    const q: QuizQuestion = {
      key: `${kind}:${word.text.toLowerCase()}`, kind,
      text: `What is the ${kind === 'firstLetter' ? 'FIRST' : 'LAST'} letter of "${word.text}"?`,
      voice: `What is the ${kind === 'firstLetter' ? 'first' : 'last'} letter of the word ${word.text}?`,
      prompt: { emoji: word.imageEmoji, word: word.text, speak: word.text },
      display: 'letter',
      options: opts,
    }
    if (validateQuestion(q).length) return null
    usedWords.add(word.text.toLowerCase())
    return q
  }

  if (kind === 'missingLetter') {
    const word = pickWord(levelPool.filter((w) => w.text.length >= 3))
    if (!word) return null
    const chars = [...word.text]
    // الصعب: نخفي حرف علة داخل الكلمة، وإلا حرفاً عشوائياً
    const inner = chars.map((_, i) => i).filter((i) => i > 0 && i < chars.length - 1)
    const vowelIdx = inner.filter((i) => VOWELS.includes(chars[i].toUpperCase()))
    const idx = (cfg.hard ? pickOne(vowelIdx) : undefined) ?? pickOne(shuffle([0, ...inner, chars.length - 1]))
    if (idx === undefined) return null
    const missing = chars[idx]
    const opts = letterOptions(missing, cfg.optionCount, cfg.hard)
    if (!opts) return null
    // نعرض الحرف بنفس حالته داخل الكلمة (كبير في أول الكلمة)
    const shown = opts.map((o) => ({ ...o, label: idx === 0 ? o.label : o.label.toLowerCase() }))
    const displayed = chars.map((c, i) => (i === idx ? '_' : c)).join('')
    const q: QuizQuestion = {
      key: `missingLetter:${word.text.toLowerCase()}:${idx}`, kind,
      text: 'Complete the missing letter',
      voice: 'Complete the missing letter in the word',
      // الصورة تحدد الكلمة المقصودة فلا يحدث لبس بين كلمات مثل Cat / Hat
      prompt: { emoji: word.imageEmoji, word: displayed },
      display: 'letter',
      options: shown,
    }
    if (validateQuestion(q).length) return null
    usedWords.add(word.text.toLowerCase())
    return q
  }

  if (kind === 'spelling') {
    const word = pickWord(levelPool.filter((w) => w.text.length >= 4))
    if (!word) return null
    const wrong = shuffle(misspellings(word.text)).slice(0, cfg.optionCount - 1)
    if (wrong.length < cfg.optionCount - 1) return null
    const q: QuizQuestion = {
      key: `spelling:${word.text.toLowerCase()}`, kind,
      text: 'Which is the correct spelling?',
      voice: 'Which is the correct spelling?',
      prompt: { emoji: word.imageEmoji, speak: word.text },
      display: 'textOnly',
      options: shuffle([
        { id: `S-${word.id}`, label: word.text, isCorrect: true },
        ...wrong.map((m, i) => ({ id: `S-bad-${i}`, label: m, isCorrect: false })),
      ]),
    }
    if (validateQuestion(q).length) return null
    usedWords.add(word.text.toLowerCase())
    return q
  }

  if (kind === 'countLetter') {
    // نفضّل كلمات فيها حرف مكرر (مثل Apple ← P)
    const repeated = candidates(levelPool).filter((w) =>
      [...new Set(w.text.toUpperCase())].some((c) => countLetter(w.text, c) >= 2))
    const word = pickOne(shuffle(repeated)) ?? pickWord(levelPool)
    if (!word) return null
    const multi = [...new Set(word.text.toUpperCase())].filter((c) => countLetter(word.text, c) >= 2)
    const L = pickOne(multi) ?? pickOne([...new Set(word.text.toUpperCase())])
    if (!L) return null
    const n = countLetter(word.text, L)
    const pool = [1, 2, 3, 4, 5].filter((x) => x !== n)
    const wrong = shuffle(pool).slice(0, cfg.optionCount - 1)
    const q: QuizQuestion = {
      key: `countLetter:${word.text.toLowerCase()}:${L}`, kind,
      text: `How many times does the letter "${L}" appear in "${word.text}"?`,
      voice: `How many times does the letter ${letterOf(L)?.name ?? L} appear in the word ${word.text}?`,
      prompt: { emoji: word.imageEmoji, word: word.text, highlight: undefined, speak: word.text },
      display: 'letter',
      options: shuffle([
        { id: `N-${n}`, label: String(n), isCorrect: true },
        ...wrong.map((x) => ({ id: `N-${x}`, label: String(x), isCorrect: false })),
      ]),
    }
    if (validateQuestion(q).length) return null
    usedWords.add(word.text.toLowerCase())
    return q
  }

  return null
}

/** بناء اختبار مستوى كامل (8 / 10 / 12 سؤالاً) — كل سؤال يمر عبر validateQuestion */
export function buildFinalTest(level: TestLevel): QuizQuestion[] {
  const cfg = LEVEL_CONFIG[level]
  const usedWords = new Set<string>()
  const usedLetters = new Set<string>()
  const keys = new Set<string>()
  const out: QuizQuestion[] = []
  const fallback: FinalKind[] = ['pictureIs', 'start', 'contains']

  for (let i = 0; out.length < cfg.count && i < cfg.count * 6; i++) {
    const kind = i < cfg.count ? cfg.kinds[i % cfg.kinds.length] : fallback[i % fallback.length]
    // محاولات متعددة لنفس النوع لأن اختيار الكلمة عشوائي
    for (let attempt = 0; attempt < 6; attempt++) {
      const q = makeFinalQuestion(kind, cfg, usedWords, usedLetters)
      if (q && !keys.has(q.key)) {
        keys.add(q.key)
        out.push(q)
        break
      }
    }
  }
  return out
}
