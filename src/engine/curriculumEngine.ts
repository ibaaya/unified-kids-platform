import { unlockWorld, getChildById, DEFAULT_CHILD_SETTINGS } from '../services/progressService'
import { computeSkillGroupMasteryPercent } from './masteryEngine'
import lettersData from '../data/letters.json'
import wordsData from '../data/words.json'
import worldsData from '../data/worlds.json'
import { HARAKAT_WORLD_MAP, HARAKA_WORLD_ORDER } from '../data/harakatWorld'
import type { Letter, Word, WorldDefinition } from '../types/content'

const letters = lettersData as Letter[]
const words = wordsData as Word[]
const worlds = (worldsData as WorldDefinition[]).slice().sort((a, b) => a.order - b.order)

/**
 * يربط كل عالم بمجموعة "المهارات" التي تُحسب منها نسبة إتقانه.
 * عوالم الحروف والحركات والكلمات تملك ألعابًا تسجّل محاولات فعلية
 * (letter_/harakaworld_/word_)، لذا أصبح شرط الفتح التسلسلي حقيقيًا.
 * عالما الجمل والقصص لا يزال محتواهما
 * التفاعلي قيد البناء، فتبقى بلا مهارات قابلة للقياس حتى الآن.
 */
function skillIdsForWorld(worldId: string): string[] {
  switch (worldId) {
    case 'letters':
      return letters.map((l) => `letter_${l.id}`)
    case 'harakat':
      return HARAKA_WORLD_ORDER.flatMap((id) =>
        (HARAKAT_WORLD_MAP.get(id)?.questions ?? []).map((question) => `harakaworld_${id}_${question.id}`),
      )
    case 'words':
      return words.map((w) => `word_${w.id}`)
    default:
      return []
  }
}

/**
 * يفحص كل العوالم المقفلة، ويفتح أي عالم يستحق الفتح حسب إعدادات ولي الأمر
 * لهذا الطفل تحديدًا (child.settings.unlockMode). يُستدعى بعد كل لعبة، وعند
 * فتح التطبيق. الفتح تراكمي فقط (لا يُقفل عالم مفتوح مسبقًا حتى لو تغيّر الوضع
 * أو انخفض الإتقان لاحقًا).
 *
 * - وضع "free": كل العوالم تُفتح فورًا بلا شروط (تنقّل حر).
 * - وضع "sequential": كل عالم يحتاج أن يكون العالم الذي يعتمد عليه (بحسب
 *   worlds.json) مفتوحًا هو نفسه أولًا، ثم إمّا:
 *     - إن كان لهذا العالم السابق نظام تتبع إتقان حقيقي (حروف/كلمات حاليًا) →
 *       يُشترط الوصول لنسبة الإتقان التي حدّدها ولي الأمر
 *       (child.settings.sequentialThresholdPercent، افتراضيًا 20%).
 *     - إن لم تُبنَ ألعاب هذا العالم السابق بعد (لا مهارات قابلة للقياس) →
 *       يُفتح العالم التالي تلقائيًا بمجرد فتح سابقه، ريثما تُبنى ألعابه
 *       الخاصة (وعندها يصبح الشرط حقيقيًا تلقائيًا دون تعديل هذا الملف).
 */
export async function checkWorldUnlocks(childId: number): Promise<string[]> {
  const child = await getChildById(childId)
  if (!child) return []

  const mode = child.settings?.unlockMode ?? DEFAULT_CHILD_SETTINGS.unlockMode
  const globalThreshold =
    child.settings?.sequentialThresholdPercent ?? DEFAULT_CHILD_SETTINGS.sequentialThresholdPercent

  const unlocked = new Set(child.unlockedWorldIds)
  const newlyUnlocked: string[] = []

  for (const world of worlds) {
    if (unlocked.has(world.id)) continue

    // فتح حر، أو عالم بلا أي شرط فتح أصلًا (مثل عالم الحروف نفسه)
    if (mode === 'free' || !world.unlockRequirement) {
      await unlockWorld(childId, world.id)
      unlocked.add(world.id)
      newlyUnlocked.push(world.id)
      continue
    }

    // تسلسل: يجب أن يكون العالم السابق نفسه مفتوحًا أولًا قبل أي حساب
    const prevWorldId = world.unlockRequirement.worldId
    if (!unlocked.has(prevWorldId)) continue

    const requiredSkillIds = skillIdsForWorld(prevWorldId)
    if (requiredSkillIds.length === 0) {
      // لا يوجد بعد نظام تتبع لهذا العالم السابق (ألعابه لم تُبنَ بعد)
      await unlockWorld(childId, world.id)
      unlocked.add(world.id)
      newlyUnlocked.push(world.id)
      continue
    }

    const percent = await computeSkillGroupMasteryPercent(childId, requiredSkillIds, 2)
    const threshold = globalThreshold ?? world.unlockRequirement.masteryPercent
    if (percent >= threshold) {
      await unlockWorld(childId, world.id)
      unlocked.add(world.id)
      newlyUnlocked.push(world.id)
    }
  }

  return newlyUnlocked
}
