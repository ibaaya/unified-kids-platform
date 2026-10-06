const PARENT_SESSION_KEY = 'kids-platform-parent-unlocked'

export function hasUnlockedParentSession(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(PARENT_SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

export function unlockParentSession(): void {
  if (typeof window === 'undefined') return
  try { window.sessionStorage.setItem(PARENT_SESSION_KEY, 'true') } catch { /* session storage may be unavailable */ }
}
