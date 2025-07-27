'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sword, 
  Shield, 
  Zap, 
  Heart, 
  Target, 
  Users, 
  X, 
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { CombatState, Combatant, CombatAction, CombatResult } from '@/lib/types'

interface CombatSystemProps {
  isOpen: boolean
  onClose: () => void
}

export function CombatSystem({ isOpen, onClose }: CombatSystemProps) {
  const { combatState, character, updateCombatState, rollDice } = useGameStore()
  const [selectedAction, setSelectedAction] = useState<CombatAction | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<Combatant | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [combatLog, setCombatLog] = useState<string[]>([])

  const actions: CombatAction[] = [
    { id: 'attack', name: 'Attack', icon: <Sword className="w-4 h-4" />, type: 'offensive' },
    { id: 'defend', name: 'Defend', icon: <Shield className="w-4 h-4" />, type: 'defensive' },
    { id: 'cast', name: 'Cast Spell', icon: <Zap className="w-4 h-4" />, type: 'magical' },
    { id: 'item', name: 'Use Item', icon: <Heart className="w-4 h-4" />, type: 'utility' },
    { id: 'flee', name: 'Flee', icon: <Target className="w-4 h-4" />, type: 'movement' }
  ]

  useEffect(() => {
    if (combatState && isOpen) {
      // Initialize combat if needed
      if (!combatState.initiative) {
        rollInitiative()
      }
    }
  }, [combatState, isOpen])

  const rollInitiative = () => {
    if (!combatState) return

    const playerInitiative = rollDice('d20', character?.abilities.dexterity || 10)
    const enemyInitiative = rollDice('d20', 10) // Simple enemy initiative

    const newCombatState: CombatState = {
      ...combatState,
      initiative: {
        player: playerInitiative,
        enemies: combatState.enemies.map(enemy => ({
          ...enemy,
          initiative: rollDice('d20', enemy.dexterity || 10)
        }))
      },
      currentTurn: playerInitiative > enemyInitiative ? 'player' : 'enemy',
      round: 1
    }

    updateCombatState(newCombatState)
    addToCombatLog(`Initiative rolled! Player: ${playerInitiative}, Enemies: ${enemyInitiative}`)
  }

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const getCurrentCombatant = (): Combatant | null => {
    if (!combatState) return null

    if (combatState.currentTurn === 'player') {
      return {
        id: 'player',
        name: character?.name || 'Player',
        health: character?.health || 0,
        maxHealth: character?.maxHealth || 0,
        attack: character?.attack || 0,
        defense: character?.defense || 0,
        type: 'player'
      }
    } else {
      return combatState.enemies.find(e => e.id === combatState.currentEnemyId) || null
    }
  }

  const getAvailableTargets = (): Combatant[] => {
    if (!combatState) return []

    if (combatState.currentTurn === 'player') {
      return combatState.enemies.filter(e => e.health > 0)
    } else {
      return [{
        id: 'player',
        name: character?.name || 'Player',
        health: character?.health || 0,
        maxHealth: character?.maxHealth || 0,
        attack: character?.attack || 0,
        defense: character?.defense || 0,
        type: 'player'
      }]
    }
  }

  const executeAction = async () => {
    if (!selectedAction || !selectedTarget || !combatState) return

    setIsProcessing(true)
    addToCombatLog(`${getCurrentCombatant()?.name} uses ${selectedAction.name} on ${selectedTarget.name}`)

    // Simulate action processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    const result = resolveCombatAction(selectedAction, selectedTarget)
    addToCombatLog(result.message)

    // Update combat state based on result
    updateCombatState({
      ...combatState,
      enemies: combatState.enemies.map(enemy => 
        enemy.id === selectedTarget.id ? { ...enemy, health: Math.max(0, enemy.health - result.damage) } : enemy
      )
    })

    // Check if combat should end
    if (result.combatEnded) {
      endCombat(result.victory)
    } else {
      nextTurn()
    }

    setIsProcessing(false)
    setSelectedAction(null)
    setSelectedTarget(null)
  }

  const resolveCombatAction = (action: CombatAction, target: Combatant): CombatResult => {
    const attacker = getCurrentCombatant()
    if (!attacker) return { damage: 0, message: 'Invalid action', combatEnded: false, victory: false }

    switch (action.id) {
      case 'attack':
        const attackRoll = rollDice('d20', attacker.attack)
        const hit = attackRoll >= target.defense
        const damage = hit ? rollDice('d6', attacker.attack) : 0
        return {
          damage,
          message: hit ? `${attacker.name} hits for ${damage} damage!` : `${attacker.name} misses!`,
          combatEnded: false,
          victory: false
        }

      case 'defend':
        return {
          damage: 0,
          message: `${attacker.name} takes a defensive stance`,
          combatEnded: false,
          victory: false
        }

      case 'flee':
        const fleeRoll = rollDice('d20', character?.abilities.dexterity || 10)
        const fleeSuccess = fleeRoll >= 15
        return {
          damage: 0,
          message: fleeSuccess ? `${attacker.name} successfully flees!` : `${attacker.name} fails to flee!`,
          combatEnded: fleeSuccess,
          victory: false
        }

      default:
        return {
          damage: 0,
          message: `${attacker.name} uses ${action.name}`,
          combatEnded: false,
          victory: false
        }
    }
  }

  const nextTurn = () => {
    if (!combatState) return

    if (combatState.currentTurn === 'player') {
      // Enemy turn
      const aliveEnemies = combatState.enemies.filter(e => e.health > 0)
      if (aliveEnemies.length === 0) {
        endCombat(true) // Player victory
        return
      }

      const nextEnemy = aliveEnemies[0]
      updateCombatState({
        ...combatState,
        currentTurn: 'enemy',
        currentEnemyId: nextEnemy.id
      })
    } else {
      // Player turn
      updateCombatState({
        ...combatState,
        currentTurn: 'player',
        round: combatState.round + 1
      })
    }
  }

  const endCombat = (victory: boolean) => {
    addToCombatLog(victory ? 'Victory! All enemies defeated!' : 'Defeat! Combat ended.')
    updateCombatState(null)
    setTimeout(() => onClose(), 2000)
  }

  const getHealthPercentage = (combatant: Combatant) => {
    return Math.round((combatant.health / combatant.maxHealth) * 100)
  }

  const getHealthColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-400'
    if (percentage >= 50) return 'text-yellow-400'
    if (percentage >= 25) return 'text-orange-400'
    return 'text-red-400'
  }

  if (!isOpen || !combatState) return null

  const currentCombatant = getCurrentCombatant()
  const availableTargets = getAvailableTargets()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Sword className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Combat</h2>
            <span className="text-console-text-dim">
              Round {combatState.round} • {currentCombatant?.name}'s Turn
            </span>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Combatants */}
          <div className="lg:col-span-2 space-y-4">
            {/* Player */}
            <div className="console-card">
              <h3 className="font-gaming text-console-accent mb-3">Player</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-gaming text-console-accent">{character?.name}</div>
                  <div className="text-sm text-console-text-dim">
                    HP: {character?.health}/{character?.maxHealth}
                  </div>
                </div>
                <div className="w-32 bg-console-border rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all"
                    style={{ width: `${getHealthPercentage({ health: character?.health || 0, maxHealth: character?.maxHealth || 0 } as Combatant)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Enemies */}
            <div className="console-card">
              <h3 className="font-gaming text-console-accent mb-3">Enemies</h3>
              <div className="space-y-2">
                {combatState.enemies.map((enemy) => (
                  <div key={enemy.id} className="flex items-center justify-between p-2 border border-console-border rounded">
                    <div>
                      <div className="font-gaming text-console-accent">{enemy.name}</div>
                      <div className="text-sm text-console-text-dim">
                        HP: {enemy.health}/{enemy.maxHealth}
                      </div>
                    </div>
                    <div className="w-32 bg-console-border rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getHealthColor(getHealthPercentage(enemy)).replace('text-', 'bg-')}`}
                        style={{ width: `${getHealthPercentage(enemy)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="space-y-4">
            {/* Current Turn */}
            <div className="console-card">
              <h3 className="font-gaming text-console-accent mb-3">Current Turn</h3>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-console-accent" />
                <span className="text-console-accent">{currentCombatant?.name}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="console-card">
              <h3 className="font-gaming text-console-accent mb-3">Actions</h3>
              <div className="space-y-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action)}
                    disabled={isProcessing || combatState.currentTurn !== 'player'}
                    className={`console-button w-full flex items-center space-x-2 ${
                      selectedAction?.id === action.id ? 'bg-console-accent text-console-dark' : ''
                    }`}
                  >
                    {action.icon}
                    <span className="text-sm">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Targets */}
            {selectedAction && (
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-3">Targets</h3>
                <div className="space-y-2">
                  {availableTargets.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => setSelectedTarget(target)}
                      disabled={isProcessing}
                      className={`console-button w-full text-left ${
                        selectedTarget?.id === target.id ? 'bg-console-accent text-console-dark' : ''
                      }`}
                    >
                      <div className="font-gaming text-console-accent">{target.name}</div>
                      <div className="text-xs text-console-text-dim">
                        HP: {target.health}/{target.maxHealth}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Execute Action */}
            {selectedAction && selectedTarget && (
              <button
                onClick={executeAction}
                disabled={isProcessing}
                className="console-button-primary w-full flex items-center justify-center space-x-2"
              >
                {isProcessing ? <Play className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span>{isProcessing ? 'Processing...' : 'Execute Action'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Combat Log */}
        <div className="mt-6 p-4 border-t border-console-border">
          <h3 className="font-gaming text-console-accent mb-3">Combat Log</h3>
          <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
            {combatLog.slice(-10).map((log, index) => (
              <div key={index} className="text-console-text-dim">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 