import { Message, GamePrompt, Character, Quest, Item, CombatState, WorldState } from '@/lib/types'

export interface ChatSession {
  id: string
  title: string
  gamePrompt: GamePrompt
  character: Character
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  quests?: Quest[]
  inventory?: Item[]
  combatState?: CombatState | null
  worldState?: WorldState | null
}

export interface ChatHistoryStore {
  sessions: ChatSession[]
  activeSessionId: string | null
  addSession: (session: ChatSession) => void
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void
  deleteSession: (sessionId: string) => void
  setActiveSession: (sessionId: string | null) => void
  getActiveSession: () => ChatSession | null
  addMessageToSession: (sessionId: string, message: Message) => void
  updateSessionTitle: (sessionId: string, title: string) => void
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

// Local storage keys
const CHAT_HISTORY_KEY = 'aethoria_chat_history'
const ACTIVE_SESSION_KEY = 'aethoria_active_session'

// Generate session ID
export const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Create new session
export const createNewSession = (
  gamePrompt: GamePrompt, 
  character: Character, 
  initialMessage?: Message
): ChatSession => {
  const session: ChatSession = {
    id: generateSessionId(),
    title: `${gamePrompt.title} - ${character.name}`,
    gamePrompt,
    character,
    messages: initialMessage ? [initialMessage] : [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
  return session
}

// Auto-generate title from first few messages
export const generateSessionTitle = (messages: Message[]): string => {
  if (messages.length === 0) return 'New Chat'
  
  const firstUserMessage = messages.find(m => m.type === 'user')
  if (!firstUserMessage) return 'New Chat'
  
  const content = typeof firstUserMessage.content === 'string' 
    ? firstUserMessage.content 
    : 'New Chat'
  
  // Extract first meaningful phrase (up to 50 chars)
  const title = content.substring(0, 50).trim()
  return title.length > 0 ? title : 'New Chat'
}

// Save to localStorage
export const saveChatHistory = (sessions: ChatSession[], activeSessionId: string | null) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(sessions))
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId || '')
  } catch (error) {
    console.error('Failed to save chat history:', error)
  }
}

// Load from localStorage
export const loadChatHistory = (): { sessions: ChatSession[], activeSessionId: string | null } => {
  try {
    const sessionsData = localStorage.getItem(CHAT_HISTORY_KEY)
    const activeSessionData = localStorage.getItem(ACTIVE_SESSION_KEY)
    
    if (!sessionsData) {
      return { sessions: [], activeSessionId: null }
    }
    
    const sessions: ChatSession[] = JSON.parse(sessionsData).map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages?.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) || []
    }))
    
    const activeSessionId = activeSessionData || null
    
    return { sessions, activeSessionId }
  } catch (error) {
    console.error('Failed to load chat history:', error)
    return { sessions: [], activeSessionId: null }
  }
}

// Clean up old sessions (keep last 50)
export const cleanupOldSessions = (sessions: ChatSession[]): ChatSession[] => {
  const MAX_SESSIONS = 50
  if (sessions.length <= MAX_SESSIONS) return sessions
  
  // Sort by updatedAt and keep the most recent
  return sessions
    .sort((a, b) => {
      const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime()
      const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime()
      return bTime - aTime
    })
    .slice(0, MAX_SESSIONS)
} 