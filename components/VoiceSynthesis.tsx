'use client'

import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, Settings } from 'lucide-react'

interface VoiceSynthesisProps {
  text: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function VoiceSynthesis({ text, enabled, onToggle }: VoiceSynthesisProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      setIsSupported(true)
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
        
        // Set default voice (prefer English)
        const englishVoice = availableVoices.find(v => 
          v.lang.startsWith('en') && v.name.includes('Google')
        ) || availableVoices[0]
        
        setVoice(englishVoice || null)
      }

      // Load voices when they become available
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices
      }
      
      loadVoices()
    }
  }, [])

  const speak = (textToSpeak: string) => {
    if (!isSupported || !enabled || !voice) return

    // Stop any current speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.voice = voice
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 0.8

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthesis.speak(utterance)
  }

  const stop = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  // Auto-speak when text changes and synthesis is enabled
  useEffect(() => {
    if (enabled && text && !isSpeaking) {
      speak(text)
    }
  }, [text, enabled, isSpeaking])

  if (!isSupported) {
    return (
      <div className="text-sm text-console-text-dim">
        Voice synthesis not supported in this browser
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onToggle(!enabled)}
        className={`console-button flex items-center space-x-2 ${
          enabled ? 'bg-console-accent text-console-dark' : ''
        }`}
      >
        {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        <span className="text-xs">Voice</span>
      </button>

      {enabled && isSpeaking && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse"></div>
          <span className="text-xs text-console-text-dim">Speaking...</span>
        </div>
      )}

      {enabled && voice && (
        <div className="text-xs text-console-text-dim">
          {voice.name}
        </div>
      )}
    </div>
  )
} 