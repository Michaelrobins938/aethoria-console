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

export interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  diceRolls?: Array<{
    type: string
    result: number
    success: boolean
  }>
}

export interface ChatSession {
  id: string
  title: string
  gamePrompt: GamePrompt
  character: Character
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  quests?: Quest[]
  inventory?: Item[]
  combatState?: CombatState | null
  worldState?: WorldState | null
}

// Voice-related types
export interface VoiceSettings {
  enabled: boolean
  autoSpeak: boolean
  voice: string
  rate: number
  pitch: number
  volume: number
  language: string
}

export interface VoiceCommand {
  pattern: string | RegExp
  action: (params: string[]) => void
  description: string
  category: 'game' | 'ui' | 'system'
}

export interface VoiceCommandResult {
  command: string
  params: string[]
  confidence: number
  executed: boolean
}

export interface VoiceRecognitionState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error: string | null
  isFinal: boolean
}

export interface VoiceSynthesisState {
  isSpeaking: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  rate: number
  pitch: number
  volume: number
  error: string | null
} 

// Combat-related types
export interface CombatParticipant {
  id: string
  name: string
  type: 'player' | 'enemy' | 'npc'
  initiative: number
  currentHP: number
  maxHP: number
  armorClass: number
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  level: number
  proficiencies: string[]
  equipment: {
    weapons: Weapon[]
    armor: Armor | null
    items: CombatItem[]
  }
  spells: Spell[]
  spellSlots: Record<string, number>
  conditions: Condition[]
  isActive: boolean
  hasAction: boolean
  hasBonusAction: boolean
  hasReaction: boolean
}

export interface Weapon {
  name: string
  type: 'melee' | 'ranged'
  damage: string
  damageType: string
  range: number
  properties: string[]
  attackBonus: number
  damageBonus: number
}

export interface Armor {
  name: string
  type: 'light' | 'medium' | 'heavy'
  baseAC: number
  maxDexBonus?: number
  stealthDisadvantage: boolean
}

export interface CombatItem {
  name: string
  type: 'consumable' | 'equipment' | 'magic'
  effect: string
  uses?: number
}

export interface Spell {
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string[]
  duration: string
  description: string
  damage?: string
  saveDC?: number
  saveType?: string
}

export interface Condition {
  name: string
  duration: number
  effects: string[]
}

export interface CombatAction {
  type: 'attack' | 'cast-spell' | 'use-item' | 'dash' | 'disengage' | 'dodge' | 'help' | 'hide' | 'ready' | 'search'
  actor: string
  target?: string
  weapon?: string
  spell?: string
  item?: string
  description: string
  roll?: CombatRoll
  result?: 'success' | 'failure' | 'critical'
  damage?: number
}

export interface CombatState {
  isActive: boolean
  round: number
  turn: number
  participants: CombatParticipant[]
  initiativeOrder: string[]
  currentActor: string | null
  actions: CombatAction[]
  environment: string
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly'
}

// Dice rolling types
export interface Modifier {
  source: string
  value: number
  type: 'bonus' | 'penalty'
  description: string
}

export interface DiceRoll {
  dice: string
  result: number
  rolls: number[]
  modifiers: Modifier[]
  total: number
  critical: boolean
  description: string
  advantage?: 'advantage' | 'disadvantage' | null
  advantageRolls?: number[]
}

export interface CombatRoll {
  type: 'attack' | 'damage' | 'saving-throw' | 'initiative' | 'skill-check'
  baseDice: string
  modifiers: Modifier[]
  target?: number
  success?: boolean
  roll: DiceRoll
} 