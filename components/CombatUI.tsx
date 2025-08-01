'use client'

import React from 'react'
import { useGameStore } from '@/lib/store'
import { CombatParticipant } from '@/lib/types'
import { Sword, Shield, Zap, Heart, Target, Users, Eye, Search } from 'lucide-react'

interface CombatUIAction {
  id: string
  name: string
  icon: React.ReactNode
  type: 'attack' | 'cast-spell' | 'use-item' | 'dash' | 'disengage' | 'dodge' | 'help' | 'hide' | 'ready' | 'search'
  description: string
}

const combatActions: CombatUIAction[] = [
  { id: 'attack', name: 'Attack', icon: <Sword className="w-4 h-4" />, type: 'attack', description: 'Make a weapon attack' },
  { id: 'defend', name: 'Defend', icon: <Shield className="w-4 h-4" />, type: 'dodge', description: 'Take the dodge action' },
  { id: 'cast', name: 'Cast Spell', icon: <Zap className="w-4 h-4" />, type: 'cast-spell', description: 'Cast a spell' },
  { id: 'item', name: 'Use Item', icon: <Heart className="w-4 h-4" />, type: 'use-item', description: 'Use an item' },
  { id: 'flee', name: 'Flee', icon: <Target className="w-4 h-4" />, type: 'dash', description: 'Use dash action' },
  { id: 'help', name: 'Help', icon: <Users className="w-4 h-4" />, type: 'help', description: 'Help an ally' },
  { id: 'hide', name: 'Hide', icon: <Eye className="w-4 h-4" />, type: 'hide', description: 'Attempt to hide' },
  { id: 'search', name: 'Search', icon: <Search className="w-4 h-4" />, type: 'search', description: 'Search the area' }
]

export default function CombatUI() {
  const { 
    combatState, 
    character,
    getCurrentCombatActor,
    getAvailableCombatActions,
    getValidCombatTargets,
    advanceCombatTurn,
    isCombatOver,
    getCombatResult
  } = useGameStore()

  const currentActor = getCurrentCombatActor()
  const availableActions = getAvailableCombatActions()

  if (!combatState?.isActive) {
    return (
      <div className="p-4 bg-console-dark rounded-lg">
        <h3 className="text-lg font-bold mb-4">Combat UI</h3>
        <p className="text-console-light">No active combat</p>
      </div>
    )
  }

  const getHealthPercentage = (currentHP: number, maxHP: number) => {
    return Math.round((currentHP / maxHP) * 100)
  }

  const getHealthColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getEnemies = (participants: CombatParticipant[]) => {
    return participants.filter(p => p.type === 'enemy' && p.currentHP > 0)
  }

  const enemies = getEnemies(combatState.participants)

  return (
    <div className="p-4 bg-console-dark rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Combat Interface</h3>
        <div className="text-sm text-console-light">
          Round {combatState.round} • Turn: {currentActor?.name || 'None'}
        </div>
      </div>

      {/* Current Actor Status */}
      {currentActor && (
        <div className="mb-4 p-3 bg-console-darker rounded">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold">{currentActor.name}</h4>
            <span className="text-sm text-console-light">
              Level {currentActor.level}
            </span>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Health</span>
              <span>{currentActor.currentHP}/{currentActor.maxHP}</span>
            </div>
            <div className="w-full bg-console-dark rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${getHealthColor(getHealthPercentage(currentActor.currentHP, currentActor.maxHP))}`}
                style={{ width: `${getHealthPercentage(currentActor.currentHP, currentActor.maxHP)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-console-light">AC</div>
              <div>{currentActor.armorClass}</div>
            </div>
            <div>
              <div className="text-console-light">Actions</div>
              <div>{currentActor.hasAction ? 'Available' : 'Used'}</div>
            </div>
            <div>
              <div className="text-console-light">Bonus</div>
              <div>{currentActor.hasBonusAction ? 'Available' : 'Used'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Combat Actions */}
      <div className="mb-4">
        <h4 className="font-bold mb-2">Available Actions</h4>
        <div className="grid grid-cols-4 gap-2">
          {combatActions.map((action) => (
            <button
              key={action.id}
              disabled={!availableActions.includes(action.type)}
              className={`p-2 rounded border transition-all duration-200 flex flex-col items-center gap-1 text-xs ${
                availableActions.includes(action.type)
                  ? 'bg-console-darker border-console-border hover:border-console-accent'
                  : 'bg-console-dark border-console-border opacity-50 cursor-not-allowed'
              }`}
              title={action.description}
            >
              {action.icon}
              <span>{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enemies */}
      {enemies.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold mb-2">Enemies</h4>
          <div className="space-y-2">
            {enemies.map((enemy) => (
              <div key={enemy.id} className="p-2 bg-console-darker rounded border border-console-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{enemy.name}</span>
                  <span className="text-sm text-console-light">
                    HP: {enemy.currentHP}/{enemy.maxHP}
                  </span>
                </div>
                <div className="w-full bg-console-dark rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getHealthColor(getHealthPercentage(enemy.currentHP, enemy.maxHP))}`}
                    style={{ width: `${getHealthPercentage(enemy.currentHP, enemy.maxHP)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-console-light">
                  <div>AC: {enemy.armorClass}</div>
                  <div>Level: {enemy.level}</div>
                  <div>Type: {enemy.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combat Status */}
      <div className="mb-4">
        <h4 className="font-bold mb-2">Combat Status</h4>
        <div className="bg-console-darker rounded p-3 text-sm">
          <div className="flex justify-between mb-1">
            <span>Status:</span>
            <span className={isCombatOver() ? 'text-red-400' : 'text-green-400'}>
              {isCombatOver() ? 'Ended' : 'Active'}
            </span>
          </div>
          {isCombatOver() && (
            <div className="flex justify-between">
              <span>Result:</span>
              <span className="font-bold">{getCombatResult().toUpperCase()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Participants:</span>
            <span>{combatState.participants.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Alive:</span>
            <span>{combatState.participants.filter(p => p.currentHP > 0).length}</span>
          </div>
        </div>
      </div>

      {/* Combat Log */}
      <div>
        <h4 className="font-bold mb-2">Recent Actions</h4>
        <div className="bg-console-darker rounded p-3 h-24 overflow-y-auto text-sm">
          {combatState.actions.length === 0 ? (
            <p className="text-console-light">No actions yet...</p>
          ) : (
            combatState.actions.slice(-5).map((action, index) => (
              <div key={index} className="text-console-light mb-1">
                <span className="text-console-accent">{action.actor}</span>
                <span> {action.description}</span>
                {action.result && (
                  <span className={`ml-2 ${action.result === 'success' ? 'text-green-400' : action.result === 'critical' ? 'text-yellow-400' : 'text-red-400'}`}>
                    ({action.result})
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 