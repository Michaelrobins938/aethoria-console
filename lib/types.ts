export interface CombatParticipant {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  armorClass: number;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  type: 'player' | 'enemy' | 'ally';
  initiative?: number;
}

export interface Character extends CombatParticipant {
  level: number;
  experience: number;
  inventory: Item[];
  skills: Skill[];
  statusEffects: Record<string, number>;
  background: string;
  proficiencyBonus: number;
  experienceToNextLevel: number;
  attack: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc';
  value: number;
  weight: number;
  effects?: Record<string, number>;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity?: number;
}

export interface Weapon extends Item {
  damage: string;
  damageType: string;
}

export interface Armor extends Item {
  armorClass: number;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
}

export interface Skill {
  name: string;
  level: number;
  experience: number;
  maxLevel: number;
  description: string;
  type: 'combat' | 'social' | 'exploration' | 'crafting';
  primaryAbility?: keyof Character['abilities'];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'active' | 'in_progress' | 'completed' | 'failed';
  type: 'main' | 'side' | 'bounty' | 'guild' | 'exploration';
  objectives: QuestObjective[];
  rewards: QuestRewards;
  level?: number;
  location?: string;
  timeLimit?: string;
  questGiver?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress?: {
    current: number;
    required: number;
  };
}

export interface QuestRewards {
  experience: number;
  gold: number;
  items: Item[];
}

export interface WorldState {
  location: string;
  timeOfDay: string;
  weather: string;
  activeEvents: string[];
  discoveredLocations?: Location[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: LocationType;
  isCurrent?: boolean;
  coordinates?: { x: number; y: number };
  isDiscovered?: boolean;
  danger?: string;
  features?: string[];
  quests?: Quest[];
}

export type LocationType = 'town' | 'dungeon' | 'wilderness' | 'shop' | 'quest' | 'safe';

export interface CombatState {
  isActive: boolean;
  participants: CombatParticipant[];
  enemies: CombatParticipant[];
  turn: number;
  round: number;
  initiativeOrder: string[];
  log: string[];
}

export interface Modifier {
  source: string;
  value: number;
  type: 'bonus' | 'penalty';
  description: string;
}

export interface DiceRoll {
  dice: string;
  result: number;
  rolls: number[];
  modifiers: Modifier[];
  total: number;
  critical: boolean;
  description: string;
  advantage?: 'advantage' | 'disadvantage' | null;
  advantageRolls?: number[];
  success?: boolean;
  type?: string;
}

export interface CombatRoll {
  type: 'attack' | 'damage' | 'saving-throw' | 'initiative' | 'skill-check';
  baseDice: string;
  modifiers: Modifier[];
  target?: number;
  success?: boolean;
  roll: DiceRoll;
}

export interface GamePrompt {
  id: string;
  title: string;
  description: string;
  genre: string;
  content: string;
  mechanics: GameMechanics;
  themes: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  aiModel?: string;
  characters?: Partial<Character>[];
}

export interface GameMechanics {
  diceSystem: string;
  combatSystem: string;
  skillSystem: string;
  inventorySystem: string;
  questSystem: string;
  specialRules: string[];
}

// Missing types that were causing errors
export interface Message {
  id: string;
  type: 'user' | 'system' | 'ai';
  content: string;
  timestamp: Date;
  diceRolls?: DiceRoll[];
}

export interface InventoryItem extends Item {
  quantity: number;
  equipped?: boolean;
}

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type QuestStatus = 'not_started' | 'active' | 'in_progress' | 'completed' | 'failed';

export type QuestType = 'main' | 'side' | 'bounty' | 'guild' | 'exploration';

export interface GameSession {
  id: string;
  title: string;
  character: Character;
  gamePrompt: GamePrompt;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  isActive: boolean;
}

export interface AIResponse {
  content: string;
  diceRolls?: DiceRoll[];
  characterUpdates?: Partial<Character>;
  worldUpdates?: Partial<WorldState>;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isEnabled: boolean;
  transcript: string;
  confidence: number;
}

export interface AudioSettings {
  volume: number;
  rate: number;
  pitch: number;
  voice: string;
  voiceOutputEnabled?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  isActive: boolean;
}