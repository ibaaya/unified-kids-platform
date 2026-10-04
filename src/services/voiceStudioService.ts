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
