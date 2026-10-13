/**
 * arabicFinalTestData.ts  ·  src/pages/ArabicFinalTest/arabicFinalTestData.ts
 * ══════════════════════════════════════════════════════════════════════════════
 * أسئلة الاختبار النهائي لمنصة رِحْلتي — العربية.
 *
 * أسئلة الحركات والمقاطع تأتي من مصدر العالم الموحّد بدل ملفات البيانات القديمة.
 * بل تأتي من HARAKAT_WORLD_DATA في harakatWorld.ts (كلمات حقيقية + إيموجي).
 *
 * الهيكل: 3 مستويات × 10 أسئلة = 30 سؤالًا.
 *   سهل   (10): تعرّف الحركة / اختيار الكلمة الصحيحة
 *   متوسط (10): تمييز المقطع / التنوين / المدود
 *   صعب   (10): جمل كاملة + فهم الحركة في السياق
 */

import lettersJson from '../../data/letters.json'
import wordsJson from '../../data/words.json'
import sentencesJson from '../../data/sentences.json'
import storiesJson from '../../data/stories.json'
import { HARAKAT_WORLD_MAP } from '../../data/harakatWorld'
import { getLetterPositionsInWord } from '../../utils/arabicText'
import type { Letter, Story, Word } from '../../types/content'

export interface ArabicFinalTestQuestion {
  id: string
  prompt: string
  say?: string
  audioId?: string
  stimulus?: string
  context?: string
  highlightText?: string
  options: string[]
  answer: string
}

const letters = lettersJson as Letter[]
const words = wordsJson as Word[]
interface CurriculumSentence { id: string; letter: string; text: string; words: string[] }
const sentences = sentencesJson as CurriculumSentence[]
const stories = storiesJson as Story[]

// ─── مساعدات ──────────────────────────────────────────────────────────────────

function choiceOptions(answer: string, source: string[], seed: number, count = 4): string[] {
  const pool = [...new Set(source)].filter((option) => option && option !== answer)
  if (!answer || pool.length < count - 1) {
    throw new Error(`لا توجد خيارات كافية للسؤال: ${answer}`)
  }
  const start = Math.abs(seed * 7 + answer.length) % pool.length
  const distractors = Array.from({ length: count - 1 }, (_, index) => pool[(start + index) % pool.length])
  const options = [...distractors]
  // إزاحة ثابتة ومتغيرة لكل سؤال، حتى لا تتكرر الإجابة في موضع واحد.
  options.splice(Math.abs(seed + Math.floor(seed / count) + 1) % count, 0, answer)
  return options
}

function requireQuestion(
  q: ArabicFinalTestQuestion | undefined,
  desc: string,
): ArabicFinalTestQuestion {
  if (!q || q.options.length < 3 || q.options.length > 4 || new Set(q.options).size !== q.options.length || !q.options.includes(q.answer)) {
    throw new Error(`تعذر تجهيز سؤال: ${desc}`)
  }
  return q
}

// ─── مستوى سهل (10 أسئلة) ────────────────────────────────────────────────────
// 4 أسئلة حروف + 6 أسئلة حركات (من عالم الحركات الجديد)

const letterQuestions: ArabicFinalTestQuestion[] = [0, 6, 13, 20].map((index, qi) => {
  const target = letters[index]
  const choices = letters.map((l) => l.forms.isolated)
  return requireQuestion(
    {
      id: `easy-letter-${target.id}`,
      prompt: 'اِسْتَمِعْ إِلَى اسْمِ الْحَرْفِ، ثُمَّ اخْتَرْ شَكْلَهُ.',
      say: target.name,
      audioId: target.soundId,
      options: choiceOptions(target.forms.isolated, choices, qi),
      answer: target.forms.isolated,
    },
    `الحرف ${target.id}`,
  )
})

// أسئلة الحركات الأساسية من العالم الجديد
const basicHarakaIds = ['fatha', 'damma', 'kasra', 'sukun', 'shadda', 'tanween_fath'] as const
const harakaEasyQuestions: ArabicFinalTestQuestion[] = basicHarakaIds.map((id, qi) => {
  const entry = HARAKAT_WORLD_MAP.get(id)!
  const sourceQuestion = entry.questions.find((item) => item.type === 'identify_haraka')
    ?? entry.questions.find((item) => item.type === 'identify_word')
  if (!sourceQuestion) throw new Error(`لا يوجد سؤال تعرّف مناسب للحركة ${id}`)
  return requireQuestion(
    {
      id: `easy-haraka-${sourceQuestion.id}`,
      prompt: sourceQuestion.prompt,
      say: sourceQuestion.speechText,
      audioId: `harakaworld_v2_q_${sourceQuestion.id}`,
      options: choiceOptions(sourceQuestion.answer, sourceQuestion.options, qi + 4),
      answer: sourceQuestion.answer,
    },
    `الحركة ${id}`,
  )
})

const easyQuestions: ArabicFinalTestQuestion[] = [
  ...letterQuestions,
  ...harakaEasyQuestions,
].slice(0, 10)

// ─── مستوى متوسط (10 أسئلة) ──────────────────────────────────────────────────
// 3 أسئلة مواضع حروف + 1 موضع + 3 جمل + 3 حركات (مد + تنوين)

const wordPositionQuestions: ArabicFinalTestQuestion[] = (
  ['start', 'middle', 'end'] as const
).map((position, index) => {
  const target = words.find((w) => getLetterPositionsInWord(w.text, w.letterId).includes(position))!
  const positionName = { start: 'بِدايَةِ', middle: 'وَسَطِ', end: 'نِهايَةِ' }[position]
  const distractors = words
    .filter((w) => !getLetterPositionsInWord(w.text, target.letterId).includes(position))
    .map((w) => w.text)
  return requireQuestion(
    {
      id: `medium-word-position-${position}-${target.id}`,
      prompt: `اخْتَرِ الْكَلِمَةَ الَّتِي يَظْهَرُ فِيهَا حَرْفُ {{target}} فِي ${positionName} الْكَلِمَةِ.`,
      highlightText: target.letterId,
      options: choiceOptions(target.text, distractors, index),
      answer: target.text,
    },
    `موضع الحرف ${target.letterId}`,
  )
})

const advancedWord = words.find(
  (w) => w.difficulty === 3 && getLetterPositionsInWord(w.text, w.letterId).length > 0,
)!
const wordLocationQuestion = requireQuestion(
  {
    id: `medium-word-location-${advancedWord.id}`,
    prompt: `أَيْنَ يَقَعُ حَرْفُ {{target}} فِي كَلِمَةِ ${advancedWord.text}؟`,
    highlightText: advancedWord.letterId,
    options: ['بِدايَةُ الْكَلِمَةِ', 'وَسَطُ الْكَلِمَةِ', 'نِهايَةُ الْكَلِمَةِ', 'لَيْسَ فِي الْكَلِمَةِ'],
    answer: (
      { start: 'بِدايَةُ الْكَلِمَةِ', middle: 'وَسَطُ الْكَلِمَةِ', end: 'نِهايَةُ الْكَلِمَةِ' } as const
    )[advancedWord.position],
  },
  'تحديد موضع الحرف',
)

const sentenceQuestions: ArabicFinalTestQuestion[] = [0, 8, 18].map((index, qi) => {
  const target = sentences[index]
  const distractors = sentences.filter((s) => s.id !== target.id).map((s) => s.text)
  return requireQuestion(
    {
      id: `medium-sentence-letter-${target.id}`,
      prompt: `أَيُّ جُمْلَةٍ تَرْتَبِطُ بِحَرْفِ {{target}}؟`,
      highlightText: target.letter,
      say: `اخْتَرِ الْجُمْلَةَ الْمُرْتَبِطَةَ بِحَرْفِ ${target.letter}.`,
      options: choiceOptions(target.text, distractors, qi + 4),
      answer: target.text,
    },
    `الجملة ${target.id}`,
  )
})

// 3 أسئلة من المدود والتنوين
const maddTanweenIds = ['madd_alif', 'madd_waw', 'madd_yaa'] as const
const maddQuestions: ArabicFinalTestQuestion[] = maddTanweenIds.map((id, qi) => {
  const entry = HARAKAT_WORLD_MAP.get(id)!
  // استخدم أول سؤال من نوع identify_word
  const q = entry.questions.find((q) => q.type === 'identify_word') ?? entry.questions[0]
  return requireQuestion(
    {
      id: `medium-madd-${id}`,
      prompt: q.prompt,
      say: q.speechText,
      audioId: `harakaworld_v2_q_${q.id}`,
      options: choiceOptions(q.answer, q.options, qi + 10),
      answer: q.answer,
    },
    `مد ${id}`,
  )
})

const mediumQuestions: ArabicFinalTestQuestion[] = [
  ...wordPositionQuestions,
  wordLocationQuestion,
  ...sentenceQuestions,
  ...maddQuestions,
].slice(0, 10)

// ─── مستوى صعب (10 أسئلة) ────────────────────────────────────────────────────
// 5 أسئلة فهم قصص + 5 أسئلة متقدمة من عالم الحركات

const storyQuestions: ArabicFinalTestQuestion[] = stories.slice(0, 5).map((story, index) => {
  const comprehension = story.comprehensionQuestions[0]
  return requireQuestion(
    {
      id: `hard-story-${story.id}`,
      prompt: comprehension.question,
      context: story.pages.map((p) => p.text).join('\n'),
      options: choiceOptions(comprehension.options[comprehension.correctIndex], comprehension.options, index + 20, comprehension.options.length),
      answer: comprehension.options[comprehension.correctIndex],
    },
    `فهم القصة ${story.id}`,
  )
})

// اختَر سؤالًا من خمسة أبواب مختلفة حتى لا يتركز المستوى الصعب في حركة واحدة.
const hardHarakaQuestions: ArabicFinalTestQuestion[] = (
  ['fatha', 'damma', 'kasra', 'tanween_fath', 'madd_alif'] as const
).map((entryId, index) => {
  const entry = HARAKAT_WORLD_MAP.get(entryId)!
  const questionTypes = ['sentence_haraka', 'complete_word', 'identify_syllable', 'identify_word'] as const
  const sourceQuestion = entry.questions.find((item) => item.type === questionTypes[index])
    ?? entry.questions.find((item) => item.type === 'identify_haraka')
    ?? entry.questions[0]
  const question = {
    id: `hard-harakaworld-${sourceQuestion.id}`,
    prompt: sourceQuestion.prompt,
    say: sourceQuestion.speechText,
    audioId: `harakaworld_v2_q_${sourceQuestion.id}`,
    options: choiceOptions(sourceQuestion.answer, sourceQuestion.options, index + 17),
    answer: sourceQuestion.answer,
  }
  return requireQuestion(question, question.id)
})

const hardQuestions: ArabicFinalTestQuestion[] = [
  ...storyQuestions,
  ...hardHarakaQuestions,
].slice(0, 10)

// ─── التحقق والتصدير ──────────────────────────────────────────────────────────

export const ARABIC_FINAL_TEST_LEVELS: [
  ArabicFinalTestQuestion[],
  ArabicFinalTestQuestion[],
  ArabicFinalTestQuestion[],
] = [easyQuestions, mediumQuestions, hardQuestions]

export function validateArabicFinalTestQuestions(): void {
  const allQuestions = ARABIC_FINAL_TEST_LEVELS.flat()
  const ids = allQuestions.map((q) => q.id)

  if (ARABIC_FINAL_TEST_LEVELS.some((level) => level.length !== 10)) {
    throw new Error('يجب أن يحتوي كل مستوى من الاختبار العربي على ١٠ أسئلة.')
  }
  if (new Set(ids).size !== 30) {
    throw new Error('توجد أسئلة مكررة في الاختبار العربي.')
  }
  if (allQuestions.some((q) => q.options.length < 3 || q.options.length > 4 || new Set(q.options).size !== q.options.length || q.options.filter((option) => option === q.answer).length !== 1)) {
    throw new Error('يجب أن يحتوي كل سؤال على ثلاثة أو أربعة خيارات فريدة تتضمن إجابة صحيحة واحدة.')
  }
}

validateArabicFinalTestQuestions()
