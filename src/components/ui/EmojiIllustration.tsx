interface EmojiIllustrationProps {
  emoji: string
  size?: 'small' | 'card' | 'large' | 'hero'
  className?: string
  label?: string
}

const sizeClasses = {
  small: 'w-16 h-16 text-6xl rounded-2xl',
  card: 'w-28 h-28 text-7xl rounded-3xl',
  large: 'w-36 h-36 text-8xl rounded-[2rem]',
  hero: 'h-44 w-44 text-9xl rounded-[2rem] sm:h-52 sm:w-52 sm:text-[10rem]',
}

/** عرض موحّد وواضح لصور المحتوى التعبيرية في جميع العوالم. */
export function EmojiIllustration({ emoji, size = 'card', className = '', label }: EmojiIllustrationProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-amber-50 via-white to-sky-50 shadow-inner ${sizeClasses[size]} ${className}`}
    >
      {emoji}
    </span>
  )
}
