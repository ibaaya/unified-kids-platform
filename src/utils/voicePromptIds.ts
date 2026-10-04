/** Stable recording IDs shared by the game screens and the Voice Studio server. */
export function voicePromptAudioId(worldId: string, promptId: string, variantId?: string): string {
  return `voice-prompt:${worldId}:${promptId}${variantId ? `:${variantId}` : ''}`
}
