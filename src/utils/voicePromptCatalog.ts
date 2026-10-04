import catalog from '../data/voice-prompts.json'

type Prompt = { id: string; text?: string; template?: string }
type PromptCatalog = { worlds: Array<{ id: string; prompts: Prompt[] }> }

/** Resolve the canonical wording from the catalog so gameplay and recordings stay in sync. */
export function getVoicePromptText(
  worldId: string,
  promptId: string,
  values: Record<string, string> = {},
): string {
  const prompt = (catalog as PromptCatalog).worlds
    .find((world) => world.id === worldId)?.prompts.find((entry) => entry.id === promptId)
  const source = prompt?.text ?? prompt?.template ?? ''
  return source.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => values[key] ?? `{${key}}`)
}
