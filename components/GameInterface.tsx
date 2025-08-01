import { ThreadList } from "@/components/assistant-ui/thread-list";
import { ThreadWithOrb } from "@/components/assistant-ui/thread-with-orb";
import { Character, GamePrompt } from "@/lib/types";
import { NarratorOrbComponent } from './NarratorOrb'
import { useNarratorOrb } from '@/lib/hooks/useNarratorOrb'
import { useGameStore } from '@/lib/store'
import { ChatSidebar } from './ChatSidebar'
import { Menu, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface GameInterfaceProps {
  character: Character;
  gamePrompt: GamePrompt;
  onBack: () => void;
}

export function GameInterface({ character, gamePrompt, onBack }: GameInterfaceProps) {
  const { orbState } = useNarratorOrb()
  const { 
    session, 
    currentPrompt, 
    character: storeCharacter, 
    worldState, 
    quests, 
    inventory, 
    combatState,
    messages,
    isTyping,
    isLoading,
    activeSessionId,
    chatSessions,
    initializeSession,
    updateCharacter,
    updateWorldState,
    addMessage,
    sendMessage,
    createNewChatSession,
    loadChatSession
  } = useGameStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)

  // Initialize game session if not already done
  useEffect(() => {
    if (!session || !currentPrompt) {
      console.log('Initializing game session in GameInterface')
      initializeSession(gamePrompt.id).catch(error => {
        console.error('Failed to initialize session:', error)
        addMessage({
          id: `error_${Date.now()}`,
          type: 'system' as const,
          content: 'Failed to initialize game session. Please try refreshing the page.',
          timestamp: new Date()
        })
      })
    }
  }, [session, currentPrompt, gamePrompt.id, initializeSession, addMessage])

  // Update character in store if it changed
  useEffect(() => {
    if (character && (!storeCharacter || storeCharacter.name !== character.name)) {
      console.log('Updating character in store:', character.name)
      updateCharacter(character)
    }
  }, [character, storeCharacter, updateCharacter])

  // Create new chat session if this is a new game
  useEffect(() => {
    if (character && gamePrompt && !activeSessionId) {
      console.log('Creating new chat session')
      createNewChatSession(gamePrompt, character)
    }
  }, [character, gamePrompt, activeSessionId, createNewChatSession])

  // Add initial welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0 && gamePrompt && character) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai' as const,
        content: `🎮 **Welcome to ${gamePrompt.title}!** 🎮

${gamePrompt.description}

**Game Genre:** ${gamePrompt.genre}
**Difficulty:** ${gamePrompt.difficulty}
**Themes:** ${gamePrompt.themes.join(', ')}

You are about to embark on an epic adventure where every choice matters. The AI Dungeon Master is ready to guide you through this immersive world.

**What you can do:**
• Speak or type your actions naturally
• Explore the world and discover secrets
• Engage in tactical combat
• Build relationships with NPCs
• Complete quests and advance your character

**Ready to begin?** Tell me what you'd like to do!`,
        timestamp: new Date()
      }
      addMessage(welcomeMessage)
    }
  }, [messages.length, gamePrompt, character, addMessage])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return
    
    try {
      await sendMessage(content)
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message to chat
      addMessage({
        id: `error_${Date.now()}`,
        type: 'system' as const,
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      })
    }
  }

  const handleNewChat = () => {
    setShowNewChatModal(true)
  }

  const handleStartNewGame = () => {
    setShowNewChatModal(false)
    onBack() // Go back to cartridge selection
  }

  // Show loading state while initializing
  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-console-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-console-accent mx-auto mb-4"></div>
          <p className="text-console-text font-console">Initializing game session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-console-dark relative">
      {/* Chat Sidebar */}
      <ChatSidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
      />

      {/* NarratorOrb Background */}
      <NarratorOrbComponent 
        isVisible={true}
        intensity={orbState.intensity}
        audioLevel={orbState.audioLevel}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Game Content */}
      <div className={`relative z-10 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Game Header */}
        <div className="p-4 border-b border-console-border bg-console-darker/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-console-dark hover:bg-console-border text-console-text transition-colors duration-200"
                title="Toggle Chat History"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <button
                onClick={onBack}
                className="px-4 py-2 bg-console-accent hover:bg-console-accent-dark text-console-dark font-console rounded-lg transition-colors duration-200"
              >
                ← Back to Games
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-console-text-dim font-console text-sm">
                AI Model: claude-3-5-sonnet
              </div>
              <button
                onClick={handleNewChat}
                className="p-2 rounded-lg bg-console-accent hover:bg-console-accent-dark text-console-dark transition-colors duration-200"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-console-accent font-console text-2xl mb-2">
              {gamePrompt.title}
            </h1>
            <p className="text-console-text font-console text-sm mb-2">
              {gamePrompt.description}
            </p>
            <div className="flex items-center space-x-4 text-console-text-dim font-console text-xs">
              <span>Genre: {gamePrompt.genre}</span>
              <span>Difficulty: {gamePrompt.difficulty}</span>
              <span>Themes: {gamePrompt.themes.join(', ')}</span>
              {activeSessionId && (
                <span>Session: {chatSessions.find(s => s.id === activeSessionId)?.title || 'Active'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Game Interface */}
        <div className="grid h-[calc(100vh-120px)] grid-cols-[300px_1fr] gap-4 p-4">
          <div className="bg-console-darker/80 backdrop-blur-sm border border-console-border rounded-lg overflow-hidden">
            <ThreadList 
              character={storeCharacter || character} 
              gamePrompt={gamePrompt}
              worldState={worldState ?? undefined}
              quests={quests}
              inventory={inventory}
              combatState={combatState}
            />
          </div>
          <div className="bg-console-darker/80 backdrop-blur-sm border border-console-border rounded-lg overflow-hidden">
            <ThreadWithOrb 
              onSendMessage={handleSendMessage}
              messages={messages}
              isTyping={isTyping}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-console-darker border border-console-border rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-gaming text-console-accent mb-4">Start New Game?</h3>
            <p className="text-console-text text-sm mb-6">
              This will start a new game session. Your current progress will be saved in chat history.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 px-4 py-2 bg-console-dark hover:bg-console-border text-console-text rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleStartNewGame}
                className="flex-1 px-4 py-2 bg-console-accent hover:bg-console-accent-dark text-console-dark rounded-lg transition-colors duration-200"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 