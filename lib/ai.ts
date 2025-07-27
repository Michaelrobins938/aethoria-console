// OpenRouter AI Configuration with sophisticated model selection
// Based on OpenRouter's available models: https://openrouter.ai/models

// Model categories for different storytelling needs
export const modelCategories: Record<string, Record<string, string>> = {
  // Creative Storytelling - Best for immersive, atmospheric narratives
  creative: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for creative writing and atmospheric storytelling',
    'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B - Great for detailed world-building and character development',
    'mistralai/mistral-7b-instruct': 'Mistral 7B - Good for concise, punchy storytelling',
    'google/gemini-pro': 'Gemini Pro - Strong for descriptive and imaginative content'
  },
  
  // Horror & Suspense - Models that excel at building tension and atmosphere
  horror: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for psychological horror and atmospheric tension',
    'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B - Great for detailed horror descriptions and mood setting',
    'openai/gpt-4o': 'GPT-4o - Strong for building suspense and psychological elements',
    'google/gemini-pro': 'Gemini Pro - Good for atmospheric horror and descriptive tension'
  },
  
  // Fantasy & Adventure - Models that excel at world-building and epic storytelling
  fantasy: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for epic fantasy world-building and character arcs',
    'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B - Great for detailed fantasy lore and magical systems',
    'openai/gpt-4o': 'GPT-4o - Strong for fantasy dialogue and character interactions',
    'google/gemini-pro': 'Gemini Pro - Good for descriptive fantasy environments and creatures'
  },
  
  // Sci-Fi & Technology - Models that excel at technical and futuristic content
  scifi: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for complex sci-fi concepts and futuristic dialogue',
    'openai/gpt-4o': 'GPT-4o - Strong for technical sci-fi and AI interactions',
    'google/gemini-pro': 'Gemini Pro - Great for scientific accuracy and futuristic descriptions',
    'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B - Good for detailed sci-fi world-building'
  },
  
  // Comedy & Light-hearted - Models that excel at humor and casual dialogue
  comedy: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for witty dialogue and clever humor',
    'openai/gpt-4o': 'GPT-4o - Strong for quick wit and comedic timing',
    'google/gemini-pro': 'Gemini Pro - Good for light-hearted banter and casual humor',
    'mistralai/mistral-7b-instruct': 'Mistral 7B - Great for punchy one-liners and quick humor'
  },
  
  // Mystery & Investigation - Models that excel at logical reasoning and puzzle-solving
  mystery: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for logical reasoning and mystery solving',
    'openai/gpt-4o': 'GPT-4o - Strong for detective work and clue analysis',
    'google/gemini-pro': 'Gemini Pro - Good for investigative dialogue and evidence analysis',
    'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B - Great for complex mystery plotting'
  },
  
  // Romance & Drama - Models that excel at emotional depth and character relationships
  romance: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for emotional depth and character development',
    'openai/gpt-4o': 'GPT-4o - Strong for romantic dialogue and emotional nuance',
    'google/gemini-pro': 'Gemini Pro - Good for relationship dynamics and emotional storytelling',
    'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B - Great for character relationship development'
  },
  
  // Action & Combat - Models that excel at dynamic, fast-paced content
  action: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for dynamic action sequences and combat descriptions',
    'openai/gpt-4o': 'GPT-4o - Strong for fast-paced action and combat dialogue',
    'google/gemini-pro': 'Gemini Pro - Good for action scene descriptions and dynamic movement',
    'mistralai/mistral-7b-instruct': 'Mistral 7B - Great for punchy action sequences'
  },
  
  // Historical & Period - Models that excel at historical accuracy and period dialogue
  historical: {
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet - Excellent for historical accuracy and period dialogue',
    'openai/gpt-4o': 'GPT-4o - Strong for historical detail and period authenticity',
    'google/gemini-pro': 'Gemini Pro - Good for historical research and period descriptions',
    'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B - Great for detailed historical world-building'
  }
}

// Game genre to model category mapping
export const gameGenreMapping: Record<string, string> = {
  // Horror Games
  'silent-hill-echoes': 'horror',
  'resident-evil-mansion': 'horror',
  'fatal-frame-whispers': 'horror',
  'blair-witch-shadows': 'horror',
  'eternal-darkness': 'horror',
  'corpse-party': 'horror',
  'nosferatu': 'horror',
  'rule-of-rose': 'horror',
  'haunting-ground': 'horror',
  'cryostasis': 'horror',
  'stay-alive': 'horror',
  'scream': 'horror',
  'friday-the-13th': 'horror',
  'halloween': 'horror',
  'childs-play': 'horror',
  'freddy-vs-jason': 'horror',
  'johnny-homicidal': 'horror',
  'beetlejuice': 'horror',
  'sleepy-hollow': 'horror',
  'the-mist': 'horror',
  '1408': 'horror',
  'evil-dead': 'horror',
  'alien-nightmare': 'horror',
  'alien-vs-necromorph': 'horror',
  'i-have-no-mouth': 'horror',
  'sherlock-holmes-hell': 'horror',
  
  // Fantasy Games
  'dnd-fantasy': 'fantasy',
  'legend-of-zelda': 'fantasy',
  'final-fantasy': 'fantasy',
  'god-of-war': 'fantasy',
  'diablo': 'fantasy',
  'gauntlet': 'fantasy',
  'legacy-of-kain': 'fantasy',
  'shadows-of-ravenloft': 'fantasy',
  'game-of-thrones': 'fantasy',
  'fantasy-high': 'fantasy',
  'misfits-and-magic': 'fantasy',
  'fantastic-beasts-elegance': 'fantasy',
  'fantastic-beasts-magic': 'fantasy',
  'fantastic-beasts-secrets': 'fantasy',
  'fantastic-beasts-shadows': 'fantasy',
  'fantastic-beasts-wizarding': 'fantasy',
  'a-crown-of-candy': 'fantasy',
  'escape-from-bloodkeep': 'fantasy',
  'pirates-of-leviathan': 'fantasy',
  'shadows-of-sanctuary': 'fantasy',
  'heroes-of-realms': 'fantasy',
  'luminaries-of-force': 'fantasy',
  
  // Sci-Fi Games
  'portal-rattmann': 'scifi',
  'portal-2-awakening': 'scifi',
  'portal-test-subject': 'scifi',
  'bioshock-depths': 'scifi',
  'detroit-become-human': 'scifi',
  'invader-zim': 'scifi',
  'ben-10-cosmic': 'scifi',
  'digimon-frontier': 'scifi',
  'code-lyoko': 'scifi',
  'teen-titans': 'scifi',
  'danny-phantom': 'scifi',
  'ben-10': 'scifi',
  
  // Adventure Games
  'pokemon-legends-olympus': 'adventure',
  'pokemon-legends-antiquity': 'adventure',
  'pokemon-chronos': 'adventure',
  'pokemon-colosseum': 'adventure',
  'treasure-planet': 'adventure',
  'atlantis-journey': 'adventure',
  'dinosaur-journey': 'adventure',
  'jurassic-park-survival': 'adventure',
  'jurassic-universe': 'adventure',
  'stardew-valley': 'adventure',
  'borderlands-2': 'adventure',
  'borderlands-tiny-tina': 'adventure',
  'borderlands-vault-hunters': 'adventure',
  'luigis-mansion': 'adventure',
  'mario-party': 'adventure',
  'samurai-jack': 'adventure',
  'courage-cowardly-dog': 'adventure',
  'grim-adventures': 'adventure',
  'kids-next-door': 'adventure',
  'corpse-bride': 'adventure',
  'fight-club': 'adventure',
  '9-stitchpunks': 'adventure',
  
  // Mystery Games
  'death-note': 'mystery',
  'sherlock-holmes': 'mystery',
  'do-you-copy': 'mystery',
  
  // Action Games
  'doom-hell-mars': 'action',
  'ninja-turtles': 'action',
  'naruto-dawn': 'action',
  'naruto-shadows': 'action',
  'jujutsu-kaisen': 'action',
  'inuyasha-shards': 'action',
  'dragon-ball': 'action',
  'one-piece': 'action',
  'bleach': 'action',
  'my-hero-academia': 'action',
  
  // Comedy Games
  'beetlejuice-hijinks': 'comedy',
  'billy-mandy': 'comedy',
  'spongebob': 'comedy',
  'family-guy': 'comedy',
  'simpsons': 'comedy',
  'futurama': 'comedy',
  'rick-morty': 'comedy',
  'south-park': 'comedy',
  'archer': 'comedy',
  'bob-burgers': 'comedy',
  
  // Historical Games
  'assassins-creed': 'historical',
  'red-dead-redemption': 'historical',
  'kingdom-come': 'historical',
  'mount-blade': 'historical',
  'total-war': 'historical',
  'civilization': 'historical',
  'age-of-empires': 'historical',
  'europa-universalis': 'historical',
  'crusader-kings': 'historical',
  'hearts-of-iron': 'historical',
  
  // Romance Games
  'harvest-moon': 'romance',
  'story-of-seasons': 'romance',
  'rune-factory': 'romance',
  'stardew-valley-romance': 'romance',
  'fire-emblem': 'romance',
  'persona': 'romance',
  'final-fantasy-romance': 'romance',
  'tales-series': 'romance',
  'atelier': 'romance',
  'otome-games': 'romance'
}

// Get the best model for a specific game cartridge
export function getModelForCartridge(cartridgeId: string): string {
  // Map cartridge ID to genre (remove special characters and convert to lowercase)
  const normalizedId = cartridgeId.toLowerCase().replace(/[^a-z0-9-]/g, '')
  
  // Find the genre for this cartridge
  const genre = gameGenreMapping[normalizedId] || 'creative'
  
  // Get available models for this genre
  const availableModels = modelCategories[genre] || modelCategories.creative
  
  // Select the best model for this genre (first in the list is typically the best)
  const modelKeys = Object.keys(availableModels)
  return modelKeys[0] || 'anthropic/claude-3-5-sonnet'
}

// Get model description for a cartridge
export function getModelDescription(cartridgeId: string): string {
  const normalizedId = cartridgeId.toLowerCase().replace(/[^a-z0-9-]/g, '')
  const genre = gameGenreMapping[normalizedId] || 'creative'
  const availableModels = modelCategories[genre] || modelCategories.creative
  const modelKey = getModelForCartridge(cartridgeId)
  return availableModels[modelKey] || 'Optimized for immersive storytelling'
}

// Get all available models for a genre
export function getModelsForGenre(genre: string): Record<string, string> {
  return modelCategories[genre] || modelCategories.creative
}

// Get genre for a cartridge
export function getGenreForCartridge(cartridgeId: string): string {
  const normalizedId = cartridgeId.toLowerCase().replace(/[^a-z0-9-]/g, '')
  return gameGenreMapping[normalizedId] || 'creative'
}

// OpenRouter configuration
export const openRouterConfig = {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultModel: 'anthropic/claude-3-5-sonnet',
  maxTokens: 2000,
  temperature: 0.8,
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1
}

// Model-specific configurations
export const modelConfigs: Record<string, {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}> = {
  'anthropic/claude-3-5-sonnet': {
    temperature: 0.8,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  'openai/gpt-4o': {
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  'meta-llama/llama-3.1-70b-instruct': {
    temperature: 0.8,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  'google/gemini-pro': {
    temperature: 0.8,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  'mistralai/mistral-7b-instruct': {
    temperature: 0.9,
    maxTokens: 1500,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  }
}

// Get configuration for a specific model
export function getModelConfig(model: string) {
  return modelConfigs[model] || modelConfigs['anthropic/claude-3-5-sonnet']
} 