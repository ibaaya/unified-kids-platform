import { useSound } from '../../hooks/useSound'

interface SpeakButtonProps {
  text: string
  size?: 'sm' | 'md'
  label?: string
  audioId?: string
}

export function SpeakButton({ text, size = 'md', label = 'استمع', audioId }: SpeakButtonProps) {
  const { speak, isSpeaking, isSupported } = useSound()

  const dimension = size === 'sm' ? 'w-10 h-10 text-base' : 'w-12 h-12 text-xl'

  if (!isSupported) return null // لا نعرض زرًا لا يعمل — الاعتماد الأساسي يبقى على النص المرئي دائمًا

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => speak(text, audioId)}
      className={`${dimension} shrink-0 flex items-center justify-center rounded-full bg-[var(--color-sky)]/10 text-[var(--color-sky)] hover:bg-[var(--color-sky)]/20 disabled:opacity-50 transition-transform active:scale-90`}
    >
      {isSpeaking ? '🔉' : '🔊'}
    </button>
  )
}
