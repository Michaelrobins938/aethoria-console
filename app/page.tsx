'use client'

import React, { useState } from 'react'

interface Message {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '🎮 Welcome to Aethoria Console! 🎮\n\nI am your AI Dungeon Master. How can I help you today?',
      type: 'ai',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Call the real AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: 'default-session'
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'I apologize, but I encountered an error processing your request.',
        type: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI request failed:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        type: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-console-dark text-console-text">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-gaming text-console-accent mb-6 text-center">
          🎮 AETHORIA CONSOLE 🎮
        </h1>
        
        {/* Messages */}
        <div className="bg-console-darker border border-console-border rounded-lg h-[600px] overflow-y-auto p-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-console-accent text-console-dark'
                    : 'bg-console-dark border border-console-border'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="text-left">
              <div className="inline-block p-3 rounded-lg bg-console-dark border border-console-border">
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
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-console-dark border border-console-border rounded-lg px-4 py-3 text-console-text font-console focus:outline-none focus:border-console-accent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-console-accent hover:bg-console-accent-dark disabled:bg-console-border text-console-dark font-console rounded-lg transition-colors"
          >
            Send
          </button>
        </div>

        <div className="mt-4 text-center text-console-text-dim text-sm">
          <p>Real AI integration - Connected to OpenRouter API!</p>
        </div>
      </div>
    </div>
  )
} 