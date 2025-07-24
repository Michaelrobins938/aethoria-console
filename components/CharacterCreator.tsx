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
  Check
} from 'lucide-react'

interface CharacterCreatorProps {
  onComplete: (character: Character) => void
  onBack: () => void
}

const races = [
  { id: 'human', name: 'Human', description: 'Versatile and adaptable', bonus: '+1 to all abilities' },
  { id: 'elf', name: 'Elf', description: 'Graceful and magical', bonus: '+2 Dexterity, +1 Intelligence' },
  { id: 'dwarf', name: 'Dwarf', description: 'Sturdy and strong', bonus: '+2 Constitution, +1 Strength' },
  { id: 'halfling', name: 'Halfling', description: 'Small and lucky', bonus: '+2 Dexterity, +1 Charisma' },
  { id: 'dragonborn', name: 'Dragonborn', description: 'Draconic heritage', bonus: '+2 Strength, +1 Charisma' },
  { id: 'tiefling', name: 'Tiefling', description: 'Infernal bloodline', bonus: '+2 Charisma, +1 Intelligence' }
]

const classes = [
  { id: 'fighter', name: 'Fighter', description: 'Master of martial combat', icon: <Sword className="w-6 h-6" /> },
  { id: 'wizard', name: 'Wizard', description: 'Scholar of arcane magic', icon: <Zap className="w-6 h-6" /> },
  { id: 'rogue', name: 'Rogue', description: 'Master of stealth and trickery', icon: <Star className="w-6 h-6" /> },
  { id: 'cleric', name: 'Cleric', description: 'Divine spellcaster and healer', icon: <Heart className="w-6 h-6" /> },
  { id: 'ranger', name: 'Ranger', description: 'Wilderness warrior', icon: <Shield className="w-6 h-6" /> },
  { id: 'bard', name: 'Bard', description: 'Inspiring performer and spellcaster', icon: <Brain className="w-6 h-6" /> }
]

const backgrounds = [
  { id: 'acolyte', name: 'Acolyte', description: 'Trained in religious service' },
  { id: 'criminal', name: 'Criminal', description: 'Lived outside the law' },
  { id: 'folk-hero', name: 'Folk Hero', description: 'Champion of the common people' },
  { id: 'noble', name: 'Noble', description: 'Born to privilege and status' },
  { id: 'sage', name: 'Sage', description: 'Scholar and researcher' },
  { id: 'soldier', name: 'Soldier', description: 'Trained in military service' }
]

export function CharacterCreator({ onComplete, onBack }: CharacterCreatorProps) {
  const [step, setStep] = useState(1)
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
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  })

  const [selectedRace, setSelectedRace] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedBackground, setSelectedBackground] = useState('')

  const handleNameChange = (name: string) => {
    setCharacter(prev => ({ ...prev, name }))
  }

  const handleAbilityChange = (ability: keyof Character['abilities'], value: number) => {
    setCharacter(prev => ({
      ...prev,
      abilities: {
        ...prev.abilities!,
        [ability]: Math.max(8, Math.min(18, value))
      }
    }))
  }

  const handleRaceSelect = (raceId: string) => {
    setSelectedRace(raceId)
    // Apply race bonuses
    const race = races.find(r => r.id === raceId)
    if (race) {
      // Simple bonus application
      setCharacter(prev => ({
        ...prev,
        abilities: {
          ...prev.abilities!,
          strength: prev.abilities!.strength + (raceId === 'dwarf' || raceId === 'dragonborn' ? 2 : 0),
          dexterity: prev.abilities!.dexterity + (raceId === 'elf' || raceId === 'halfling' ? 2 : 0),
          constitution: prev.abilities!.constitution + (raceId === 'dwarf' ? 2 : 0),
          intelligence: prev.abilities!.intelligence + (raceId === 'elf' || raceId === 'tiefling' ? 1 : 0),
          wisdom: prev.abilities!.wisdom,
          charisma: prev.abilities!.charisma + (raceId === 'halfling' || raceId === 'dragonborn' || raceId === 'tiefling' ? 1 : 0)
        }
      }))
    }
  }

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId)
    // Apply class bonuses
    setCharacter(prev => {
      const baseStats = { attack: 10, defense: 5, speed: 10 }
      switch (classId) {
        case 'fighter':
          return { ...prev, attack: baseStats.attack + 3, defense: baseStats.defense + 2 }
        case 'wizard':
          return { ...prev, attack: baseStats.attack + 1, defense: baseStats.defense + 1 }
        case 'rogue':
          return { ...prev, attack: baseStats.attack + 2, speed: baseStats.speed + 3 }
        case 'cleric':
          return { ...prev, attack: baseStats.attack + 2, defense: baseStats.defense + 2 }
        case 'ranger':
          return { ...prev, attack: baseStats.attack + 2, speed: baseStats.speed + 2 }
        case 'bard':
          return { ...prev, attack: baseStats.attack + 1, speed: baseStats.speed + 1 }
        default:
          return prev
      }
    })
  }

  const handleBackgroundSelect = (backgroundId: string) => {
    setSelectedBackground(backgroundId)
    const background = backgrounds.find(b => b.id === backgroundId)
    if (background) {
      setCharacter(prev => ({ ...prev, background: background.description }))
    }
  }

  const handleComplete = () => {
    if (character.name && selectedRace && selectedClass && selectedBackground) {
      const finalCharacter: Character = {
        ...character as Character,
        name: character.name!,
        background: character.background || 'A mysterious adventurer'
      }
      onComplete(finalCharacter)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return character.name && character.name.length >= 2
      case 2:
        return selectedRace
      case 3:
        return selectedClass
      case 4:
        return selectedBackground
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gaming text-console-accent">What is your name, adventurer?</h2>
            <input
              type="text"
              value={character.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your character's name..."
              className="console-input text-xl text-center w-full max-w-md"
              maxLength={20}
            />
            <p className="text-console-text-dim">
              Choose a name that reflects your character's personality and background.
            </p>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gaming text-console-accent">Choose Your Race</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {races.map((race) => (
                <div
                  key={race.id}
                  onClick={() => handleRaceSelect(race.id)}
                  className={`console-card cursor-pointer transition-all ${
                    selectedRace === race.id ? 'border-console-accent console-glow' : ''
                  }`}
                >
                  <h3 className="font-gaming text-console-accent">{race.name}</h3>
                  <p className="text-sm text-console-text-dim">{race.description}</p>
                  <p className="text-xs text-console-accent">{race.bonus}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gaming text-console-accent">Choose Your Class</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => handleClassSelect(cls.id)}
                  className={`console-card cursor-pointer transition-all ${
                    selectedClass === cls.id ? 'border-console-accent console-glow' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-console-accent">{cls.icon}</div>
                    <div>
                      <h3 className="font-gaming text-console-accent">{cls.name}</h3>
                      <p className="text-sm text-console-text-dim">{cls.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gaming text-console-accent">Choose Your Background</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backgrounds.map((bg) => (
                <div
                  key={bg.id}
                  onClick={() => handleBackgroundSelect(bg.id)}
                  className={`console-card cursor-pointer transition-all ${
                    selectedBackground === bg.id ? 'border-console-accent console-glow' : ''
                  }`}
                >
                  <h3 className="font-gaming text-console-accent">{bg.name}</h3>
                  <p className="text-sm text-console-text-dim">{bg.description}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-gaming text-console-accent">Your Character</h2>
            <div className="console-card">
              <div className="text-center mb-4">
                <h3 className="text-xl font-gaming text-console-accent">{character.name}</h3>
                <p className="text-console-text-dim">
                  {races.find(r => r.id === selectedRace)?.name} {classes.find(c => c.id === selectedClass)?.name}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="text-console-accent">Strength:</span> {character.abilities?.strength}</p>
                  <p><span className="text-console-accent">Dexterity:</span> {character.abilities?.dexterity}</p>
                  <p><span className="text-console-accent">Constitution:</span> {character.abilities?.constitution}</p>
                </div>
                <div>
                  <p><span className="text-console-accent">Intelligence:</span> {character.abilities?.intelligence}</p>
                  <p><span className="text-console-accent">Wisdom:</span> {character.abilities?.wisdom}</p>
                  <p><span className="text-console-accent">Charisma:</span> {character.abilities?.charisma}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-console-border">
                <p><span className="text-console-accent">Attack:</span> {character.attack}</p>
                <p><span className="text-console-accent">Defense:</span> {character.defense}</p>
                <p><span className="text-console-accent">Speed:</span> {character.speed}</p>
              </div>
            </div>
            
            <button
              onClick={handleComplete}
              className="console-button-primary w-full"
            >
              <Check className="w-4 h-4 mr-2" />
              Begin Adventure
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-console-text-dim">Step {step} of 5</span>
            <span className="text-sm text-console-accent">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-console-darker rounded-full h-2">
            <div 
              className="bg-console-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="console-card">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="console-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="console-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : null}
        </div>

        {/* Back to Menu */}
        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className="text-console-text-dim hover:text-console-accent transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
} 