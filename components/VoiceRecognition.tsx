'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react'

interface VoiceRecognitionProps {
  isListening: boolean
  onToggle: (isListening: boolean) => void
  onTranscript: (transcript: string) => void
  onError: (error: string) => void
}

export function VoiceRecognition({ 
  isListening, 
  onToggle, 
  onTranscript, 
  onError 
}: VoiceRecognitionProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      initializeRecognition()
    } else {
      setIsSupported(false)
      onError('Speech recognition is not supported in this browser')
    }
  }, [])

  const initializeRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    recognitionRef.current = new SpeechRecognition()
    const recognition = recognitionRef.current

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      console.log('Voice recognition started')
      setIsProcessing(true)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const fullTranscript = finalTranscript + interimTranscript
      setTranscript(fullTranscript)
      setConfidence(event.results[event.results.length - 1]?.[0]?.confidence || 0)

      if (finalTranscript) {
        onTranscript(finalTranscript.trim())
        setTranscript('')
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsProcessing(false)
      
      switch (event.error) {
        case 'no-speech':
          onError('No speech detected. Please try again.')
          break
        case 'audio-capture':
          onError('Audio capture failed. Please check your microphone.')
          break
        case 'not-allowed':
          onError('Microphone access denied. Please allow microphone access.')
          break
        case 'network':
          onError('Network error. Please check your connection.')
          break
        default:
          onError(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      console.log('Voice recognition ended')
      setIsProcessing(false)
      
      // Restart if still supposed to be listening
      if (isListening) {
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (error) {
              console.error('Failed to restart recognition:', error)
            }
          }
        }, 100)
      }
    }
  }

  const handleToggle = () => {
    if (!isSupported) {
      onError('Speech recognition is not supported')
      return
    }

    const recognition = recognitionRef.current
    if (!recognition) return

    if (isListening) {
      try {
        recognition.stop()
        onToggle(false)
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
    } else {
      try {
        recognition.start()
        onToggle(true)
      } catch (error) {
        console.error('Error starting recognition:', error)
        onError('Failed to start voice recognition')
      }
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2">
        <button
          disabled
          className="console-button flex items-center space-x-2 opacity-50"
          title="Voice recognition not supported"
        >
          <MicOff className="w-4 h-4" />
          <span className="text-xs">Voice</span>
        </button>
        <span className="text-xs text-console-text-dim">Not supported</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleToggle}
        className={`console-button flex items-center space-x-2 ${
          isListening ? 'bg-console-accent text-console-dark' : ''
        }`}
        title={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
      >
        {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        <span className="text-xs">Voice</span>
      </button>

      {/* Status indicators */}
      {isListening && (
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse"></div>
              <span className="text-xs text-console-text-dim">Listening...</span>
            </div>
          )}
          
          {confidence > 0 && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getConfidenceColor(confidence)}`}></div>
              <span className={`text-xs ${getConfidenceColor(confidence)}`}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Live transcript */}
      {transcript && (
        <div className="text-xs text-console-text-dim max-w-xs truncate">
          "{transcript}"
        </div>
      )}
    </div>
  )
} 