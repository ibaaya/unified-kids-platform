import { useRef, useState } from 'react'
import { useSound } from './useSound'
import { pickSuccessMessage, pickTryAgainMessage } from '../components/feedback/FeedbackMessage'

export type AnswerFeedbackState = { status: 'success' | 'retry'; message: string } | null

/**
 * يوحّد منطق "تحفيز الإجابة" في كل الألعاب: يتناوب بين صيغ مختلفة (بدل
 * التكرار العشوائي)، وينطق الرسالة صوتيًا فور ظهورها.
 * ملاحظة: لم يعد يُدرج اسم الطفل ولا وصف الأيقونة في الرسالة.
 */
export function useAnswerFeedback() {
  const [feedback, setFeedback] = useState<AnswerFeedbackState>(null)
  const successCount = useRef(0)
  const retryCount = useRef(0)
  const { speak } = useSound()

  function showSuccess() {
    const message = pickSuccessMessage(successCount.current)
    successCount.current += 1
    setFeedback({ status: 'success', message })
    speak(message)
  }

  function showRetry() {
    const message = pickTryAgainMessage(retryCount.current)
    retryCount.current += 1
    setFeedback({ status: 'retry', message })
    speak(message)
  }

  function reset() {
    setFeedback(null)
  }

  return { feedback, showSuccess, showRetry, reset }
}