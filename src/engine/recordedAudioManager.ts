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

/** Plays exact recordings or composes an utterance from approved phrase clips and caller-provided speech. */
export function playRecordedAudioText(
  text: string,
  onEnd?: () => void,
  onError?: () => void,
  onMissing?: (text: string, done: () => void) => void,
  options: { composeNumbers?: boolean } = {},
): boolean {
  if (!options.composeNumbers && playRecordedAudio(text, onEnd, onError)) return true

  const parts = text
    .split(/\s*(?:،\s*أَو\s*|[.!?؟]+\s*)\s*/u)
    .map(normalizedAudioText)
    .filter(Boolean)
  if (parts.length < 2) {
    // احفظ التوافق مع الاستدعاءات القديمة، واسمح للمستدعي بتركيب التسجيلات القصيرة.
    if (!onMissing) return false
  }

  const isComposableNumberEntry = (entry: AudioManifestEntry) => entry.itemId.startsWith('numbers:fragment_')
    || /^numbers:q_/u.test(entry.itemId)
    || ['numbers:cheer_correct', 'numbers:cheer_try', 'numbers:welcome'].includes(entry.itemId)
  const availableEntries = Object.values(audioManifest).filter((entry) =>
    (!onMissing || entry.itemId.startsWith('numbers:')) && (!options.composeNumbers || isComposableNumberEntry(entry)),
  )
  const entries = parts.map((part) => availableEntries.find((entry) =>
    entry.status === 'approved' && entry.relativePath && normalizedAudioText(entry.text) === part,
  ))
  if (!entries.some(Boolean) && !onMissing) return false

  const segments: Array<{ entry?: AudioManifestEntry; text?: string }> = []
  if (parts.length >= 2 && entries.every(Boolean)) {
    entries.forEach((entry) => { if (entry) segments.push({ entry }) })
  } else {
    const approved = Object.values(audioManifest)
      .filter((entry) => entry.status === 'approved' && entry.relativePath && (!onMissing || entry.itemId.startsWith('numbers:')) && (!options.composeNumbers || isComposableNumberEntry(entry)))
      .map((entry) => ({ entry, text: normalizedAudioText(entry.text) }))
      .filter((item) => item.text)
      .sort((a, b) => b.text.length - a.text.length)
    let cursor = 0
    let plainStart = 0
    const flushPlain = (end: number) => {
      if (end <= plainStart) return
      const fragment = text.slice(plainStart, end).trim()
      if (/[\p{L}\p{N}]/u.test(fragment)) segments.push({ text: fragment })
    }
    while (cursor < text.length) {
      const remaining = text.slice(cursor)
      const match = approved.find(({ text: phrase }) => {
        if (!remaining.startsWith(phrase)) return false
        const next = remaining[phrase.length]
        return !next || /[\s،؛:,.!?؟]/u.test(next)
      })
      if (match) {
        flushPlain(cursor)
        segments.push({ entry: match.entry })
        cursor += match.text.length
        while (/\s/u.test(text[cursor] ?? '')) cursor += 1
        plainStart = cursor
      } else {
        cursor += 1
      }
    }
    flushPlain(text.length)
    if (!segments.some((segment) => segment.entry)) return false
    if (segments.some((segment) => segment.text) && !onMissing) return false
  }

  const playNext = (index: number): void => {
    if (index >= segments.length) { onEnd?.(); return }
    const segment = segments[index]
    const next = () => playNext(index + 1)
    if (segment.entry) playRecordedAudio(segment.entry.itemId, next, onError)
    else if (segment.text) onMissing?.(segment.text, next)
    else next()
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
