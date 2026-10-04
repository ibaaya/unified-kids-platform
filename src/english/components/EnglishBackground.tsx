import type { CSSProperties, ReactNode } from 'react'
import './english-background.css'

// Override one route here when it needs its own illustration in the future.
const ENGLISH_BACKGROUNDS: Record<string, string> = {
  default: '/images/LearnEnglish_bg.jpg',
}

export function EnglishBackground({ children, page = 'default' }: { children: ReactNode; page?: string }) {
  const image = ENGLISH_BACKGROUNDS[page] ?? ENGLISH_BACKGROUNDS.default
  return (
    <div className="english-background" style={{ '--english-background-image': `url("${image}")` } as CSSProperties}>
      {children}
    </div>
  )
}
