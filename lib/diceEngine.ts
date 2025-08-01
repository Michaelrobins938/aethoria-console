// Advanced Dice Rolling Engine for D&D 5e
// Handles complex dice notation, modifiers, and combat calculations

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

export interface DiceNotation {
  count: number
  sides: number
  modifier: number
  advantage?: 'advantage' | 'disadvantage' | null
}

// Parse dice notation like "2d6+3", "1d20", "d20+5"
export function parseDiceNotation(notation: string): DiceNotation {
  const cleanNotation = notation.toLowerCase().replace(/\s/g, '')
  
  // Handle advantage/disadvantage
  let advantage: 'advantage' | 'disadvantage' | null = null
  if (cleanNotation.includes('adv')) {
    advantage = 'advantage'
  } else if (cleanNotation.includes('dis')) {
    advantage = 'disadvantage'
  }
  
  // Remove advantage/disadvantage from notation
  const dicePart = cleanNotation.replace(/adv|dis/g, '')
  
  // Parse the dice part
  const diceMatch = dicePart.match(/^(\d*)d(\d+)(.*)$/)
  if (!diceMatch) {
    throw new Error(`Invalid dice notation: ${notation}`)
  }
  
  const count = diceMatch[1] ? parseInt(diceMatch[1]) : 1
  const sides = parseInt(diceMatch[2])
  const modifierPart = diceMatch[3]
  
  // Parse modifier
  let modifier = 0
  if (modifierPart) {
    const modifierMatch = modifierPart.match(/^([+-]\d+)$/)
    if (modifierMatch) {
      modifier = parseInt(modifierMatch[1])
    } else {
      throw new Error(`Invalid modifier in dice notation: ${notation}`)
    }
  }
  
  return { count, sides, modifier, advantage }
}

// Roll a single die
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

// Roll multiple dice with modifiers
export function rollDice(notation: string): DiceRoll {
  const parsed = parseDiceNotation(notation)
  const rolls: number[] = []
  let total = 0
  
  // Roll the dice
  for (let i = 0; i < parsed.count; i++) {
    const roll = rollDie(parsed.sides)
    rolls.push(roll)
    total += roll
  }
  
  // Add modifier
  total += parsed.modifier
  
  // Handle advantage/disadvantage for d20 rolls
  let advantageRolls: number[] | undefined
  if (parsed.sides === 20 && parsed.advantage) {
    advantageRolls = [rollDie(20), rollDie(20)]
    if (parsed.advantage === 'advantage') {
      total = Math.max(...advantageRolls) + parsed.modifier
    } else {
      total = Math.min(...advantageRolls) + parsed.modifier
    }
  }
  
  // Check for critical hits/misses (natural 20/1 on d20)
  const isCritical = parsed.sides === 20 && rolls.some(roll => roll === 20)
  const isCriticalMiss = parsed.sides === 20 && rolls.some(roll => roll === 1)
  
  return {
    dice: notation,
    result: total,
    rolls,
    modifiers: parsed.modifier !== 0 ? [{
      source: 'modifier',
      value: parsed.modifier,
      type: parsed.modifier > 0 ? 'bonus' : 'penalty',
      description: `Modifier: ${parsed.modifier >= 0 ? '+' : ''}${parsed.modifier}`
    }] : [],
    total,
    critical: isCritical,
    description: `${notation} = ${total}`,
    advantage: parsed.advantage || null,
    advantageRolls
  }
}

// Calculate ability modifier from ability score
export function calculateAbilityModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2)
}

// Calculate proficiency bonus based on level
export function calculateProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

// Roll initiative (d20 + Dexterity modifier)
export function rollInitiative(dexterityScore: number, additionalModifiers: Modifier[] = []): CombatRoll {
  const dexModifier = calculateAbilityModifier(dexterityScore)
  const totalModifier = dexModifier + additionalModifiers.reduce((sum, mod) => sum + mod.value, 0)
  
  const roll = rollDice(`d20+${totalModifier}`)
  
  return {
    type: 'initiative',
    baseDice: 'd20',
    modifiers: [
      {
        source: 'dexterity',
        value: dexModifier,
        type: 'bonus',
        description: `Dexterity modifier (${dexterityScore})`
      },
      ...additionalModifiers
    ],
    roll
  }
}

// Roll attack (d20 + proficiency + ability modifier + other modifiers)
export function rollAttack(
  proficiencyBonus: number,
  abilityModifier: number,
  additionalModifiers: Modifier[] = [],
  advantage: 'advantage' | 'disadvantage' | null = null
): CombatRoll {
  const totalModifier = proficiencyBonus + abilityModifier + additionalModifiers.reduce((sum, mod) => sum + mod.value, 0)
  
  const diceNotation = advantage ? `d20+${totalModifier}${advantage}` : `d20+${totalModifier}`
  const roll = rollDice(diceNotation)
  
  return {
    type: 'attack',
    baseDice: 'd20',
    modifiers: [
      {
        source: 'proficiency',
        value: proficiencyBonus,
        type: 'bonus',
        description: `Proficiency bonus (+${proficiencyBonus})`
      },
      {
        source: 'ability',
        value: abilityModifier,
        type: 'bonus',
        description: `Ability modifier (+${abilityModifier})`
      },
      ...additionalModifiers
    ],
    roll
  }
}

// Roll damage (weapon dice + ability modifier + other modifiers)
export function rollDamage(
  weaponDice: string,
  abilityModifier: number,
  additionalModifiers: Modifier[] = [],
  isCritical: boolean = false
): CombatRoll {
  const totalModifier = abilityModifier + additionalModifiers.reduce((sum, mod) => sum + mod.value, 0)
  
  // For critical hits, double the dice but not the modifiers
  const diceNotation = isCritical ? `${weaponDice}+${totalModifier}` : `${weaponDice}+${totalModifier}`
  const roll = rollDice(diceNotation)
  
  return {
    type: 'damage',
    baseDice: weaponDice,
    modifiers: [
      {
        source: 'ability',
        value: abilityModifier,
        type: 'bonus',
        description: `Ability modifier (+${abilityModifier})`
      },
      ...additionalModifiers
    ],
    roll
  }
}

// Roll saving throw (d20 + ability modifier + proficiency if proficient)
export function rollSavingThrow(
  abilityModifier: number,
  isProficient: boolean,
  proficiencyBonus: number,
  additionalModifiers: Modifier[] = [],
  advantage: 'advantage' | 'disadvantage' | null = null
): CombatRoll {
  const proficiencyModifier = isProficient ? proficiencyBonus : 0
  const totalModifier = abilityModifier + proficiencyModifier + additionalModifiers.reduce((sum, mod) => sum + mod.value, 0)
  
  const diceNotation = advantage ? `d20+${totalModifier}${advantage}` : `d20+${totalModifier}`
  const roll = rollDice(diceNotation)
  
  return {
    type: 'saving-throw',
    baseDice: 'd20',
    modifiers: [
      {
        source: 'ability',
        value: abilityModifier,
        type: 'bonus' as const,
        description: `Ability modifier (+${abilityModifier})`
      },
      ...(isProficient ? [{
        source: 'proficiency',
        value: proficiencyBonus,
        type: 'bonus' as const,
        description: `Proficiency bonus (+${proficiencyBonus})`
      }] : []),
      ...additionalModifiers
    ],
    roll
  }
}

// Roll skill check (d20 + ability modifier + proficiency if proficient)
export function rollSkillCheck(
  abilityModifier: number,
  isProficient: boolean,
  proficiencyBonus: number,
  additionalModifiers: Modifier[] = [],
  advantage: 'advantage' | 'disadvantage' | null = null
): CombatRoll {
  const proficiencyModifier = isProficient ? proficiencyBonus : 0
  const totalModifier = abilityModifier + proficiencyModifier + additionalModifiers.reduce((sum, mod) => sum + mod.value, 0)
  
  const diceNotation = advantage ? `d20+${totalModifier}${advantage}` : `d20+${totalModifier}`
  const roll = rollDice(diceNotation)
  
  return {
    type: 'skill-check',
    baseDice: 'd20',
    modifiers: [
      {
        source: 'ability',
        value: abilityModifier,
        type: 'bonus' as const,
        description: `Ability modifier (+${abilityModifier})`
      },
      ...(isProficient ? [{
        source: 'proficiency',
        value: proficiencyBonus,
        type: 'bonus' as const,
        description: `Proficiency bonus (+${proficiencyBonus})`
      }] : []),
      ...additionalModifiers
    ],
    roll
  }
}

// Check if attack hits target AC
export function checkAttackHit(attackRoll: CombatRoll, targetAC: number): boolean {
  return attackRoll.roll.total >= targetAC
}

// Check if saving throw succeeds against DC
export function checkSavingThrowSuccess(savingThrow: CombatRoll, difficultyClass: number): boolean {
  return savingThrow.roll.total >= difficultyClass
}

// Calculate spell save DC
export function calculateSpellSaveDC(
  spellcastingAbilityModifier: number,
  proficiencyBonus: number,
  additionalModifiers: Modifier[] = []
): number {
  const totalModifier = spellcastingAbilityModifier + proficiencyBonus + additionalModifiers.reduce((sum, mod) => sum + mod.value, 0)
  return 8 + totalModifier
}

// Format roll result for display
export function formatRollResult(roll: DiceRoll): string {
  let result = `${roll.dice} = `
  
  if (roll.advantage) {
    result += `[${roll.advantageRolls?.join(', ')}] `
  }
  
  result += `${roll.rolls.join(' + ')}`
  
  if (roll.modifiers.length > 0) {
    result += ` + ${roll.modifiers.map(mod => mod.value).join(' + ')}`
  }
  
  result += ` = ${roll.total}`
  
  if (roll.critical) {
    result += ' (CRITICAL!)'
  }
  
  return result
}

// Get roll description for combat log
export function getRollDescription(combatRoll: CombatRoll, target?: string): string {
  const typeDescriptions = {
    'attack': 'Attack roll',
    'damage': 'Damage roll',
    'saving-throw': 'Saving throw',
    'initiative': 'Initiative roll',
    'skill-check': 'Skill check'
  }
  
  let description = typeDescriptions[combatRoll.type]
  
  if (target) {
    description += ` vs ${target}`
  }
  
  if (combatRoll.target) {
    description += ` (DC ${combatRoll.target})`
  }
  
  if (combatRoll.success !== undefined) {
    description += combatRoll.success ? ' - SUCCESS!' : ' - FAILURE'
  }
  
  return description
} 