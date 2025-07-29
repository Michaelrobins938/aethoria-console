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
import { CombatState, Combatant, CombatAction, CombatResult, Character } from '@/lib/types'

interface CombatSystemProps {
  isOpen: boolean
  onClose: () => void
}

// Helper function to get enemies from participants
const getEnemies = (participants: Character[]): Combatant[] => {
  return participants.map(p => ({
    id: p.name,
    name: p.name,
    health: p.health,
    maxHealth: p.maxHealth,
    attack: p.attack,
    defense: p.defense,
    type: 'enemy' as const,
    dexterity: p.abilities.dexterity
  }))
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

    const playerInitiativeRoll = rollDice('d20', character?.abilities.dexterity || 10)
    const enemyInitiativeRoll = rollDice('d20', 10) // Simple enemy initiative

    const newCombatState: CombatState = {
      ...combatState,
      initiative: {
        player: playerInitiativeRoll.total,
        enemies: combatState.participants.map(enemy => ({
          ...enemy,
          initiative: rollDice('d20', enemy.abilities.dexterity || 10).total
        }))
      },
      currentTurn: playerInitiativeRoll.total > enemyInitiativeRoll.total ? 'player' : 'enemy',
      round: 1
    }

    updateCombatState(newCombatState)
    addToCombatLog(`Initiative rolled! Player: ${playerInitiativeRoll.total}, Enemies: ${enemyInitiativeRoll.total}`)
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
      const enemies = getEnemies(combatState.participants)
      return enemies.find(e => e.id === combatState.currentEnemyId) || null
    }
  }

  const getAvailableTargets = (): Combatant[] => {
    if (!combatState) return []

    if (combatState.currentTurn === 'player') {
      const enemies = getEnemies(combatState.participants)
      return enemies.filter(e => e.health > 0)
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
      participants: combatState.participants.map(participant => 
        participant.name === selectedTarget.id ? { ...participant, health: Math.max(0, participant.health - result.damage) } : participant
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
        const hit = attackRoll.total >= target.defense
        const damage = hit ? rollDice('d6', attacker.attack).total : 0
        
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
        const fleeSuccess = fleeRoll.total >= 15
        
        return {
          damage: 0,
          message: fleeSuccess ? `${attacker.name} successfully flees!` : `${attacker.name} fails to flee!`,
          combatEnded: fleeSuccess,
          victory: fleeSuccess
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

    const aliveEnemies = getEnemies(combatState.participants).filter(e => e.health > 0)
    
    if (aliveEnemies.length === 0) {
      endCombat(true)
      return
    }

    // Simple turn switching
    const newTurn = combatState.currentTurn === 'player' ? 'enemy' : 'player'
    const nextEnemy = aliveEnemies[0]

    updateCombatState({
      ...combatState,
      currentTurn: newTurn,
      currentEnemyId: newTurn === 'enemy' ? nextEnemy.id : undefined,
      round: (combatState.round || 0) + 1
    })

    addToCombatLog(`Turn: ${newTurn === 'player' ? 'Player' : nextEnemy.name}`)
  }

  const endCombat = (victory: boolean) => {
    if (!combatState) return

    updateCombatState(null)
    addToCombatLog(victory ? 'Combat ended in victory!' : 'Combat ended in defeat!')
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
  const enemies = getEnemies(combatState.participants)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Sword className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Combat System</h2>
            <span className="text-console-text-dim">
              Round {combatState.round || 1} • Turn: {combatState.currentTurn === 'player' ? 'Player' : 'Enemy'}
            </span>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Combatants */}
          <div className="lg:col-span-2">
            <div className="console-card mb-6">
              <h3 className="font-gaming text-console-accent mb-4">Combatants</h3>
              
              {/* Player */}
              <div className="mb-4 p-4 border border-console-border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-gaming text-console-accent">{character?.name || 'Player'}</h4>
                  <span className={`text-sm ${getHealthColor(getHealthPercentage({
                    id: 'player',
                    name: character?.name || 'Player',
                    health: character?.health || 0,
                    maxHealth: character?.maxHealth || 0,
                    attack: character?.attack || 0,
                    defense: character?.defense || 0,
                    type: 'player'
                  }))}`}>
                    {character?.health || 0}/{character?.maxHealth || 0} HP
                  </span>
                </div>
                <div className="w-full bg-console-border rounded-full h-2">
                  <div 
                    className="bg-console-accent h-2 rounded-full transition-all"
                    style={{ width: `${getHealthPercentage({
                      id: 'player',
                      name: character?.name || 'Player',
                      health: character?.health || 0,
                      maxHealth: character?.maxHealth || 0,
                      attack: character?.attack || 0,
                      defense: character?.defense || 0,
                      type: 'player'
                    })}%` }}
                  ></div>
                </div>
              </div>

              {/* Enemies */}
              <div className="space-y-2">
                {enemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    className={`p-3 border rounded cursor-pointer transition-all ${
                      selectedTarget?.id === enemy.id ? 'border-console-accent console-glow' : 'border-console-border'
                    } ${enemy.health <= 0 ? 'opacity-50' : ''}`}
                    onClick={() => enemy.health > 0 && setSelectedTarget(enemy)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-gaming text-console-accent">{enemy.name}</h4>
                      <span className={`text-sm ${getHealthColor(getHealthPercentage(enemy))}`}>
                        {enemy.health}/{enemy.maxHealth} HP
                      </span>
                    </div>
                    <div className="w-full bg-console-border rounded-full h-2">
                      <div 
                        className="bg-red-400 h-2 rounded-full transition-all"
                        style={{ width: `${getHealthPercentage(enemy)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="console-card">
              <h3 className="font-gaming text-console-accent mb-4">Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action)}
                    disabled={isProcessing || combatState.currentTurn !== 'player'}
                    className={`console-button flex items-center space-x-2 ${
                      selectedAction?.id === action.id ? 'bg-console-accent text-console-dark' : ''
                    }`}
                  >
                    {action.icon}
                    <span className="text-xs">{action.name}</span>
                  </button>
                ))}
              </div>
              
              {selectedAction && (
                <div className="mt-4">
                  <button
                    onClick={executeAction}
                    disabled={!selectedTarget || isProcessing}
                    className="console-button-primary w-full"
                  >
                    {isProcessing ? 'Processing...' : `Execute ${selectedAction.name}`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Combat Log */}
          <div className="console-card">
            <h3 className="font-gaming text-console-accent mb-4">Combat Log</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-1 text-sm">
              {combatLog.map((entry, index) => (
                <div key={index} className="text-console-text-dim">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 