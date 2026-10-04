import { useCallback, useEffect, useState } from 'react'
import type { ChildProfile } from '../types/progress'
import {
  createChildProfile,
  getActiveChild,
  touchDailyStreak,
  listChildren,
} from '../services/progressService'
import { checkWorldUnlocks } from '../engine/curriculumEngine'

interface UseChildProfileResult {
  child: ChildProfile | null
  loading: boolean
  /**
   * null = لم يُفحص بعد. عندما child يكون null، يوضّح هذا الحقل إن كان يوجد
   * طلاب محفوظون على الجهاز أصلًا (فيجب الذهاب لشاشة "اختر اسمك" /login)
   * أو لا يوجد أي طالب بعد (فيجب الذهاب لشاشة الترحيب /onboarding).
   */
  hasAnyChildren: boolean | null
  createProfile: (name: string, avatar?: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useChildProfile(): UseChildProfileResult {
  const [child, setChild] = useState<ChildProfile | null>(null)
  const [hasAnyChildren, setHasAnyChildren] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const existing = await getActiveChild()
    if (existing?.id) {
      await checkWorldUnlocks(existing.id)
      const updated = await touchDailyStreak(existing.id)
      setChild(updated ?? existing)
      setHasAnyChildren(true)
    } else {
      setChild(null)
      const all = await listChildren()
      setHasAnyChildren(all.length > 0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const createProfile = useCallback(
    async (name: string, avatar?: string) => {
      await createChildProfile(name, avatar)
      await load()
    },
    [load],
  )

  return { child, loading, hasAnyChildren, createProfile, refresh: load }
}
