'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { Send, Mic, MicOff, Volume2, VolumeX, Settings, Dice1, X, Cpu, Save, Package, BookOpen, User, Sword, Map, HelpCircle } from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { VoiceSynthesis } from './VoiceSynthesis'
import { VoiceRecognition } from './VoiceRecognition'
import { DieRoller } from './DieRoller'
import { SaveManager } from './SaveManager'
import { Inventory } from './Inventory'
import { QuestLog } from './QuestLog'
import { CharacterSheet } from './CharacterSheet'
import { CombatSystem } from './CombatSystem'
import { WorldMap } from './WorldMap'
import { Settings as SettingsComponent } from './Settings'
import { Help } from './Help'
import { getModelForCartridge, getModelDescription } from '@/lib/ai'
import { Character } from '@/lib/types'

interface AIChatProps {
  cartridgeId: string
  onGameEnd: () => void
  character?: Character | null
}

export function AIChat({ cartridgeId, onGameEnd, character }: AIChatProps) {
  const {
    session,
    worldState,
    quests,
    inventory,
    combatState,
    voiceState,
    audioSettings,
    setVoiceState,
    setAudioSettings,
    saveGame,
    rollDice,
    updateCharacter,
    loadGame
  } = useGameStore()

  const [isDieRollerOpen, setIsDieRollerOpen] = useState(false)
  const [isSaveManagerOpen, setIsSaveManagerOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false)
  const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState(false)
  const [isCombatSystemOpen, setIsCombatSystemOpen] = useState(false)
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [requestedRoll, setRequestedRoll] = useState<{
    dice: string
    modifier?: number
    difficultyClass?: number
    type: string
  } | null>(null)
  const [lastAIResponse, setLastAIResponse] = useState('')
  const [voiceError, setVoiceError] = useState<string | null>(null)

  // Get AI model information
  const aiModel = getModelForCartridge(cartridgeId)
  const modelDescription = getModelDescription(cartridgeId)

  // Initialize character in store if provided
  useEffect(() => {
    if (character && !session?.character) {
      updateCharacter(character)
    }
  }, [character, session?.character, updateCharacter])

  // Debug logging
      // AIChat initialized

  // Initialize chat with AI SDK
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    onError: (error) => {
      console.error('Chat error:', error)
    },
    api: '/api/game/process-input',
    body: {
      sessionId: session?.id || 'default-session',
      cartridgeId,
      gameState: {
        character: character || {
          name: 'Adventurer',
          health: 100,
          maxHealth: 100,
          attack: 10,
          defense: 5,
          speed: 10,
          level: 1,
          experience: 0,
          inventory: [],
          skills: [],
          statusEffects: {},
          background: 'A mysterious traveler',
          abilities: {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
          }
        },
        worldState: worldState || {
          location: 'Unknown',
          timeOfDay: 'day',
          weather: 'clear',
          activeEvents: [],
          npcStates: {},
          discoveredLocations: [],
          factionRelations: {},
          worldEvents: []
        },
        quests: quests || [],
        inventory: inventory || [],
        combatState: combatState || null
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

  const handleVoiceTranscript = (transcript: string) => {
    // Auto-submit voice input
    if (transcript.trim()) {
      // Simulate typing the transcript
      handleInputChange({ target: { value: transcript } } as React.ChangeEvent<HTMLInputElement>)
      // Submit the form
      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)
    }
  }

  const handleVoiceError = (error: string) => {
    setVoiceError(error)
    setTimeout(() => setVoiceError(null), 5000) // Clear error after 5 seconds
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

  const handleLoadGame = (sessionId: string) => {
    loadGame(sessionId)
  }

  const handleNavigate = (locationId: string) => {
    // TODO: Implement navigation logic
    // Navigating to location
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
            
            {/* AI Model Information */}
            <div className="flex items-center space-x-2 text-xs">
              <Cpu className="w-3 h-3 text-console-accent" />
              <span className="text-console-accent font-gaming">AI:</span>
              <span className="text-console-text-dim">
                {aiModel.split('/').pop()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="console-button flex items-center space-x-2"
              title="Help & Tutorial"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs">Help</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="console-button flex items-center space-x-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs">Settings</span>
            </button>

            <button
              onClick={() => setIsSaveManagerOpen(true)}
              className="console-button flex items-center space-x-2"
              title="Save/Load Game"
            >
              <Save className="w-4 h-4" />
              <span className="text-xs">Save</span>
            </button>

            <button
              onClick={() => setIsWorldMapOpen(true)}
              className="console-button flex items-center space-x-2"
              title="World Map"
            >
              <Map className="w-4 h-4" />
              <span className="text-xs">Map</span>
            </button>

            <button
              onClick={() => setIsCharacterSheetOpen(true)}
              className="console-button flex items-center space-x-2"
              title="Character Sheet"
            >
              <User className="w-4 h-4" />
              <span className="text-xs">Char</span>
            </button>

            <button
              onClick={() => setIsQuestLogOpen(true)}
              className="console-button flex items-center space-x-2"
              title="Quest Log"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">Quests</span>
              {quests.length > 0 && (
                <span className="text-xs bg-console-accent text-console-dark px-1 rounded-full">
                  {quests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsInventoryOpen(true)}
              className="console-button flex items-center space-x-2"
              title="Inventory"
            >
              <Package className="w-4 h-4" />
              <span className="text-xs">Items</span>
              {inventory.length > 0 && (
                <span className="text-xs bg-console-accent text-console-dark px-1 rounded-full">
                  {inventory.length}
                </span>
              )}
            </button>

            {combatState && (
              <button
                onClick={() => setIsCombatSystemOpen(true)}
                className="console-button flex items-center space-x-2 bg-red-900 hover:bg-red-800"
                title="Combat System"
              >
                <Sword className="w-4 h-4" />
                <span className="text-xs">Combat</span>
                <span className="text-xs bg-red-600 text-white px-1 rounded-full animate-pulse">
                  !
                </span>
              </button>
            )}

            <VoiceRecognition
              isListening={voiceState.isListening}
              onToggle={handleVoiceToggle}
              onTranscript={handleVoiceTranscript}
              onError={handleVoiceError}
            />
            
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
        
        {/* Model Description */}
        <div className="mt-2 text-xs text-console-text-dim">
          {modelDescription}
        </div>

        {/* Voice Error Display */}
        {voiceError && (
          <div className="mt-2 p-2 bg-red-900 text-red-100 border border-red-500 rounded text-xs">
            {voiceError}
          </div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-900 text-red-100 border border-red-500 rounded-lg p-3 max-w-[70%]">
                  <div className="text-sm">
                    <strong>Error:</strong> {error.message || 'Failed to connect to AI service'}
                    <br />
                    <span className="text-xs">Please check your API configuration in the environment variables.</span>
                  </div>
                </div>
              </div>
            )}
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

      {/* Save Manager */}
      <SaveManager
        isOpen={isSaveManagerOpen}
        onClose={() => setIsSaveManagerOpen(false)}
        onLoadGame={handleLoadGame}
      />

      {/* Inventory */}
      <Inventory
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />

      {/* Quest Log */}
      <QuestLog
        isOpen={isQuestLogOpen}
        onClose={() => setIsQuestLogOpen(false)}
      />

      {/* Character Sheet */}
      <CharacterSheet
        isOpen={isCharacterSheetOpen}
        onClose={() => setIsCharacterSheetOpen(false)}
      />

      {/* Combat System */}
      <CombatSystem
        isOpen={isCombatSystemOpen}
        onClose={() => setIsCombatSystemOpen(false)}
      />

      {/* World Map */}
      <WorldMap
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Settings */}
      <SettingsComponent
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Help */}
      <Help
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  )
} 