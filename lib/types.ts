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
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
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
}

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