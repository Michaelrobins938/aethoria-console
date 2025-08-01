'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Send, Dice1, Sword, Shield, Map, Package, BookOpen, User, Settings, Mic, MicOff, Volume2, VolumeX, MoreVertical, Copy, Check } from "lucide-react";
import { Character, GamePrompt } from "@/lib/types";

import { AttachmentProvider } from "./attachment-provider";
import {
  ComposerAttachments,
  ComposerAddAttachment,
  UserMessageAttachments,
} from "@/components/attachment";
import { ComposerPrimitive, MessagePrimitive } from "@assistant-ui/react";
// import { NarratorOrbComponent } from '../NarratorOrb'
// import { useNarratorOrb } from '@/lib/hooks/useNarratorOrb'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ChatContainer } from '@/components/ChatContainer'
import { VoiceRecognition } from '@/components/VoiceRecognition'
import { VoiceSynthesis } from '@/components/VoiceSynthesis'

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

interface ThreadWithOrbProps {
  onSendMessage?: (content: string) => Promise<void>;
  messages?: Message[];
  isTyping?: boolean;
  isLoading?: boolean;
}

export function ThreadWithOrb({ 
  onSendMessage, 
  messages = [], 
  isTyping = false, 
  isLoading = false 
}: ThreadWithOrbProps) {
  // const { orbState } = useNarratorOrb()
  const [input, setInput] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Get the latest AI message for voice synthesis
  const latestAIMessage = useMemo(() => {
    const aiMessages = messages.filter(m => m.type === 'ai')
    return aiMessages[aiMessages.length - 1]?.content || ''
  }, [messages])

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isTyping || isLoading) return

    const content = input.trim()
    setInput('')

    if (onSendMessage) {
      try {
        await onSendMessage(content)
        // Focus input after sending
        inputRef.current?.focus()
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    }
  }, [input, isTyping, isLoading, onSendMessage])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const toggleVoiceInput = useCallback(() => {
    setVoiceEnabled(!voiceEnabled)
  }, [voiceEnabled])

  const toggleVoiceOutput = useCallback(() => {
    setVoiceOutputEnabled(!voiceOutputEnabled)
  }, [voiceOutputEnabled])

  const handleScrollToBottom = useCallback(() => {
    // Optional: Add any additional logic when scrolling to bottom
    console.log('Scrolled to bottom')
  }, [])

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string, isFinal: boolean) => {
    if (isFinal && transcript.trim()) {
      setInput(transcript.trim())
      // Auto-send the voice input
      setTimeout(() => {
        if (onSendMessage) {
          onSendMessage(transcript.trim())
        }
      }, 500)
    }
  }, [onSendMessage])

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string, params: string[]) => {
    console.log('Voice command executed:', command, params)
    // Here you can integrate with game systems
    // For example: dice rolling, inventory, combat, etc.
  }, [])

  return (
    <AttachmentProvider>
      <div className="flex flex-col h-full bg-console-dark">
        {/* Chat Container with Bubbles */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner text="Loading messages..." />
            </div>
          ) : (
            <ChatContainer
              messages={messages}
              isTyping={isTyping}
              onScrollToBottom={handleScrollToBottom}
              className="h-full"
            />
          )}
        </div>

        {/* Voice Synthesis for AI Messages */}
        {voiceOutputEnabled && latestAIMessage && (
          <div className="px-4 py-2 border-t border-console-border bg-console-darker">
            <VoiceSynthesis
              text={latestAIMessage}
              autoSpeak={autoSpeak}
              onSpeakStart={() => console.log('AI speaking started')}
              onSpeakEnd={() => console.log('AI speaking ended')}
              onError={(error) => console.error('Voice synthesis error:', error)}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-console-border bg-console-darker">
          <div className="max-w-4xl mx-auto p-4">
            <ComposerPrimitive.Root className="space-y-3">
              {/* Attachments Display */}
              <ComposerAttachments />
              
              {/* Voice Recognition */}
              {voiceEnabled && (
                <div className="mb-3">
                  <VoiceRecognition
                    onTranscript={handleVoiceTranscript}
                    onCommand={handleVoiceCommand}
                    autoSend={true}
                    timeout={5000}
                  />
                </div>
              )}
              
              {/* Input and Controls */}
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <ComposerPrimitive.Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message Aethoria..."
                    className="w-full bg-console-dark border border-console-border rounded-lg px-4 py-3 text-console-text font-console placeholder-console-text-dim focus:outline-none focus:border-console-accent focus:ring-1 focus:ring-console-accent resize-none"
                    disabled={isTyping || isLoading}
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <ComposerAddAttachment />
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isTyping || isLoading || !input.trim()}
                      className="p-2 bg-console-accent hover:bg-console-accent-dark disabled:bg-console-border disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 text-console-dark" />
                    </button>
                  </div>
                </div>
                
                {/* Voice Controls */}
                <div className="flex items-center space-x-2">
                  {/* Voice Input Toggle */}
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      voiceEnabled 
                        ? 'bg-console-accent text-console-dark' 
                        : 'bg-console-dark text-console-text hover:bg-console-border'
                    }`}
                    title={voiceEnabled ? 'Disable Voice Input' : 'Enable Voice Input'}
                  >
                    {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  {/* Voice Output Toggle */}
                  <button
                    onClick={toggleVoiceOutput}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      voiceOutputEnabled 
                        ? 'bg-console-accent text-console-dark' 
                        : 'bg-console-dark text-console-text hover:bg-console-border'
                    }`}
                    title={voiceOutputEnabled ? 'Disable Voice Output' : 'Enable Voice Output'}
                  >
                    {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* Auto-speak Toggle */}
                  {voiceOutputEnabled && (
                    <button
                      onClick={() => setAutoSpeak(!autoSpeak)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        autoSpeak 
                          ? 'bg-console-accent text-console-dark' 
                          : 'bg-console-dark text-console-text hover:bg-console-border'
                      }`}
                      title={autoSpeak ? 'Disable Auto-speak' : 'Enable Auto-speak'}
                    >
                      <div className={`w-4 h-4 border-2 border-current rounded-full ${autoSpeak ? 'bg-current' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Help Text */}
              <div className="text-xs text-console-text-dim text-center">
                Press Enter to send, Shift+Enter for new line
                {voiceEnabled && <span className="ml-2">• Voice input enabled</span>}
                {voiceOutputEnabled && <span className="ml-2">• Voice output enabled</span>}
              </div>
            </ComposerPrimitive.Root>
          </div>
        </div>

        {/* Game Tools - Temporarily Disabled for Debugging */}
        {/* <DiceRollToolUI />
        <CharacterStatsToolUI />
        <CombatToolUI />
        <InventoryToolUI />
        <QuestToolUI />
        <MapToolUI /> */}
      </div>
    </AttachmentProvider>
  );
} 