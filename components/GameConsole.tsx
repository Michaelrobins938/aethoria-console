'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Mic, MicOff, Volume2, VolumeX, X, Save, Download, Settings, Dice1 } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { GameState } from './GameState'
import { VoiceRecorder } from './VoiceRecorder'
import { DieRoller } from './DieRoller'
import { useGameStore } from '@/lib/store'

interface GameConsoleProps {
  cartridgeId: string
  onGameEnd: () => void
}

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export function GameConsole({ cartridgeId, onGameEnd }: GameConsoleProps) {
  const {
    session,
    character,
    worldState,
    quests,
    inventory,
    combatState,
    messages,
    isTyping,
    voiceState,
    audioSettings,
    initializeSession,
    sendMessage,
    setVoiceState,
    setAudioSettings,
    addMessage,
    saveGame,
    rollDice
  } = useGameStore()
  
  const [inputValue, setInputValue] = useState('')
  const [isDieRollerOpen, setIsDieRollerOpen] = useState(false)
  const [requestedRoll, setRequestedRoll] = useState<{
    dice: string
    modifier?: number
    difficultyClass?: number
    type: string
  } | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize session when component mounts
  useEffect(() => {
    if (!session) {
      initializeSession(cartridgeId)
    }
  }, [cartridgeId, session, initializeSession])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !session) return

    setInputValue('')
    await sendMessage(inputValue)
  }

  const generateAIResponse = (userInput: string, cartridgeId: string) => {
    // Simple response generation (replace with actual AI API)
    const responses = {
      'dnd-fantasy': [
        "The tavern keeper nods approvingly at your request.",
        "A mysterious figure in the corner watches you intently.",
        "The sound of clashing steel echoes from the training grounds.",
        "Magic energy crackles in the air around you."
      ],
      'silent-hill': [
        "The fog grows thicker as you move forward.",
        "A distant radio crackles with static.",
        "Something moves in the shadows ahead.",
        "The air is heavy with the scent of decay."
      ],
      'portal-sci-fi': [
        "The AI system processes your request.",
        "Test chamber protocols are being initialized.",
        "The portal gun hums with energy.",
        "The facility's automated systems respond."
      ],
      'pokemon-adventure': [
        "Your Pokémon looks at you with anticipation.",
        "A wild Pokémon appears in the tall grass!",
        "The Pokédex beeps with new information.",
        "You feel the energy of the Pokémon world."
      ]
    }

    const cartridgeResponses = responses[cartridgeId as keyof typeof responses] || responses['dnd-fantasy']
    return cartridgeResponses[Math.floor(Math.random() * cartridgeResponses.length)]
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript)
    // Auto-send voice input after a short delay
    setTimeout(() => {
      handleSendMessage()
    }, 500)
  }

  const handleVoiceToggle = () => {
    setVoiceState({ isListening: !voiceState.isListening })
  }

  const handleAudioToggle = () => {
    setAudioSettings({ voiceOutputEnabled: !audioSettings.voiceOutputEnabled })
  }

  const handleDieRoll = (result: number, dice: string, modifier: number, success: boolean, difficultyClass?: number) => {
    const rollMessage = `🎲 Rolled ${dice} + ${modifier >= 0 ? '+' : ''}${modifier} = ${result + modifier}${difficultyClass ? ` (DC ${difficultyClass})` : ''} - ${success ? 'SUCCESS!' : 'FAILURE!'}`
    
    // Add roll result to chat
    const rollChatMessage = {
      id: `roll_${Date.now()}`,
      type: 'system' as const,
      content: rollMessage,
      timestamp: new Date(),
      diceRolls: [{
        type: requestedRoll?.type || 'Roll',
        result,
        success
      }]
    }
    
    // Update messages in store
    addMessage(rollChatMessage)
    
    // Close die roller
    setIsDieRollerOpen(false)
    setRequestedRoll(null)
  }

  const openDieRoller = (dice: string, type: string, modifier?: number, difficultyClass?: number) => {
    setRequestedRoll({ dice, type, modifier, difficultyClass })
    setIsDieRollerOpen(true)
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
            
            <button
              onClick={handleAudioToggle}
              className={`console-button flex items-center space-x-2 ${
                audioSettings.voiceOutputEnabled ? 'bg-console-accent text-console-dark' : ''
              }`}
            >
              {audioSettings.voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-xs">Audio</span>
            </button>

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
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="chat-message-ai">
                <div className="flex items-center space-x-2">
                  <span>AI is thinking</span>
                  <div className="flex space-x-1">
                    <div className="typing-indicator"></div>
                    <div className="typing-indicator" style={{ animationDelay: '0.2s' }}></div>
                    <div className="typing-indicator" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-console-border">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your action or speak..."
                className="flex-1 console-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="console-button-primary"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Game State Panel */}
        <div className="w-80 border-l border-console-border">
          <GameState state={worldState} />
        </div>
      </div>

      {/* Voice Recorder */}
      {voiceState.isListening && (
        <VoiceRecorder onTranscript={handleVoiceInput} />
      )}

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