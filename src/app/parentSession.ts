const LEGACY_PARENT_SESSION_KEY = 'kids-platform-parent-unlocked'
let parentSessionUnlocked = false

/**
 * Keep the parent-area unlock for the current tab so a dev-server reload (for
 * example, when saving an audio file) does not ask for the code again. AppShell
 * clears this when navigation leaves the parent-only area.
 */
export function hasUnlockedParentSession(): boolean {
  if (typeof window === 'undefined') return false
  if (parentSessionUnlocked) return true
  try {
    parentSessionUnlocked = window.sessionStorage.getItem(LEGACY_PARENT_SESSION_KEY) === 'true'
  } catch {
    // Storage can be unavailable in restricted browser contexts; retain the
    // in-memory session for client-side navigation in that case.
  }
  return parentSessionUnlocked
}

export function unlockParentSession(): void {
  if (typeof window === 'undefined') return
  parentSessionUnlocked = true
  try { window.sessionStorage.setItem(LEGACY_PARENT_SESSION_KEY, 'true') } catch { /* storage may be unavailable */ }
}

export function lockParentSession(): void {
  if (typeof window === 'undefined') return
  parentSessionUnlocked = false
  try { window.sessionStorage.removeItem(LEGACY_PARENT_SESSION_KEY) } catch { /* storage may be unavailable */ }
}
