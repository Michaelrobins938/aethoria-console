'use client'

import React, { useState, useEffect } from 'react'
import { useGameStore } from '@/lib/store'
import { CombatState, CombatParticipant, CombatAction } from '@/lib/types'
import { Sword, Shield, Zap, Heart, Target, Users, Eye, Search, ArrowRight } from 'lucide-react'

interface CombatActionButton {
  id: string
  name: string
  icon: React.ReactNode
  type: 'attack' | 'cast-spell' | 'use-item' | 'dash' | 'disengage' | 'dodge' | 'help' | 'hide' | 'ready' | 'search'
  description: string
}

const combatActions: CombatActionButton[] = [
  { id: 'attack', name: 'Attack', icon: <Sword className="w-4 h-4" />, type: 'attack', description: 'Make a weapon attack' },
  { id: 'defend', name: 'Defend', icon: <Shield className="w-4 h-4" />, type: 'dodge', description: 'Take the dodge action' },
  { id: 'cast', name: 'Cast Spell', icon: <Zap className="w-4 h-4" />, type: 'cast-spell', description: 'Cast a spell' },
  { id: 'item', name: 'Use Item', icon: <Heart className="w-4 h-4" />, type: 'use-item', description: 'Use an item' },
  { id: 'flee', name: 'Flee', icon: <Target className="w-4 h-4" />, type: 'dash', description: 'Use dash action' },
  { id: 'help', name: 'Help', icon: <Users className="w-4 h-4" />, type: 'help', description: 'Help an ally' },
  { id: 'hide', name: 'Hide', icon: <Eye className="w-4 h-4" />, type: 'hide', description: 'Attempt to hide' },
  { id: 'search', name: 'Search', icon: <Search className="w-4 h-4" />, type: 'search', description: 'Search the area' }
]

export default function CombatSystem() {
  const { 
    combatState, 
    updateCombatState, 
    getCurrentCombatActor, 
    getAvailableCombatActions, 
    getValidCombatTargets,
    advanceCombatTurn,
    isCombatOver,
    getCombatResult
  } = useGameStore()

  const [selectedAction, setSelectedAction] = useState<CombatActionButton | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<CombatParticipant | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [combatLog, setCombatLog] = useState<string[]>([])

  const currentActor = getCurrentCombatActor()
  const availableActions = getAvailableCombatActions()
  const validTargets = selectedAction ? getValidCombatTargets(selectedAction.type) : []

  // Add to combat log
  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Handle action selection
  const handleActionSelect = (action: CombatActionButton) => {
    setSelectedAction(action)
    setSelectedTarget(null)
  }

  // Handle target selection
  const handleTargetSelect = (target: CombatParticipant) => {
    setSelectedTarget(target)
  }

  // Execute combat action
  const executeAction = async () => {
    if (!selectedAction || !selectedTarget || !currentActor || !combatState) return

    setIsProcessing(true)
    addToCombatLog(`${currentActor.name} uses ${selectedAction.name} on ${selectedTarget.name}`)

    try {
      // Execute the action based on type
      switch (selectedAction.type) {
        case 'attack':
          // This would call the actual combat engine
          addToCombatLog(`${currentActor.name} attacks ${selectedTarget.name}`)
          break
        case 'cast-spell':
          addToCombatLog(`${currentActor.name} casts a spell at ${selectedTarget.name}`)
          break
        case 'use-item':
          addToCombatLog(`${currentActor.name} uses an item on ${selectedTarget.name}`)
          break
        case 'dash':
          addToCombatLog(`${currentActor.name} dashes`)
          break
        case 'dodge':
          addToCombatLog(`${currentActor.name} takes the dodge action`)
          break
        case 'help':
          addToCombatLog(`${currentActor.name} helps ${selectedTarget.name}`)
          break
        case 'hide':
          addToCombatLog(`${currentActor.name} attempts to hide`)
          break
        case 'search':
          addToCombatLog(`${currentActor.name} searches the area`)
          break
        default:
          addToCombatLog(`${currentActor.name} performs ${selectedAction.name}`)
      }

      // Advance to next turn
      advanceCombatTurn()
      
      // Reset selection
      setSelectedAction(null)
      setSelectedTarget(null)

      // Check if combat is over
      if (isCombatOver()) {
        const result = getCombatResult()
        addToCombatLog(`Combat ended: ${result.toUpperCase()}!`)
      }

    } catch (error) {
      addToCombatLog(`Error: ${error}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Get enemies for display
  const getEnemies = (participants: CombatParticipant[]) => {
    return participants.filter(p => p.type === 'enemy' && p.currentHP > 0)
  }

  // Get current enemy
  const getCurrentEnemy = () => {
    if (!combatState) return null
    const enemies = getEnemies(combatState.participants)
    return enemies.length > 0 ? enemies[0] : null
  }

  // Handle turn advancement
  const handleNextTurn = () => {
    if (!combatState) return
    
    advanceCombatTurn()
    addToCombatLog('Turn advanced')
    
    const newCurrentActor = getCurrentCombatActor()
    if (newCurrentActor) {
      addToCombatLog(`${newCurrentActor.name}'s turn`)
    }
  }

  // Initialize combat if not active
  useEffect(() => {
    if (!combatState?.isActive && currentActor) {
      addToCombatLog('Combat initialized')
    }
  }, [combatState?.isActive, currentActor])

  if (!combatState?.isActive) {
    return (
      <div className="p-4 bg-console-dark rounded-lg">
        <h3 className="text-lg font-bold mb-4">Combat System</h3>
        <p className="text-console-light">No active combat</p>
      </div>
    )
  }

  const enemies = getEnemies(combatState.participants)
  const currentEnemy = getCurrentEnemy()

  return (
    <div className="p-4 bg-console-dark rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Combat System</h3>
        <div className="text-sm text-console-light">
          Round {combatState.round} • Turn: {currentActor?.name || 'None'}
        </div>
      </div>

      {/* Combat Status */}
      <div className="mb-4 p-3 bg-console-darker rounded">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-console-light">Current Actor: </span>
            <span className="font-bold">{currentActor?.name || 'None'}</span>
          </div>
          <button
            onClick={handleNextTurn}
            disabled={isProcessing}
            className="px-3 py-1 bg-console-accent text-console-dark rounded text-sm hover:bg-console-accent/80 disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {currentActor && (
          <div className="mt-2 text-sm text-console-light">
            HP: {currentActor.currentHP}/{currentActor.maxHP} | 
            AC: {currentActor.armorClass} | 
            Actions: {currentActor.hasAction ? 'Available' : 'Used'} | 
            Bonus: {currentActor.hasBonusAction ? 'Available' : 'Used'}
          </div>
        )}
      </div>

      {/* Combat Actions */}
      <div className="mb-4">
        <h4 className="font-bold mb-2">Actions</h4>
        <div className="grid grid-cols-4 gap-2">
          {combatActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionSelect(action)}
              disabled={isProcessing || !availableActions.includes(action.type)}
              className={`p-2 rounded border transition-all duration-200 flex flex-col items-center gap-1 text-xs ${
                selectedAction?.id === action.id 
                  ? 'bg-console-accent text-console-dark border-console-accent' 
                  : 'bg-console-darker border-console-border hover:border-console-accent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={action.description}
            >
              {action.icon}
              <span>{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target Selection */}
      {selectedAction && validTargets.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold mb-2">Select Target</h4>
          <div className="grid grid-cols-2 gap-2">
            {validTargets.map((target) => (
              <button
                key={target.id}
                onClick={() => handleTargetSelect(target)}
                className={`p-2 rounded border transition-all duration-200 ${
                  selectedTarget?.id === target.id 
                    ? 'bg-console-accent text-console-dark border-console-accent' 
                    : 'bg-console-darker border-console-border hover:border-console-accent'
                }`}
              >
                <div className="font-bold">{target.name}</div>
                <div className="text-xs text-console-light">
                  HP: {target.currentHP}/{target.maxHP} | AC: {target.armorClass}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Execute Button */}
      {selectedAction && selectedTarget && (
        <div className="mb-4">
          <button
            onClick={executeAction}
            disabled={isProcessing}
            className="w-full py-2 bg-console-accent text-console-dark rounded font-bold hover:bg-console-accent/80 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : `Execute ${selectedAction.name}`}
          </button>
        </div>
      )}

      {/* Combat Log */}
      <div className="mb-4">
        <h4 className="font-bold mb-2">Combat Log</h4>
        <div className="bg-console-darker rounded p-3 h-32 overflow-y-auto text-sm">
          {combatLog.length === 0 ? (
            <p className="text-console-light">No combat actions yet...</p>
          ) : (
            combatLog.map((entry, index) => (
              <div key={index} className="text-console-light mb-1">
                {entry}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enemy Status */}
      {enemies.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Enemies</h4>
          <div className="space-y-2">
            {enemies.map((enemy) => (
              <div key={enemy.id} className="p-2 bg-console-darker rounded border border-console-border">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{enemy.name}</span>
                  <span className="text-sm text-console-light">
                    HP: {enemy.currentHP}/{enemy.maxHP}
                  </span>
                </div>
                <div className="w-full bg-console-dark rounded-full h-2 mt-1">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(enemy.currentHP / enemy.maxHP) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 