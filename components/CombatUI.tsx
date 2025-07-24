'use client'

import React from 'react'
import { useGameStore } from '@/lib/store'
import { 
  Sword, 
  Shield, 
  Zap, 
  ArrowRight, 
  Heart, 
  Target,
  Skull,
  Crown
} from 'lucide-react'

export function CombatUI() {
  const { combatState, performCombatAction, character } = useGameStore()

  if (!combatState?.isActive) return null

  const player = combatState.participants.find(p => p.name === character?.name)
  const enemies = combatState.participants.filter(p => p.name !== character?.name)

  const handleAction = (action: 'attack' | 'defend' | 'special' | 'flee' | 'item' | 'skill', target?: string) => {
    performCombatAction({
      type: action,
      target
    })
  }

  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, Math.min(100, (current / max) * 100))
  }

  const getHealthColor = (percentage: number) => {
    if (percentage > 60) return 'bg-green-500'
    if (percentage > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-4xl mx-4">
        {/* Combat Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-gaming text-console-accent mb-2">
            COMBAT - Turn {combatState.turn}
          </h2>
          <p className="text-console-text-dim">
            {combatState.environment}
          </p>
        </div>

        {/* Combatants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player */}
          <div className="console-card border-2 border-console-accent">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">👤</div>
              <h3 className="font-gaming text-console-accent">{player?.name}</h3>
              <p className="text-sm text-console-text-dim">
                Level {player?.level} {player?.background}
              </p>
            </div>

            {/* Health Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Health</span>
                <span>{player?.health}/{player?.maxHealth}</span>
              </div>
              <div className="w-full bg-console-darker rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${getHealthColor(getHealthPercentage(player?.health || 0, player?.maxHealth || 1))}`}
                  style={{ width: `${getHealthPercentage(player?.health || 0, player?.maxHealth || 1)}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-console-accent">⚔️</div>
                <div>{player?.attack}</div>
              </div>
              <div className="text-center">
                <div className="text-console-accent">🛡️</div>
                <div>{player?.defense}</div>
              </div>
              <div className="text-center">
                <div className="text-console-accent">⚡</div>
                <div>{player?.speed}</div>
              </div>
            </div>
          </div>

          {/* Enemies */}
          <div className="space-y-4">
            <h3 className="font-gaming text-console-accent text-center">Enemies</h3>
            {enemies.map((enemy, index) => (
              <div key={index} className="console-card border-2 border-red-500">
                <div className="text-center mb-2">
                  <div className="text-2xl mb-1">👹</div>
                  <h4 className="font-gaming text-red-400">{enemy.name}</h4>
                </div>

                {/* Health Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Health</span>
                    <span>{enemy.health}/{enemy.maxHealth}</span>
                  </div>
                  <div className="w-full bg-console-darker rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getHealthColor(getHealthPercentage(enemy.health, enemy.maxHealth))}`}
                      style={{ width: `${getHealthPercentage(enemy.health, enemy.maxHealth)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className="text-center">
                    <div className="text-red-400">⚔️</div>
                    <div>{enemy.attack}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400">🛡️</div>
                    <div>{enemy.defense}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400">⚡</div>
                    <div>{enemy.speed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combat Actions */}
        <div className="space-y-4">
          <h3 className="font-gaming text-console-accent text-center">Choose Your Action</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleAction('attack', enemies[0]?.name)}
              className="console-button flex flex-col items-center space-y-2"
              disabled={!enemies.length}
            >
              <Sword className="w-6 h-6" />
              <span>Attack</span>
            </button>

            <button
              onClick={() => handleAction('defend')}
              className="console-button flex flex-col items-center space-y-2"
            >
              <Shield className="w-6 h-6" />
              <span>Defend</span>
            </button>

            <button
              onClick={() => handleAction('special', enemies[0]?.name)}
              className="console-button flex flex-col items-center space-y-2"
              disabled={!enemies.length}
            >
              <Zap className="w-6 h-6" />
              <span>Special</span>
            </button>

            <button
              onClick={() => handleAction('flee')}
              className="console-button flex flex-col items-center space-y-2"
            >
              <ArrowRight className="w-6 h-6" />
              <span>Flee</span>
            </button>
          </div>
        </div>

        {/* Combat Log */}
        <div className="mt-6">
          <h3 className="font-gaming text-console-accent mb-2">Combat Log</h3>
          <div className="console-card max-h-32 overflow-y-auto">
            {combatState.log.map((entry, index) => (
              <div key={index} className="text-sm text-console-text mb-1">
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 