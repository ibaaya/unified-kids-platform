export type VoiceItemType =
  | 'letter'
  | 'haraka'
  | 'syllable'
  | 'word'
  | 'sentence'
  | 'prompt'
  | 'story-page'
  | 'story-question'
  | 'sentence-question'

export type VoiceItemStatus = 'missing' | 'recorded' | 'approved' | 'generated' | 'pending' | 'stale'

export interface VoiceRecordingItem {
  id: string
  type: VoiceItemType
  group: string
  groupLabel: string
  text: string
  filename: string
  relativePath: string
  status: VoiceItemStatus
  sourceId: string
  order: number
  contentHash: string
  textHash?: string
  source?: 'manual' | 'edge-tts' | 'azure' // [AZURE-T1] أضفنا 'azure' ليقبل TypeScript المزوّد الجديد
  voice?: string
  meta?: Record<string, string | number | undefined>
}

export interface AudioManifestEntry {
  itemId: string
  sourceId: string
  type: VoiceItemType
  text: string
  filename: string
  relativePath: string
  status: 'recorded' | 'pending' | 'generated' | 'approved'
  updatedAt: string
  durationMs?: number
  contentHash: string
  textHash?: string
  source?: 'manual' | 'edge-tts' | 'azure' // [AZURE-T1] أضفنا 'azure' ليقبل TypeScript المزوّد الجديد
  voice?: string
  processing?: {
    format: 'mp3'
    channels: 1
    sampleRate: number
    bitrateKbps: number
    trimSilence: boolean
    normalizeDb: number
  }
}

export type AudioManifest = Record<string, AudioManifestEntry>