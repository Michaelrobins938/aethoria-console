'use client'

import React, { useState, useEffect } from 'react'
import { Play, Sword, Ghost, Rocket, Shield, Zap, Skull, Cpu } from 'lucide-react'
import type { GamePrompt } from '@/lib/types'
import { getModelForCartridge, getModelDescription, getGenreForCartridge } from '@/lib/ai'

interface Cartridge {
  id: string
  title: string
  genre: string
  description: string
  difficulty: string
  icon: React.ReactNode
  color: string
  aiModel: string
  modelDescription: string
}

const getIconForGenre = (genre: string) => {
  switch (genre.toLowerCase()) {
    case 'fantasy':
      return <Sword className="w-8 h-8" />
    case 'horror':
      return <Ghost className="w-8 h-8" />
    case 'sci-fi':
      return <Rocket className="w-8 h-8" />
    case 'adventure':
      return <Shield className="w-8 h-8" />
    case 'cyberpunk':
      return <Zap className="w-8 h-8" />
    case 'survival horror':
      return <Skull className="w-8 h-8" />
    default:
      return <Shield className="w-8 h-8" />
  }
}

const getColorForGenre = (genre: string) => {
  switch (genre.toLowerCase()) {
    case 'fantasy':
      return 'border-yellow-500'
    case 'horror':
      return 'border-red-500'
    case 'sci-fi':
      return 'border-blue-500'
    case 'adventure':
      return 'border-green-500'
    case 'cyberpunk':
      return 'border-purple-500'
    case 'survival horror':
      return 'border-red-600'
    default:
      return 'border-gray-500'
  }
}

interface CartridgeSelectorProps {
  onSelect: (cartridgeId: string) => void
}

export function CartridgeSelector({ onSelect }: CartridgeSelectorProps) {
  const [selectedCartridge, setSelectedCartridge] = useState<string | null>(null)
  const [cartridges, setCartridges] = useState<Cartridge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch game prompts from API
    fetch('/api/game-prompts')
      .then(res => res.json())
      .then((data: GamePrompt[]) => {
        const formattedCartridges = data.map((prompt: GamePrompt) => {
          const aiModel = getModelForCartridge(prompt.id)
          const modelDescription = getModelDescription(prompt.id)
          const genre = getGenreForCartridge(prompt.id)
          
          return {
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            genre: genre.charAt(0).toUpperCase() + genre.slice(1),
            difficulty: prompt.difficulty.charAt(0).toUpperCase() + prompt.difficulty.slice(1),
            icon: getIconForGenre(genre),
            color: getColorForGenre(genre),
            aiModel,
            modelDescription
          }
        })
        setCartridges(formattedCartridges)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch game prompts:', error)
        // Fallback to default cartridges with AI model info
        setCartridges([
          {
            id: 'dnd-fantasy',
            title: 'D&D Fantasy Adventure',
            description: 'A classic fantasy adventure in the world of Aetheria, filled with magic, monsters, and epic quests.',
            genre: 'Fantasy',
            difficulty: 'Medium',
            icon: <Sword className="w-8 h-8" />,
            color: 'border-yellow-500',
            aiModel: 'anthropic/claude-3-5-sonnet',
            modelDescription: 'Claude 3.5 Sonnet - Excellent for epic fantasy world-building and character arcs'
          },
          {
            id: 'silent-hill-echoes',
            title: 'Silent Hill: Echoes of the Fog',
            description: 'A psychological horror adventure where reality and nightmare blur together in a fog-shrouded town.',
            genre: 'Horror',
            difficulty: 'Hard',
            icon: <Ghost className="w-8 h-8" />,
            color: 'border-red-500',
            aiModel: 'anthropic/claude-3-5-sonnet',
            modelDescription: 'Claude 3.5 Sonnet - Excellent for psychological horror and atmospheric tension'
          },
          {
            id: 'portal-sci-fi',
            title: 'Portal: Test Subject\'s Odyssey',
            description: 'Navigate through Aperture Science test chambers with portals, physics puzzles, and AI commentary.',
            genre: 'Sci-Fi',
            difficulty: 'Medium',
            icon: <Rocket className="w-8 h-8" />,
            color: 'border-blue-500',
            aiModel: 'anthropic/claude-3-5-sonnet',
            modelDescription: 'Claude 3.5 Sonnet - Excellent for complex sci-fi concepts and futuristic dialogue'
          },
          {
            id: 'pokemon-adventure',
            title: 'Pokémon: Legends of Antiquity',
            description: 'Become a Pokémon trainer in a world where ancient legends come to life and new discoveries await.',
            genre: 'Adventure',
            difficulty: 'Easy',
            icon: <Shield className="w-8 h-8" />,
            color: 'border-green-500',
            aiModel: 'anthropic/claude-3-5-sonnet',
            modelDescription: 'Claude 3.5 Sonnet - Excellent for creative writing and atmospheric storytelling'
          }
        ])
        setIsLoading(false)
      })
  }, [])

  const handleCartridgeClick = (cartridgeId: string) => {
    setSelectedCartridge(cartridgeId)
  }

  const handleStartGame = () => {
    if (selectedCartridge) {
      onSelect(selectedCartridge)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-gaming text-console-accent mb-2">
          INSERT CARTRIDGE
        </h2>
        <p className="text-console-text-dim">
          Select a game cartridge to begin your adventure
        </p>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-console-accent"></div>
          <p className="text-console-text-dim mt-2">Loading game cartridges...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cartridges.map((cartridge) => (
            <div
              key={cartridge.id}
              onClick={() => handleCartridgeClick(cartridge.id)}
              className={`cartridge-slot ${cartridge.color} ${
                selectedCartridge === cartridge.id ? 'cartridge-active' : ''
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="text-console-accent">
                  {cartridge.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-gaming font-bold text-console-text">
                    {cartridge.title}
                  </h3>
                  <p className="text-xs text-console-text-dim mt-1">
                    {cartridge.genre} • {cartridge.difficulty}
                  </p>
                  <p className="text-xs text-console-text-dim mt-2">
                    {cartridge.description}
                  </p>
                  
                  {/* AI Model Information */}
                  <div className="mt-3 p-2 bg-console-dark rounded border border-console-border">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Cpu className="w-3 h-3 text-console-accent" />
                      <span className="text-xs text-console-accent font-gaming">AI MODEL</span>
                    </div>
                    <p className="text-xs text-console-text-dim text-center">
                      {cartridge.aiModel.split('/').pop()}
                    </p>
                    <p className="text-xs text-console-text-dim text-center mt-1">
                      {cartridge.modelDescription.split(' - ')[1]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCartridge && (
        <div className="text-center animate-fade-in">
          <button
            onClick={handleStartGame}
            className="console-button-primary flex items-center space-x-2 mx-auto"
          >
            <Play className="w-4 h-4" />
            <span>START GAME</span>
          </button>
        </div>
      )}
    </div>
  )
} 