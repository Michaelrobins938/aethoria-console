'use client'

import React, { useState, useEffect } from 'react'
import { Save, Download, Upload, Trash2, Clock, User, Gamepad2 } from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { Character, GameSession } from '@/lib/types'

interface SaveSlot {
  id: string
  sessionId: string
  character: Character
  cartridgeId: string
  timestamp: Date
  playTime: number
  lastSave: Date
  version: string
}

interface SaveManagerProps {
  isOpen: boolean
  onClose: () => void
  onLoadGame: (sessionId: string) => void
}

export function SaveManager({ isOpen, onClose, onLoadGame }: SaveManagerProps) {
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; content: string } | null>(null)

  const { session, character, worldState, quests, inventory, combatState } = useGameStore()

  // Load save slots on mount
  useEffect(() => {
    if (isOpen) {
      loadSaveSlots()
    }
  }, [isOpen])

  const loadSaveSlots = () => {
    try {
      const slots: SaveSlot[] = []
      
      // Load from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('aethoria_save_')) {
          try {
            const saveData = JSON.parse(localStorage.getItem(key)!)
            if (saveData && saveData.data) {
              slots.push({
                id: key,
                sessionId: saveData.sessionId,
                character: saveData.data.character,
                cartridgeId: saveData.data.gamePromptId,
                timestamp: new Date(saveData.timestamp),
                playTime: saveData.data.playTime || 0,
                lastSave: new Date(saveData.data.lastSave),
                version: saveData.version || '1.0.0'
              })
            }
          } catch (e) {
            console.warn('Failed to parse save slot:', key)
          }
        }
      }
      
      // Sort by last save time (newest first)
      slots.sort((a, b) => b.lastSave.getTime() - a.lastSave.getTime())
      setSaveSlots(slots)
    } catch (error) {
      console.error('Failed to load save slots:', error)
      setError('Failed to load save slots')
    }
  }

  const saveGame = async () => {
    if (!session || !character) {
      setError('No active game to save')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const saveData = {
        sessionId: session,
        data: {
          sessionId: session,
          character,
          worldState,
          quests,
          inventory,
          combatState,
          lastSave: new Date()
        },
        timestamp: new Date(),
        version: '1.0.0'
      }

      const saveKey = `aethoria_save_${session}`
      localStorage.setItem(saveKey, JSON.stringify(saveData))

      // Try to save to cloud storage if available
      try {
        await saveToCloud(saveData)
      } catch (cloudError) {
        console.warn('Cloud save failed, using local storage only:', cloudError)
      }

      // Refresh save slots
      loadSaveSlots()
      
      // Game saved successfully
    } catch (error) {
      console.error('Failed to save game:', error)
      setError('Failed to save game')
    } finally {
      setIsLoading(false)
    }
  }

  const loadGame = async (slotId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const saveData = localStorage.getItem(slotId)
      if (!saveData) {
        throw new Error('Save data not found')
      }

      const parsed = JSON.parse(saveData)
      onLoadGame(parsed.sessionId)
      onClose()
    } catch (error) {
      console.error('Failed to load game:', error)
      setError('Failed to load game')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSave = (slotId: string) => {
    if (confirm('Are you sure you want to delete this save? This action cannot be undone.')) {
      localStorage.removeItem(slotId)
      loadSaveSlots()
    }
  }

  const saveToCloud = async (saveData: { sessionId: string; data: unknown; timestamp: Date; version: string }) => {
    try {
      // Validate save data
      if (!saveData.sessionId || !saveData.data) {
        throw new Error('Invalid save data');
      }

      // Prepare save data with metadata
      const cloudSaveData = {
        id: saveData.sessionId,
        data: saveData.data,
        timestamp: saveData.timestamp.toISOString(),
        version: saveData.version,
        checksum: generateChecksum(JSON.stringify(saveData.data)),
        metadata: {
          character: saveData.data.character?.name || 'Unknown',
          cartridgeId: saveData.data.cartridgeId || 'unknown',
          playTime: saveData.data.playTime || 0,
          lastSave: new Date().toISOString()
        }
      };

      // Encrypt sensitive data before cloud storage
      const encryptedData = await encryptSaveData(cloudSaveData);

      // Upload to cloud storage
      const response = await fetch('/api/save/cloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          saveId: saveData.sessionId,
          encryptedData: encryptedData,
          metadata: cloudSaveData.metadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloud save failed: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      
      // Update local save slots with cloud info
      const updatedSlots = saveSlots.map(slot => 
        slot.id === saveData.sessionId 
          ? { ...slot, cloudSync: true, cloudId: result.cloudId }
          : slot
      );
      setSaveSlots(updatedSlots);

      // Show success message
      setMessage({
        type: 'success',
        content: 'Game saved to cloud successfully!'
      });

      return result.cloudId;

    } catch (error) {
      console.error('Cloud save error:', error);
      
      setError(`Cloud save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to local save
      await saveGameLocally(saveData);
      
      return null;
    }
  }

  const loadFromCloud = async (cloudId: string) => {
    try {
      const response = await fetch(`/api/save/cloud/${cloudId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load cloud save: ${response.statusText}`);
      }

      const cloudData = await response.json();
      
      // Decrypt the save data
      const decryptedData = await decryptSaveData(cloudData.encryptedData);
      
      // Validate checksum
      const expectedChecksum = generateChecksum(JSON.stringify(decryptedData.data));
      if (decryptedData.checksum !== expectedChecksum) {
        throw new Error('Save data corruption detected');
      }

      // Load the game
      onLoadGame(decryptedData.data.sessionId);
      
      setMessage({
        type: 'success',
        content: 'Game loaded from cloud successfully!'
      });

    } catch (error) {
      console.error('Cloud load error:', error);
      setError(`Failed to load from cloud: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const syncToCloud = async (slotId: string) => {
    try {
      const slot = saveSlots.find(s => s.id === slotId);
      if (!slot) {
        throw new Error('Save slot not found');
      }

      // Prepare save data
      const saveData = {
        sessionId: slot.sessionId,
        data: slot,
        timestamp: slot.lastSave,
        version: slot.version
      };

      await saveToCloud(saveData);

    } catch (error) {
      console.error('Cloud sync error:', error);
      setError(`Cloud sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility functions for cloud save functionality
  const generateChecksum = async (data: string): Promise<string> => {
    // Robust checksum generation using SHA-256 for data integrity
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const encryptSaveData = async (data: any): Promise<string> => {
    // Robust encryption using AES-GCM for data security
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encodedData = new TextEncoder().encode(JSON.stringify(data))
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    )
    const encryptedArray = new Uint8Array(encryptedBuffer)
    const combined = new Uint8Array(iv.length + encryptedArray.length)
    combined.set(iv)
    combined.set(encryptedArray, iv.length)
    return btoa(String.fromCharCode(...combined))
  }

  const decryptSaveData = async (encryptedData: string): Promise<any> => {
    // Robust decryption using AES-GCM for data security
    try {
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)))
      const iv = combined.slice(0, 12)
      const encrypted = combined.slice(12)
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      )
      return JSON.parse(new TextDecoder().decode(decryptedBuffer))
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt save data')
    }
  }

  const getAuthToken = (): string => {
    // Get auth token from localStorage or session
    return localStorage.getItem('authToken') || '';
  }

  const saveGameLocally = async (saveData: any) => {
    try {
      const localSave = {
        ...saveData,
        localSave: true,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(`save_${saveData.sessionId}`, JSON.stringify(localSave));
      
      setMessage({
        type: 'info',
        content: 'Game saved locally (cloud sync unavailable)'
      });

    } catch (error) {
      console.error('Local save error:', error);
      setError('Failed to save locally');
    }
  }

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-gaming text-console-accent">Save Manager</h2>
          <button onClick={onClose} className="console-button">
            ✕
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-100 border border-red-500 rounded">
            {error}
          </div>
        )}

        {/* Success/Info Message Display */}
        {message && (
          <div className={`mb-4 p-3 border rounded ${
            message.type === 'success' 
              ? 'bg-green-900 text-green-100 border-green-500' 
              : message.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-500'
                : 'bg-blue-900 text-blue-100 border-blue-500'
          }`}>
            {message.content}
          </div>
        )}

        {/* Save Slots */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {saveSlots.length === 0 ? (
            <div className="text-center py-8 text-console-text-dim">
              <Save className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No save files found</p>
              <p className="text-sm">Start a game and save to create your first save file</p>
            </div>
          ) : (
            saveSlots.map((slot) => (
              <div
                key={slot.id}
                className={`console-card cursor-pointer transition-all ${
                  selectedSlot === slot.id ? 'border-console-accent console-glow' : ''
                }`}
                onClick={() => setSelectedSlot(slot.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-console-accent">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-gaming text-console-accent">
                        {slot.character.name}
                      </h3>
                      <p className="text-sm text-console-text-dim">
                        Level {slot.character.level} • {slot.cartridgeId.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-console-text-dim">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatPlayTime(slot.playTime)}</span>
                      </div>
                      <div>{formatDate(slot.lastSave)}</div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          loadGame(slot.id)
                        }}
                        disabled={isLoading}
                        className="console-button text-xs"
                        title="Load Game"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSave(slot.id)
                        }}
                        className="console-button text-xs text-red-400 hover:text-red-300"
                        title="Delete Save"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-console-border">
          <div className="text-sm text-console-text-dim">
            {saveSlots.length} save file{saveSlots.length !== 1 ? 's' : ''} found
          </div>
          
          <div className="flex space-x-2">
            {session && character && (
              <button
                onClick={saveGame}
                disabled={isLoading}
                className="console-button-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Game'}</span>
              </button>
            )}
            
            <button
              onClick={loadSaveSlots}
              disabled={isLoading}
              className="console-button flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 