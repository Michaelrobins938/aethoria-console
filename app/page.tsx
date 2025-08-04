'use client'

import React, { useState } from 'react'
import { HeroSection } from '@/components/HeroSection'
import { Header } from '@/components/Header'
import { CharacterCreator } from '@/components/CharacterCreator'
import { CartridgeSelector } from '@/components/CartridgeSelector'
import { GamePrompt } from '@/lib/types'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'landing' | 'character' | 'game-select'>('landing')
  const [character, setCharacter] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)

  // Default game prompt for character creation
  const defaultGamePrompt: GamePrompt = {
    id: "default-adventure",
    title: "Fantasy Adventure",
    description: "An epic journey through a mystical realm filled with magic, monsters, and ancient secrets.",
    content: "You are in a mystical realm filled with magic, monsters, and ancient secrets. Your adventure begins...",
    genre: "Fantasy",
    difficulty: "medium",
    themes: ["Adventure", "Magic", "Exploration"],
    mechanics: {
      diceSystem: "D20",
      combatSystem: "Turn-based",
      skillSystem: "D&D 5e inspired",
      inventorySystem: "Weight-based",
      questSystem: "Objective-based",
      specialRules: ["Magic casting", "Stealth mechanics"]
    }
  }

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
    window.location.href = `/assistant-ui?character=${encodeURIComponent(JSON.stringify(character))}&game=${encodeURIComponent(JSON.stringify(game))}`
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
              gamePrompt={defaultGamePrompt}
            />
          </div>
        </div>
      )}

      {currentStep === 'game-select' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <CartridgeSelector 
              onCartridgeSelect={handleGameSelected}
              onBack={() => setCurrentStep('character')}
            />
          </div>
        </div>
      )}
    </div>
  )
}