'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Message } from '@/lib/types'
import { ChatBubble } from './ChatBubble'
import { ChevronDown, ArrowDown } from 'lucide-react'

interface ChatContainerProps {
  messages: Message[]
  isTyping?: boolean
  onScrollToBottom?: () => void
  className?: string
}

export function ChatContainer({ 
  messages, 
  isTyping = false, 
  onScrollToBottom,
  className = '' 
}: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  // Check if user is at bottom
  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) return true
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const threshold = 100 // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold
  }, [])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (!containerRef.current) return
    
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }, [])

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const atBottom = checkIfAtBottom()
    
    setIsAtBottom(atBottom)
    setShowScrollButton(!atBottom)
    setLastScrollTop(scrollTop)
  }, [checkIfAtBottom])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const shouldAutoScroll = isAtBottom || lastScrollTop === 0
      if (shouldAutoScroll) {
        // Small delay to ensure DOM is updated
        setTimeout(() => scrollToBottom(false), 100)
      }
    }
  }, [messages.length, isAtBottom, lastScrollTop, scrollToBottom])

  // Scroll to bottom when typing starts
  useEffect(() => {
    if (isTyping && isAtBottom) {
      scrollToBottom(true)
    }
  }, [isTyping, isAtBottom, scrollToBottom])

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false)
    }
  }, [scrollToBottom])

  const handleScrollButtonClick = () => {
    scrollToBottom(true)
    onScrollToBottom?.()
  }

  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-console-border scrollbar-track-console-dark"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--console-border) var(--console-dark)'
        }}
      >
        <div className="flex flex-col min-h-full justify-end">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-console-text-dim">
              <div className="text-center">
                <div className="w-16 h-16 bg-console-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-console-accent rounded-full" />
                </div>
                <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
                <p className="text-sm opacity-70">I&apos;m ready to guide you through your adventure!</p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              isLastMessage={index === messages.length - 1 && isTyping}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4 px-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-console-accent/20">
                  <div className="w-4 h-4 bg-console-accent rounded-full" />
                </div>
                <div className="bg-console-darker text-console-text border border-console-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-console-text-dim">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={handleScrollButtonClick}
          className="absolute bottom-4 right-4 p-3 bg-console-accent hover:bg-console-accent-dark text-console-dark rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* New Messages Indicator */}
      {!isAtBottom && messages.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleScrollButtonClick}
            className="px-4 py-2 bg-console-accent hover:bg-console-accent-dark text-console-dark rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="text-sm font-medium">New messages</span>
          </button>
        </div>
      )}
    </div>
  )
} 