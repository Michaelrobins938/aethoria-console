// D&D 5e Combat Engine
// Handles initiative, combat actions, and state management

import { 
  CombatRoll, 
  Modifier, 
  rollInitiative, 
  rollAttack, 
  rollDamage, 
  rollSavingThrow,
  checkAttackHit,
  checkSavingThrowSuccess,
  calculateAbilityModifier,
  calculateProficiencyBonus
} from './diceEngine'

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
    items: Item[]
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

export interface Item {
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

// Initialize combat with participants
export function initializeCombat(participants: CombatParticipant[]): CombatState {
  // Roll initiative for all participants
  const participantsWithInitiative = participants.map(participant => {
    const dexModifier = calculateAbilityModifier(participant.abilities.dexterity)
    const initiativeRoll = rollInitiative(participant.abilities.dexterity)
    
    return {
      ...participant,
      initiative: initiativeRoll.roll.total,
      isActive: true,
      hasAction: true,
      hasBonusAction: true,
      hasReaction: true
    }
  })
  
  // Sort by initiative (highest first)
  const sortedParticipants = participantsWithInitiative.sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative
    }
    // Tie breaker: higher dexterity score
    return b.abilities.dexterity - a.abilities.dexterity
  })
  
  const initiativeOrder = sortedParticipants.map(p => p.id)
  
  return {
    isActive: true,
    round: 1,
    turn: 0,
    participants: sortedParticipants,
    initiativeOrder,
    currentActor: initiativeOrder[0] || null,
    actions: [],
    environment: 'Standard combat',
    difficulty: 'medium'
  }
}

// Get current actor
export function getCurrentActor(state: CombatState): CombatParticipant | null {
  if (!state.currentActor) return null
  return state.participants.find(p => p.id === state.currentActor) || null
}

// Get next actor in initiative order
export function getNextActor(state: CombatState): CombatParticipant | null {
  if (!state.currentActor) return state.participants[0] || null
  
  const currentIndex = state.initiativeOrder.indexOf(state.currentActor)
  const nextIndex = (currentIndex + 1) % state.initiativeOrder.length
  
  // If we've completed a round, increment round number
  if (nextIndex === 0) {
    state.round++
  }
  
  const nextActorId = state.initiativeOrder[nextIndex]
  return state.participants.find(p => p.id === nextActorId) || null
}

// Advance to next turn
export function advanceTurn(state: CombatState): CombatState {
  const nextActor = getNextActor(state)
  
  if (nextActor) {
    // Reset action economy for new actor
    nextActor.hasAction = true
    nextActor.hasBonusAction = true
    nextActor.hasReaction = true
  }
  
  return {
    ...state,
    currentActor: nextActor?.id || null,
    turn: state.turn + 1
  }
}

// Perform attack action
export function performAttack(
  state: CombatState,
  actorId: string,
  targetId: string,
  weaponName: string
): CombatAction {
  const actor = state.participants.find(p => p.id === actorId)
  const target = state.participants.find(p => p.id === targetId)
  const weapon = actor?.equipment.weapons.find(w => w.name === weaponName)
  
  if (!actor || !target || !weapon) {
    throw new Error('Invalid attack parameters')
  }
  
  // Calculate attack roll
  const proficiencyBonus = calculateProficiencyBonus(actor.level)
  const abilityModifier = weapon.type === 'melee' 
    ? calculateAbilityModifier(actor.abilities.strength)
    : calculateAbilityModifier(actor.abilities.dexterity)
  
  const additionalModifiers: Modifier[] = []
  if (weapon.attackBonus !== 0) {
    additionalModifiers.push({
      source: 'weapon',
      value: weapon.attackBonus,
      type: 'bonus',
      description: `${weapon.name} bonus`
    })
  }
  
  const attackRoll = rollAttack(proficiencyBonus, abilityModifier, additionalModifiers)
  const hit = checkAttackHit(attackRoll, target.armorClass)
  
  // Calculate damage if hit
  let damage = 0
  let damageRoll: CombatRoll | undefined
  
  if (hit) {
    const damageAbilityModifier = weapon.type === 'melee'
      ? calculateAbilityModifier(actor.abilities.strength)
      : calculateAbilityModifier(actor.abilities.dexterity)
    
    const damageModifiers: Modifier[] = []
    if (weapon.damageBonus !== 0) {
      damageModifiers.push({
        source: 'weapon',
        value: weapon.damageBonus,
        type: 'bonus',
        description: `${weapon.name} damage bonus`
      })
    }
    
    damageRoll = rollDamage(
      weapon.damage,
      damageAbilityModifier,
      damageModifiers,
      attackRoll.roll.critical
    )
    
    damage = damageRoll.roll.total
    
    // Apply damage to target
    target.currentHP = Math.max(0, target.currentHP - damage)
  }
  
  // Consume action
  actor.hasAction = false
  
  const action: CombatAction = {
    type: 'attack',
    actor: actorId,
    target: targetId,
    weapon: weaponName,
    description: `${actor.name} attacks ${target.name} with ${weapon.name}`,
    roll: attackRoll,
    result: attackRoll.roll.critical ? 'critical' : hit ? 'success' : 'failure',
    damage: hit ? damage : undefined
  }
  
  return action
}

// Perform spell casting
export function performSpellCast(
  state: CombatState,
  actorId: string,
  targetId: string,
  spellName: string
): CombatAction {
  const actor = state.participants.find(p => p.id === actorId)
  const target = state.participants.find(p => p.id === targetId)
  const spell = actor?.spells.find(s => s.name === spellName)
  
  if (!actor || !target || !spell) {
    throw new Error('Invalid spell cast parameters')
  }
  
  // Check spell slots
  const spellLevel = spell.level === 0 ? 'cantrip' : spell.level.toString()
  const availableSlots = actor.spellSlots[spellLevel] || 0
  
  if (spellLevel !== 'cantrip' && availableSlots <= 0) {
    throw new Error(`No ${spellLevel} level spell slots available`)
  }
  
  // Calculate spell attack or saving throw
  let roll: CombatRoll | undefined
  let success: boolean | undefined
  
  if (spell.saveDC) {
    // Target makes saving throw
    const saveAbilityModifier = calculateAbilityModifier(target.abilities[spell.saveType as keyof typeof target.abilities] || target.abilities.dexterity)
    const isProficient = target.proficiencies.includes(spell.saveType || '')
    const proficiencyBonus = calculateProficiencyBonus(target.level)
    
    roll = rollSavingThrow(saveAbilityModifier, isProficient, proficiencyBonus)
    success = checkSavingThrowSuccess(roll, spell.saveDC)
  } else if (spell.damage) {
    // Spell attack roll
    const spellcastingModifier = calculateAbilityModifier(actor.abilities.charisma) // Default to charisma
    const proficiencyBonus = calculateProficiencyBonus(actor.level)
    
    roll = rollAttack(proficiencyBonus, spellcastingModifier)
    success = checkAttackHit(roll, target.armorClass)
  }
  
  // Consume spell slot
  if (spellLevel !== 'cantrip') {
    actor.spellSlots[spellLevel] = availableSlots - 1
  }
  
  // Consume action
  actor.hasAction = false
  
  const action: CombatAction = {
    type: 'cast-spell',
    actor: actorId,
    target: targetId,
    spell: spellName,
    description: `${actor.name} casts ${spell.name} on ${target.name}`,
    roll,
    result: success ? 'success' : 'failure'
  }
  
  return action
}

// Use item action
export function performUseItem(
  state: CombatState,
  actorId: string,
  targetId: string,
  itemName: string
): CombatAction {
  const actor = state.participants.find(p => p.id === actorId)
  const target = state.participants.find(p => p.id === targetId)
  const item = actor?.equipment.items.find(i => i.name === itemName)
  
  if (!actor || !target || !item) {
    throw new Error('Invalid use item parameters')
  }
  
  // Consume item if it has limited uses
  if (item.uses !== undefined) {
    item.uses--
    if (item.uses <= 0) {
      actor.equipment.items = actor.equipment.items.filter(i => i.name !== itemName)
    }
  }
  
  // Consume action
  actor.hasAction = false
  
  const action: CombatAction = {
    type: 'use-item',
    actor: actorId,
    target: targetId,
    item: itemName,
    description: `${actor.name} uses ${item.name} on ${target.name}`,
    result: 'success'
  }
  
  return action
}

// Check if combat is over
export function isCombatOver(state: CombatState): boolean {
  const aliveParticipants = state.participants.filter(p => p.currentHP > 0)
  const playerParticipants = aliveParticipants.filter(p => p.type === 'player')
  const enemyParticipants = aliveParticipants.filter(p => p.type === 'enemy')
  
  return playerParticipants.length === 0 || enemyParticipants.length === 0
}

// Get combat result
export function getCombatResult(state: CombatState): 'victory' | 'defeat' | 'ongoing' {
  if (!isCombatOver(state)) return 'ongoing'
  
  const aliveParticipants = state.participants.filter(p => p.currentHP > 0)
  const playerParticipants = aliveParticipants.filter(p => p.type === 'player')
  
  return playerParticipants.length > 0 ? 'victory' : 'defeat'
}

// Get available actions for current actor
export function getAvailableActions(state: CombatState): string[] {
  const actor = getCurrentActor(state)
  if (!actor) return []
  
  const actions: string[] = []
  
  if (actor.hasAction) {
    actions.push('attack', 'cast-spell', 'use-item', 'dash', 'disengage', 'dodge', 'help', 'hide', 'ready', 'search')
  }
  
  if (actor.hasBonusAction) {
    actions.push('bonus-attack', 'bonus-spell', 'bonus-item')
  }
  
  if (actor.hasReaction) {
    actions.push('opportunity-attack', 'shield', 'counterspell')
  }
  
  return actions
}

// Get valid targets for action
export function getValidTargets(state: CombatState, actionType: string): CombatParticipant[] {
  const actor = getCurrentActor(state)
  if (!actor) return []
  
  switch (actionType) {
    case 'attack':
    case 'cast-spell':
      return state.participants.filter(p => p.id !== actor.id && p.currentHP > 0)
    
    case 'use-item':
      return state.participants.filter(p => p.currentHP > 0) // Can use items on self or others
    
    case 'help':
      return state.participants.filter(p => p.type === actor.type && p.id !== actor.id)
    
    default:
      return []
  }
} 