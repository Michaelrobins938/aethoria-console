import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Character, GamePrompt, WorldState, Quest, Item, CombatState, Message, CombatParticipant, CombatAction } from './types'
import { ChatSession, createNewSession, generateSessionTitle, cleanupOldSessions } from './chatHistory'
import { initializeCombat, performAttack, performSpellCast, performUseItem, advanceTurn, getCurrentActor, getAvailableActions, getValidTargets, isCombatOver, getCombatResult } from './combatEngine'

interface GameState {
  // Game state
  session: string | null
  currentPrompt: GamePrompt | null
  character: Character | null
  worldState: WorldState | null
  quests: Quest[]
  inventory: Item[]
  combatState: CombatState | null
  
  // Chat state
  messages: Message[]
  isTyping: boolean
  isLoading: boolean
  
  // Chat history
  chatSessions: ChatSession[]
  activeSessionId: string | null
  
  // Voice state
  voiceState: {
    enabled: boolean
    autoSpeak: boolean
    voice: string
    rate: number
    pitch: number
    volume: number
    isListening: boolean
  }
  
  // Audio settings
  audioSettings: {
    enabled: boolean
    volume: number
    effects: boolean
    music: boolean
    voiceOutputEnabled: boolean
  }
  
  // Actions
  initializeSession: (cartridgeId: string) => Promise<void>
  updateCharacter: (character: Character) => void
  updateWorldState: (worldState: WorldState) => void
  addQuest: (quest: Quest) => void
  updateQuest: (questId: string, updates: Partial<Quest>) => void
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void
  setCombatState: (combatState: CombatState | null) => void
  addMessage: (message: Message) => void
  sendMessage: (content: string) => Promise<void>
  
  // Combat actions
  updateCombatState: (updates: Partial<CombatState>) => void
  performCombatAction: (action: string, target?: string) => void
  rollDice: (diceType: string, count?: number) => { total: number }
  
  // Advanced combat actions
  initializeCombat: (participants: CombatParticipant[]) => void
  performAttack: (actorId: string, targetId: string, weaponName: string) => CombatAction
  performSpellCast: (actorId: string, targetId: string, spellName: string) => CombatAction
  performUseItem: (actorId: string, targetId: string, itemName: string) => CombatAction
  advanceCombatTurn: () => void
  getCurrentCombatActor: () => CombatParticipant | null
  getAvailableCombatActions: () => string[]
  getValidCombatTargets: (actionType: string) => CombatParticipant[]
  isCombatOver: () => boolean
  getCombatResult: () => 'victory' | 'defeat' | 'ongoing'
  
  // Voice actions
  updateVoiceState: (updates: Partial<GameState['voiceState']>) => void
  updateAudioSettings: (updates: Partial<GameState['audioSettings']>) => void
  setAudioSettings: (settings: Partial<GameState['audioSettings']>) => void
  setVoiceState: (settings: Partial<GameState['voiceState']>) => void
  
  // Inventory actions
  updateInventory: (updates: Partial<{ items: Item[] }> | Item[]) => void
  
  // Chat history actions
  createNewChatSession: (gamePrompt: GamePrompt, character: Character) => void
  loadChatSession: (sessionId: string) => void
  deleteChatSession: (sessionId: string) => void
  updateSessionTitle: (sessionId: string, title: string) => void
  clearAllSessions: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      currentPrompt: null,
      character: null,
      worldState: null,
      quests: [],
      inventory: [],
      combatState: null,
      messages: [],
      isTyping: false,
      isLoading: false,
      chatSessions: [],
      activeSessionId: null,
      
      // Voice state
      voiceState: {
        enabled: false,
        autoSpeak: true,
        voice: 'default',
        rate: 1,
        pitch: 1,
        volume: 1,
        isListening: false
      },
      
      // Audio settings
      audioSettings: {
        enabled: true,
        volume: 0.8,
        effects: true,
        music: true,
        voiceOutputEnabled: true
      },

      // Initialize session
      initializeSession: async (cartridgeId: string) => {
        set({ isLoading: true })
        
        try {
          // Fetch game prompt
          const response = await fetch(`/api/game-prompts/${cartridgeId}`)
          if (!response.ok) {
            throw new Error(`Failed to fetch game prompt: ${response.status}`)
          }
          const gamePrompt: GamePrompt = await response.json()
          
          set({
            session: cartridgeId,
            currentPrompt: gamePrompt,
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to initialize session:', error)
          set({ isLoading: false })
          throw error
        }
      },

      // Update character
      updateCharacter: (character: Character) => {
        set({ character })
      },

      // Update world state
      updateWorldState: (worldState: WorldState) => {
        set({ worldState })
      },

      // Quest management
      addQuest: (quest: Quest) => {
        set(state => ({
          quests: [...state.quests.filter(q => q.id !== quest.id), quest]
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
          inventory: [...state.inventory.filter(i => i.id !== item.id), item]
        }))
      },

      removeItem: (itemId: string) => {
        set(state => ({
          inventory: state.inventory.filter(item => item.id !== itemId)
        }))
      },

      // Combat state
      setCombatState: (combatState: CombatState | null) => {
        set({ combatState })
      },

      // Combat actions
      updateCombatState: (updates: Partial<CombatState>) => {
        set(state => ({
          combatState: state.combatState ? { ...state.combatState, ...updates } : null
        }))
      },

      performCombatAction: (action: string, target?: string) => {
        const { combatState } = get()
        if (!combatState) return
        
        // Implement combat action logic here
        console.log(`Performing combat action: ${action}${target ? ` on ${target}` : ''}`)
      },

      rollDice: (diceType: string, count: number = 1) => {
        const sides = parseInt(diceType.replace('d', ''))
        let total = 0
        for (let i = 0; i < count; i++) {
          total += Math.floor(Math.random() * sides) + 1
        }
        return { total }
      },

      // Advanced combat actions
      initializeCombat: (participants: CombatParticipant[]) => {
        const combatState = initializeCombat(participants)
        set({ combatState })
      },

      performAttack: (actorId: string, targetId: string, weaponName: string) => {
        const { combatState } = get()
        if (!combatState) throw new Error('No active combat')
        
        const action = performAttack(combatState, actorId, targetId, weaponName)
        
        set(state => ({
          combatState: state.combatState ? {
            ...state.combatState,
            actions: [...state.combatState.actions, action]
          } : null
        }))
        
        return action
      },

      performSpellCast: (actorId: string, targetId: string, spellName: string) => {
        const { combatState } = get()
        if (!combatState) throw new Error('No active combat')
        
        const action = performSpellCast(combatState, actorId, targetId, spellName)
        
        set(state => ({
          combatState: state.combatState ? {
            ...state.combatState,
            actions: [...state.combatState.actions, action]
          } : null
        }))
        
        return action
      },

      performUseItem: (actorId: string, targetId: string, itemName: string) => {
        const { combatState } = get()
        if (!combatState) throw new Error('No active combat')
        
        const action = performUseItem(combatState, actorId, targetId, itemName)
        
        set(state => ({
          combatState: state.combatState ? {
            ...state.combatState,
            actions: [...state.combatState.actions, action]
          } : null
        }))
        
        return action
      },

      advanceCombatTurn: () => {
        const { combatState } = get()
        if (!combatState) return
        
        const newCombatState = advanceTurn(combatState)
        set({ combatState: newCombatState })
      },

      getCurrentCombatActor: () => {
        const { combatState } = get()
        if (!combatState) return null
        return getCurrentActor(combatState)
      },

      getAvailableCombatActions: () => {
        const { combatState } = get()
        if (!combatState) return []
        return getAvailableActions(combatState)
      },

      getValidCombatTargets: (actionType: string) => {
        const { combatState } = get()
        if (!combatState) return []
        return getValidTargets(combatState, actionType)
      },

      isCombatOver: () => {
        const { combatState } = get()
        if (!combatState) return false
        return isCombatOver(combatState)
      },

      getCombatResult: () => {
        const { combatState } = get()
        if (!combatState) return 'ongoing'
        return getCombatResult(combatState)
      },

      // Voice actions
      updateVoiceState: (updates: Partial<GameState['voiceState']>) => {
        set(state => ({
          voiceState: { ...state.voiceState, ...updates }
        }))
      },

      updateAudioSettings: (updates: Partial<GameState['audioSettings']>) => {
        set(state => ({
          audioSettings: { ...state.audioSettings, ...updates }
        }))
      },

      setAudioSettings: (settings: Partial<GameState['audioSettings']>) => {
        set(state => ({
          audioSettings: { ...state.audioSettings, ...settings }
        }))
      },

      setVoiceState: (settings: Partial<GameState['voiceState']>) => {
        set(state => ({
          voiceState: { ...state.voiceState, ...settings }
        }))
      },

      // Inventory actions
      updateInventory: (updates: Partial<{ items: Item[] }> | Item[]) => {
        set(state => ({
          inventory: Array.isArray(updates) ? updates : (updates.items || state.inventory)
        }))
      },

      // Message management
      addMessage: (message: Message) => {
        set(state => ({
          messages: [...state.messages, message]
        }))
        
        // Update active session with new message
        const { activeSessionId, chatSessions } = get()
        if (activeSessionId) {
          const session = chatSessions.find(s => s.id === activeSessionId)
          if (session) {
            const updatedSession = {
              ...session,
              messages: [...session.messages, message],
              updatedAt: new Date()
            }
            
            // Auto-generate title from first user message
            if (message.type === 'user' && session.messages.length === 0) {
              updatedSession.title = generateSessionTitle([message])
            }
            
            set(state => ({
              chatSessions: state.chatSessions.map(s => 
                s.id === activeSessionId ? updatedSession : s
              )
            }))
          }
        }
      },

      // Send message to AI
      sendMessage: async (content: string) => {
        const { session, character, worldState, quests, inventory, combatState, currentPrompt } = get()
        
        if (!session || !character || !currentPrompt) return

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
              messages: [...get().messages, userMessage],
              cartridgeId: session,
              gameState: {
                character,
                worldState,
                quests,
                inventory,
                combatState
              }
            })
          })

          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`)
          }

          const data = await response.json()
          
          // Add AI response
          const aiMessage = {
            id: `ai_${Date.now()}`,
            type: 'ai' as const,
            content: data.response,
            timestamp: new Date(),
            diceRolls: data.diceRolls || []
          }

          set(state => ({
            messages: [...state.messages, aiMessage],
            isTyping: false
          }))

          // Update game state from AI response
          if (data.gameState) {
            if (data.gameState.character) {
              get().updateCharacter(data.gameState.character)
            }
            if (data.gameState.worldState) {
              get().updateWorldState(data.gameState.worldState)
            }
            if (data.gameState.quests) {
              data.gameState.quests.forEach((quest: Quest) => {
                get().addQuest(quest)
              })
            }
            if (data.gameState.inventory) {
              data.gameState.inventory.forEach((item: Item) => {
                get().addItem(item)
              })
            }
            if (data.gameState.combatState !== undefined) {
              get().setCombatState(data.gameState.combatState)
            }
          }
        } catch (error) {
          console.error('Failed to send message:', error)
          set({ isTyping: false })
          
          // Add error message
          const errorMessage = {
            id: `error_${Date.now()}`,
            type: 'system' as const,
            content: 'Sorry, there was an error processing your message. Please try again.',
            timestamp: new Date()
          }
          
          set(state => ({
            messages: [...state.messages, errorMessage]
          }))
        }
      },

      // Chat history management
      createNewChatSession: (gamePrompt: GamePrompt, character: Character) => {
        const session = createNewSession(gamePrompt, character)
        
        set(state => ({
          chatSessions: cleanupOldSessions([session, ...state.chatSessions]),
          activeSessionId: session.id,
          currentPrompt: gamePrompt,
          character,
          messages: session.messages,
          quests: [],
          inventory: [],
          combatState: null,
          worldState: null
        }))
      },

      loadChatSession: (sessionId: string) => {
        const { chatSessions } = get()
        const session = chatSessions.find(s => s.id === sessionId)
        
        if (session) {
          set({
            activeSessionId: sessionId,
            currentPrompt: session.gamePrompt,
            character: session.character,
            messages: session.messages,
            quests: session.quests || [],
            inventory: session.inventory || [],
            combatState: session.combatState || null,
            worldState: session.worldState || null
          })
        }
      },

      deleteChatSession: (sessionId: string) => {
        set(state => {
          const newSessions = state.chatSessions.filter(s => s.id !== sessionId)
          let newActiveSessionId = state.activeSessionId
          
          // If deleting active session, switch to first available
          if (state.activeSessionId === sessionId) {
            newActiveSessionId = newSessions.length > 0 ? newSessions[0].id : null
          }
          
          return {
            chatSessions: newSessions,
            activeSessionId: newActiveSessionId
          }
        })
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set(state => ({
          chatSessions: state.chatSessions.map(s => 
            s.id === sessionId ? { ...s, title } : s
          )
        }))
      },

      clearAllSessions: () => {
        set({
          chatSessions: [],
          activeSessionId: null,
          messages: [],
          currentPrompt: null,
          character: null,
          quests: [],
          inventory: [],
          combatState: null,
          worldState: null
        })
      }
    }),
    {
      name: 'aethoria-game-store',
      partialize: (state) => ({
        chatSessions: state.chatSessions,
        activeSessionId: state.activeSessionId
      })
    }
  )
) 