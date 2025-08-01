'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface VoiceSynthesisState {
  isSpeaking: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  selectedVoice: SpeechSynthesisVoice | null
  rate: number
  pitch: number
  volume: number
  error: string | null
}

interface VoiceSynthesisOptions {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
}

export function useVoiceSynthesis(options: VoiceSynthesisOptions = {}) {
  const [state, setState] = useState<VoiceSynthesisState>({
    isSpeaking: false,
    isSupported: false,
    voices: [],
    selectedVoice: null,
    rate: options.rate ?? 1,
    pitch: options.pitch ?? 1,
    volume: options.volume ?? 1,
    error: null
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    const synthesis = window.speechSynthesis
    const isSupported = !!synthesis

    setState(prev => ({ ...prev, isSupported }))

    if (isSupported) {
      synthesisRef.current = synthesis

      // Load available voices
      const loadVoices = () => {
        const voices = synthesis.getVoices()
        const englishVoices = voices.filter(voice => 
          voice.lang.startsWith('en') || voice.lang.startsWith('en-')
        )
        
        setState(prev => ({ 
          ...prev, 
          voices: englishVoices,
          selectedVoice: englishVoices.find(v => v.name === options.voice) || englishVoices[0] || null
        }))
      }

      // Load voices when available
      if (synthesis.onvoiceschanged !== undefined) {
        synthesis.onvoiceschanged = loadVoices
      }

      // Try to load voices immediately
      loadVoices()
    }
  }, [options.voice])

  // Speak text
  const speak = useCallback((text: string, speakOptions?: {
    voice?: string
    rate?: number
    pitch?: number
    volume?: number
  }) => {
    if (!synthesisRef.current || !state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Speech synthesis not supported'
      }))
      return false
    }

    try {
      // Cancel any ongoing speech
      synthesisRef.current.cancel()

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Configure utterance
      const voice = speakOptions?.voice 
        ? state.voices.find(v => v.name === speakOptions.voice)
        : state.selectedVoice
      
      if (voice) {
        utterance.voice = voice
      }

      utterance.rate = speakOptions?.rate ?? state.rate
      utterance.pitch = speakOptions?.pitch ?? state.pitch
      utterance.volume = speakOptions?.volume ?? state.volume

      // Event handlers
      utterance.onstart = () => {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: true,
          error: null
        }))
        options.onStart?.()
      }

      utterance.onend = () => {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: false
        }))
        options.onEnd?.()
      }

      utterance.onerror = (event) => {
        let errorMessage = 'Speech synthesis error'
        
        switch (event.error) {
          case 'canceled':
            errorMessage = 'Speech synthesis canceled'
            break
          case 'interrupted':
            errorMessage = 'Speech synthesis interrupted'
            break
          case 'audio-busy':
            errorMessage = 'Audio system busy'
            break
          case 'audio-hardware':
            errorMessage = 'Audio hardware error'
            break
          case 'network':
            errorMessage = 'Network error'
            break
          case 'synthesis-unavailable':
            errorMessage = 'Speech synthesis unavailable'
            break
          case 'synthesis-failed':
            errorMessage = 'Speech synthesis failed'
            break
          case 'text-too-long':
            errorMessage = 'Text too long for synthesis'
            break
          case 'invalid-argument':
            errorMessage = 'Invalid argument'
            break
          case 'not-allowed':
            errorMessage = 'Speech synthesis not allowed'
            break
          default:
            errorMessage = `Speech synthesis error: ${event.error}`
        }

        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isSpeaking: false
        }))
        
        options.onError?.(errorMessage)
      }

      // Start speaking
      synthesisRef.current.speak(utterance)
      return true

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start speech synthesis'
      }))
      return false
    }
  }, [state.isSupported, state.voices, state.selectedVoice, state.rate, state.pitch, state.volume, options])

  // Stop speaking
  const stop = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false
      }))
    }
  }, [])

  // Pause speaking
  const pause = useCallback(() => {
    if (synthesisRef.current && state.isSpeaking) {
      synthesisRef.current.pause()
    }
  }, [state.isSpeaking])

  // Resume speaking
  const resume = useCallback(() => {
    if (synthesisRef.current && state.isSpeaking) {
      synthesisRef.current.resume()
    }
  }, [state.isSpeaking])

  // Update voice settings
  const updateSettings = useCallback((settings: {
    voice?: string
    rate?: number
    pitch?: number
    volume?: number
  }) => {
    setState(prev => ({
      ...prev,
      selectedVoice: settings.voice 
        ? prev.voices.find(v => v.name === settings.voice) || prev.selectedVoice
        : prev.selectedVoice,
      rate: settings.rate ?? prev.rate,
      pitch: settings.pitch ?? prev.pitch,
      volume: settings.volume ?? prev.volume
    }))
  }, [])

  // Get available voices
  const getVoices = useCallback(() => {
    return state.voices
  }, [state.voices])

  // Check if voice is available
  const isVoiceAvailable = useCallback((voiceName: string) => {
    return state.voices.some(voice => voice.name === voiceName)
  }, [state.voices])

  // Speak with auto-stop on new speech
  const speakWithInterrupt = useCallback((text: string, speakOptions?: {
    voice?: string
    rate?: number
    pitch?: number
    volume?: number
  }) => {
    // Stop any ongoing speech first
    stop()
    
    // Small delay to ensure previous speech is stopped
    setTimeout(() => {
      speak(text, speakOptions)
    }, 100)
  }, [speak, stop])

  // Cleanup
  useEffect(() => {
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
    }
  }, [])

  return {
    // State
    isSpeaking: state.isSpeaking,
    isSupported: state.isSupported,
    voices: state.voices,
    selectedVoice: state.selectedVoice,
    rate: state.rate,
    pitch: state.pitch,
    volume: state.volume,
    error: state.error,
    
    // Actions
    speak,
    stop,
    pause,
    resume,
    speakWithInterrupt,
    updateSettings,
    
    // Utilities
    getVoices,
    isVoiceAvailable,
    hasError: !!state.error,
    isReady: state.isSupported && !state.isSpeaking && !state.error
  }
} 