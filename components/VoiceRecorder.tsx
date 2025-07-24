'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Square, AlertCircle, Volume2 } from 'lucide-react'

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
    }
  }, [])

  const startRecording = () => {
    if (!isSupported) return

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsRecording(true)
        setError(null)
        setInterimTranscript('')
      }
      
      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
            setConfidence(event.results[i][0].confidence)
          } else {
            interimTranscript += transcript
          }
        }
        
        setInterimTranscript(interimTranscript)
        
        if (finalTranscript) {
          onTranscript(finalTranscript)
          setInterimTranscript('')
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setError(getErrorMessage(event.error))
        setIsRecording(false)
      }
      
      recognition.onend = () => {
        setIsRecording(false)
      }
      
      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      setError('Failed to start voice recognition')
      console.error('Voice recognition error:', err)
    }
  }

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.'
      case 'audio-capture':
        return 'Microphone access denied. Please allow microphone access.'
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.'
      case 'network':
        return 'Network error. Please check your connection.'
      default:
        return `Voice recognition error: ${error}`
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    // The recognition will stop automatically
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-console-darker border-t border-console-border">
        <div className="flex items-center justify-center space-x-2 text-console-text-dim">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Voice input not supported in this browser</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-console-darker border-t border-console-border">
      <div className="space-y-3">
        {/* Error Display */}
        {error && (
          <div className="flex items-center justify-center space-x-2 text-red-400 bg-red-900 bg-opacity-20 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`console-button flex items-center space-x-2 ${
              isRecording ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Voice Input</span>
              </>
            )}
          </button>
          
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-console-text-dim">Listening...</span>
            </div>
          )}
        </div>

        {/* Interim Transcript */}
        {interimTranscript && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Volume2 className="w-4 h-4 text-console-accent" />
              <span className="text-sm text-console-text-dim">Hearing:</span>
            </div>
            <p className="text-sm text-console-text italic">"{interimTranscript}"</p>
          </div>
        )}

        {/* Confidence Indicator */}
        {confidence > 0 && (
          <div className="text-center">
            <div className="flex justify-between text-xs text-console-text-dim mb-1">
              <span>Confidence</span>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
            <div className="w-full bg-console-darker rounded-full h-2">
              <div 
                className="bg-console-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 