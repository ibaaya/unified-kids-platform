import type { AudioManifest, VoiceRecordingItem } from '../types/voiceStudio'
import { removeRecordedAudioEntry, setRecordedAudioEntry } from '../engine/recordedAudioManager'

const manifestModules = import.meta.glob('../data/audio-manifest.json', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const bundledManifestUrl = manifestModules['../data/audio-manifest.json']

export async function loadAudioManifest(): Promise<AudioManifest> {
  if (!bundledManifestUrl) return {}
  try {
    const response = await fetch(`${bundledManifestUrl}?t=${Date.now()}`)
    if (!response.ok) return {}
    return (await response.json()) as AudioManifest
  } catch {
    return {}
  }
}

export async function loadVoiceItems(): Promise<VoiceRecordingItem[]> {
  const response = await fetch(`/__voice-studio/items?t=${Date.now()}`)
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || 'تعذر تحميل قائمة التسجيلات.')
  }
  return (await response.json()) as VoiceRecordingItem[]
}

function toBase64(blob: Blob): Promise<string> {
  return blob.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
    }
    return btoa(binary)
  })
}

async function readError(response: Response): Promise<string> {
  const text = await response.text().catch(() => '')
  try {
    const parsed = JSON.parse(text) as { error?: string }
    return parsed.error || text
  } catch {
    return text
  }
}

export async function saveVoiceRecording(
  item: VoiceRecordingItem,
  blob: Blob,
  durationMs: number,
): Promise<{ item: VoiceRecordingItem; entry: AudioManifest[string]; localSave: boolean }> {
  const response = await fetch('/__voice-studio/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      itemId: item.id,
      sourceId: item.sourceId,
      type: item.type,
      text: item.text,
      filename: item.filename,
      relativePath: item.relativePath,
      audioBase64: await toBase64(blob),
      durationMs,
      contentHash: item.contentHash,
      textHash: item.textHash,
    }),
  })

  if (!response.ok) {
    const detail = await readError(response)
    throw new Error(
      detail ||
      'تعذر الحفظ داخل المشروع. تأكد أنك شغلت المشروع بواسطة npm run dev وليس vite preview.',
    )
  }

  const result = (await response.json()) as {
    item: VoiceRecordingItem
    entry: AudioManifest[string]
    localSave: boolean
    savedBytes?: number
  }
  if (result.entry) setRecordedAudioEntry(result.entry)
  return result
}

export interface VoiceBatchResult {
  generated: number
  failed: number
  total: number
  stopped: boolean
  results: Array<{ itemId: string; ok: boolean; error?: string; entry?: AudioManifest[string] }>
}

export interface VoiceBatchProgress {
  completed: number
  total: number
  itemId: string
  ok: boolean
  entry?: AudioManifest[string]
  error?: string
}

export type VoiceStudioSection = 'arabic' | 'english' | 'numbers' | 'discover' | 'islamic' | 'skills'

// [AZURE-S1] مزوّدات التوليد المتاحة. لإضافة مزوّد جديد لاحقًا (مثل ElevenLabs) أضف اسمه هنا
//   وفي vite.config.ts (TtsProvider) وفي قائمة الاختيار داخل VoiceStudio.tsx.
export type TtsProvider = 'edge-tts' | 'azure'

export async function deleteVoiceGroupAudio(section: VoiceStudioSection, group: string): Promise<{ deletedFiles: number; removedEntries: number; itemIds: string[] }> {
  const response = await fetch('/__voice-studio/delete-group', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, group, confirmed: true }),
  })
  if (!response.ok) throw new Error(await readError(response) || 'تعذر حذف تسجيلات هذه المجموعة.')
  const result = await response.json() as { deletedFiles: number; removedEntries: number; removedItemIds: string[] }
  for (const itemId of result.removedItemIds) removeRecordedAudioEntry(itemId)
  return { deletedFiles: result.deletedFiles, removedEntries: result.removedEntries, itemIds: result.removedItemIds }
}

export async function deleteVoiceSectionAudio(section: VoiceStudioSection): Promise<{ deletedFiles: number; removedEntries: number; itemIds: string[] }> {
  const response = await fetch('/__voice-studio/delete-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, confirmed: true }),
  })
  if (!response.ok) throw new Error(await readError(response) || 'تعذر حذف تسجيلات هذا القسم.')
  const result = await response.json() as { deletedFiles: number; removedEntries: number; removedItemIds: string[] }
  for (const itemId of result.removedItemIds) removeRecordedAudioEntry(itemId)
  return { deletedFiles: result.deletedFiles, removedEntries: result.removedEntries, itemIds: result.removedItemIds }
}

export async function approveGeneratedVoices(section: VoiceStudioSection): Promise<AudioManifest[string][]> {
  const response = await fetch('/__voice-studio/approve-generated', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section }),
  })
  if (!response.ok) throw new Error(await readError(response) || 'تعذر اعتماد التسجيلات السابقة.')
  const result = await response.json() as { approved: AudioManifest[string][] }
  for (const entry of result.approved) setRecordedAudioEntry(entry)
  return result.approved
}

/**
 * توليد جماعي سريع:
 *  - يرسل دفعات من 8 عناصر لكل طلب HTTP (بدل عنصر-عنصر).
 *  - يشغّل حتى 3 طلبات متوازية → 24 عنصراً قيد التوليد في نفس الوقت.
 *  - كل طلب داخلياً يولّد حتى 8 عناصر بالتوازي عبر edge-tts.
 *  - الخادم يكتب المانيفست مرة واحدة لكل دفعة (بدل 8 مرات).
 */
export async function generateAllBatchWithAI(
  section: VoiceStudioSection,
  voice: string,
  onProgress: (progress: VoiceBatchProgress) => void,
  shouldContinue: () => boolean,
  onlyItemId?: string,
  // [AZURE-S2] معامل جديد اختياري في آخر القائمة؛ الاستدعاءات القديمة تبقى تعمل (الافتراضي edge-tts).
  provider: TtsProvider = 'edge-tts',
): Promise<VoiceBatchResult> {
  const allItems = await loadVoiceItems()
  const candidates = onlyItemId
    ? allItems.filter((item) => item.id === onlyItemId && item.meta?.section === section && item.status !== 'approved')
    : allItems.filter((item) => item.meta?.section === section && (item.status === 'missing' || item.status === 'stale'))

  const result: VoiceBatchResult = {
    generated: 0,
    failed: 0,
    total: candidates.length,
    stopped: false,
    results: [],
  }
  if (candidates.length === 0) return result

  // حجم الدفعة: 8 عناصر لكل طلب HTTP. مع 3 طلبات متوازية = 24 عنصراً فعلياً.
  const BATCH_SIZE = 8
  const batches: VoiceRecordingItem[][] = []
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    batches.push(candidates.slice(i, i + BATCH_SIZE))
  }

  let nextBatch = 0
  let completed = 0

  const worker = async () => {
    while (shouldContinue()) {
      const batchIndex = nextBatch++
      if (batchIndex >= batches.length) return
      const batch = batches[batchIndex]

      try {
        const response = await fetch('/__voice-studio/generate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section,
            itemIds: batch.map((item) => item.id),
            voice,
            provider, // [AZURE-S3] يُرسَل إلى /__voice-studio/generate-batch في vite.config.ts
          }),
        })

        if (!response.ok) {
          const errMsg = await readError(response) || 'تعذر توليد الدفعة.'
          for (const item of batch) {
            completed += 1
            result.failed += 1
            const itemResult = { itemId: item.id, ok: false, error: errMsg }
            result.results.push(itemResult)
            onProgress({
              completed,
              total: candidates.length,
              itemId: item.id,
              ok: false,
              error: errMsg,
            })
          }
          continue
        }

        const payload = await response.json() as {
          generated: number
          failed: number
          results: VoiceBatchResult['results']
        }

        const byId = new Map(payload.results.map((entry) => [entry.itemId, entry]))
        for (const item of batch) {
          const itemResult = byId.get(item.id) ?? {
            itemId: item.id,
            ok: false,
            error: 'لم يُرجع الخادم نتيجة لهذا العنصر.',
          }
          completed += 1
          result.results.push(itemResult)
          if (itemResult.ok && itemResult.entry) {
            result.generated += 1
            setRecordedAudioEntry(itemResult.entry)
          } else {
            result.failed += 1
          }
          onProgress({
            completed,
            total: candidates.length,
            itemId: item.id,
            ok: itemResult.ok,
            entry: itemResult.entry,
            error: itemResult.error,
          })
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        for (const item of batch) {
          completed += 1
          result.failed += 1
          const itemResult = { itemId: item.id, ok: false, error: msg }
          result.results.push(itemResult)
          onProgress({
            completed,
            total: candidates.length,
            itemId: item.id,
            ok: false,
            error: msg,
          })
        }
      }
    }
  }

  // 3 عمال × 8 عناصر = 24 عنصراً قيد التوليد في وقت واحد. توازن جيد بين السرعة والاستقرار.
  await Promise.all(Array.from({ length: Math.min(2, batches.length) }, () => worker()))
  result.stopped = completed < candidates.length && !shouldContinue()
  return result
}

export async function approveGeneratedVoice(itemId: string): Promise<AudioManifest[string]> {
  const response = await fetch('/__voice-studio/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  })
  if (!response.ok) throw new Error(await readError(response) || 'تعذر اعتماد الملف الصوتي.')
  const result = await response.json() as { entry: AudioManifest[string] }
  setRecordedAudioEntry(result.entry)
  return result.entry
}

export async function deleteVoiceRecording(
  itemId: string,
): Promise<{ itemId: string; localSave: boolean }> {
  const response = await fetch('/__voice-studio/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  })

  if (!response.ok) {
    const detail = await readError(response)
    throw new Error(detail || 'تعذر حذف التسجيل من المشروع.')
  }

  const result = (await response.json()) as { itemId: string; localSave: boolean }
  removeRecordedAudioEntry(result.itemId)
  return result
}