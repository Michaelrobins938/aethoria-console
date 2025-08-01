'use client'

import React from 'react'
import { Message } from '@/lib/types'
import { User, Bot, Copy, Check, MoreVertical } from 'lucide-react'
import { MessageRenderer } from './MessageRenderer'

interface ChatBubbleProps {
  message: Message
  isLastMessage?: boolean
  onCopy?: (content: string) => void
}

export function ChatBubble({ message, isLastMessage = false, onCopy }: ChatBubbleProps) {
  const [copied, setCopied] = React.useState(false)
  const [showActions, setShowActions] = React.useState(false)

  const handleCopy = async () => {
    const content = typeof message.content === 'string' ? message.content : 'Message content'
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      onCopy?.(content)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const isUser = message.type === 'user'
  const isAI = message.type === 'ai'
  const isSystem = message.type === 'system'

  return (
    <div
      className={`group relative flex ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-4 px-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-console-accent text-console-dark' 
            : isSystem
            ? 'bg-red-500/20 text-red-400'
            : 'bg-console-accent/20 text-console-accent'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : isSystem ? (
            <div className="w-4 h-4 bg-red-400 rounded-full" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Message Bubble */}
        <div className={`relative flex flex-col ${
          isUser ? 'items-end' : 'items-start'
        }`}>
          {/* Message Content */}
          <div className={`rounded-2xl px-4 py-3 max-w-full ${
            isUser
              ? 'bg-console-accent text-console-dark rounded-br-md'
              : isSystem
              ? 'bg-red-900/20 text-red-400 border border-red-500/30 rounded-bl-md'
              : 'bg-console-darker text-console-text border border-console-border rounded-bl-md'
          }`}>
            <MessageRenderer message={message} />
          </div>

          {/* Timestamp */}
          <div className={`text-xs text-console-text-dim mt-1 px-2 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className={`absolute top-0 ${
              isUser ? '-left-12' : '-right-12'
            } flex items-center space-x-1 bg-console-darker border border-console-border rounded-lg p-1 shadow-lg`}>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-console-border rounded transition-colors duration-200"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              <button className="p-1 hover:bg-console-border rounded transition-colors duration-200">
                <MoreVertical className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Typing Indicator for last message */}
      {isLastMessage && isAI && (
        <div className="flex items-center space-x-2 text-console-text-dim text-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>AI is typing...</span>
        </div>
      )}
    </div>
  )
} 