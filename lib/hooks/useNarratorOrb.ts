import { useState, useEffect, useCallback } from 'react'
import { useGameStore } from '@/lib/store'

interface NarratorOrbState {
  intensity: number
  audioLevel: number
  isActive: boolean
  isThinking: boolean
  isSpeaking: boolean
  isListening: boolean
}

export function useNarratorOrb() {
  const [orbState, setOrbState] = useState<NarratorOrbState>({
    intensity: 1.0,
    audioLevel: 0.2,
    isActive: false,
    isThinking: false,
    isSpeaking: false,
    isListening: false
  })

  const { 
    isTyping, 
    voiceState, 
    audioSettings,
    messages 
  } = useGameStore()

  // Update orb state based on game state
  useEffect(() => {
    setOrbState(prev => ({
      ...prev,
      isThinking: isTyping,
      isListening: voiceState.isListening,
      isSpeaking: audioSettings.voiceOutputEnabled && messages.some(m => m.type === 'ai')
    }))
  }, [isTyping, voiceState.isListening, audioSettings.voiceOutputEnabled, messages])

  // Calculate intensity based on current state
  useEffect(() => {
    let intensity = 1.0
    let audioLevel = 0.2

    if (orbState.isThinking) {
      intensity = 1.5
      audioLevel = 0.4
    } else if (orbState.isListening) {
      intensity = 1.3
      audioLevel = 0.6
    } else if (orbState.isSpeaking) {
      intensity = 1.2
      audioLevel = 0.5
    } else if (orbState.isActive) {
      intensity = 1.1
      audioLevel = 0.3
    }

    setOrbState(prev => ({
      ...prev,
      intensity,
      audioLevel
    }))
  }, [orbState.isThinking, orbState.isListening, orbState.isSpeaking, orbState.isActive])

  // React to message activity
  const handleMessageActivity = useCallback(() => {
    setOrbState(prev => ({
      ...prev,
      isActive: true
    }))

    // Reset active state after a delay
    setTimeout(() => {
      setOrbState(prev => ({
        ...prev,
        isActive: false
      }))
    }, 2000)
  }, [])

  // React to voice activity
  const handleVoiceActivity = useCallback((level: number) => {
    setOrbState(prev => ({
      ...prev,
      audioLevel: Math.max(level, 0.1)
    }))
  }, [])

  // React to AI thinking
  const handleAIThinking = useCallback(() => {
    setOrbState(prev => ({
      ...prev,
      isThinking: true,
      intensity: 1.8,
      audioLevel: 0.8
    }))
  }, [])

  // React to AI response
  const handleAIResponse = useCallback(() => {
    setOrbState(prev => ({
      ...prev,
      isThinking: false,
      intensity: 1.2,
      audioLevel: 0.4
    }))

    // Gradually return to normal state
    setTimeout(() => {
      setOrbState(prev => ({
        ...prev,
        intensity: 1.0,
        audioLevel: 0.2
      }))
    }, 1000)
  }, [])

  return {
    orbState,
    handleMessageActivity,
    handleVoiceActivity,
    handleAIThinking,
    handleAIResponse
  }
} 