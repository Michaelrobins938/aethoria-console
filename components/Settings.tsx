'use client'

import React, { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Monitor, 
  Palette,
  Keyboard,
  Gamepad2,
  X,
  Save,
  RotateCcw,
  Info,
  HelpCircle,
  Heart
} from 'lucide-react'
import { useGameStore } from '@/lib/store'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

type SettingsTab = 'audio' | 'display' | 'controls' | 'gameplay' | 'system'

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { audioSettings, voiceState, setAudioSettings, setVoiceState } = useGameStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('audio')
  const [settings, setSettings] = useState({
    // Audio Settings
    masterVolume: 80,
    voiceVolume: 70,
    musicVolume: 50,
    sfxVolume: 60,
    voiceOutputEnabled: audioSettings.voiceOutputEnabled,
    voiceInputEnabled: voiceState.isListening,
    
    // Display Settings
    theme: 'console-dark',
    fontSize: 'medium',
    animations: true,
    particleEffects: true,
    showHealthBars: true,
    showDamageNumbers: true,
    
    // Control Settings
    keyboardLayout: 'qwerty',
    mouseSensitivity: 50,
    invertY: false,
    autoSave: true,
    autoSaveInterval: 5,
    
    // Gameplay Settings
    difficulty: 'normal',
    autoRoll: false,
    showDiceResults: true,
    confirmActions: true,
    tutorialEnabled: true,
    
    // System Settings
    language: 'en',
    region: 'us',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  })

  const tabs = [
    { id: 'audio', label: 'Audio', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'display', label: 'Display', icon: <Monitor className="w-4 h-4" /> },
    { id: 'controls', label: 'Controls', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'gameplay', label: 'Gameplay', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <SettingsIcon className="w-4 h-4" /> }
  ]

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    
    // Update store for immediate settings
    if (key === 'voiceOutputEnabled') {
      setAudioSettings({ voiceOutputEnabled: value })
    }
    if (key === 'voiceInputEnabled') {
      setVoiceState({ isListening: value })
    }
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('aethoria_settings', JSON.stringify(settings))
    console.log('Settings saved')
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        masterVolume: 80,
        voiceVolume: 70,
        musicVolume: 50,
        sfxVolume: 60,
        voiceOutputEnabled: true,
        voiceInputEnabled: false,
        theme: 'console-dark',
        fontSize: 'medium',
        animations: true,
        particleEffects: true,
        showHealthBars: true,
        showDamageNumbers: true,
        keyboardLayout: 'qwerty',
        mouseSensitivity: 50,
        invertY: false,
        autoSave: true,
        autoSaveInterval: 5,
        difficulty: 'normal',
        autoRoll: false,
        showDiceResults: true,
        confirmActions: true,
        tutorialEnabled: true,
        language: 'en',
        region: 'us',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      })
    }
  }

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return <VolumeX className="w-4 h-4" />
    if (volume < 30) return <Volume2 className="w-4 h-4" />
    if (volume < 70) return <Volume2 className="w-4 h-4" />
    return <Volume2 className="w-4 h-4" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <SettingsIcon className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Settings</h2>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`console-button flex items-center space-x-2 ${
                activeTab === tab.id ? 'bg-console-accent text-console-dark' : ''
              }`}
            >
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-h-[500px] overflow-y-auto">
          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Audio Settings</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-console-accent">Master Volume</label>
                      <div className="flex items-center space-x-2">
                        {getVolumeIcon(settings.masterVolume)}
                        <span className="text-sm">{settings.masterVolume}%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.masterVolume}
                      onChange={(e) => handleSettingChange('masterVolume', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-console-accent">Voice Volume</label>
                      <div className="flex items-center space-x-2">
                        {getVolumeIcon(settings.voiceVolume)}
                        <span className="text-sm">{settings.voiceVolume}%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.voiceVolume}
                      onChange={(e) => handleSettingChange('voiceVolume', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-console-accent">Music Volume</label>
                      <div className="flex items-center space-x-2">
                        {getVolumeIcon(settings.musicVolume)}
                        <span className="text-sm">{settings.musicVolume}%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.musicVolume}
                      onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-console-accent">SFX Volume</label>
                      <div className="flex items-center space-x-2">
                        {getVolumeIcon(settings.sfxVolume)}
                        <span className="text-sm">{settings.sfxVolume}%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.sfxVolume}
                      onChange={(e) => handleSettingChange('sfxVolume', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mic className="w-4 h-4" />
                      <label className="text-console-accent">Voice Output</label>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.voiceOutputEnabled}
                      onChange={(e) => handleSettingChange('voiceOutputEnabled', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MicOff className="w-4 h-4" />
                      <label className="text-console-accent">Voice Input</label>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.voiceInputEnabled}
                      onChange={(e) => handleSettingChange('voiceInputEnabled', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Display Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-console-accent block mb-2">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className="console-input"
                    >
                      <option value="console-dark">Console Dark</option>
                      <option value="console-light">Console Light</option>
                      <option value="retro">Retro</option>
                      <option value="modern">Modern</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-console-accent block mb-2">Font Size</label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                      className="console-input"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4" />
                      <label className="text-console-accent">Animations</label>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.animations}
                      onChange={(e) => handleSettingChange('animations', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4" />
                      <label className="text-console-accent">Particle Effects</label>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.particleEffects}
                      onChange={(e) => handleSettingChange('particleEffects', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <label className="text-console-accent">Show Health Bars</label>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showHealthBars}
                      onChange={(e) => handleSettingChange('showHealthBars', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4" />
                      <label className="text-console-accent">Show Damage Numbers</label>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.showDamageNumbers}
                      onChange={(e) => handleSettingChange('showDamageNumbers', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Control Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-console-accent block mb-2">Keyboard Layout</label>
                    <select
                      value={settings.keyboardLayout}
                      onChange={(e) => handleSettingChange('keyboardLayout', e.target.value)}
                      className="console-input"
                    >
                      <option value="qwerty">QWERTY</option>
                      <option value="azerty">AZERTY</option>
                      <option value="dvorak">Dvorak</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-console-accent">Mouse Sensitivity</label>
                      <span className="text-sm">{settings.mouseSensitivity}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={settings.mouseSensitivity}
                      onChange={(e) => handleSettingChange('mouseSensitivity', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-console-accent">Invert Y Axis</label>
                    <input
                      type="checkbox"
                      checked={settings.invertY}
                      onChange={(e) => handleSettingChange('invertY', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-console-accent">Auto Save</label>
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  {settings.autoSave && (
                    <div>
                      <label className="text-console-accent block mb-2">Auto Save Interval (minutes)</label>
                      <select
                        value={settings.autoSaveInterval}
                        onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                        className="console-input"
                      >
                        <option value={1}>1 minute</option>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={30}>30 minutes</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gameplay' && (
            <div className="space-y-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Gameplay Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-console-accent block mb-2">Difficulty</label>
                    <select
                      value={settings.difficulty}
                      onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                      className="console-input"
                    >
                      <option value="easy">Easy</option>
                      <option value="normal">Normal</option>
                      <option value="hard">Hard</option>
                      <option value="nightmare">Nightmare</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-console-accent">Auto Roll Dice</label>
                    <input
                      type="checkbox"
                      checked={settings.autoRoll}
                      onChange={(e) => handleSettingChange('autoRoll', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-console-accent">Show Dice Results</label>
                    <input
                      type="checkbox"
                      checked={settings.showDiceResults}
                      onChange={(e) => handleSettingChange('showDiceResults', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-console-accent">Confirm Actions</label>
                    <input
                      type="checkbox"
                      checked={settings.confirmActions}
                      onChange={(e) => handleSettingChange('confirmActions', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-console-accent">Tutorial Enabled</label>
                    <input
                      type="checkbox"
                      checked={settings.tutorialEnabled}
                      onChange={(e) => handleSettingChange('tutorialEnabled', e.target.checked)}
                      className="console-checkbox"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">System Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-console-accent block mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="console-input"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-console-accent block mb-2">Region</label>
                    <select
                      value={settings.region}
                      onChange={(e) => handleSettingChange('region', e.target.value)}
                      className="console-input"
                    >
                      <option value="us">United States</option>
                      <option value="eu">Europe</option>
                      <option value="asia">Asia</option>
                      <option value="global">Global</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-console-accent block mb-2">Date Format</label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                      className="console-input"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-console-accent block mb-2">Time Format</label>
                    <select
                      value={settings.timeFormat}
                      onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                      className="console-input"
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-console-border">
          <button
            onClick={handleResetSettings}
            className="console-button flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="console-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="console-button-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 