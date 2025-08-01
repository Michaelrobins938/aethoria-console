'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface VoiceRecognitionState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error: string | null
  isFinal: boolean
}

interface VoiceRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  maxAlternatives?: number
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

export function useVoiceRecognition(options: VoiceRecognitionOptions = {}) {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0,
    error: null,
    isFinal: false
  })

  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const isSupported = !!SpeechRecognition

    setState(prev => ({ ...prev, isSupported }))

    if (isSupported) {
      recognitionRef.current = new SpeechRecognition()
      const recognition = recognitionRef.current

      // Configure recognition
      recognition.continuous = options.continuous ?? true
      recognition.interimResults = options.interimResults ?? true
      recognition.lang = options.lang ?? 'en-US'
      recognition.maxAlternatives = options.maxAlternatives ?? 1

      // Event handlers
      recognition.onstart = () => {
        setState(prev => ({ 
          ...prev, 
          isListening: true, 
          error: null,
          transcript: '',
          isFinal: false
        }))
        options.onStart?.()
      }

      recognition.onend = () => {
        setState(prev => ({ 
          ...prev, 
          isListening: false,
          isFinal: true
        }))
        options.onEnd?.()
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        let maxConfidence = 0

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript
            maxConfidence = Math.max(maxConfidence, confidence)
          } else {
            interimTranscript += transcript
          }
        }

        const fullTranscript = finalTranscript || interimTranscript
        const isFinal = finalTranscript.length > 0

        setState(prev => ({
          ...prev,
          transcript: fullTranscript,
          confidence: maxConfidence,
          isFinal
        }))

        if (isFinal && options.onResult) {
          options.onResult(finalTranscript, true)
        } else if (options.onResult) {
          options.onResult(fullTranscript, false)
        }
      }

      recognition.onerror = (event: any) => {
        let errorMessage = 'Speech recognition error'
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected'
            break
          case 'audio-capture':
            errorMessage = 'Audio capture failed'
            break
          case 'not-allowed':
            errorMessage = 'Microphone access denied'
            break
          case 'network':
            errorMessage = 'Network error'
            break
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed'
            break
          case 'bad-grammar':
            errorMessage = 'Bad grammar'
            break
          case 'language-not-supported':
            errorMessage = 'Language not supported'
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }

        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isListening: false
        }))
        
        options.onError?.(errorMessage)
      }

      recognition.onnomatch = () => {
        setState(prev => ({ 
          ...prev, 
          error: 'No speech match found',
          isListening: false
        }))
      }
    }
  }, [options.continuous, options.interimResults, options.lang, options.maxAlternatives])

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Speech recognition not supported'
      }))
      return false
    }

    try {
      recognitionRef.current.start()
      return true
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start speech recognition'
      }))
      return false
    }
  }, [state.isSupported])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
      }
    }
  }, [state.isListening])

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [state.isListening, startListening, stopListening])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      transcript: '',
      error: null,
      isFinal: false
    }))
  }, [])

  // Auto-stop after silence
  const startListeningWithTimeout = useCallback((timeoutMs: number = 5000) => {
    const success = startListening()
    
    if (success && timeoutMs > 0) {
      timeoutRef.current = setTimeout(() => {
        stopListening()
      }, timeoutMs)
    }
    
    return success
  }, [startListening, stopListening])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (recognitionRef.current && state.isListening) {
        recognitionRef.current.stop()
      }
    }
  }, [state.isListening])

  return {
    // State
    isListening: state.isListening,
    isSupported: state.isSupported,
    transcript: state.transcript,
    confidence: state.confidence,
    error: state.error,
    isFinal: state.isFinal,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    startListeningWithTimeout,
    
    // Utilities
    hasError: !!state.error,
    isReady: state.isSupported && !state.isListening && !state.error
  }
} 