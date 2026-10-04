import { useEffect } from 'react'
import { useSound } from './useSound'

/**
 * يقرأ سؤال/تعليمة اللعبة تلقائيًا عند ظهور سؤال جديد، وإذا وُجد followUpText
 * ينطقه مباشرة بعد انتهاء السؤال (مثل: تعليمات بناء الكلمة ثم الكلمة نفسها).
 */
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

  useEffect(() => {
    if (!enabled || !text.trim()) return

    const timer = window.setTimeout(() => {
      if (followUpText?.trim()) {
        speakSequence([
          { text, audioId },
          { text: followUpText, audioId: followUpAudioId },
        ])
      } else {
        speak(text, audioId)
      }
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [text, enabled, questionKey, delayMs, followUpText, audioId, followUpAudioId, speak, speakSequence])
}
