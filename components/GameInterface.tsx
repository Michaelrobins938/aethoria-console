import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Character, GamePrompt } from "@/lib/types";
import { useGameStore } from '@/lib/store'
import { Menu, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface GameInterfaceProps {
  character: Character;
  gamePrompt: GamePrompt;
  onBack: () => void;
}

export function GameInterface({ character, gamePrompt, onBack }: GameInterfaceProps) {
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
    addMessage,
    sendMessage,
    createNewChatSession
  } = useGameStore()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [input, setInput] = useState('')

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

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return
    
    const content = input.trim()
    setInput('')
    
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
          <div className="bg-console-darker/80 backdrop-blur-sm border border-console-border rounded-lg overflow-hidden flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-console-text-dim">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-console-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 bg-console-accent rounded-full" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                    <p className="text-sm opacity-70">I'm ready to guide you through your adventure!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-console-accent text-console-dark'
                          : message.type === 'system'
                          ? 'bg-red-900/20 text-red-400 border border-red-500/30'
                          : 'bg-console-darker text-console-text border border-console-border'
                      }`}>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-60 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-console-darker text-console-text border border-console-border rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-console-border bg-console-darker p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Aethoria..."
                  className="flex-1 bg-console-dark border border-console-border rounded-lg px-4 py-2 text-console-text font-console placeholder-console-text-dim focus:outline-none focus:border-console-accent"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isTyping || !input.trim()}
                  className="px-4 py-2 bg-console-accent hover:bg-console-accent-dark disabled:bg-console-border disabled:cursor-not-allowed text-console-dark font-console rounded-lg transition-colors duration-200"
                >
                  Send
                </button>
              </div>
              <div className="text-xs text-console-text-dim text-center mt-2">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
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