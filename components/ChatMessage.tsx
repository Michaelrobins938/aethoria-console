'use client'

import { User, Bot } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user'
  
  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-console-accent rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-console-dark" />
        </div>
      )}
      
      <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'}`}>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-gaming">
            {isUser ? 'You' : 'AI'}
          </span>
          <span className="text-xs text-console-text-dim">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-console-accent rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-console-dark" />
        </div>
      )}
    </div>
  )
} 