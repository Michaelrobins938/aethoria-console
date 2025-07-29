'use client'

import React, { useState, useEffect } from 'react'
import { 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6,
  RotateCcw,
  Zap,
  Target,
  Crown
} from 'lucide-react'

interface DieRollerProps {
  isOpen: boolean
  onClose: () => void
  onRoll: (result: number, dice: string, modifier: number, success: boolean, difficultyClass?: number) => void
  requestedRoll?: {
    dice: string
    modifier?: number
    difficultyClass?: number
    type: string
  }
}

const diceTypes = [
  { sides: 4, name: 'd4', icon: '⚀' },
  { sides: 6, name: 'd6', icon: '⚀' },
  { sides: 8, name: 'd8', icon: '⚀' },
  { sides: 10, name: 'd10', icon: '⚀' },
  { sides: 12, name: 'd12', icon: '⚀' },
  { sides: 20, name: 'd20', icon: '⚀' },
  { sides: 100, name: 'd100', icon: '⚀' }
]

export function DieRoller({ isOpen, onClose, onRoll, requestedRoll }: DieRollerProps) {
  const [selectedDice, setSelectedDice] = useState('d20')
  const [modifier, setModifier] = useState(0)
  const [difficultyClass, setDifficultyClass] = useState<number | undefined>()
  const [isRolling, setIsRolling] = useState(false)
  const [lastResult, setLastResult] = useState<number | null>(null)
  const [rollHistory, setRollHistory] = useState<Array<{
    dice: string
    result: number
    modifier: number
    total: number
    timestamp: Date
  }>>([])

  useEffect(() => {
    if (requestedRoll) {
      setSelectedDice(requestedRoll.dice)
      setModifier(requestedRoll.modifier || 0)
      setDifficultyClass(requestedRoll.difficultyClass)
    }
  }, [requestedRoll])

  const rollDice = (dice: string, modifier: number = 0) => {
    setIsRolling(true)
    
    // Extract number of sides from dice string (e.g., "d20" -> 20)
    const sides = parseInt(dice.replace('d', ''))
    
    // Simulate rolling animation
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1
      const total = result + modifier
      const success = difficultyClass ? total >= difficultyClass : true
      
      setLastResult(result)
      setIsRolling(false)
      
      // Add to roll history
      setRollHistory(prev => [{
        dice,
        result,
        modifier,
        total,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]) // Keep last 10 rolls
      
      // Call the callback
      onRoll(result, dice, modifier, success, difficultyClass)
    }, 1500) // 1.5 second rolling animation
  }

  const getDiceIcon = (sides: number) => {
    switch (sides) {
      case 4: return '⚀'
      case 6: return '⚀'
      case 8: return '⚀'
      case 10: return '⚀'
      case 12: return '⚀'
      case 20: return '⚀'
      case 100: return '⚀'
      default: return '⚀'
    }
  }

  const getDiceColor = (sides: number) => {
    switch (sides) {
      case 4: return 'text-purple-400'
      case 6: return 'text-blue-400'
      case 8: return 'text-green-400'
      case 10: return 'text-yellow-400'
      case 12: return 'text-orange-400'
      case 20: return 'text-red-400'
      case 100: return 'text-indigo-400'
      default: return 'text-console-accent'
    }
  }

  const getRollMessage = (result: number, sides: number) => {
    if (sides === 20) {
      if (result === 20) return "NATURAL 20! CRITICAL SUCCESS!"
      if (result === 1) return "NATURAL 1! CRITICAL FAILURE!"
      if (result >= 18) return "Excellent roll!"
      if (result >= 15) return "Good roll!"
      if (result >= 10) return "Decent roll"
      if (result >= 5) return "Poor roll"
      return "Terrible roll"
    }
    return ""
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-gaming text-console-accent mb-2">
            🎲 DICE ROLLER 🎲
          </h2>
          {requestedRoll && (
            <p className="text-console-text-dim">
              DM requests: {requestedRoll.type} ({requestedRoll.dice})
              {requestedRoll.difficultyClass && ` - DC ${requestedRoll.difficultyClass}`}
            </p>
          )}
        </div>

        {/* Dice Selection */}
        <div className="mb-6">
          <h3 className="font-gaming text-console-accent mb-3">Choose Your Dice</h3>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {diceTypes.map((dice) => (
              <button
                key={dice.sides}
                onClick={() => setSelectedDice(dice.name)}
                className={`console-button flex flex-col items-center space-y-1 ${
                  selectedDice === dice.name ? 'border-console-accent console-glow' : ''
                }`}
              >
                <span className={`text-2xl ${getDiceColor(dice.sides)}`}>
                  {getDiceIcon(dice.sides)}
                </span>
                <span className="text-xs">{dice.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modifier and DC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-gaming text-console-accent mb-2">
              Modifier
            </label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              className="console-input text-center"
              min="-10"
              max="20"
            />
          </div>
          <div>
            <label className="block text-sm font-gaming text-console-accent mb-2">
              Difficulty Class (DC)
            </label>
            <input
              type="number"
              value={difficultyClass || ''}
              onChange={(e) => setDifficultyClass(parseInt(e.target.value) || undefined)}
              className="console-input text-center"
              min="1"
              max="30"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Rolling Area */}
        <div className="text-center mb-6">
          {isRolling ? (
            <div className="space-y-4">
              <div className="text-6xl animate-bounce">
                {getDiceIcon(parseInt(selectedDice.replace('d', '')))}
              </div>
              <div className="text-console-accent font-gaming text-xl">
                Rolling {selectedDice}...
              </div>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">
                {getDiceIcon(parseInt(selectedDice.replace('d', '')))}
              </div>
              <div className="text-console-text-dim">
                {selectedDice} + {modifier >= 0 ? '+' : ''}{modifier}
                {difficultyClass && ` (DC ${difficultyClass})`}
              </div>
              <button
                onClick={() => rollDice(selectedDice, modifier)}
                className="console-button-primary text-xl px-8 py-4 animate-pulse"
              >
                <Zap className="w-6 h-6 mr-2" />
                ROLL DICE!
              </button>
            </div>
          )}
        </div>

        {/* Last Result */}
        {lastResult && !isRolling && (
          <div className="text-center mb-6 p-4 bg-console-darker rounded-lg border border-console-accent">
            <div className="text-4xl font-gaming text-console-accent mb-2">
              {lastResult}
            </div>
            <div className="text-sm text-console-text-dim mb-1">
              {selectedDice} + {modifier >= 0 ? '+' : ''}{modifier} = {lastResult + modifier}
            </div>
            {difficultyClass && (
              <div className={`text-sm font-gaming ${
                lastResult + modifier >= difficultyClass ? 'text-green-400' : 'text-red-400'
              }`}>
                {lastResult + modifier >= difficultyClass ? 'SUCCESS!' : 'FAILURE!'}
              </div>
            )}
            <div className="text-xs text-console-accent mt-2">
              {getRollMessage(lastResult, parseInt(selectedDice.replace('d', '')))}
            </div>
          </div>
        )}

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="font-gaming text-console-accent mb-3">Recent Rolls</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {rollHistory.slice(0, 5).map((roll, index) => (
                <div key={index} className="console-card text-center p-2">
                  <div className="text-lg font-gaming text-console-accent">
                    {roll.result}
                  </div>
                  <div className="text-xs text-console-text-dim">
                    {roll.dice} + {roll.modifier >= 0 ? '+' : ''}{roll.modifier}
                  </div>
                  <div className="text-xs text-console-accent">
                    = {roll.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Roll Buttons */}
        <div className="mb-6">
          <h3 className="font-gaming text-console-accent mb-3">Quick Rolls</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => rollDice('d20', 0)}
              className="console-button text-sm"
            >
              <Target className="w-4 h-4 mr-1" />
              d20
            </button>
            <button
              onClick={() => rollDice('d20', 5)}
              className="console-button text-sm"
            >
              <Crown className="w-4 h-4 mr-1" />
              d20+5
            </button>
            <button
              onClick={() => rollDice('d6', 0)}
              className="console-button text-sm"
            >
              <Dice6 className="w-4 h-4 mr-1" />
              d6
            </button>
            <button
              onClick={() => rollDice('d100', 0)}
              className="console-button text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              d100
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="console-button"
          >
            Close Dice Roller
          </button>
        </div>
      </div>
    </div>
  )
} 