'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles, MessageSquare, Menu, X } from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { NarratorOrbComponent } from './NarratorOrb'
import { useNarratorOrb } from '@/lib/hooks/useNarratorOrb'

interface AIChatProps {
  onClose?: () => void
  className?: string
}

export function AIChat({ onClose, className = '' }: AIChatProps) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const { orbState, handleMessageActivity, handleAIThinking, handleAIResponse } = useNarratorOrb()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  
  const { 
    messages, 
    addMessage, 
    sendMessage, 
    isTyping: storeIsTyping,
    voiceState,
    audioSettings 
  } = useGameStore()

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle typing state changes
  useEffect(() => {
    setIsTyping(storeIsTyping)
    if (storeIsTyping) {
      handleAIThinking()
    } else {
      handleAIResponse()
    }
  }, [storeIsTyping, handleAIThinking, handleAIResponse])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
      }

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        
        setInput(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    addMessage({
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    })

    // Set orb to active state
    handleMessageActivity()

    try {
      await sendMessage(userMessage)
    } catch (error) {
      console.error('Failed to send message:', error)
      addMessage({
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      })
    } finally {
      // Orb state will be handled by the hook
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  const toggleVoiceOutput = () => {
    if (!synthesisRef.current) return

    if (isSpeaking) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      // Speak the last AI message
      const lastAIMessage = messages
        .filter(m => m.type === 'ai')
        .pop()
      
      if (lastAIMessage) {
        const utterance = new SpeechSynthesisUtterance(lastAIMessage.content)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        synthesisRef.current.speak(utterance)
      }
    }
  }

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('send') || lowerCommand.includes('submit')) {
      handleSendMessage()
    } else if (lowerCommand.includes('clear') || lowerCommand.includes('reset')) {
      setInput('')
    } else if (lowerCommand.includes('help')) {
      addMessage({
        id: Date.now().toString(),
        type: 'system',
        content: 'Available voice commands: "send", "clear", "help"',
        timestamp: new Date()
      })
    }
  }

  return (
    <div className={`ai-chat-container relative mobile-full-height ${className}`}>
      {/* NarratorOrb Background */}
      <NarratorOrbComponent 
        isVisible={true}
        intensity={orbState.intensity}
        audioLevel={orbState.audioLevel}
        className="absolute inset-0"
      />

      {/* Mobile-optimized Chat Interface */}
      <div className="relative z-20 flex flex-col h-full bg-black/20 backdrop-blur-sm rounded-lg border border-cyan-500/30 mobile-safe-area">
        {/* Mobile Header */}
        <div className="mobile-chat-header">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="mobile-button md:hidden bg-console-accent/20 text-console-accent border border-console-accent/30 hover:bg-console-accent/30"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-cyan-400 font-gaming">AI Dungeon Master</h3>
            </div>
          </div>
          
          {/* Desktop Voice Controls */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleVoiceInput}
              className={`mobile-button transition-colors ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleVoiceOutput}
              className={`mobile-button transition-colors ${
                isSpeaking 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Start voice output'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 z-20 bg-console-darker/95 backdrop-blur-sm border-b border-console-border">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-console-text font-console">Voice Controls</span>
                <div className="flex space-x-2">
                  <button
                    onClick={toggleVoiceInput}
                    className={`mobile-button transition-colors ${
                      isListening 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={toggleVoiceOutput}
                    className={`mobile-button transition-colors ${
                      isSpeaking 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {isListening && (
                <div className="text-xs text-cyan-300/70 font-console">
                  Voice commands: "send", "clear", "help"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="mobile-chat-messages">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-console text-sm md:text-base">Start your adventure by typing a message or using voice commands</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${
                    message.type === 'user'
                      ? 'mobile-message-user'
                      : message.type === 'ai'
                      ? 'mobile-message-ai'
                      : 'mobile-message bg-gray-500/20 text-gray-100 border border-gray-500/30'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-console text-sm md:text-base leading-relaxed">
                    {message.content}
                  </p>
                  {message.diceRolls && message.diceRolls.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <p className="text-xs opacity-75 font-console">Dice Rolls:</p>
                      {message.diceRolls.map((roll, index) => (
                        <p key={index} className="text-xs font-console">
                          {roll.type}: {roll.result} {roll.success ? '✅' : '❌'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="mobile-message-ai">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-console text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Mobile-optimized Input */}
        <div className="mobile-chat-input">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice commands..."
              className="mobile-input resize-none"
              rows={2}
              disabled={isTyping}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="mobile-button bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Voice Command Hints - Mobile */}
          {isListening && (
            <div className="mt-2 text-xs text-cyan-300/70 font-console">
              Voice commands: "send", "clear", "help"
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 