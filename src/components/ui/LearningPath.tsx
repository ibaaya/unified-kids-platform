import { useNavigate } from 'react-router-dom'
import type { WorldDefinition } from '../../types/content'
import { WorldIllustration } from './WorldIllustration'

interface LearningPathProps {
  worlds: WorldDefinition[]
  unlockedWorldIds: string[]
}

export function LearningPath({ worlds, unlockedWorldIds }: LearningPathProps) {
  const navigate = useNavigate()
  const sorted = [...worlds].sort((a, b) => a.order - b.order)

  return (
    <ol className="mx-auto grid max-w-4xl grid-cols-2 gap-3 py-2 sm:grid-cols-3 sm:gap-4" role="list" aria-label="طريق التعلّم من الحروف إلى القصص">
      {sorted.map((world, index) => {
        const isUnlocked = unlockedWorldIds.includes(world.id)
        return (
          <li key={world.id} className="min-w-0">
            <button
              type="button"
              disabled={!isUnlocked}
              onClick={() => navigate('/world/' + world.id)}
              aria-label={isUnlocked ? 'ابدأ ' + world.title : world.title + ' — أكمل الرحلة لفتحه'}
              className={'group relative flex h-full min-h-36 w-full flex-col items-center justify-center rounded-3xl border-2 p-3 text-center transition-all duration-300 sm:min-h-40 sm:p-4 ' + (isUnlocked ? 'hover:-translate-y-1' : 'cursor-not-allowed opacity-60 grayscale')}
              style={{
                background: isUnlocked ? 'linear-gradient(135deg, color-mix(in srgb, ' + world.colorVar + ' 10%, rgba(255,255,255,.12)), rgba(255,255,255,.08))' : 'rgba(255,255,255,.08)',
                borderColor: isUnlocked ? 'color-mix(in srgb, ' + world.colorVar + ' 78%, white)' : 'rgba(255,255,255,.72)',
                backdropFilter: 'blur(3px)',
                boxShadow: isUnlocked ? '0 18px 38px rgba(36,49,58,.19), inset 0 1px 0 rgba(255,255,255,.48)' : '0 8px 20px rgba(36,49,58,.10)',
              }}
            >
              <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-300 text-xs font-black text-amber-950 shadow" aria-label={`المحطة ${index + 1}`}>
                {index + 1}
              </span>
              <WorldIllustration worldId={world.id} className="mb-2 h-16 w-16 transition-transform group-hover:rotate-[-5deg] group-hover:scale-105" />
              <span className="block text-[10px] font-extrabold text-indigo-700">المحطة {index + 1} من {sorted.length}</span>
              <span className="mt-1 block font-display text-sm font-extrabold leading-tight text-[var(--color-ink)] sm:text-lg">{world.title}</span>
              <span className="mt-2 inline-flex rounded-full border border-white/70 px-2 py-1 text-[10px] font-extrabold shadow-sm backdrop-blur-sm sm:text-xs" style={{ backgroundColor: isUnlocked ? 'rgba(255,255,255,.24)' : 'rgba(255,255,255,.18)', color: isUnlocked ? 'var(--color-ink)' : '#555', textShadow: '0 1px 2px rgba(255,255,255,.8)' }}>
                {isUnlocked ? 'انطلق إلى المغامرة ←' : 'قريبًا في رحلتك 🔒'}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
