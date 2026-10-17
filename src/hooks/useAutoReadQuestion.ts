import { useEffect, useRef } from 'react'
import { useSound } from './useSound'

export function useAutoReadQuestion(
  text: string,
  enabled: boolean,
  questionKey: string | number,
  delayMs = 500,
  followUpText?: string,
  audioId?: string,
  followUpAudioId?: string,
): void {
  const { speak, speakSequence } = useSound()

  // ✅ احتفظ بآخر نسخة من speak/speakSequence بدون إعادة تشغيل الـ effect
  const speakRef = useRef(speak)
  const speakSequenceRef = useRef(speakSequence)
  useEffect(() => { speakRef.current = speak }, [speak])
  useEffect(() => { speakSequenceRef.current = speakSequence }, [speakSequence])

  useEffect(() => {
    if (!enabled || !text.trim()) return

    const timer = window.setTimeout(() => {
      if (followUpText?.trim()) {
        speakSequenceRef.current([
          { text, audioId },
          { text: followUpText, audioId: followUpAudioId },
        ])
      } else {
        speakRef.current(text, audioId)
      }
    }, delayMs)

    return () => window.clearTimeout(timer)
  // ✅ speak/speakSequence خرجا من هنا — لن يُعيد تشغيل الـ effect عند re-render
  }, [text, enabled, questionKey, delayMs, followUpText, audioId, followUpAudioId])
}