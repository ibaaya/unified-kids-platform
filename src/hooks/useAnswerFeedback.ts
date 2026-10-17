/*src\hooks\useAnswerFeedback.ts */
import { useRef, useState } from 'react'
import { useSound } from './useSound'
import { pickSuccessMessage, pickTryAgainMessage } from '../components/feedback/FeedbackMessage'
import { RETRY_FEEDBACK, SUCCESS_FEEDBACK } from '../utils/feedbackPrompts'

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
    const messageIndex = successCount.current % SUCCESS_FEEDBACK.length
    const message = pickSuccessMessage(successCount.current)
    successCount.current += 1
    speak(message, `feedback:success:${messageIndex + 1}`)
    setFeedback({ status: 'success', message })
  }

  function showRetry() {
    const messageIndex = retryCount.current % RETRY_FEEDBACK.length
    const message = pickTryAgainMessage(retryCount.current)
    retryCount.current += 1
    speak(message, `feedback:retry:${messageIndex + 1}`)
    setFeedback({ status: 'retry', message })
  }

  function reset() {
    setFeedback(null)
  }

  return { feedback, showSuccess, showRetry, reset }
}
