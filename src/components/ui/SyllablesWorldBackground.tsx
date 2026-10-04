import type { ReactNode } from 'react'
import { VISUAL_ASSETS } from '../../config/visualAssets'

interface SyllablesWorldBackgroundProps {
  children: ReactNode
}

/** Shared image backdrop and floating navigation for the syllables world. */
export function SyllablesWorldBackground({ children }: SyllablesWorldBackgroundProps) {
  return (
    <div className="relative isolate min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08), rgba(255,255,255,.12)), url("${VISUAL_ASSETS.syllablesWorldBackground}")`,
        }}
      />
      <div className="relative z-10 min-h-screen" style={{ paddingTop: 'clamp(235px, 29vh, 285px)' }}>{children}</div>
    </div>
  )
}
