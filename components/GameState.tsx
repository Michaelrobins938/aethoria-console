'use client'

import { Heart, MapPin, Package, Target } from 'lucide-react'

interface GameStateProps {
  state: {
    location: string
    health: number
    inventory: string[]
    quests: string[]
  }
}

export function GameState({ state }: GameStateProps) {
  return (
    <div className="h-full bg-console-darker p-4 space-y-6">
      <h3 className="text-lg font-gaming text-console-accent border-b border-console-border pb-2">
        GAME STATE
      </h3>
      
      {/* Location */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-console-accent" />
          <span className="text-sm font-gaming text-console-text">Location</span>
        </div>
        <div className="console-card">
          <p className="text-sm text-console-text">{state.location}</p>
        </div>
      </div>
      
      {/* Health */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-console-accent" />
          <span className="text-sm font-gaming text-console-text">Health</span>
        </div>
        <div className="console-card">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-console-dark rounded-full h-2">
              <div 
                className="bg-console-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${state.health}%` }}
              ></div>
            </div>
            <span className="text-xs text-console-text-dim">{state.health}%</span>
          </div>
        </div>
      </div>
      
      {/* Inventory */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-console-accent" />
          <span className="text-sm font-gaming text-console-text">Inventory</span>
        </div>
        <div className="console-card">
          {state.inventory.length > 0 ? (
            <div className="space-y-1">
              {state.inventory.map((item, index) => (
                <div key={index} className="text-sm text-console-text">
                  • {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-console-text-dim">Empty</p>
          )}
        </div>
      </div>
      
      {/* Quests */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-console-accent" />
          <span className="text-sm font-gaming text-console-text">Active Quests</span>
        </div>
        <div className="console-card">
          {state.quests.length > 0 ? (
            <div className="space-y-1">
              {state.quests.map((quest, index) => (
                <div key={index} className="text-sm text-console-text">
                  • {quest}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-console-text-dim">No active quests</p>
          )}
        </div>
      </div>
    </div>
  )
} 