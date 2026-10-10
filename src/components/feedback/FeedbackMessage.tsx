export { pickSuccessMessage, pickTryAgainMessage } from '../../utils/feedbackPrompts'

interface FeedbackMessageProps {
  status: 'success' | 'retry'
  message: string
}

export function FeedbackMessage({ status, message }: FeedbackMessageProps) {
  const isSuccess = status === 'success'
  return (
    <div
      role="status"
      className={`text-center font-display font-extrabold text-xl py-3 px-4 rounded-2xl ${
        isSuccess
          ? 'bg-[var(--color-leaf)]/10 text-[var(--color-leaf)]'
          : 'bg-[var(--color-amber)]/15 text-[var(--color-sun-dark)]'
      }`}
    >
      {message}
    </div>
  )
}
