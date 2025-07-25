'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Send, Mic, MicOff, Volume2, VolumeX, Settings, Dice1, X } from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { VoiceSynthesis } from './VoiceSynthesis'
import { DieRoller } from './DieRoller'

interface AIChatProps {
  cartridgeId: string
  onGameEnd: () => void
}

export function AIChat({ cartridgeId, onGameEnd }: AIChatProps) {
  const {
    session,
    character,
    worldState,
    quests,
    inventory,
    combatState,
    voiceState,
    audioSettings,
    setVoiceState,
    setAudioSettings,
    saveGame,
    rollDice
  } = useGameStore()

  const [isDieRollerOpen, setIsDieRollerOpen] = useState(false)
  const [requestedRoll, setRequestedRoll] = useState<{
    dice: string
    modifier?: number
    difficultyClass?: number
    type: string
  } | null>(null)
  const [lastAIResponse, setLastAIResponse] = useState('')

  // Initialize chat with AI SDK
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/game/process-input',
    body: {
      sessionId: session?.id,
      cartridgeId,
      gameState: {
        character,
        worldState,
        quests,
        inventory,
        combatState
      }
    },
    onFinish: (message) => {
      // Store the last AI response for voice synthesis
      if (message.role === 'assistant') {
        setLastAIResponse(message.content)
      }
    }
  })

  const handleVoiceToggle = () => {
    setVoiceState({ isListening: !voiceState.isListening })
  }

  const handleAudioToggle = () => {
    setAudioSettings({ voiceOutputEnabled: !audioSettings.voiceOutputEnabled })
  }

  const openDieRoller = (dice: string, type: string, modifier?: number, difficultyClass?: number) => {
    setRequestedRoll({ dice, type, modifier, difficultyClass })
    setIsDieRollerOpen(true)
  }

  const handleDieRoll = (result: number, dice: string, modifier: number, success: boolean, difficultyClass?: number) => {
    const rollMessage = `🎲 Rolled ${dice} + ${modifier >= 0 ? '+' : ''}${modifier} = ${result + modifier}${difficultyClass ? ` (DC ${difficultyClass})` : ''} - ${success ? 'SUCCESS!' : 'FAILURE!'}`
    
    // Close die roller
    setIsDieRollerOpen(false)
    setRequestedRoll(null)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Game Header */}
      <div className="bg-console-darker border-b border-console-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-gaming text-console-accent">
              {cartridgeId.replace('-', ' ').toUpperCase()}
            </h2>
            <div className="text-console-text-dim text-sm">
              AI Status: <span className="text-console-accent">ACTIVE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleVoiceToggle}
              className={`console-button flex items-center space-x-2 ${
                voiceState.isListening ? 'bg-console-accent text-console-dark' : ''
              }`}
            >
              {voiceState.isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="text-xs">Voice</span>
            </button>
            
            <VoiceSynthesis
              text={lastAIResponse}
              enabled={audioSettings.voiceOutputEnabled}
              onToggle={(enabled) => setAudioSettings({ voiceOutputEnabled: enabled })}
            />

            <button
              onClick={() => openDieRoller('d20', 'Manual Roll')}
              className="console-button flex items-center space-x-2"
            >
              <Dice1 className="w-4 h-4" />
              <span className="text-xs">Dice</span>
            </button>
            
            <button
              onClick={onGameEnd}
              className="console-button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-console-accent text-console-dark'
                      : 'bg-console-darker text-console-text border border-console-border'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-console-darker text-console-text border border-console-border rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-console-border bg-console-darker p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your action or speak..."
                className="flex-1 bg-console-dark text-console-text border border-console-border rounded px-3 py-2 focus:outline-none focus:border-console-accent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="console-button flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Game State Panel */}
        <div className="w-80 border-l border-console-border">
          <div className="p-4">
            <h3 className="font-gaming text-console-accent mb-4">Game State</h3>
            <div className="space-y-4">
              {character && (
                <div className="console-card">
                  <h4 className="font-gaming text-console-text mb-2">Character</h4>
                  <div className="text-sm text-console-text-dim">
                    <div>Name: {character.name}</div>
                    <div>Health: {character.health}/{character.maxHealth}</div>
                    <div>Level: {character.level}</div>
                    <div>Attack: {character.attack}</div>
                    <div>Defense: {character.defense}</div>
                  </div>
                </div>
              )}
              
              {worldState && (
                <div className="console-card">
                  <h4 className="font-gaming text-console-text mb-2">World</h4>
                  <div className="text-sm text-console-text-dim">
                    <div>Location: {worldState.location}</div>
                    <div>Time: {worldState.timeOfDay}</div>
                    <div>Weather: {worldState.weather}</div>
                  </div>
                </div>
              )}

              {quests && quests.length > 0 && (
                <div className="console-card">
                  <h4 className="font-gaming text-console-text mb-2">Quests</h4>
                  <div className="text-sm text-console-text-dim">
                    {quests.filter(q => q.status === 'in_progress').map(quest => (
                      <div key={quest.id} className="mb-1">
                        • {quest.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inventory && inventory.length > 0 && (
                <div className="console-card">
                  <h4 className="font-gaming text-console-text mb-2">Inventory</h4>
                  <div className="text-sm text-console-text-dim">
                    {inventory.slice(0, 5).map(item => (
                      <div key={item.id} className="mb-1">
                        • {item.name}
                      </div>
                    ))}
                    {inventory.length > 5 && (
                      <div className="text-xs text-console-text-dim">
                        +{inventory.length - 5} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Die Roller */}
      <DieRoller
        isOpen={isDieRollerOpen}
        onClose={() => setIsDieRollerOpen(false)}
        onRoll={handleDieRoll}
        requestedRoll={requestedRoll || undefined}
      />
    </div>
  )
} 