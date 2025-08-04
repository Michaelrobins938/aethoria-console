'use client'

import React, { useState } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { Header } from '@/components/Header'
import { CharacterCreator } from '@/components/CharacterCreator'
import { CartridgeSelector } from '@/components/CartridgeSelector'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'landing' | 'character' | 'game-select'>('landing')
  const [character, setCharacter] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)

  const handleStartAdventure = () => {
    setCurrentStep('character')
  }

  const handleScrollToFeatures = () => {
    // Scroll to features section
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  const handleCharacterCreated = (newCharacter: any) => {
    setCharacter(newCharacter)
    setCurrentStep('game-select')
  }

  const handleGameSelected = (game: any) => {
    setSelectedGame(game)
    // Navigate to the assistant UI with the character and game
    window.location.href = `/assistant-ui?character=${encodeURIComponent(JSON.stringify(newCharacter))}&game=${encodeURIComponent(JSON.stringify(game))}`
  }

  const handleBackToLanding = () => {
    setCurrentStep('landing')
    setCharacter(null)
    setSelectedGame(null)
  }

  return (
    <div className="min-h-screen bg-console-dark">
      <Header />
      
      {currentStep === 'landing' && (
        <>
          <HeroSection 
            onStartAdventure={handleStartAdventure}
            onScrollToFeatures={handleScrollToFeatures}
          />
          
          {/* Features Section */}
          <section className="py-20 bg-console-darker">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-4xl font-gaming font-bold text-console-accent text-center mb-16">
                FEATURES
              </h2>
              {/* Add your features content here */}
            </div>
          </section>
        </>
      )}

      {currentStep === 'character' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <CharacterCreator 
              onComplete={handleCharacterCreated}
              onBack={handleBackToLanding}
            />
          </div>
        </div>
      )}

      {currentStep === 'game-select' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <CartridgeSelector 
              onSelect={handleGameSelected}
              onBack={() => setCurrentStep('character')}
            />
          </div>
        </div>
      )}
    </div>
  )
}