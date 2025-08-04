import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Character, 
  WorldState, 
  Quest, 
  Item, 
  CombatState, 
  AIResponse, 
  GameSession,
  VoiceState,
  AudioSettings,
  GamePrompt,
  CombatParticipant,
  Message
} from './types';

interface GameStore {
  session: GameSession | null;
  currentPrompt: GamePrompt | null;
  character: Character | null;
  worldState: WorldState;
  quests: Quest[];
  inventory: Item[];
  combatState: CombatState | null;
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  voiceState: VoiceState;
  audioSettings: AudioSettings;
  chatSessions: GameSession[];
  activeSessionId: string | null;
  initializeSession: (promptId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  updateCharacter: (updates: Partial<Character>) => void;
  updateWorldState: (updates: Partial<WorldState>) => void;
  addQuest: (quest: Quest) => void;
  updateQuest: (questId: string, updates: Partial<Quest>) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  updateInventory: (inventory: Item[]) => void;
  startCombat: (enemies: CombatParticipant[]) => void;
  endCombat: () => void;
  updateCombatState: (combatState: CombatState | null) => void;
  setVoiceState: (state: Partial<VoiceState>) => void;
  setAudioSettings: (settings: Partial<AudioSettings>) => void;
  addMessage: (message: Message) => void;
  loadChatSession: (sessionId: string) => void;
  deleteChatSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  clearAllSessions: () => void;
  saveGame: () => void;
  loadGame: (sessionId: string) => Promise<void>;
  resetGame: () => void;
}

const initialWorldState: WorldState = {
  location: 'Unknown',
  timeOfDay: 'day',
  weather: 'clear',
  activeEvents: [],
};

const initialVoiceState: VoiceState = {
  isListening: false,
  isSpeaking: false,
  isEnabled: false,
  transcript: '',
  confidence: 0,
};

const initialAudioSettings: AudioSettings = {
  volume: 0.7,
  rate: 1.0,
  pitch: 1.0,
  voice: 'default',
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
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
      chatSessions: [],
      activeSessionId: null,

      initializeSession: async (promptId: string) => {
        // ... (implementation remains the same)
      },

      sendMessage: async (content: string) => {
        // ... (implementation remains the same)
      },

      updateCharacter: (updates: Partial<Character>) => {
        set(state => ({
          character: state.character ? { ...state.character, ...updates } : null,
        }));
      },

      updateWorldState: (updates: Partial<WorldState>) => {
        set(state => ({
          worldState: { ...state.worldState, ...updates },
        }));
      },

      addQuest: (quest: Quest) => {
        set(state => ({ quests: [...state.quests, quest] }));
      },

      updateQuest: (questId: string, updates: Partial<Quest>) => {
        set(state => ({
          quests: state.quests.map(q => q.id === questId ? { ...q, ...updates } : q),
        }));
      },

      addItem: (item: Item) => {
        set(state => ({ inventory: [...state.inventory, item] }));
      },

      removeItem: (itemId: string) => {
        set(state => ({ inventory: state.inventory.filter(i => i.id !== itemId) }));
      },

      updateInventory: (inventory: Item[]) => {
        set({ inventory });
      },

      startCombat: (enemies: CombatParticipant[]) => {
        const { character } = get();
        if (!character) return;

        const participants = [character, ...enemies];

        set({
          combatState: {
            isActive: true,
            participants,
            enemies,
            turn: 0,
            round: 1,
            initiativeOrder: [],
            log: [`Combat started! ${enemies.length} enemies appear.`],
          },
        });
      },

      endCombat: () => {
        set({ combatState: null });
      },

      updateCombatState: (combatState: CombatState | null) => {
        set({ combatState });
      },

      setVoiceState: (state: Partial<VoiceState>) => {
        set(prev => ({ voiceState: { ...prev.voiceState, ...state } }));
      },

      setAudioSettings: (settings: Partial<AudioSettings>) => {
        set(prev => ({ audioSettings: { ...prev.audioSettings, ...settings } }));
      },

      addMessage: (message) => {
        set(state => ({ messages: [...state.messages, message] }));
      },

      loadChatSession: (sessionId: string) => {
        set({ activeSessionId: sessionId });
      },

      deleteChatSession: (sessionId: string) => {
        set(state => ({
          chatSessions: state.chatSessions.filter(s => s.id !== sessionId),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
        }));
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set(state => ({
          chatSessions: state.chatSessions.map(s => 
            s.id === sessionId ? { ...s, title } : s
          ),
        }));
      },

      clearAllSessions: () => {
        set({ chatSessions: [], activeSessionId: null });
      },

      saveGame: () => {
        // ... (implementation remains the same)
      },

      loadGame: async (sessionId: string) => {
        // ... (implementation remains the same)
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
          isLoading: false,
        });
      },
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
        audioSettings: state.audioSettings,
      }),
    }
  )
);