import { useCallback, useEffect, useState } from 'react'
import {
  isSpeechSupported,
  primeVoices,
  speakArabic,
  speakArabicSequence,
  stopSpeaking,
  type SpeechSequenceItem,
} from '../engine/soundManager'

interface UseSoundResult {
  speak: (text: string, audioId?: string) => void
  speakSequence: (texts: SpeechSequenceItem[]) => void
  isSpeaking: boolean
  isSupported: boolean
}

export function useSound(): UseSoundResult {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const supported = isSpeechSupported()

  useEffect(() => {
    primeVoices()
    return () => stopSpeaking()
  }, [])

  const speak = useCallback((text: string, audioId?: string) => {
    if (!text.trim()) return

    setIsSpeaking(true)
    const started = speakArabic(text, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    }, audioId)

    if (!started) setIsSpeaking(false)
  }, [])

  const speakSequence = useCallback((texts: SpeechSequenceItem[]) => {
    if (texts.every((item) => !(typeof item === 'string' ? item : item.text).trim())) return

    setIsSpeaking(true)
    const started = speakArabicSequence(texts, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })

    if (!started) setIsSpeaking(false)
  }, [])

  return { speak, speakSequence, isSpeaking, isSupported: supported }
}
