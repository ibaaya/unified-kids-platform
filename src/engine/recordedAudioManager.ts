import type { AudioManifest, AudioManifestEntry } from '../types/voiceStudio'
import bundledManifestJson from '../data/audio-manifest.json'

// المانيفست المضمَّن وقت البناء: هو المصدر في الموقع المنشور وفي التطبيق (لا يوجد خادم تطوير هناك).
const bundledManifest = bundledManifestJson as unknown as AudioManifest
const IS_DEV = import.meta.env.DEV

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

// الإنتاج: المانيفست المضمَّن فقط. التطوير: نبدأ بنسخة المتصفح ثم نحدّثها من خادم الاستوديو.
audioManifest = IS_DEV ? readLocalManifest() : bundledManifest
manifestLoaded = !IS_DEV

export async function hydrateRecordedAudioManifest(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!IS_DEV) {
    audioManifest = bundledManifest
    manifestLoaded = true
    return
  }
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
      (candidate.sourceId === audioId || candidate.itemId === audioId || candidate.text === audioId),
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

function normalizedAudioText(text: string): string {
  return text.trim().replace(/[.!?؟،؛:]+$/u, '').replace(/\s+/g, ' ')
}

/** Plays exact recordings, including simple phrases composed from separately recorded pieces. */
export function playRecordedAudioText(
  text: string,
  onEnd?: () => void,
  onError?: () => void,
): boolean {
  if (playRecordedAudio(text, onEnd, onError)) return true

  const parts = text
    .split(/\s*(?:،\s*أَو\s*|[.!?؟]+\s*)\s*/u)
    .map(normalizedAudioText)
    .filter(Boolean)
  if (parts.length < 2) return false

  const entries = parts.map((part) => Object.values(audioManifest).find((entry) =>
    entry.status === 'approved' && entry.relativePath && normalizedAudioText(entry.text) === part,
  ))
  if (entries.some((entry) => !entry)) return false

  const playNext = (index: number): void => {
    const entry = entries[index]
    if (!entry) { onEnd?.(); return }
    const ended = index + 1 === entries.length ? onEnd : () => playNext(index + 1)
    playRecordedAudio(entry.itemId, ended, onError)
  }
  playNext(0)
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
