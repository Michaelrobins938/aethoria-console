'use client'

import React from 'react'
import { ThreadWithOrb } from '@/components/assistant-ui/thread-with-orb'

interface Message {
  id: string;
  type: 'user' | 'system' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: any[];
  diceRolls?: Array<{
    type: string;
    result: number;
    success: boolean;
  }>;
}

export default function TestChatPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! This is a test message.',
      timestamp: new Date()
    }
  ])

  const handleSendMessage = async (content: string) => {
    console.log('Sending message:', content)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `You said: "${content}". This is a test response.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-console-dark p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-gaming text-console-accent mb-4">Test Chat Interface</h1>
        <div className="h-[600px] border border-console-border rounded-lg overflow-hidden">
          <ThreadWithOrb 
            onSendMessage={handleSendMessage}
            messages={messages}
            isTyping={false}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  )
} 