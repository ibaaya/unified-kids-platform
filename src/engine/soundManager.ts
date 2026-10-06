import { playRecordedAudio, stopRecordedAudio } from './recordedAudioManager'

/**
 * محرك النطق العربي: يبدأ بالتسجيلات الأصلية إن وُجدت، ثم يعود إلى Web Speech API.
 * كل استدعاءات الصوت في التطبيق تمر من هنا حتى يبقى السلوك موحدًا.
 */

let cachedVoice: SpeechSynthesisVoice | null = null
let voicesLoaded = false
let pendingSpeakTimer: number | null = null
let speakRequestId = 0

function pickArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null

  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  voicesLoaded = true
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith('ar-sa')) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith('ar')) ??
    voices.find((v) => v.lang?.toLowerCase().includes('ar-')) ??
    null
  )
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && ('speechSynthesis' in window || 'Audio' in window)
}

/** يهيئ الأصوات مبكرًا لأن بعض المتصفحات لا توفر getVoices() فورًا. */
export function primeVoices(): void {
  if (!isSpeechSupported()) return

  cachedVoice = pickArabicVoice()

  if (!voicesLoaded) {
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        cachedVoice = pickArabicVoice()
      },
      { once: true },
    )
  }
}

interface SpeakOptions {
  /** أبطأ قليلًا من المعتاد لتناسب الأطفال. */
  rate?: number
  pitch?: number
  onEnd?: () => void
  onError?: () => void
}

function createUtterance(text: string, options: SpeakOptions): SpeechSynthesisUtterance {
  cachedVoice = cachedVoice ?? pickArabicVoice()

  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = 'ar-SA'
  utterance.rate = options.rate ?? 0.8
  utterance.pitch = options.pitch ?? 1.1

  if (cachedVoice) utterance.voice = cachedVoice
  return utterance
}

/** ينطق نصًا واحدًا، مع حماية من تعارض النطق السابق أو تأخر تحميل الأصوات. */
export function speakArabic(text: string, options: SpeakOptions = {}, audioId?: string): boolean {
  if (!text.trim()) return false

  // التسجيلات التي اعتمدها Voice Studio لها الأولوية على صوت المتصفح.
  if (playRecordedAudio(audioId ?? text, options.onEnd, options.onError)) {
    speakRequestId += 1
    if (pendingSpeakTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(pendingSpeakTimer)
      pendingSpeakTimer = null
    }
    if (isSpeechSupported()) window.speechSynthesis.cancel()
    return true
  }

  if (!isSpeechSupported()) return false

  // أوقف أي تسجيل سؤال ما زال يعمل قبل تشغيل رسالة المتصفح؛ وإلا قد
  // يتداخل صوت السؤال المسجّل مع «أحسنت» أو يحجبها بالكامل.
  stopRecordedAudio()

  const synthesis = window.speechSynthesis
  const requestId = ++speakRequestId

  if (pendingSpeakTimer !== null) {
    window.clearTimeout(pendingSpeakTimer)
    pendingSpeakTimer = null
  }

  synthesis.cancel()
  synthesis.resume()

  // إعطاء المتصفح لحظة بعد cancel/resume، خصوصًا في أول نطق بعد فتح الصفحة.
  pendingSpeakTimer = window.setTimeout(() => {
    pendingSpeakTimer = null
    if (requestId !== speakRequestId) return

    const utterance = createUtterance(text, options)
    utterance.onend = () => {
      if (requestId === speakRequestId) options.onEnd?.()
    }
    utterance.onerror = () => {
      if (requestId === speakRequestId) options.onError?.()
    }

    synthesis.speak(utterance)
  }, 40)

  return true
}

/**
 * ينطق عدة نصوص بالتتابع دون أن يلغي النص السابق.
 * يستخدم عندما يكون المطلوب: اقرأ التعليمات أولًا ثم اقرأ الكلمة/الجملة المستهدفة.
 */
export type SpeechSequenceItem = string | { text: string; audioId?: string }

export function speakArabicSequence(texts: SpeechSequenceItem[], options: SpeakOptions = {}): boolean {
  if (!isSpeechSupported()) return false

  const cleanItems = texts
    .map((item) => typeof item === 'string' ? { text: item.trim() } : { ...item, text: item.text.trim() })
    .filter((item) => Boolean(item.text))
  if (cleanItems.length === 0) return false

  const synthesis = window.speechSynthesis
  const requestId = ++speakRequestId

  if (pendingSpeakTimer !== null) {
    window.clearTimeout(pendingSpeakTimer)
    pendingSpeakTimer = null
  }

  stopRecordedAudio()
  synthesis.cancel()
  synthesis.resume()

  let index = 0

  const speakNext = () => {
    if (requestId !== speakRequestId || index >= cleanItems.length) {
      if (requestId === speakRequestId) options.onEnd?.()
      return
    }

    const item = cleanItems[index]
    index += 1

    const playNext = () => {
      if (requestId === speakRequestId) window.setTimeout(speakNext, 60)
    }
    const speakWithSynthesis = () => {
      if (requestId !== speakRequestId) return
      const utterance = createUtterance(item.text, options)
      utterance.onend = playNext
      utterance.onerror = () => {
        if (requestId === speakRequestId) options.onError?.()
      }
      synthesis.speak(utterance)
    }

    if (item.audioId && playRecordedAudio(item.audioId, playNext, speakWithSynthesis)) return

    speakWithSynthesis()
  }

  pendingSpeakTimer = window.setTimeout(() => {
    pendingSpeakTimer = null
    speakNext()
  }, 40)

  return true
}

export function stopSpeaking(): void {
  stopRecordedAudio()
  speakRequestId += 1

  if (pendingSpeakTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(pendingSpeakTimer)
    pendingSpeakTimer = null
  }

  if (isSpeechSupported()) window.speechSynthesis.cancel()
}
