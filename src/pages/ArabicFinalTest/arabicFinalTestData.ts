import lettersJson from '../../data/letters.json'
import harakatJson from '../../data/harakat.json'
import syllablesJson from '../../data/syllables.json'
import wordsJson from '../../data/words.json'
import sentencesJson from '../../data/sentences.json'
import storiesJson from '../../data/stories.json'
import { HARAKA_LABELS } from '../../data/harakaLabels'
import { getLetterPositionsInWord } from '../../utils/arabicText'
import type { HarakaVariant, Letter, Story, Syllable, Word } from '../../types/content'

export interface ArabicFinalTestQuestion {
  id: string
  prompt: string
  say?: string
  audioId?: string
  stimulus?: string
  context?: string
  options: string[]
  answer: string
}

const letters = lettersJson as Letter[]
const harakat = harakatJson as HarakaVariant[]
const syllables = syllablesJson as Syllable[]
const words = wordsJson as Word[]
interface CurriculumSentence { id: string; letter: string; text: string; words: string[] }
const sentences = sentencesJson as CurriculumSentence[]
const stories = storiesJson as Story[]

function choiceOptions(answer: string, source: string[], seed: number, count = 4): string[] {
  const pool = [...new Set([answer, ...source])].filter(Boolean)
  const answerIndex = pool.indexOf(answer)
  const distractors = pool.filter((option) => option !== answer).slice(seed % 3, (seed % 3) + count - 1)
  while (distractors.length < count - 1) {
    const fallback = pool.find((option) => option !== answer && !distractors.includes(option))
    if (!fallback) break
    distractors.push(fallback)
  }
  const options = [answer, ...distractors]
  const offset = (seed + answerIndex) % options.length
  return [...options.slice(offset), ...options.slice(0, offset)]
}

function requireQuestion(question: ArabicFinalTestQuestion | undefined, description: string): ArabicFinalTestQuestion {
  if (!question || question.options.length < 2 || !question.options.includes(question.answer)) {
    throw new Error(`تعذر تجهيز سؤال الاختبار العربي: ${description}`)
  }
  return question
}

const easyQuestions: ArabicFinalTestQuestion[] = [
  ...[0, 6, 13, 20].map((index, questionIndex) => {
    const target = letters[index]
    const choices = letters.map((letter) => letter.forms.isolated)
    return requireQuestion({
      id: `easy-letter-${target.id}`,
      prompt: 'استمع إلى اسم الحرف، ثم اختر شكله.',
      say: target.name,
      audioId: target.soundId,
      options: choiceOptions(target.forms.isolated, choices, questionIndex),
      answer: target.forms.isolated,
    }, `الحرف ${target.id}`)
  }),
  ...(['fatha', 'damma', 'kasra'] as const).map((type, questionIndex) => {
    const target = harakat.find((item) => item.haraka === type)
    const choices = Object.values(HARAKA_LABELS)
    return requireQuestion({
      id: `easy-haraka-${type}`,
      prompt: 'ما اسم الحركة الظاهرة على الحرف؟',
      say: target?.form,
      audioId: target?.soundId,
      stimulus: target?.form,
      options: choiceOptions(HARAKA_LABELS[type], choices, questionIndex + 4),
      answer: HARAKA_LABELS[type],
    }, `الحركة ${type}`)
  }),
  ...[0, 8, 16].map((index, questionIndex) => {
    const target = syllables[index]
    const choices = syllables.filter((item) => item.type === target.type && item.letterId !== target.letterId).map((item) => item.text)
    return requireQuestion({
      id: `easy-syllable-${target.id}`,
      prompt: 'استمع إلى المقطع، ثم اختره.',
      say: target.text,
      audioId: `syllable:${target.id}`,
      options: choiceOptions(target.text, choices, questionIndex + 7),
      answer: target.text,
    }, `المقطع ${target.id}`)
  }),
]

const wordPositionQuestions: ArabicFinalTestQuestion[] = (['start', 'middle', 'end'] as const).map((position, index) => {
  const target = words.find((word) => getLetterPositionsInWord(word.text, word.letterId).includes(position))!
  const positionName = { start: 'بداية', middle: 'وسط', end: 'نهاية' }[position]
  const distractors = words.filter((word) => !getLetterPositionsInWord(word.text, target.letterId).includes(position)).map((word) => word.text)
  return requireQuestion({
    id: `medium-word-position-${position}-${target.id}`,
    prompt: `اختر الكلمة التي يظهر فيها حرف ${target.letterId} في ${positionName} الكلمة.`,
    options: choiceOptions(target.text, distractors, index),
    answer: target.text,
  }, `موضع الحرف ${target.letterId}`)
})

const advancedWord = words.find((word) => word.difficulty === 3 && getLetterPositionsInWord(word.text, word.letterId).length > 0)!
const wordLocationQuestions: ArabicFinalTestQuestion[] = [requireQuestion({
  id: `medium-word-location-${advancedWord.id}`,
  prompt: `أين يقع حرف ${advancedWord.letterId} في كلمة ${advancedWord.text}؟`,
  options: ['بداية الكلمة', 'وسط الكلمة', 'نهاية الكلمة'],
  answer: ({ start: 'بداية الكلمة', middle: 'وسط الكلمة', end: 'نهاية الكلمة' } as const)[advancedWord.position],
}, 'تحديد موضع الحرف في كلمة متقدمة')]

const sentenceQuestions: ArabicFinalTestQuestion[] = [0, 8, 18].map((index, questionIndex) => {
  const target = sentences[index]
  const targetLetter = target.letter
  const answer = target.text
  const distractors = sentences.filter((sentence) => sentence.id !== target.id).map((sentence) => sentence.text)
  return requireQuestion({
    id: `medium-sentence-letter-${target.id}`,
    prompt: `أي جملة من الجمل التي تعلمتها ترتبط بحرف ${targetLetter}؟`,
    say: `اختر الجملة المرتبطة بحرف ${targetLetter}.`,
    options: choiceOptions(answer, distractors, questionIndex + 4),
    answer,
  }, `الجملة ${target.id}`)
})

const sentenceOrderQuestions: ArabicFinalTestQuestion[] = [4, 13, 22].map((index, questionIndex) => {
  const target = sentences[index]
  const answer = target.words.join('، ')
  const distractors = sentences
    .filter((sentence) => sentence.id !== target.id && sentence.words.length === target.words.length)
    .map((sentence) => sentence.words.join('، '))
  return requireQuestion({
    id: `medium-sentence-order-${target.id}`,
    prompt: 'ما ترتيب الكلمات الصحيح الذي يكوّن هذه الجملة؟',
    say: target.text,
    stimulus: target.text,
    options: choiceOptions(answer, distractors, questionIndex + 7),
    answer,
  }, `ترتيب كلمات ${target.id}`)
})

const mediumQuestions: ArabicFinalTestQuestion[] = [
  ...wordPositionQuestions,
  ...wordLocationQuestions,
  ...sentenceQuestions,
  ...sentenceOrderQuestions,
]

const hardQuestions: ArabicFinalTestQuestion[] = stories.slice(0, 10).map((story) => {
  const comprehension = story.comprehensionQuestions[0]
  return requireQuestion({
    id: `hard-story-${story.id}`,
    prompt: comprehension.question,
    context: story.pages.map((page) => page.text).join('\n'),
    options: [...comprehension.options],
    answer: comprehension.options[comprehension.correctIndex],
  }, `فهم القصة ${story.id}`)
})

export const ARABIC_FINAL_TEST_LEVELS: [ArabicFinalTestQuestion[], ArabicFinalTestQuestion[], ArabicFinalTestQuestion[]] = [
  easyQuestions,
  mediumQuestions,
  hardQuestions,
]

export function validateArabicFinalTestQuestions(): void {
  const allQuestions = ARABIC_FINAL_TEST_LEVELS.flat()
  const ids = allQuestions.map((question) => question.id)
  if (ARABIC_FINAL_TEST_LEVELS.some((level) => level.length !== 10)) {
    throw new Error('يجب أن يحتوي كل مستوى من الاختبار العربي على ١٠ أسئلة.')
  }
  if (new Set(ids).size !== 30) throw new Error('توجد أسئلة مكررة بين مستويات الاختبار العربي.')
  if (allQuestions.some((question) => question.options.length < 2 || !question.options.includes(question.answer))) {
    throw new Error('توجد إجابة صحيحة غير موجودة ضمن خيارات الاختبار العربي.')
  }
}

validateArabicFinalTestQuestions()
