import { Capacitor } from '@capacitor/core'

export interface NativeSpeechOptions {
  lang: string
  rate?: number
  pitch?: number
  onEnd?: () => void
  onError?: () => void
}

let requestId = 0
let nativeSpeechActive = false

export function hasNativeSpeech(): boolean {
  return Capacitor.isNativePlatform()
}

/** Uses Android TextToSpeech / iOS AVSpeechSynthesizer when Web Speech is absent. */
export function speakNative(text: string, options: NativeSpeechOptions): boolean {
  if (!hasNativeSpeech() || !text.trim()) return false
  const id = ++requestId
  void import('@capacitor-community/text-to-speech').then(async ({ TextToSpeech }) => {
    if (id !== requestId) return
    if (nativeSpeechActive) await TextToSpeech.stop().catch(() => undefined)
    if (id !== requestId) return
    nativeSpeechActive = true
    await TextToSpeech.speak({
      text: text.trim(),
      lang: options.lang,
      rate: options.rate ?? 0.85,
      pitch: options.pitch ?? 1,
      volume: 1,
      category: 'ambient',
      queueStrategy: 0,
    })
    if (id === requestId) {
      nativeSpeechActive = false
      options.onEnd?.()
    }
  }).catch(() => {
    if (id === requestId) {
      nativeSpeechActive = false
      options.onError?.()
    }
  })
  return true
}

export function stopNativeSpeech(): void {
  requestId += 1
  if (!hasNativeSpeech() || !nativeSpeechActive) return
  nativeSpeechActive = false
  void import('@capacitor-community/text-to-speech')
    .then(({ TextToSpeech }) => TextToSpeech.stop())
    .catch(() => undefined)
}
