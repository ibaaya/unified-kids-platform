import lettersData from '../data/letters.json'
import wordsData from '../data/words.json'
import syllablesData from '../data/syllables.json'
import { HARAKA_ORDER } from '../data/harakaLabels'
import type { Letter, Word, Syllable, WorldId } from '../types/content'

const letters = lettersData as Letter[]
const words = wordsData as Word[]
const syllables = syllablesData as Syllable[]

/** كل أزواج (حرف، نوع) الموجودة فعليًا في بيانات المقاطع. */
function syllableLessonIds(): string[] {
  const pairs = new Set(syllables.map((s) => `${s.type}_${s.letterId}`))
  return Array.from(pairs).map((key) => `syllable_lesson_${key}`)
}

/** كل معرّفات "الدرس المكتمل" (completedLessonIds) المطلوبة لاعتبار عالم ما مكتملًا 100%. */
function lessonIdsForWorld(worldId: WorldId): string[] {
  switch (worldId) {
    case 'letters':
      return letters.map((l) => `letter_lesson_${l.id}`)
    case 'harakat':
      return HARAKA_ORDER.map((h) => `haraka_lesson_${h}`)
    case 'syllables':
      return syllableLessonIds()
    case 'words':
      return words.map((w) => `word_lesson_${w.id}`)
    default:
      // الجمل والقصص: محتواهما التفاعلي (الأسئلة الاستيعابية) لم يُبنَ بعد
      return []
  }
}

export interface WorldCompletion {
  done: number
  total: number
  isComplete: boolean
}

/** نسبة إنجاز الطفل لعالم معيّن — تُستخدم لعرض شارة "🏅 عالم مكتمل" في الخريطة الرئيسية. */
export function getWorldCompletion(worldId: WorldId, completedLessonIds: string[]): WorldCompletion {
  const required = lessonIdsForWorld(worldId)
  if (required.length === 0) return { done: 0, total: 0, isComplete: false }
  const doneSet = new Set(completedLessonIds)
  const done = required.filter((id) => doneSet.has(id)).length
  return { done, total: required.length, isComplete: done === required.length }
}

export function isLetterLessonDone(letterId: string, completedLessonIds: string[]): boolean {
  return completedLessonIds.includes(`letter_lesson_${letterId}`)
}

/** هل أنهى الطفل كل كلمات حرف معيّن في عالم الكلمات؟ */
export function isWordsForLetterDone(letterId: string, completedLessonIds: string[]): boolean {
  const ids = words.filter((w) => w.letterId === letterId).map((w) => `word_lesson_${w.id}`)
  return ids.length > 0 && ids.every((id) => completedLessonIds.includes(id))
}
