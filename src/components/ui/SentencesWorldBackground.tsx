import type { ReactNode } from 'react'
import { VISUAL_ASSETS } from '../../config/visualAssets'

interface SentencesWorldBackgroundProps {
  children: ReactNode
}

/** خلفية موحدة لواجهة عالم الجمل ونشاطاته. */
export function SentencesWorldBackground({ children }: SentencesWorldBackgroundProps) {
  return (
    <div className="relative isolate min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08), rgba(255,255,255,.12)), url("${VISUAL_ASSETS.sentencesWorldBackground}")`,
        }}
      />
      <div className="relative z-10 min-h-screen" style={{ paddingTop: 'clamp(285px, 36vh, 365px)' }}>
        {children}
      </div>
    </div>
  )
}
