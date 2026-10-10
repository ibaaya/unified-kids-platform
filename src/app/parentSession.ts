const LEGACY_PARENT_SESSION_KEY = 'kids-platform-parent-unlocked'
let parentSessionUnlocked = false

/** Access lasts only while the app remains in a parent-only area in this page load. */
export function hasUnlockedParentSession(): boolean {
  return typeof window !== 'undefined' && parentSessionUnlocked
}

export function unlockParentSession(): void {
  if (typeof window === 'undefined') return
  parentSessionUnlocked = true
  try { window.sessionStorage.removeItem(LEGACY_PARENT_SESSION_KEY) } catch { /* storage may be unavailable */ }
}

export function lockParentSession(): void {
  if (typeof window === 'undefined') return
  parentSessionUnlocked = false
  try { window.sessionStorage.removeItem(LEGACY_PARENT_SESSION_KEY) } catch { /* storage may be unavailable */ }
}
