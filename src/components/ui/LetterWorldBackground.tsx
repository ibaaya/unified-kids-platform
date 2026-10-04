import type { ReactNode } from 'react'
import { VISUAL_ASSETS } from '../../config/visualAssets'

interface LetterWorldBackgroundProps {
  children: ReactNode
}

/** Shared decorative backdrop for the letter world and all of its lessons. */
export function LetterWorldBackground({ children }: LetterWorldBackgroundProps) {
  return (
    <div className="relative isolate min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08), rgba(255,255,255,.12)), url("${VISUAL_ASSETS.lettersWorldBackground}")`,
        }}
      />
      <div className="relative z-10 min-h-screen" style={{ paddingTop: 'clamp(125px, 17vh, 165px)' }}>{children}</div>
    </div>
  )
}
