import type { ReactNode } from 'react'
import { VISUAL_ASSETS } from '../../config/visualAssets'

interface WordsWorldBackgroundProps {
  children: ReactNode
}

/** خلفية موحدة لصفحة عالم الكلمات وكافة صفحاتها الفرعية. */
export function WordsWorldBackground({ children }: WordsWorldBackgroundProps) {
  return (
    <div className="relative isolate min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.08), rgba(255,255,255,.12)), url("${VISUAL_ASSETS.wordsWorldBackground}")`,
        }}
      />
      <div className="relative z-10 min-h-screen" style={{ paddingTop: 'clamp(270px, 34vh, 350px)' }}>
        {children}
      </div>
    </div>
  )
}
