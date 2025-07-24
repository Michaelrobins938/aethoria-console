'use client'

import React, { useState, useEffect } from 'react'
import { Play, Sword, Ghost, Rocket, Shield, Zap, Skull } from 'lucide-react'

interface Cartridge {
  id: string
  title: string
  genre: string
  description: string
  difficulty: string
  icon: React.ReactNode
  color: string
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
      .then(data => {
        const formattedCartridges = data.map((prompt: any) => ({
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          genre: prompt.genre.charAt(0).toUpperCase() + prompt.genre.slice(1),
          difficulty: prompt.difficulty.charAt(0).toUpperCase() + prompt.difficulty.slice(1),
          icon: getIconForGenre(prompt.genre),
          color: getColorForGenre(prompt.genre)
        }))
        setCartridges(formattedCartridges)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch game prompts:', error)
        // Fallback to default cartridges
        setCartridges([
          {
            id: 'dnd-fantasy',
            title: 'D&D Fantasy Adventure',
            description: 'A classic fantasy adventure in the world of Aetheria, filled with magic, monsters, and epic quests.',
            genre: 'Fantasy',
            difficulty: 'Medium',
            icon: <Sword className="w-8 h-8" />,
            color: 'border-yellow-500'
          },
          {
            id: 'silent-hill-echoes',
            title: 'Silent Hill: Echoes of the Fog',
            description: 'A psychological horror adventure where reality and nightmare blur together in a fog-shrouded town.',
            genre: 'Horror',
            difficulty: 'Hard',
            icon: <Ghost className="w-8 h-8" />,
            color: 'border-red-500'
          },
          {
            id: 'portal-sci-fi',
            title: 'Portal: Test Subject\'s Odyssey',
            description: 'Navigate through Aperture Science test chambers with portals, physics puzzles, and AI commentary.',
            genre: 'Sci-Fi',
            difficulty: 'Medium',
            icon: <Rocket className="w-8 h-8" />,
            color: 'border-blue-500'
          },
          {
            id: 'pokemon-adventure',
            title: 'Pokémon: Legends of Antiquity',
            description: 'Become a Pokémon trainer in a world where ancient legends come to life and new discoveries await.',
            genre: 'Adventure',
            difficulty: 'Easy',
            icon: <Shield className="w-8 h-8" />,
            color: 'border-green-500'
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