'use client'

import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Settings, AlertCircle, CheckCircle } from 'lucide-react'
import { useVoiceRecognition } from '@/lib/hooks/useVoiceRecognition'
import { useVoiceCommands } from '@/lib/hooks/useVoiceCommands'

interface VoiceRecognitionProps {
  onTranscript?: (transcript: string, isFinal: boolean) => void
  onCommand?: (command: string, params: string[]) => void
  autoSend?: boolean
  timeout?: number
  className?: string
}

export function VoiceRecognition({ 
  onTranscript, 
  onCommand,
  autoSend = true,
  timeout = 5000,
  className = ''
}: VoiceRecognitionProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Voice recognition hook
  const {
    isListening,
    isSupported,
    transcript,
    confidence,
    error,
    isFinal,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    startListeningWithTimeout
  } = useVoiceRecognition({
    onResult: (transcript, isFinal) => {
      onTranscript?.(transcript, isFinal)
      
      if (isFinal && autoSend) {
        setIsProcessing(true)
        // Auto-send the transcript
        setTimeout(() => {
          setIsProcessing(false)
        }, 1000)
      }
    },
    onError: (error) => {
      console.error('Voice recognition error:', error)
    }
  })

  // Voice commands hook
  const {
    processTranscript,
    lastResult,
    clearLastResult
  } = useVoiceCommands({
    onCommandExecuted: (result) => {
      onCommand?.(result.command, result.params)
    },
    onCommandNotFound: (transcript) => {
      // If no command found, treat as regular message
      onTranscript?.(transcript, true)
    }
  })

  // Process transcript for commands when it's final
  useEffect(() => {
    if (isFinal && transcript) {
      processTranscript(transcript, confidence)
    }
  }, [isFinal, transcript, confidence, processTranscript])

  // Auto-clear command result after 3 seconds
  useEffect(() => {
    if (lastResult) {
      const timer = setTimeout(() => {
        clearLastResult()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [lastResult, clearLastResult])

  // Handle voice button click
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListeningWithTimeout(timeout)
    }
  }

  // Handle settings toggle
  const handleSettingsToggle = () => {
    setShowSettings(!showSettings)
  }

  if (!isSupported) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 text-console-text-dim">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Voice not supported</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Voice Toggle Button */}
      <button
        onClick={handleVoiceToggle}
        disabled={isProcessing}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : isProcessing
            ? 'bg-console-accent/50 text-console-dark cursor-not-allowed'
            : 'bg-console-dark text-console-text hover:bg-console-border'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <Mic className="w-4 h-4" />
        ) : isProcessing ? (
          <div className="w-4 h-4 border-2 border-console-dark border-t-transparent rounded-full animate-spin" />
        ) : (
          <MicOff className="w-4 h-4" />
        )}
      </button>

      {/* Transcript Display */}
      {transcript && (
        <div className="flex-1 min-w-0">
          <div className="bg-console-darker border border-console-border rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-console-text truncate">
                {transcript}
              </span>
              {isFinal && (
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 ml-2" />
              )}
            </div>
            {confidence > 0 && (
              <div className="mt-1">
                <div className="w-full bg-console-border rounded-full h-1">
                  <div 
                    className="bg-console-accent h-1 rounded-full transition-all duration-200"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-console-text-dim">
                  Confidence: {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Command Result */}
      {lastResult && (
        <div className="flex items-center space-x-2 bg-console-accent/20 text-console-accent px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {lastResult.command}
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 bg-red-900/20 text-red-400 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={handleSettingsToggle}
        className="p-2 rounded-lg bg-console-dark text-console-text hover:bg-console-border transition-colors duration-200"
        title="Voice settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-full right-0 mb-2 bg-console-darker border border-console-border rounded-lg p-4 shadow-lg min-w-64">
          <h3 className="text-sm font-medium text-console-accent mb-3">Voice Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-console-text-dim block mb-1">
                Auto-send messages
              </label>
              <input
                type="checkbox"
                checked={autoSend}
                onChange={() => {/* Toggle auto-send */}}
                className="rounded border-console-border bg-console-dark text-console-accent focus:ring-console-accent"
              />
            </div>
            
            <div>
              <label className="text-xs text-console-text-dim block mb-1">
                Timeout (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={timeout / 1000}
                onChange={(e) => {/* Update timeout */}}
                className="w-full px-2 py-1 bg-console-dark border border-console-border rounded text-console-text text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs text-console-text-dim block mb-1">
                Language
              </label>
              <select className="w-full px-2 py-1 bg-console-dark border border-console-border rounded text-console-text text-sm">
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 