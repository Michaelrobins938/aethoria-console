'use client'

import React, { useState } from 'react'
import { 
  User, 
  Heart, 
  Sword, 
  Shield, 
  Zap, 
  Brain, 
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Activity,
  X
} from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { Character, Skill } from '@/lib/types'

interface CharacterSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function CharacterSheet({ isOpen, onClose }: CharacterSheetProps) {
  const { character } = useGameStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'combat' | 'skills' | 'inventory' | 'progression'>('overview')

  if (!character || !isOpen) return null

  const getAbilityModifier = (value: number) => {
    return Math.floor((value - 10) / 2)
  }

  const getAbilityColor = (value: number) => {
    if (value >= 18) return 'text-purple-400'
    if (value >= 16) return 'text-blue-400'
    if (value >= 14) return 'text-green-400'
    if (value >= 12) return 'text-yellow-400'
    if (value >= 10) return 'text-console-text'
    return 'text-red-400'
  }

  const getSkillTypeIcon = (type: string) => {
    switch (type) {
      case 'combat': return <Sword className="w-3 h-3" />
      case 'social': return <User className="w-3 h-3" />
      case 'exploration': return <Target className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'combat': return 'text-red-400'
      case 'social': return 'text-blue-400'
      case 'exploration': return 'text-green-400'
      default: return 'text-console-text'
    }
  }

  const calculateTotalSkillBonus = (skill: Skill) => {
    const abilityMod = getAbilityModifier(character.abilities[skill.primaryAbility || 'strength'])
    const proficiencyBonus = Math.floor(character.level / 4) + 2
    return abilityMod + proficiencyBonus + skill.level
  }

  const getHealthPercentage = () => {
    return Math.round((character.health / character.maxHealth) * 100)
  }

  const getHealthColor = () => {
    const percentage = getHealthPercentage()
    if (percentage >= 75) return 'text-green-400'
    if (percentage >= 50) return 'text-yellow-400'
    if (percentage >= 25) return 'text-orange-400'
    return 'text-red-400'
  }

  const getExperienceProgress = () => {
    const expForNextLevel = character.level * 1000
    const progress = (character.experience / expForNextLevel) * 100
    return Math.min(progress, 100)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'combat', label: 'Combat', icon: <Sword className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Award className="w-4 h-4" /> },
    { id: 'progression', label: 'Progression', icon: <TrendingUp className="w-4 h-4" /> }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <User className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Character Sheet</h2>
            <span className="text-console-text-dim">
              {character.name} • Level {character.level}
            </span>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'combat' | 'skills' | 'inventory' | 'progression')}
              className={`console-button flex items-center space-x-2 ${
                activeTab === tab.id ? 'bg-console-accent text-console-dark' : ''
              }`}
            >
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-h-[500px] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-console-accent">Name:</span> {character.name}</div>
                  <div><span className="text-console-accent">Background:</span> {character.background}</div>
                  <div><span className="text-console-accent">Level:</span> {character.level}</div>
                  <div><span className="text-console-accent">Experience:</span> {character.experience}</div>
                </div>
              </div>

              {/* Health & Status */}
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Health & Status</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health</span>
                      <span className={getHealthColor()}>
                        {character.health}/{character.maxHealth}
                      </span>
                    </div>
                    <div className="w-full bg-console-border rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getHealthColor().replace('text-', 'bg-')}`}
                        style={{ width: `${getHealthPercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Experience</span>
                      <span>{getExperienceProgress().toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-console-border rounded-full h-2">
                      <div 
                        className="bg-console-accent h-2 rounded-full transition-all"
                        style={{ width: `${getExperienceProgress()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Abilities */}
              <div className="console-card md:col-span-2">
                <h3 className="font-gaming text-console-accent mb-4">Abilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(character.abilities).map(([ability, value]) => (
                    <div key={ability} className="text-center">
                      <div className={`text-2xl font-gaming mb-1 ${getAbilityColor(value)}`}>
                        {value}
                      </div>
                      <div className="text-sm text-console-accent font-gaming">
                        {ability.toUpperCase()}
                      </div>
                      <div className="text-xs text-console-text-dim">
                        {getAbilityModifier(value) >= 0 ? '+' : ''}{getAbilityModifier(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Combat Stats */}
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Combat Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Sword className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-sm text-console-accent">Attack</div>
                      <div className="text-lg font-gaming">{character.attack}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-console-accent">Defense</div>
                      <div className="text-lg font-gaming">{character.defense}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-sm text-console-accent">Speed</div>
                      <div className="text-lg font-gaming">{character.speed}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Effects */}
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Status Effects</h3>
                {Object.keys(character.statusEffects).length === 0 ? (
                  <p className="text-console-text-dim text-sm">No active status effects</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(character.statusEffects).map(([effect, details]) => (
                      <div key={effect} className="text-sm">
                        <div className="text-console-accent">{effect}</div>
                        <div className="text-console-text-dim">{details}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {character.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between p-3 border border-console-border rounded">
                      <div className="flex items-center space-x-3">
                        <div className={getSkillTypeColor(skill.type)}>
                          {getSkillTypeIcon(skill.type)}
                        </div>
                        <div>
                          <div className="font-gaming text-console-accent">{skill.name}</div>
                          <div className="text-xs text-console-text-dim">{skill.description}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-gaming text-console-accent">
                          +{calculateTotalSkillBonus(skill)}
                        </div>
                        <div className="text-xs text-console-text-dim">
                          Level {skill.level}/{skill.maxLevel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Equipment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-console-accent mb-2">Weapons</h4>
                    <div className="space-y-1 text-sm">
                      {character.inventory.filter(item => item.type === 'weapon').map(item => (
                        <div key={item.id} className="text-console-text-dim">• {item.name}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-console-accent mb-2">Armor</h4>
                    <div className="space-y-1 text-sm">
                      {character.inventory.filter(item => item.type === 'armor').map(item => (
                        <div key={item.id} className="text-console-text-dim">• {item.name}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progression' && (
            <div className="space-y-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Level Progression</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Level</span>
                      <span>{character.level}</span>
                    </div>
                    <div className="w-full bg-console-border rounded-full h-3">
                      <div 
                        className="bg-console-accent h-3 rounded-full transition-all"
                        style={{ width: `${getExperienceProgress()}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-console-text-dim mt-1">
                      {character.experience} / {character.level * 1000} XP
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-console-accent mb-2">Next Level Benefits</h4>
                      <div className="space-y-1 text-sm text-console-text-dim">
                        <div>• +1 to all ability scores</div>
                        <div>• New skill proficiency</div>
                        <div>• Increased health</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-console-accent mb-2">Achievements</h4>
                      <div className="space-y-1 text-sm text-console-text-dim">
                        <div>• Survived 10 encounters</div>
                        <div>• Completed 5 quests</div>
                        <div>• Reached level {character.level}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 