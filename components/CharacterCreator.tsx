'use client'

import React, { useState } from 'react'
import { useGameStore } from '@/lib/store'
import { Character } from '@/lib/types'
import { 
  Sword, 
  Shield, 
  Zap, 
  Heart, 
  Brain, 
  Star,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  BookOpen,
  Target,
  Activity
} from 'lucide-react'

interface CharacterCreatorProps {
  onComplete: (character: Character) => void
  onBack: () => void
}

type CreationStep = 'name' | 'background' | 'abilities' | 'skills' | 'review'

const backgrounds = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'A battle-hardened fighter with exceptional combat skills',
    icon: <Sword className="w-6 h-6" />,
    bonuses: { strength: 2, constitution: 1, attack: 3, defense: 2 }
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'A stealthy operative skilled in deception and precision',
    icon: <Target className="w-6 h-6" />,
    bonuses: { dexterity: 2, intelligence: 1, attack: 2, speed: 3 }
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'A scholarly spellcaster with arcane knowledge',
    icon: <Brain className="w-6 h-6" />,
    bonuses: { intelligence: 2, wisdom: 1, attack: 2, maxHealth: -10 }
  },
  {
    id: 'cleric',
    name: 'Cleric',
    description: 'A divine servant with healing and protective abilities',
    icon: <Heart className="w-6 h-6" />,
    bonuses: { wisdom: 2, charisma: 1, defense: 2, maxHealth: 10 }
  },
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'A wilderness expert skilled in survival and ranged combat',
    icon: <Activity className="w-6 h-6" />,
    bonuses: { dexterity: 1, wisdom: 1, constitution: 1, speed: 2 }
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'A learned academic with vast knowledge and research skills',
    icon: <BookOpen className="w-6 h-6" />,
    bonuses: { intelligence: 2, wisdom: 1, charisma: 1, attack: -1 }
  }
]

const skills = [
  { name: 'Acrobatics', ability: 'dexterity', type: 'exploration' },
  { name: 'Athletics', ability: 'strength', type: 'combat' },
  { name: 'Deception', ability: 'charisma', type: 'social' },
  { name: 'Insight', ability: 'wisdom', type: 'social' },
  { name: 'Intimidation', ability: 'charisma', type: 'social' },
  { name: 'Investigation', ability: 'intelligence', type: 'exploration' },
  { name: 'Perception', ability: 'wisdom', type: 'exploration' },
  { name: 'Persuasion', ability: 'charisma', type: 'social' },
  { name: 'Stealth', ability: 'dexterity', type: 'exploration' },
  { name: 'Survival', ability: 'wisdom', type: 'exploration' }
]

export function CharacterCreator({ onComplete, onBack }: CharacterCreatorProps) {
  const [currentStep, setCurrentStep] = useState<CreationStep>('name')
  const [character, setCharacter] = useState<Partial<Character>>({
    name: '',
    health: 100,
    maxHealth: 100,
    attack: 10,
    defense: 5,
    speed: 10,
    level: 1,
    experience: 0,
    inventory: [],
    skills: [],
    statusEffects: {},
    background: '',
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  })

  const [selectedBackground, setSelectedBackground] = useState<string>('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [remainingPoints, setRemainingPoints] = useState(27) // Standard point buy system

  const updateAbility = (ability: keyof Character['abilities'], value: number) => {
    const currentValue = character.abilities?.[ability] || 10
    const cost = Math.max(0, value - 8) // Point buy: 8-13 cost 1, 14-15 cost 2
    const currentCost = Math.max(0, currentValue - 8)
    const pointDifference = cost - currentCost

    if (remainingPoints - pointDifference >= 0) {
      setCharacter(prev => ({
        ...prev,
        abilities: {
          ...prev.abilities!,
          [ability]: value
        }
      }))
      setRemainingPoints(prev => prev - pointDifference)
    }
  }

  const applyBackground = (backgroundId: string) => {
    const background = backgrounds.find(b => b.id === backgroundId)
    if (background) {
      setSelectedBackground(backgroundId)
      setCharacter(prev => ({
        ...prev,
        background: background.name,
        attack: (prev.attack || 10) + (background.bonuses.attack || 0),
        defense: (prev.defense || 5) + (background.bonuses.defense || 0),
        speed: (prev.speed || 10) + (background.bonuses.speed || 0),
        maxHealth: (prev.maxHealth || 100) + (background.bonuses.maxHealth || 0),
        health: (prev.maxHealth || 100) + (background.bonuses.maxHealth || 0),
        abilities: {
          ...prev.abilities!,
          strength: (prev.abilities?.strength || 10) + (background.bonuses.strength || 0),
          dexterity: (prev.abilities?.dexterity || 10) + (background.bonuses.dexterity || 0),
          constitution: (prev.abilities?.constitution || 10) + (background.bonuses.constitution || 0),
          intelligence: (prev.abilities?.intelligence || 10) + (background.bonuses.intelligence || 0),
          wisdom: (prev.abilities?.wisdom || 10) + (background.bonuses.wisdom || 0),
          charisma: (prev.abilities?.charisma || 10) + (background.bonuses.charisma || 0)
        }
      }))
    }
  }

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(prev => prev.filter(s => s !== skillName))
    } else if (selectedSkills.length < 4) {
      setSelectedSkills(prev => [...prev, skillName])
    }
  }

  const getAbilityModifier = (value: number) => {
    return Math.floor((value - 10) / 2)
  }

  const getAbilityColor = (value: number) => {
    if (value >= 16) return 'text-blue-400'
    if (value >= 14) return 'text-green-400'
    if (value >= 12) return 'text-yellow-400'
    if (value >= 10) return 'text-console-text'
    return 'text-red-400'
  }

  const handleNext = () => {
    if (currentStep === 'name' && character.name?.trim()) {
      setCurrentStep('background')
    } else if (currentStep === 'background' && selectedBackground) {
      setCurrentStep('abilities')
    } else if (currentStep === 'abilities' && remainingPoints === 0) {
      setCurrentStep('skills')
    } else if (currentStep === 'skills' && selectedSkills.length === 4) {
      setCurrentStep('review')
    }
  }

  const handlePrevious = () => {
    if (currentStep === 'background') setCurrentStep('name')
    else if (currentStep === 'abilities') setCurrentStep('background')
    else if (currentStep === 'skills') setCurrentStep('abilities')
    else if (currentStep === 'review') setCurrentStep('skills')
  }

  const handleComplete = () => {
    const finalCharacter: Character = {
      ...character as Character,
      skills: selectedSkills.map(skillName => ({
        name: skillName,
        level: 1,
        experience: 0,
        maxLevel: 10,
        description: `Proficiency in ${skillName}`,
        type: skills.find(s => s.name === skillName)?.type as any || 'exploration'
      }))
    }
    onComplete(finalCharacter)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'name': return character.name && character.name.trim().length > 0
      case 'background': return selectedBackground.length > 0
      case 'abilities': return remainingPoints === 0
      case 'skills': return selectedSkills.length === 4
      case 'review': return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-console-dark flex items-center justify-center p-4">
      <div className="console-card w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-gaming text-console-accent mb-2">
            CHARACTER CREATION
          </h1>
          <div className="flex justify-center space-x-2">
            {(['name', 'background', 'abilities', 'skills', 'review'] as CreationStep[]).map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  currentStep === step ? 'bg-console-accent' : 'bg-console-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'name' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <User className="w-16 h-16 text-console-accent" />
              </div>
              <h2 className="text-2xl font-gaming text-console-accent">What is your name?</h2>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your character's name..."
                className="console-input text-center text-xl w-full max-w-md"
                autoFocus
              />
              <p className="text-console-text-dim">
                Choose a name that reflects your character's personality and background
              </p>
            </div>
          )}

          {currentStep === 'background' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-gaming text-console-accent text-center">Choose Your Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {backgrounds.map((bg) => (
                  <div
                    key={bg.id}
                    onClick={() => applyBackground(bg.id)}
                    className={`console-card cursor-pointer transition-all ${
                      selectedBackground === bg.id ? 'border-console-accent console-glow' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-console-accent">{bg.icon}</div>
                      <h3 className="font-gaming text-console-accent">{bg.name}</h3>
                    </div>
                    <p className="text-sm text-console-text-dim mb-3">{bg.description}</p>
                    <div className="text-xs text-console-text-dim">
                      <div>STR +{bg.bonuses.strength || 0}</div>
                      <div>DEX +{bg.bonuses.dexterity || 0}</div>
                      <div>CON +{bg.bonuses.constitution || 0}</div>
                      <div>INT +{bg.bonuses.intelligence || 0}</div>
                      <div>WIS +{bg.bonuses.wisdom || 0}</div>
                      <div>CHA +{bg.bonuses.charisma || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'abilities' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-gaming text-console-accent text-center">Customize Your Abilities</h2>
              <div className="text-center mb-4">
                <span className="text-console-accent">Remaining Points: {remainingPoints}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(character.abilities || {}).map(([ability, value]) => (
                  <div key={ability} className="console-card text-center">
                    <h3 className="font-gaming text-console-accent mb-2">
                      {ability.toUpperCase()}
                    </h3>
                    <div className={`text-2xl font-gaming mb-2 ${getAbilityColor(value)}`}>
                      {value}
                    </div>
                    <div className="text-sm text-console-text-dim mb-2">
                      Modifier: {getAbilityModifier(value) >= 0 ? '+' : ''}{getAbilityModifier(value)}
                    </div>
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={() => updateAbility(ability as keyof Character['abilities'], value - 1)}
                        disabled={value <= 8}
                        className="console-button text-xs"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateAbility(ability as keyof Character['abilities'], value + 1)}
                        disabled={value >= 15 || remainingPoints === 0}
                        className="console-button text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'skills' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-gaming text-console-accent text-center">Choose Your Skills</h2>
              <p className="text-center text-console-text-dim">
                Select 4 skills that your character is proficient in
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    onClick={() => toggleSkill(skill.name)}
                    className={`console-card cursor-pointer transition-all ${
                      selectedSkills.includes(skill.name) ? 'border-console-accent console-glow' : ''
                    }`}
                  >
                    <div className="text-center">
                      <h3 className="font-gaming text-console-accent">{skill.name}</h3>
                      <p className="text-xs text-console-text-dim">
                        {skill.ability.toUpperCase()} • {skill.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <span className="text-console-accent">
                  Selected: {selectedSkills.length}/4
                </span>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-gaming text-console-accent text-center">Review Your Character</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="console-card">
                  <h3 className="font-gaming text-console-accent mb-3">Basic Info</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-console-accent">Name:</span> {character.name}</div>
                    <div><span className="text-console-accent">Background:</span> {character.background}</div>
                    <div><span className="text-console-accent">Level:</span> {character.level}</div>
                    <div><span className="text-console-accent">Health:</span> {character.health}/{character.maxHealth}</div>
                  </div>
                </div>
                <div className="console-card">
                  <h3 className="font-gaming text-console-accent mb-3">Combat Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-console-accent">Attack:</span> {character.attack}</div>
                    <div><span className="text-console-accent">Defense:</span> {character.defense}</div>
                    <div><span className="text-console-accent">Speed:</span> {character.speed}</div>
                  </div>
                </div>
                <div className="console-card">
                  <h3 className="font-gaming text-console-accent mb-3">Abilities</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(character.abilities || {}).map(([ability, value]) => (
                      <div key={ability}>
                        <span className="text-console-accent">{ability.toUpperCase()}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="console-card">
                  <h3 className="font-gaming text-console-accent mb-3">Skills</h3>
                  <div className="space-y-1 text-sm">
                    {selectedSkills.map(skill => (
                      <div key={skill} className="text-console-text-dim">• {skill}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={currentStep === 'name' ? onBack : handlePrevious}
            className="console-button flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 'name' ? 'Back' : 'Previous'}</span>
          </button>
          
          {currentStep === 'review' ? (
            <button
              onClick={handleComplete}
              className="console-button-primary flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Create Character</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="console-button flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 