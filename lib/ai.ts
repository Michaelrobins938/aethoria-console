import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { groq } from '@ai-sdk/groq'

// Default model configuration
export const defaultModel = 'gpt-3.5-turbo'

// Game-specific model configurations
export const gameModels = {
  'dnd-fantasy': 'gpt-4',
  'silent-hill-echoes': 'gpt-4',
  'portal-sci-fi': 'gpt-3.5-turbo',
  'pokemon-adventure': 'gpt-3.5-turbo',
  default: 'gpt-3.5-turbo'
}

// Get model for specific cartridge
export function getModelForCartridge(cartridgeId: string): string {
  return gameModels[cartridgeId as keyof typeof gameModels] || gameModels.default
}

// Get AI provider for specific model
export function getAIProvider(model: string) {
  if (model.startsWith('gpt-')) {
    return openai(model as any)
  } else if (model.startsWith('claude-')) {
    return anthropic(model as any)
  } else if (model.startsWith('llama-') || model.startsWith('mixtral-')) {
    return groq(model as any)
  }
  return openai('gpt-3.5-turbo') // default fallback
} 