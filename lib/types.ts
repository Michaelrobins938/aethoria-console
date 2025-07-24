// Core game types
export interface Character {
  name: string
  health: number
  maxHealth: number
  attack: number
  defense: number
  speed: number
  level: number
  experience: number
  inventory: Item[]
  skills: Skill[]
  statusEffects: Record<string, number>
  background: string
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
}

export interface Item {
  id: string
  name: string
  description: string
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc'
  value: number
  weight: number
  effects?: Record<string, number>
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export interface Skill {
  name: string
  level: number
  experience: number
  maxLevel: number
  description: string
  type: 'combat' | 'social' | 'exploration' | 'crafting'
}

export interface Quest {
  id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  objectives: QuestObjective[]
  rewards: Item[]
  experienceReward: number
  dependencies: string[]
  progress: number
  maxProgress: number
}

export interface QuestObjective {
  id: string
  description: string
  completed: boolean
  progress: number
  maxProgress: number
}

export interface WorldState {
  location: string
  timeOfDay: string
  weather: string
  activeEvents: string[]
  npcStates: Record<string, NPCState>
  discoveredLocations: string[]
  factionRelations: Record<string, number>
  worldEvents: WorldEvent[]
}

export interface NPCState {
  name: string
  mood: number
  relationship: number
  knowledge: string[]
  currentLocation: string
  schedule: NPCSchedule[]
}

export interface NPCSchedule {
  time: string
  location: string
  activity: string
}

export interface WorldEvent {
  id: string
  title: string
  description: string
  type: 'combat' | 'social' | 'exploration' | 'story'
  location: string
  participants: string[]
  outcome?: string
  timestamp: Date
}

// Combat system types
export interface CombatAction {
  type: 'attack' | 'defend' | 'special' | 'flee' | 'item' | 'skill'
  target?: string
  itemId?: string
  skillName?: string
}

export interface CombatState {
  isActive: boolean
  participants: Character[]
  turn: number
  currentActor: string
  log: string[]
  environment: string
}

// AI system types
export interface AIResponse {
  text: string
  gameState: Partial<WorldState>
  characterUpdates?: Partial<Character>
  questUpdates?: Partial<Quest>[]
  inventoryUpdates?: Item[]
  combatState?: Partial<CombatState>
  diceRolls?: DiceRoll[]
  choices?: GameChoice[]
}

export interface DiceRoll {
  type: string
  dice: string
  result: number
  modifier: number
  total: number
  success: boolean
  difficultyClass?: number
}

export interface GameChoice {
  id: string
  text: string
  consequences: string[]
}

// Game prompt types
export interface GamePrompt {
  id: string
  title: string
  description: string
  genre: string
  content: string
  mechanics: GameMechanics
  themes: string[]
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

export interface GameMechanics {
  diceSystem: string
  combatSystem: string
  skillSystem: string
  inventorySystem: string
  questSystem: string
  specialRules: string[]
}

// Voice and audio types
export interface VoiceState {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  confidence: number
  error?: string
}

export interface AudioSettings {
  voiceEnabled: boolean
  voiceOutputEnabled: boolean
  volume: number
  voiceSpeed: number
  voicePitch: number
}

// Session and save data
export interface GameSession {
  id: string
  gamePromptId: string
  character: Character
  worldState: WorldState
  quests: Quest[]
  inventory: Item[]
  combatState?: CombatState
  sessionStart: Date
  lastSave: Date
  playTime: number
}

export interface SaveData {
  sessionId: string
  data: GameSession
  timestamp: Date
  version: string
} 