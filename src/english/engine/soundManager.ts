/**
 * English Sound Manager — يعتمد على Web Speech API
 * - يختار صوتاً إنجليزياً تلقائياً
 * - يقرأ الأسئلة والكلمات والحروف بسرعة مناسبة للأطفال
 * - يدعم التشجيع الصوتي المتنوع
 */

let cachedVoice: SpeechSynthesisVoice | null = null
let voicesLoaded = false

/** اختيار أفضل صوت إنجليزي متاح في المتصفح */
function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null
  voicesLoaded = true
  // أولوية: en-US ثم en-GB ثم أي en
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith('en-us')) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith('en-gb')) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
    null
  )
}

/** تهيئة الأصوات مسبقاً (استدعاء عند تحميل التطبيق) */
export function primeEnglishVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  cachedVoice = pickEnglishVoice()
  if (!voicesLoaded) {
    window.speechSynthesis.addEventListener(
      'voiceschanged',
      () => { cachedVoice = pickEnglishVoice() },
      { once: true }
    )
  }
}

// معرّف الطلب الأخير لمنع التداخل
let speakRequestId = 0

export interface EnglishSpeakOptions {
  rate?: number    // سرعة النطق (0.1 - 2)
  pitch?: number   // درجة الصوت (0 - 2)
  onEnd?: () => void
}

/** الدالة الأساسية للنطق */
export function speakEnglish(text: string, options: EnglishSpeakOptions = {}): void {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return

  const { rate = 0.82, pitch = 1.05, onEnd } = options
  const reqId = ++speakRequestId

  window.speechSynthesis.cancel()

  const doSpeak = () => {
    if (reqId !== speakRequestId) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = rate
    utter.pitch = pitch
    utter.volume = 1

    if (!cachedVoice) cachedVoice = pickEnglishVoice()
    if (cachedVoice) utter.voice = cachedVoice

    if (onEnd) utter.onend = onEnd
    window.speechSynthesis.speak(utter)
  }

  // تأخير بسيط لتجنب خطأ Chrome
  setTimeout(doSpeak, 60)
}

/** قراءة اسم الحرف */
export function speakLetter(letterName: string): void {
  speakEnglish(letterName, { rate: 0.75, pitch: 1.1 })
}

/** قراءة كلمة */
export function speakWord(word: string): void {
  speakEnglish(word, { rate: 0.78 })
}

/** قراءة جملة */
export function speakSentence(sentence: string): void {
  speakEnglish(sentence, { rate: 0.75 })
}

/** قراءة Phonics */
export function speakPhonic(phonicText: string): void {
  speakEnglish(phonicText, { rate: 0.70, pitch: 1.1 })
}

/** تشجيع صوتي متنوع */
const ENCOURAGEMENTS = [
  'Excellent!', 'Well done!', 'Amazing!', 'Perfect!',
  'Super job!', 'Brilliant!', 'Fantastic!', 'Keep going!',
  'You are a star!', 'Wonderful!',
]
let lastEncouragementIdx = -1

export function speakEncouragement(): void {
  let idx
  do { idx = Math.floor(Math.random() * ENCOURAGEMENTS.length) }
  while (idx === lastEncouragementIdx)
  lastEncouragementIdx = idx
  speakEnglish(ENCOURAGEMENTS[idx], { rate: 0.9, pitch: 1.15 })
}

/** تحقق من دعم Web Speech API */
export function isEnglishSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
