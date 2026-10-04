import { useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Mascot } from '../../components/character/Mascot'
import worldsData from '../../data/worlds.json'
import type { WorldDefinition } from '../../types/content'

const worlds = worldsData as WorldDefinition[]

export function WorldPlaceholder() {
  const { worldId } = useParams()
  const world = worlds.find((w) => w.id === worldId)

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-5xl mb-3">{world?.emoji ?? '🚧'}</div>
        <h1 className="font-display text-xl font-extrabold mb-2">
          {world?.title ?? 'هذا العالم'}
        </h1>
        <div className="flex justify-center my-4">
          <Mascot message="نحن نجهّز هذا العالم الآن، سيكون جاهزًا قريبًا! 🚧" size={90} />
        </div>
      </Card>
    </div>
  )
}
