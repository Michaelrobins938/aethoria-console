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

// Extended item types for inventory system
export interface InventoryItem extends Omit<Item, 'effects'> {
  quantity?: number
  effects?: ItemEffect[]
  primaryAbility?: keyof Character['abilities']
}

export interface ItemEffect {
  type: string
  value: number
  description?: string
}

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'magical' | 'quest' | 'currency'
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Skill {
  name: string
  level: number
  experience: number
  maxLevel: number
  description: string
  type: 'combat' | 'social' | 'exploration' | 'crafting'
  primaryAbility?: keyof Character['abilities']
}

export interface Quest {
  id: string
  title: string
  description: string
  status: QuestStatus
  type: QuestType
  objectives: QuestObjective[]
  rewards: QuestRewards
  level?: number
  location?: string
  questGiver?: string
  timeLimit?: string
  dependencies: string[]
  progress: number
  maxProgress: number
}

export type QuestStatus = 'not_started' | 'active' | 'in_progress' | 'completed' | 'failed'
export type QuestType = 'main' | 'side' | 'bounty' | 'guild' | 'exploration'

export interface QuestObjective {
  id: string
  description: string
  completed: boolean
  progress?: {
    current: number
    required: number
  }
}

export interface QuestRewards {
  experience: number
  gold: number
  items: Item[]
}

export interface WorldState {
  location: string
  timeOfDay: string
  weather: string
  activeEvents: string[]
  npcStates: Record<string, NPCState>
  discoveredLocations: Location[]
  factionRelations: Record<string, number>
  worldEvents: WorldEvent[]
}

export interface Location {
  id: string
  name: string
  description: string
  type: LocationType
  coordinates?: {
    x: number
    y: number
  }
  isCurrent: boolean
  isDiscovered: boolean
  danger?: string
  features?: string[]
  quests?: string[]
}

export type LocationType = 'town' | 'dungeon' | 'wilderness' | 'shop' | 'quest' | 'safe'

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
  id: string
  name: string
  icon: React.ReactNode
  type: 'offensive' | 'defensive' | 'magical' | 'utility' | 'movement'
}

export interface CombatState {
  isActive: boolean
  participants: Character[]
  turn: number
  currentActor: string
  log: string[]
  environment: string
  initiative?: {
    player: number
    enemies: Array<Character & { initiative: number }>
  }
  currentTurn?: 'player' | 'enemy'
  currentEnemyId?: string
  round?: number
}

export interface Combatant {
  id: string
  name: string
  health: number
  maxHealth: number
  attack: number
  defense: number
  type: 'player' | 'enemy' | 'ally'
  dexterity?: number
}

export interface CombatResult {
  damage: number
  message: string
  combatEnded: boolean
  victory: boolean
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
  aiModel?: string
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