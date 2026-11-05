/**
 * AudioUnlockProvider.tsx
 * src/components/AudioUnlockProvider.tsx
 *
 * يلتقط أول تفاعل (نقرة أو لمسة) في أي مكان بالتطبيق،
 * ثم يشغّل صوتاً صامتاً قصيراً لفتح نافذة الصوت مرة واحدة للجلسة كلها.
 * يعمل على: Chrome, Edge, Safari, iOS, Android WebView, PWA.
 */

import { useEffect, useRef } from 'react'
import { primeVoices } from '../engine/soundManager'
import { primeEnglishVoices } from '../english/engine/soundManager'

const STORAGE_KEY = 'audio-unlocked-session'

function createSilentAudio(): HTMLAudioElement {
  // ملف صوتي صامت مضمّن كـ base64 (wav فارغ 0.1 ثانية)
  const silentWav =
    'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
  const audio = new Audio(silentWav)
  audio.volume = 0
  return audio
}

export function AudioUnlockProvider({ children }: { children: React.ReactNode }) {
  const unlocked = useRef(false)

  useEffect(() => {
    // إذا سبق فتح الصوت في هذه الجلسة — لا نحتاج إعادة الفتح
    if (sessionStorage.getItem(STORAGE_KEY) === '1') {
      unlocked.current = true
      primeVoices()
      primeEnglishVoices()
      return
    }

    const unlock = () => {
      if (unlocked.current) return
      unlocked.current = true

      // 1. شغّل صوتاً صامتاً لفتح HTMLAudioElement على iOS/Android
      const silent = createSilentAudio()
      void silent.play().catch(() => {/* مقبول */})

      // 2. هيّئ Web Speech API مبكراً
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        // استدعاء getVoices() أثناء حدث المستخدم يُنشّط الأصوات على بعض المتصفحات
        window.speechSynthesis.getVoices()

        // تشغيل utterance صامت لفتح نافذة Speech على iOS Safari
        const utterance = new SpeechSynthesisUtterance('')
        utterance.volume = 0
        utterance.lang = 'ar-SA'
        window.speechSynthesis.speak(utterance)
      }

      // 3. هيّئ الأصوات المخزّنة مؤقتاً
      primeVoices()
      primeEnglishVoices()

      // 4. احفظ في sessionStorage حتى لا نكرر عند re-render
      try { sessionStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }

      // 5. أزل المستمعين بعد أول تفاعل
      document.removeEventListener('pointerdown', unlock, true)
      document.removeEventListener('keydown', unlock, true)
    }

    // pointerdown يعمل على اللمس والنقر والقلم — أشمل من click
    document.addEventListener('pointerdown', unlock, true)
    document.addEventListener('keydown', unlock, true)

    return () => {
      document.removeEventListener('pointerdown', unlock, true)
      document.removeEventListener('keydown', unlock, true)
    }
  }, [])

  return <>{children}</>
}
