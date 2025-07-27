import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Character, 
  WorldState, 
  Quest, 
  Item, 
  CombatState, 
  AIResponse, 
  GameSession,
  VoiceState,
  AudioSettings,
  GamePrompt
} from './types'

interface GameStore {
  // Core game state
  session: GameSession | null
  currentPrompt: GamePrompt | null
  character: Character | null
  worldState: WorldState
  quests: Quest[]
  inventory: Item[]
  combatState: CombatState | null
  
  // UI state
  messages: Array<{
    id: string
    type: 'user' | 'ai' | 'system'
    content: string
    timestamp: Date
    diceRolls?: Array<{
      type: string
      result: number
      success: boolean
    }>
  }>
  isTyping: boolean
  isLoading: boolean
  
  // Voice and audio
  voiceState: VoiceState
  audioSettings: AudioSettings
  
  // Actions
  initializeSession: (promptId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  updateCharacter: (updates: Partial<Character>) => void
  updateWorldState: (updates: Partial<WorldState>) => void
  addQuest: (quest: Quest) => void
  updateQuest: (questId: string, updates: Partial<Quest>) => void
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void
  updateInventory: (inventory: Item[]) => void
  startCombat: (enemies: Character[]) => void
  endCombat: () => void
  updateCombatState: (combatState: CombatState | null) => void
  performCombatAction: (action: {
    type: 'attack' | 'defend' | 'special' | 'flee' | 'item' | 'skill'
    target?: string
    itemId?: string
    skillName?: string
  }) => void
  rollDice: (dice: string, modifier?: number, difficultyClass?: number) => {
    result: number
    total: number
    success: boolean
  }
  setVoiceState: (state: Partial<VoiceState>) => void
  setAudioSettings: (settings: Partial<AudioSettings>) => void
  addMessage: (message: {
    id: string
    type: 'user' | 'ai' | 'system'
    content: string
    timestamp: Date
    diceRolls?: Array<{
      type: string
      result: number
      success: boolean
    }>
  }) => void
  saveGame: () => void
  loadGame: (sessionId: string) => Promise<void>
  resetGame: () => void
}

const initialWorldState: WorldState = {
  location: 'Unknown',
  timeOfDay: 'day',
  weather: 'clear',
  activeEvents: [],
  npcStates: {},
  discoveredLocations: [],
  factionRelations: {},
  worldEvents: []
}

const initialVoiceState: VoiceState = {
  isListening: false,
  isSpeaking: false,
  transcript: '',
  confidence: 0
}

const initialAudioSettings: AudioSettings = {
  voiceEnabled: false,
  voiceOutputEnabled: true,
  volume: 0.7,
  voiceSpeed: 1.0,
  voicePitch: 1.0
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      currentPrompt: null,
      character: null,
      worldState: initialWorldState,
      quests: [],
      inventory: [],
      combatState: null,
      messages: [],
      isTyping: false,
      isLoading: false,
      voiceState: initialVoiceState,
      audioSettings: initialAudioSettings,

      // Initialize a new game session
      initializeSession: async (promptId: string) => {
        set({ isLoading: true })
        
        try {
          // Load game prompt
          const response = await fetch(`/api/game-prompts/${promptId}`)
          const prompt: GamePrompt = await response.json()
          
          // Create new character
          const character: Character = {
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
            background: 'A mysterious traveler with a hidden past',
            abilities: {
              strength: 10,
              dexterity: 10,
              constitution: 10,
              intelligence: 10,
              wisdom: 10,
              charisma: 10
            }
          }

          const session: GameSession = {
            id: `session_${Date.now()}`,
            gamePromptId: promptId,
            character,
            worldState: initialWorldState,
            quests: [],
            inventory: [],
            sessionStart: new Date(),
            lastSave: new Date(),
            playTime: 0
          }

          // Create comprehensive welcome message with game context
          const welcomeMessage = {
            id: 'welcome',
            type: 'ai' as const,
            content: `🎮 **Welcome to ${prompt.title}!** 🎮

${prompt.description}

**Game Genre:** ${prompt.genre}
**Difficulty:** ${prompt.difficulty}
**Themes:** ${prompt.themes.join(', ')}

You are about to embark on an epic adventure where every choice matters. The AI Dungeon Master is ready to guide you through this immersive world.

**What you can do:**
• Speak or type your actions naturally
• Explore the world and discover secrets
• Engage in tactical combat
• Build relationships with NPCs
• Complete quests and advance your character

**Ready to begin?** Create your character and let the adventure start!`,
            timestamp: new Date()
          }

          // Create system message with game mechanics
          const systemMessage = {
            id: 'system-setup',
            type: 'system' as const,
            content: `Game Session Initialized:
- Game: ${prompt.title}
- Mechanics: ${prompt.mechanics.diceSystem} dice system
- Combat: ${prompt.mechanics.combatSystem}
- Skills: ${prompt.mechanics.skillSystem}
- Special Rules: ${prompt.mechanics.specialRules.join(', ')}`,
            timestamp: new Date()
          }

          set({
            session,
            currentPrompt: prompt,
            character,
            worldState: initialWorldState,
            quests: [],
            inventory: [],
            combatState: null,
            messages: [welcomeMessage, systemMessage]
          })

          console.log('AI session initialized successfully with prompt:', prompt.title)
        } catch (error) {
          console.error('Failed to initialize session:', error)
          // Fallback welcome message if prompt loading fails
          const fallbackMessage = {
            id: 'welcome-fallback',
            type: 'ai' as const,
            content: `🎮 **Welcome to Aethoria!** 🎮

You are about to embark on an epic AI-powered adventure. The Dungeon Master is ready to guide you through an immersive world where every choice shapes your story.

**Ready to begin?** Create your character and let the adventure start!`,
            timestamp: new Date()
          }

          set({
            session: null,
            currentPrompt: null,
            character: null,
            worldState: initialWorldState,
            quests: [],
            inventory: [],
            combatState: null,
            messages: [fallbackMessage]
          })
        } finally {
          set({ isLoading: false })
        }
      },

      // Send message to AI and get response
      sendMessage: async (content: string) => {
        const { session, character, worldState, quests, inventory, combatState } = get()
        
        if (!session || !character) return

        const userMessage = {
          id: `msg_${Date.now()}`,
          type: 'user' as const,
          content,
          timestamp: new Date()
        }

        set(state => ({
          messages: [...state.messages, userMessage],
          isTyping: true
        }))

        try {
          const response = await fetch('/api/game/process-input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              userInput: content,
              gameState: {
                character,
                worldState,
                quests,
                inventory,
                combatState
              }
            })
          })

          const aiResponse: AIResponse = await response.json()

          // Update game state based on AI response
          if (aiResponse.gameState) {
            set({ 
              worldState: { ...get().worldState, ...aiResponse.gameState }
            })
          }

          // Update combat state
          if (aiResponse.combatState) {
            set({ 
              combatState: { 
                ...get().combatState, 
                ...aiResponse.combatState,
                isActive: aiResponse.combatState.isActive ?? get().combatState?.isActive ?? false,
                participants: aiResponse.combatState.participants ?? get().combatState?.participants ?? [],
                turn: aiResponse.combatState.turn ?? get().combatState?.turn ?? 1,
                currentActor: aiResponse.combatState.currentActor ?? get().combatState?.currentActor ?? '',
                log: aiResponse.combatState.log ?? get().combatState?.log ?? [],
                environment: aiResponse.combatState.environment ?? get().combatState?.environment ?? ''
              } 
            })
          }

          // Save game state
          get().saveGame()

          const aiMessage = {
            id: `ai_${Date.now()}`,
            type: 'ai' as const,
            content: aiResponse.text,
            timestamp: new Date(),
            diceRolls: aiResponse.diceRolls?.map(roll => ({
              type: roll.type,
              result: roll.result,
              success: roll.success
            }))
          }

          set(state => ({
            messages: [...state.messages, aiMessage],
            isTyping: false
          }))

        } catch (error) {
          console.error('Failed to process message:', error)
          set({ isTyping: false })
        }
      },

      // Character management
      updateCharacter: (updates: Partial<Character>) => {
        set(state => ({
          character: state.character ? { ...state.character, ...updates } : null
        }))
      },

      // World state management
      updateWorldState: (updates: Partial<WorldState>) => {
        set(state => ({
          worldState: { ...state.worldState, ...updates }
        }))
      },

      // Quest management
      addQuest: (quest: Quest) => {
        set(state => ({
          quests: [...state.quests, quest]
        }))
      },

      updateQuest: (questId: string, updates: Partial<Quest>) => {
        set(state => ({
          quests: state.quests.map(quest => 
            quest.id === questId ? { ...quest, ...updates } : quest
          )
        }))
      },

      // Inventory management
      addItem: (item: Item) => {
        set(state => ({
          inventory: [...state.inventory, item]
        }))
      },

      removeItem: (itemId: string) => {
        set(state => ({
          inventory: state.inventory.filter(item => item.id !== itemId)
        }))
      },

      updateInventory: (inventory: Item[]) => {
        set({ inventory })
      },

      // Combat system
      startCombat: (enemies: Character[]) => {
        const { character } = get()
        if (!character) return

        const combatState: CombatState = {
          isActive: true,
          participants: [character, ...enemies],
          turn: 1,
          currentActor: character.name,
          log: [`Combat started! ${enemies.length} enemies appear.`],
          environment: get().worldState.location
        }

        set({ combatState })
      },

      endCombat: () => {
        set({ combatState: null })
      },

      updateCombatState: (combatState: CombatState | null) => {
        set({ combatState })
      },

      performCombatAction: (action) => {
        const { combatState, character } = get()
        if (!combatState || !character) return

        // Simple combat resolution
        const log = [...combatState.log]
        
        switch (action.type) {
          case 'attack':
            const target = combatState.participants.find(p => p.name === action.target)
            if (target) {
              const damage = Math.max(0, character.attack - target.defense + Math.floor(Math.random() * 6))
              target.health -= damage
              log.push(`${character.name} attacks ${target.name} for ${damage} damage!`)
            }
            break
          case 'defend':
            log.push(`${character.name} takes a defensive stance!`)
            break
          case 'flee':
            const fleeChance = 0.3 + (character.speed * 0.05)
            if (Math.random() < fleeChance) {
              log.push(`${character.name} successfully flees from combat!`)
              set({ combatState: null })
              return
            } else {
              log.push(`${character.name} tried to flee but failed!`)
            }
            break
        }

        set(state => ({
          combatState: state.combatState ? {
            ...state.combatState,
            log,
            turn: state.combatState.turn + 1
          } : null
        }))
      },

      // Dice rolling system
      rollDice: (dice: string, modifier = 0, difficultyClass?: number) => {
        const [count, sides] = dice.split('d').map(Number)
        let result = 0
        
        for (let i = 0; i < count; i++) {
          result += Math.floor(Math.random() * sides) + 1
        }
        
        const total = result + modifier
        const success = difficultyClass ? total >= difficultyClass : true

        return { result, total, success }
      },

      // Voice and audio
      setVoiceState: (state: Partial<VoiceState>) => {
        set(prev => ({
          voiceState: { ...prev.voiceState, ...state }
        }))
      },

      setAudioSettings: (settings: Partial<AudioSettings>) => {
        set(prev => ({
          audioSettings: { ...prev.audioSettings, ...settings }
        }))
      },

      // Add message to chat
      addMessage: (message) => {
        set(state => ({
          messages: [...state.messages, message]
        }))
      },

      // Save/load system
      saveGame: () => {
        const { session, character, worldState, quests, inventory, combatState } = get()
        if (!session || !character) return

        const saveData = {
          sessionId: session.id,
          data: {
            ...session,
            character,
            worldState,
            quests,
            inventory,
            combatState,
            lastSave: new Date()
          },
          timestamp: new Date(),
          version: '1.0.0'
        }

        localStorage.setItem(`aethoria_save_${session.id}`, JSON.stringify(saveData))
      },

      loadGame: async (sessionId: string) => {
        const saveData = localStorage.getItem(`aethoria_save_${sessionId}`)
        if (!saveData) return

        try {
          const parsed = JSON.parse(saveData)
          set({
            session: parsed.data,
            character: parsed.data.character,
            worldState: parsed.data.worldState,
            quests: parsed.data.quests,
            inventory: parsed.data.inventory,
            combatState: parsed.data.combatState
          })
        } catch (error) {
          console.error('Failed to load game:', error)
        }
      },

      resetGame: () => {
        set({
          session: null,
          currentPrompt: null,
          character: null,
          worldState: initialWorldState,
          quests: [],
          inventory: [],
          combatState: null,
          messages: [],
          isTyping: false,
          isLoading: false
        })
      }
    }),
    {
      name: 'aethoria-game-store',
      partialize: (state) => ({
        session: state.session,
        character: state.character,
        worldState: state.worldState,
        quests: state.quests,
        inventory: state.inventory,
        combatState: state.combatState,
        audioSettings: state.audioSettings
      })
    }
  )
) 