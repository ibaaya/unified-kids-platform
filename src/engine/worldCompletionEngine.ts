import lettersData from '../data/letters.json'
import wordsData from '../data/words.json'
import { HARAKA_WORLD_ORDER } from '../data/harakatWorld'
import type { Letter, Word, WorldId } from '../types/content'

const letters = lettersData as Letter[]
const words = wordsData as Word[]
/** كل معرّفات "الدرس المكتمل" (completedLessonIds) المطلوبة لاعتبار عالم ما مكتملًا 100%. */
function lessonIdsForWorld(worldId: WorldId): string[] {
  switch (worldId) {
    case 'letters':
      return letters.map((l) => `letter_lesson_${l.id}`)
    case 'harakat':
      return HARAKA_WORLD_ORDER.map((h) => `harakaworld_lesson_${h}`)
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
  const done = required.filter((id) => {
    if (doneSet.has(id)) return true
    // Preserve progress from the previous standalone harakat lessons.
    if (worldId === 'harakat' && id.startsWith('harakaworld_lesson_')) {
      return doneSet.has(id.replace('harakaworld_lesson_', 'haraka_lesson_'))
    }
    return false
  }).length
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
