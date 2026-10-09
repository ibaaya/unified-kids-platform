/** English Sound Manager — تشغيل التسجيلات المعتمدة أولاً ثم الرجوع إلى Web Speech API. */
import { playRecordedAudio, stopRecordedAudio } from '../../engine/recordedAudioManager'
import { ENGLISH_ENCOURAGEMENTS } from '../data/voicePrompts'

let cachedVoice: SpeechSynthesisVoice | null = null
let voicesLoaded = false
let speakRequestId = 0

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  voicesLoaded = true
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith('en-us')) ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('en-gb')) ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('en')) ?? null
}

export function primeEnglishVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  cachedVoice = pickEnglishVoice()
  if (!voicesLoaded) {
    window.speechSynthesis.addEventListener('voiceschanged', () => { cachedVoice = pickEnglishVoice() }, { once: true })
  }
}

export interface EnglishSpeakOptions { rate?: number; pitch?: number; onEnd?: () => void }

export function speakEnglish(text: string, options: EnglishSpeakOptions = {}): void {
  if (typeof window === 'undefined' || !text) return
  const { rate = 0.82, pitch = 1.05, onEnd } = options
  const requestId = ++speakRequestId
  if (window.speechSynthesis) window.speechSynthesis.cancel()
  stopRecordedAudio()

  const speakWithSynthesis = () => {
    if (requestId !== speakRequestId) return
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = 1
    if (!cachedVoice) cachedVoice = pickEnglishVoice()
    if (cachedVoice) utterance.voice = cachedVoice
    if (onEnd) utterance.onend = onEnd
    window.speechSynthesis.speak(utterance)
  }

  if (playRecordedAudio(text, onEnd, speakWithSynthesis)) return
  if (!window.speechSynthesis) return
  window.setTimeout(speakWithSynthesis, 60)
}

export function speakLetter(letterName: string): void { speakEnglish(letterName, { rate: 0.75, pitch: 1.1 }) }
export function speakWord(word: string): void { speakEnglish(word, { rate: 0.78 }) }
export function speakSentence(sentence: string): void { speakEnglish(sentence, { rate: 0.75 }) }
export function speakPhonic(phonicText: string): void { speakEnglish(phonicText, { rate: 0.70, pitch: 1.1 }) }

let lastEncouragementIdx = -1
export function speakEncouragement(): void {
  let idx
  do { idx = Math.floor(Math.random() * ENGLISH_ENCOURAGEMENTS.length) } while (idx === lastEncouragementIdx)
  lastEncouragementIdx = idx
  speakEnglish(ENGLISH_ENCOURAGEMENTS[idx], { rate: 0.9, pitch: 1.15 })
}
export function isEnglishSpeechSupported(): boolean { return typeof window !== 'undefined' && 'speechSynthesis' in window }
