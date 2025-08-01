'use client'

import React, { useState, useMemo } from 'react'
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Clock,
  Gamepad2,
  User,
  Settings,
  Search,
  Filter,
  Calendar,
  Star
} from 'lucide-react'
import { ChatSession } from '@/lib/chatHistory'
import { useGameStore } from '@/lib/store'

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onNewChat: () => void
}

export function ChatSidebar({ isOpen, onToggle, onNewChat }: ChatSidebarProps) {
  const { 
    chatSessions, 
    activeSessionId, 
    loadChatSession, 
    deleteChatSession, 
    updateSessionTitle,
    clearAllSessions 
  } = useGameStore()
  
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'favorites'>('all')

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    let filtered = chatSessions

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.gamePrompt.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    switch (filterType) {
      case 'recent':
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        filtered = filtered.filter(session => session.updatedAt > oneWeekAgo)
        break
      case 'favorites':
        // For now, consider sessions with "favorite" in title as favorites
        filtered = filtered.filter(session => session.title.toLowerCase().includes('favorite'))
        break
      default:
        break
    }

    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }, [chatSessions, searchQuery, filterType])

  const handleSessionClick = (sessionId: string) => {
    loadChatSession(sessionId)
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChatSession(sessionId)
  }

  const handleEditTitle = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSessionId(session.id)
    setEditTitle(session.title)
  }

  const handleSaveTitle = () => {
    if (editingSessionId && editTitle.trim()) {
      updateSessionTitle(editingSessionId, editTitle.trim())
    }
    setEditingSessionId(null)
    setEditTitle('')
  }

  const handleCancelEdit = () => {
    setEditingSessionId(null)
    setEditTitle('')
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return 'Today'
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getSessionIcon = (session: ChatSession) => {
    return <Gamepad2 className="w-4 h-4" />
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-console-darker border-r border-console-border transition-transform duration-300 z-40 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`} style={{ width: '320px' }}>
      {/* Header */}
      <div className="p-4 border-b border-console-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-gaming text-console-accent">Chat History</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg bg-console-accent hover:bg-console-accent-dark text-console-dark transition-colors duration-200"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowConfirmClear(true)}
              className="p-2 rounded-lg bg-console-darker hover:bg-console-border text-console-text transition-colors duration-200"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-console-text-dim" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-console-dark border border-console-border rounded-lg text-console-text placeholder-console-text-dim focus:outline-none focus:border-console-accent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-3">
          {[
            { key: 'all', label: 'All', icon: MessageSquare },
            { key: 'recent', label: 'Recent', icon: Clock },
            { key: 'favorites', label: 'Favorites', icon: Star }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilterType(key as any)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs transition-colors duration-200 ${
                filterType === key
                  ? 'bg-console-accent text-console-dark'
                  : 'bg-console-dark text-console-text hover:bg-console-border'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.length === 0 ? (
          <div className="p-4 text-center">
            <MessageSquare className="w-8 h-8 text-console-text-dim mx-auto mb-2" />
            <p className="text-console-text-dim font-console text-sm">
              {searchQuery ? 'No conversations found' : 'No chat history'}
            </p>
            <p className="text-console-text-dim font-console text-xs mt-1">
              {searchQuery ? 'Try adjusting your search' : 'Start a new game to begin'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionClick(session.id)}
                className={`group relative p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 ${
                  activeSessionId === session.id
                    ? 'bg-console-accent text-console-dark'
                    : 'bg-console-dark hover:bg-console-border text-console-text'
                }`}
              >
                {/* Session Content */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSessionIcon(session)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingSessionId === session.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        onBlur={handleSaveTitle}
                        className="w-full bg-transparent border-none outline-none text-sm font-console"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-console truncate">
                          {session.title}
                        </h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => handleEditTitle(session, e)}
                            className="p-1 rounded hover:bg-console-accent/20 transition-colors duration-200"
                            title="Edit title"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors duration-200"
                            title="Delete session"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1 text-xs text-console-text-dim">
                        <User className="w-3 h-3" />
                        <span>{session.character.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-console-text-dim">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(session.updatedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <span className="inline-block bg-console-accent/20 text-console-accent text-xs px-2 py-1 rounded">
                        {session.gamePrompt.genre}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-console-border">
        <div className="flex items-center justify-between text-xs text-console-text-dim">
          <span>{filteredSessions.length} of {chatSessions.length} conversations</span>
          <button
            onClick={() => setShowConfirmClear(true)}
            className="hover:text-console-text transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-console-darker border border-console-border rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-gaming text-console-accent mb-4">Clear All Sessions?</h3>
            <p className="text-console-text text-sm mb-6">
              This will permanently delete all chat history. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 px-4 py-2 bg-console-dark hover:bg-console-border text-console-text rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllSessions()
                  setShowConfirmClear(false)
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 