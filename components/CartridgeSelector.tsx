'use client'

import React, { useState, useEffect } from 'react'
import Slider from 'react-slick'
import { Gamepad2, Star, Play, ArrowLeft, ArrowRight, CheckCircle, Cpu, Zap } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import { GamePrompt } from '@/lib/types'

// Import slick carousel styles
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface CartridgeSelectorProps {
  onCartridgeSelect: (cartridgeId: string) => void
  onBack?: () => void
}

export function CartridgeSelector({ onCartridgeSelect, onBack }: CartridgeSelectorProps) {
  const [cartridges, setCartridges] = useState<GamePrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCartridge, setSelectedCartridge] = useState<GamePrompt | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    fetchCartridges()
  }, [])

  const fetchCartridges = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/game-prompts')
      if (!response.ok) {
        throw new Error('Failed to fetch game cartridges')
      }
      const data = await response.json()
      setCartridges(data)
    } catch (err) {
      console.error('Error fetching cartridges:', err)
      setError('Failed to load game cartridges')
    } finally {
      setLoading(false)
    }
  }

  const getColorForGenre = (genre: string) => {
    const colors: { [key: string]: string } = {
      'Horror': 'border-red-500 hover:border-red-400',
      'Fantasy': 'border-purple-500 hover:border-purple-400',
      'Sci-Fi': 'border-blue-500 hover:border-blue-400',
      'Adventure': 'border-green-500 hover:border-green-400',
      'Mystery': 'border-yellow-500 hover:border-yellow-400',
      'Comedy': 'border-pink-500 hover:border-pink-400',
      'Action': 'border-orange-500 hover:border-orange-400',
      'Drama': 'border-indigo-500 hover:border-indigo-400',
      'Thriller': 'border-red-600 hover:border-red-500',
      'Romance': 'border-rose-500 hover:border-rose-400'
    }
    return colors[genre] || 'border-console-accent hover:border-green-400'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'Easy': 'text-green-400',
      'Medium': 'text-yellow-400',
      'Hard': 'text-red-400',
      'Expert': 'text-purple-400'
    }
    return colors[difficulty] || 'text-console-text'
  }

  const handleCartridgeClick = (cartridge: GamePrompt) => {
    setSelectedCartridge(cartridge)
  }

  const handleStartGame = () => {
    if (selectedCartridge) {
      onCartridgeSelect(selectedCartridge.id)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    }
  }

  // Carousel settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
          autoplay: false
        }
      }
    ]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-console-dark flex items-center justify-center mobile-full-height">
        <LoadingSpinner 
          message="Loading Game Cartridges..." 
          variant="gaming"
          size="lg"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-console-dark flex items-center justify-center mobile-full-height">
        <div className="console-panel text-center">
          <h2 className="text-xl md:text-2xl font-gaming text-red-400 mb-4">Error Loading Games</h2>
          <p className="text-console-text mb-6 text-sm md:text-base">{error}</p>
          <button 
            onClick={fetchCartridges}
            className="console-button-primary mobile-button"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-console-dark transition-all duration-1000 mobile-full-height ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={handleBack}
                className="console-button-secondary flex items-center space-x-2 mobile-button"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}
            <div className="flex items-center space-x-3">
              <Gamepad2 className="text-console-accent" size={24} />
              <h1 className="text-2xl md:text-4xl font-gaming text-console-accent">Game Cartridges</h1>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-console-text font-console text-sm md:text-base">Available Games: {cartridges.length}</p>
            <p className="text-console-text-dim text-xs md:text-sm">Select your adventure</p>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative mb-8 md:mb-12">
          <Slider {...sliderSettings} className="game-carousel">
            {cartridges.map((cartridge, index) => (
              <div key={cartridge.id} className="px-2 md:px-4">
                <div 
                  className={`cartridge-slot ${getColorForGenre(cartridge.genre)} ${
                    selectedCartridge?.id === cartridge.id ? 'cartridge-active' : ''
                  } transition-all duration-300 transform hover:scale-105 mobile-button`}
                  onClick={() => handleCartridgeClick(cartridge)}
                >
                  {/* Selection Indicator */}
                  {selectedCartridge?.id === cartridge.id && (
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 z-10">
                      <CheckCircle className="text-console-accent" size={20} />
                    </div>
                  )}

                  {/* Cartridge Content */}
                  <div className="space-y-3 md:space-y-4">
                    {/* Icon */}
                    <div className="flex justify-center">
                      <Gamepad2 className="text-console-accent" size={32} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-gaming font-bold text-console-accent text-center">
                      {cartridge.title}
                    </h3>

                    {/* Genre & Difficulty */}
                    <div className="flex justify-center space-x-2">
                      <span className={`bg-console-darker px-2 py-1 rounded text-xs font-console ${getColorForGenre(cartridge.genre).replace('border-', 'text-').replace(' hover:border-', '')}`}>
                        {cartridge.genre}
                      </span>
                      <span className={`bg-console-darker px-2 py-1 rounded text-xs font-console ${getDifficultyColor(cartridge.difficulty)}`}>
                        {cartridge.difficulty}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-console-text text-xs md:text-sm font-console leading-relaxed text-center">
                      {cartridge.description.length > 100 
                        ? `${cartridge.description.substring(0, 100)}...` 
                        : cartridge.description
                      }
                    </p>

                    {/* AI Model Info */}
                    <div className="flex items-center justify-center space-x-2 text-xs text-console-text-dim">
                      <Cpu size={12} />
                      <span className="font-console">AI: {cartridge.aiModel}</span>
                    </div>

                    {/* Themes */}
                    <div className="flex flex-wrap justify-center gap-1">
                      {cartridge.themes.slice(0, 2).map((theme, idx) => (
                        <span 
                          key={idx} 
                          className="bg-console-accent/20 text-console-accent text-xs px-2 py-1 rounded"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Selection Summary */}
        {selectedCartridge && (
          <div className="console-panel mb-6 md:mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Star className="text-console-accent" size={20} />
                  <h3 className="text-lg md:text-2xl font-gaming text-console-accent">
                    Selected: {selectedCartridge.title}
                  </h3>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="text-center md:text-right">
                  <p className="text-console-text font-console text-sm">
                    Genre: <span className="text-console-accent">{selectedCartridge.genre}</span>
                  </p>
                  <p className="text-console-text font-console text-sm">
                    Difficulty: <span className={getDifficultyColor(selectedCartridge.difficulty)}>{selectedCartridge.difficulty}</span>
                  </p>
                </div>
                <button
                  onClick={handleStartGame}
                  className="console-button-primary flex items-center space-x-2 animate-pulse-glow mobile-button"
                >
                  <Play size={18} />
                  <span className="hidden sm:inline">START GAME</span>
                  <span className="sm:hidden">START</span>
                  <Zap size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center">
          <p className="text-console-text-dim font-console text-xs md:text-sm">
            Click on a cartridge to select it, then press START GAME to begin your adventure
          </p>
        </div>
      </div>

      {/* Custom Carousel Styles */}
      <style jsx global>{`
        .game-carousel .slick-dots {
          bottom: -30px;
        }
        
        .game-carousel .slick-dots li button:before {
          color: #00ff41;
          opacity: 0.5;
          font-size: 12px;
        }
        
        .game-carousel .slick-dots li.slick-active button:before {
          color: #00ff41;
          opacity: 1;
        }
        
        .game-carousel .slick-prev,
        .game-carousel .slick-next {
          color: #00ff41;
          z-index: 10;
        }
        
        .game-carousel .slick-prev:hover,
        .game-carousel .slick-next:hover {
          color: #00ff88;
        }
        
        .game-carousel .slick-track {
          display: flex;
          align-items: stretch;
        }
        
        .game-carousel .slick-slide {
          height: auto;
        }
        
        .game-carousel .slick-slide > div {
          height: 100%;
        }

        @media (max-width: 768px) {
          .game-carousel .slick-dots {
            bottom: -25px;
          }
          
          .game-carousel .slick-dots li button:before {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  )
} 