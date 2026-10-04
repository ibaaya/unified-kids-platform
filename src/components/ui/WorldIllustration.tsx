import type { ReactNode } from 'react'
import type { WorldId } from '../../types/content'

const labels: Record<WorldId, string> = {
  letters: 'حروف عربية ملوّنة',
  harakat: 'حروف مع الفتحة والضمة والكسرة',
  syllables: 'مقاطع با وبو وبي',
  words: 'كلمتا درس وكتب',
  sentences: 'فقاعة جملة عربية',
  stories: 'كتاب وقطة للقصص',
}

const art: Record<WorldId, ReactNode> = {
  letters: (
    <div className="flex items-end gap-0.5" dir="rtl" aria-hidden="true">
      {[
        ['أ', '#ff9e42', 'world-art-delay-2'],
        ['ب', '#41a6de', 'world-art-delay-1'],
        ['ت', '#39b88e', ''],
      ].map(([letter, color, delay]) => (
        <span key={letter} className={`world-art-tile ${delay} h-9 w-6 rounded-lg text-base`} style={{ backgroundColor: color }}>{letter}</span>
      ))}
    </div>
  ),
  harakat: (
    <div className="flex items-center gap-0.5 font-display text-[1.05rem] font-black" dir="rtl" aria-hidden="true">
      <span className="world-art-word text-rose-600">بَ</span>
      <span className="world-art-word world-art-delay-1 text-violet-700">بُ</span>
      <span className="world-art-word world-art-delay-2 text-sky-700">بِ</span>
    </div>
  ),
  syllables: (
    <div className="flex flex-col items-center gap-0 font-display text-[.9rem] font-black leading-[1.15]" dir="rtl" aria-hidden="true">
      <span className="world-art-word text-orange-600">بَا</span>
      <span className="world-art-word world-art-delay-1 text-violet-700">بُو</span>
      <span className="world-art-word world-art-delay-2 text-sky-700">بِي</span>
    </div>
  ),
  words: (
    <div className="flex flex-col items-center font-display text-[.84rem] font-black leading-[1.25]" dir="rtl" aria-hidden="true">
      <span className="world-art-word text-amber-800">دَرَسَ</span>
      <span className="world-art-word world-art-delay-1 text-emerald-700">كَتَبَ</span>
    </div>
  ),
  sentences: (
    <div className="relative flex h-12 w-[3.7rem] flex-col items-center justify-center rounded-xl border-2 border-white bg-gradient-to-br from-sky-100 to-cyan-200 font-display text-[.62rem] font-black leading-tight text-sky-900 shadow-[0_4px_0_#6bb9d3,0_8px_12px_rgba(20,60,70,.18)]" dir="rtl" aria-hidden="true">
      <span>هٰذَا</span><span>كِتَابٌ</span>
      <span className="absolute -bottom-1 left-2 h-2 w-2 rotate-45 border-b-2 border-r-2 border-white bg-cyan-200" />
      <span className="absolute -top-2 -right-1 text-sm text-amber-500">✦</span>
    </div>
  ),
  stories: (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      <span className="world-art-book text-4xl">📖</span>
      <span className="absolute -bottom-2 -left-3 world-art-cat text-2xl">🐈</span>
      <span className="absolute -top-2 -right-3 text-sm text-amber-500">✦</span>
    </div>
  ),
}

/** Illustration designed as a small 3D-style emblem, shared by both home layouts. */
export function WorldIllustration({ worldId, className = '' }: { worldId: WorldId; className?: string }) {
  return (
    <span
      className={`relative inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.6rem] border-2 border-white/90 shadow-[0_8px_14px_rgba(31,55,69,.2),inset_0_1px_0_rgba(255,255,255,.95)] ${className}`}
      style={{ background: `linear-gradient(145deg, color-mix(in srgb, var(--world-${worldId}) 26%, white), rgba(255,255,255,.82))` }}
      role="img"
      aria-label={labels[worldId]}
    >
      <span className="pointer-events-none absolute -left-2 -top-3 h-10 w-10 rounded-full bg-white/80 blur-md" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-4 -right-3 h-10 w-10 rounded-full opacity-30 blur-lg" style={{ backgroundColor: `var(--world-${worldId})` }} aria-hidden="true" />
      <span className="world-art-float relative z-10 inline-flex h-full w-full items-center justify-center">{art[worldId]}</span>
    </span>
  )
}
