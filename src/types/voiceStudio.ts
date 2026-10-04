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

export type VoiceItemStatus = 'missing' | 'recorded' | 'approved' | 'stale'

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
  meta?: Record<string, string | number | undefined>
}

export interface AudioManifestEntry {
  itemId: string
  sourceId: string
  type: VoiceItemType
  text: string
  filename: string
  relativePath: string
  status: 'recorded' | 'approved'
  updatedAt: string
  durationMs?: number
  contentHash: string
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
