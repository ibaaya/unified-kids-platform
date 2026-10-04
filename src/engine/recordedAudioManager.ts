import type { AudioManifest, AudioManifestEntry } from '../types/voiceStudio'

let audioManifest: AudioManifest = {}
let currentAudio: HTMLAudioElement | null = null
let audioRequestId = 0
let manifestLoaded = false

const STORAGE_KEY = 'arabic-kids-recorded-audio-manifest-v1'

function readLocalManifest(): AudioManifest {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as AudioManifest
  } catch {
    return {}
  }
}

function writeLocalManifest(manifest: AudioManifest): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(manifest)) } catch { /* storage may be unavailable */ }
}

audioManifest = readLocalManifest()

export async function hydrateRecordedAudioManifest(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const response = await fetch(`/__voice-studio/manifest?t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) return
    const serverManifest = (await response.json()) as AudioManifest
    audioManifest = serverManifest
    writeLocalManifest(serverManifest)
    manifestLoaded = true
  } catch {
    manifestLoaded = true
  }
}

export function setRecordedAudioEntry(entry: AudioManifestEntry): void {
  audioManifest = { ...audioManifest, [entry.itemId]: entry }
  writeLocalManifest(audioManifest)
}

export function removeRecordedAudioEntry(itemId: string): void {
  const next = { ...audioManifest }
  delete next[itemId]
  audioManifest = next
  writeLocalManifest(next)
}

function findRecordedEntry(audioId?: string): AudioManifestEntry | null {
  if (!audioId) return null
  const direct = audioManifest[audioId]
  if (direct?.status === 'approved' && direct.relativePath) return direct

  return Object.values(audioManifest).find(
    (candidate) =>
      candidate.status === 'approved' &&
      candidate.relativePath &&
      (candidate.sourceId === audioId || candidate.itemId === audioId),
  ) ?? null
}

export function hasRecordedAudio(audioId?: string): boolean {
  return Boolean(findRecordedEntry(audioId))
}

export function playRecordedAudio(
  audioId: string | undefined,
  onEnd?: () => void,
  onError?: () => void,
): boolean {
  if (!audioId || typeof window === 'undefined') return false

  const entry = findRecordedEntry(audioId)
  if (!entry) return false

  const requestId = ++audioRequestId
  currentAudio?.pause()
  currentAudio = new Audio(`${entry.relativePath}?v=${encodeURIComponent(entry.updatedAt)}`)
  currentAudio.preload = 'auto'
  currentAudio.volume = 1

  currentAudio.onended = () => {
    if (requestId === audioRequestId) onEnd?.()
  }
  currentAudio.onerror = () => {
    if (requestId === audioRequestId) onError?.()
  }

  void currentAudio.play().catch(() => {
    if (requestId === audioRequestId) onError?.()
  })
  return true
}

export function stopRecordedAudio(): void {
  audioRequestId += 1
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

export function isRecordedAudioManifestLoaded(): boolean {
  return manifestLoaded
}
