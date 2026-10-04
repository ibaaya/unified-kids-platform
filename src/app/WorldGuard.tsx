import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useChildProfile } from '../hooks/useChildProfile'
import type { WorldId } from '../types/content'

/**
 * يمنع الوصول لصفحات عالم مقفل عبر كتابة الرابط مباشرة (تجاوز خريطة العوالم).
 * بدون هذا الحارس، كانت خريطة العوالم (Home) تُظهر القفل بصريًا فقط دون
 * منع فعلي للتنقل، مما يُبطل فائدة وضع "تسلسل العوالم" بالكامل.
 */
export function WorldGuard({ worldId, children }: { worldId: WorldId; children: ReactNode }) {
  const { child, loading } = useChildProfile()

  if (loading) return null
  if (!child) return <Navigate to="/login" replace />
  if (!child.unlockedWorldIds.includes(worldId)) return <Navigate to="/" replace />

  return <>{children}</>
}
