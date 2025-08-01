'use client'

import React, { useState } from 'react'
import { ChatContainer } from '@/components/ChatContainer'
import { Message } from '@/lib/types'

export default function TestChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! This is a test message to see if the chat interface is working.',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'user',
      content: 'Hi! This is a test response.',
      timestamp: new Date()
    }
  ])

  const [input, setInput] = useState('')

  const handleSendMessage = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `You said: "${input}". This is a test response.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-console-dark p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-gaming text-console-accent mb-4">Chat Interface Test</h1>
        
        <div className="bg-console-darker border border-console-border rounded-lg h-[600px] overflow-hidden">
          <ChatContainer 
            messages={messages}
            isTyping={false}
            className="h-full"
          />
        </div>

        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-console-dark border border-console-border rounded-lg px-4 py-2 text-console-text font-console focus:outline-none focus:border-console-accent"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-console-accent hover:bg-console-accent-dark text-console-dark font-console rounded-lg transition-colors duration-200"
          >
            Send
          </button>
        </div>

        <div className="mt-4 text-console-text-dim text-sm">
          <p>This is a simple test to verify the chat interface works without 3D components.</p>
          <p>If you can see this page and the chat messages above, the basic interface is working.</p>
        </div>
      </div>
    </div>
  )
} 