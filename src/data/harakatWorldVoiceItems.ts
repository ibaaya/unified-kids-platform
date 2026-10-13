/**
 * harakatWorldVoiceItems.ts  ·  src/data/harakatWorldVoiceItems.ts
 * ═════════════════════════════════════════════════════════════════
 * يبني قائمة VoiceRecordingItem لعالم الحركات والمقاطع الجديد.
 * يُستورد داخل vite.config.ts ويُضاف في buildItems().
 *
 * الدمج في vite.config.ts:
 * ─────────────────────────
 *   import { buildHarakatWorldItems } from './src/data/harakatWorldVoiceItems.ts'
 *   // داخل buildItems():
 *   items.push(...buildHarakatWorldItems())
 *
 * يولّد لكل حركة:
 *  • نص الشرح (desc)
 *  • نص التعريف المختصر (intro)
 *  • نطق كل مثال (ex_0 … ex_N)
 *  • نطق الجملة الكاملة (sentence)
 *  • نطق كل سؤال (q_ID)
 */

import { HARAKAT_WORLD_DATA, harakaWorldSoundId } from './harakatWorld.ts'
import type { VoiceRecordingItem } from '../types/voiceStudio.ts'
import { stripEmojiForSpeech } from '../utils/arabicSpeech.ts'

function textHash(text: string): string {
  // Browser and Node compatible deterministic 96-bit fingerprint.
  const seeds = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b]
  return seeds.map((seed) => {
    let hash = seed
    for (let i = 0; i < text.length; i += 1) {
      hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193)
    }
    return (hash >>> 0).toString(16).padStart(8, '0')
  }).join('').slice(0, 24)
}

function safeSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'item'
}

export function buildHarakatWorldItems(): VoiceRecordingItem[] {
  const items: VoiceRecordingItem[] = []
  const usedFilenames = new Set<string>()
  const usedIds = new Set<string>()

  function makeItem(id: string, speechText: string, group: string): VoiceRecordingItem {
    speechText = stripEmojiForSpeech(speechText)
    const hash = textHash(speechText)
    const base = safeSlug(id)
    let filename = `${base}__${hash}.mp3`
    let n = 2
    while (usedFilenames.has(filename)) {
      filename = `${base}_${n}__${hash}.mp3`
      n++
    }
    usedFilenames.add(filename)
    usedIds.add(id)

    return {
      id,
      sourceId: id,
      type: 'sentence',
      group,
      groupLabel: `عالم الحركات والمقاطع · ${group}`,
      text: speechText,
      filename,
      relativePath: `/audio/arabic/harakaworld/${group}/${filename}`,
      contentHash: textHash(id + speechText),
      textHash: hash,
      status: 'missing',
      order: items.length + 1,
      meta: { section: 'arabic', group },
    }
  }

  for (const entry of HARAKAT_WORLD_DATA) {
    const group = `hw_${entry.id}`

    // 1. شرح الحركة
    items.push(makeItem(harakaWorldSoundId(entry.id, 'desc'), entry.descriptionSpeech, group))

    // 2. التعريف المختصر
    items.push(makeItem(harakaWorldSoundId(entry.id, 'intro'), entry.introSpeech, group))

    // 3. نطق كل مثال
    entry.examples.forEach((ex, i) => {
      items.push(makeItem(harakaWorldSoundId(entry.id, `ex_${i}`), ex.speechText, group))
    })

    // 4. الجملة الكاملة
    items.push(makeItem(harakaWorldSoundId(entry.id, 'sentence'), entry.sentenceSpeech, group))

    // 5. كل سؤال
    entry.questions.forEach((q) => {
      items.push(makeItem(`harakaworld_v2_q_${q.id}`, q.speechText, group))
    })
  }

  // Questions in the easy final-test level use their own stable audio IDs.
  for (const id of ['fatha', 'damma', 'kasra', 'sukun', 'shadda', 'tanween_fath'] as const) {
    const entry = HARAKAT_WORLD_DATA.find((item) => item.id === id)
    if (!entry) continue
    const example = entry.examples[0]
    const soundId = `harakaworld_v2_q_${id}_easy`
    if (!usedIds.has(soundId)) {
      items.push(makeItem(
        soundId,
        `مَا اسْمُ الْحَرَكَةِ عَلَى أَوَّلِ حَرْفٍ فِي كَلِمَةِ ${example.word}؟`,
        'hw_final_test_easy',
      ))
    }
  }

  return items
}
