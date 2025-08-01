'use client'

import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, Play, Pause, Settings, AlertCircle } from 'lucide-react'
import { useVoiceSynthesis } from '@/lib/hooks/useVoiceSynthesis'

interface VoiceSynthesisProps {
  text?: string
  autoSpeak?: boolean
  onSpeakStart?: () => void
  onSpeakEnd?: () => void
  onError?: (error: string) => void
  className?: string
}

export function VoiceSynthesis({ 
  text,
  autoSpeak = false,
  onSpeakStart,
  onSpeakEnd,
  onError,
  className = ''
}: VoiceSynthesisProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)

  // Voice synthesis hook
  const {
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    error,
    speak,
    stop,
    pause,
    resume,
    speakWithInterrupt,
    updateSettings
  } = useVoiceSynthesis({
    onStart: onSpeakStart,
    onEnd: onSpeakEnd,
    onError: onError
  })

  // Auto-speak when text changes
  useEffect(() => {
    if (autoSpeak && text && isEnabled && isSupported) {
      speakWithInterrupt(text)
    }
  }, [text, autoSpeak, isEnabled, isSupported, speakWithInterrupt])

  // Handle manual speak
  const handleSpeak = () => {
    if (text && isSupported) {
      speakWithInterrupt(text)
    }
  }

  // Handle stop
  const handleStop = () => {
    stop()
  }

  // Handle pause/resume
  const handlePauseResume = () => {
    if (isSpeaking) {
      pause()
    } else {
      resume()
    }
  }

  // Handle settings toggle
  const handleSettingsToggle = () => {
    setShowSettings(!showSettings)
  }

  // Handle voice selection
  const handleVoiceChange = (voiceName: string) => {
    updateSettings({ voice: voiceName })
  }

  // Handle rate change
  const handleRateChange = (newRate: number) => {
    updateSettings({ rate: newRate })
  }

  // Handle pitch change
  const handlePitchChange = (newPitch: number) => {
    updateSettings({ pitch: newPitch })
  }

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    updateSettings({ volume: newVolume })
  }

  if (!isSupported) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 text-console-text-dim">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Voice synthesis not supported</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Voice Toggle Button */}
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isEnabled
            ? 'bg-console-accent text-console-dark'
            : 'bg-console-dark text-console-text hover:bg-console-border'
        }`}
        title={isEnabled ? 'Disable voice output' : 'Enable voice output'}
      >
        {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Play/Pause Button */}
      {text && isEnabled && (
        <button
          onClick={handlePauseResume}
          disabled={!isSupported}
          className="p-2 rounded-lg bg-console-dark text-console-text hover:bg-console-border transition-colors duration-200"
          title={isSpeaking ? 'Pause speech' : 'Resume speech'}
        >
          {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      )}

      {/* Stop Button */}
      {isSpeaking && (
        <button
          onClick={handleStop}
          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200"
          title="Stop speech"
        >
          <div className="w-4 h-4 border-2 border-current rounded-full" />
        </button>
      )}

      {/* Manual Speak Button */}
      {text && isEnabled && !isSpeaking && (
        <button
          onClick={handleSpeak}
          className="p-2 rounded-lg bg-console-dark text-console-text hover:bg-console-border transition-colors duration-200"
          title="Speak text"
        >
          <Play className="w-4 h-4" />
        </button>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center space-x-2 bg-console-accent/20 text-console-accent px-3 py-2 rounded-lg">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm font-medium">Speaking...</span>
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
            {/* Voice Selection */}
            <div>
              <label className="text-xs text-console-text-dim block mb-1">
                Voice
              </label>
              <select 
                value={selectedVoice?.name || ''}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full px-2 py-1 bg-console-dark border border-console-border rounded text-console-text text-sm"
              >
                {voices.map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Rate Control */}
            <div>
              <label className="text-xs text-console-text-dim block mb-1">
                Speed: {rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-console-border rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Pitch Control */}
            <div>
              <label className="text-xs text-console-text-dim block mb-1">
                Pitch: {pitch.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-console-border rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Volume Control */}
            <div>
              <label className="text-xs text-console-text-dim block mb-1">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-console-border rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Auto-speak Toggle */}
            <div>
              <label className="text-xs text-console-text-dim block mb-1">
                Auto-speak AI responses
              </label>
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={() => {/* Toggle auto-speak */}}
                className="rounded border-console-border bg-console-dark text-console-accent focus:ring-console-accent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 