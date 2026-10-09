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

export async function generateAllBatchWithAI(
  section: VoiceStudioSection,
  voice: string,
  onProgress: (progress: VoiceBatchProgress) => void,
  shouldContinue: () => boolean,
  onlyItemId?: string,
): Promise<VoiceBatchResult> {
  const candidates = onlyItemId
    ? (await loadVoiceItems()).filter((item) => item.id === onlyItemId && item.meta?.section === section && item.status !== 'approved')
    : (await loadVoiceItems()).filter((item) => item.meta?.section === section && (item.status === 'missing' || item.status === 'stale'))
  const result: VoiceBatchResult = { generated: 0, failed: 0, total: candidates.length, stopped: false, results: [] }

  let nextIndex = 0
  let completed = 0
  const worker = async () => {
    while (shouldContinue()) {
      const index = nextIndex++
      if (index >= candidates.length) return
      const item = candidates[index]
      let itemResult: VoiceBatchResult['results'][number]
      try {
        const response = await fetch('/__voice-studio/generate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, itemId: item.id, voice }),
        })
        if (!response.ok) throw new Error(await readError(response) || 'تعذر توليد الملف الصوتي.')
        const payload = await response.json() as { generated: number; failed: number; results: VoiceBatchResult['results'] }
        itemResult = payload.results[0] ?? { itemId: item.id, ok: false, error: 'لم يُرجع الخادم نتيجة لهذا العنصر.' }
      } catch (error) {
        itemResult = { itemId: item.id, ok: false, error: error instanceof Error ? error.message : String(error) }
      }
      completed += 1
      result.results.push(itemResult)
      if (itemResult.ok && itemResult.entry) {
        result.generated += 1
        setRecordedAudioEntry(itemResult.entry)
      } else result.failed += 1
      onProgress({ completed, total: candidates.length, itemId: item.id, ok: itemResult.ok, entry: itemResult.entry, error: itemResult.error })
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, candidates.length) }, () => worker()))
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
