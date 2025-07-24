'use client'

import { useState } from 'react'
import { Settings, Volume2, Mic, MicOff } from 'lucide-react'

export function Header() {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <header className="bg-console-darker border-b border-console-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-console-accent rounded-full animate-pulse"></div>
            <span className="text-console-accent font-gaming text-sm">ONLINE</span>
          </div>
          
          <div className="text-console-text-dim text-sm">
            AI Status: <span className="text-console-accent">READY</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`console-button flex items-center space-x-2 ${
              isVoiceEnabled ? 'bg-console-accent text-console-dark' : ''
            }`}
          >
            {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span className="text-xs">Voice</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="console-button"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="mt-4 p-4 bg-console-dark border border-console-border rounded-lg">
          <h3 className="text-console-accent font-gaming mb-3">Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-console-text">Voice Input</span>
              <input
                type="checkbox"
                checked={isVoiceEnabled}
                onChange={(e) => setIsVoiceEnabled(e.target.checked)}
                className="w-4 h-4 text-console-accent bg-console-darker border-console-border rounded focus:ring-console-accent"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-console-text">Voice Output</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-console-accent bg-console-darker border-console-border rounded focus:ring-console-accent"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 