'use client'

import React, { useState, useRef, useEffect } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { CartridgeSelector } from '@/components/CartridgeSelector'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FeaturesSection } from '@/components/FeaturesSection'
import { CharacterCreator } from '@/components/CharacterCreator'
import { GameInterface } from '@/components/GameInterface'
import { Character, GamePrompt } from '@/lib/types'
import { ArrowUp, Gamepad2, Users, BookOpen, Mail } from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { AssistantModal } from '@/components/assistant-ui/assistant-modal'
import { ErrorLogger } from '@/components/ErrorLogger'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Home() {
  const [selectedCartridge, setSelectedCartridge] = useState<string | null>(null)
  const [gamePrompt, setGamePrompt] = useState<GamePrompt | null>(null)
  const [isGameActive, setIsGameActive] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [showCharacterCreator, setShowCharacterCreator] = useState(false)
  const [character, setCharacter] = useState<Character | null>(null)
  const [currentSection, setCurrentSection] = useState<string>('home')
  const [isInitializing, setIsInitializing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const featuresRef = useRef<HTMLDivElement>(null)
  const gamesRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const { initializeSession } = useGameStore()

  // Initialize the page
  useEffect(() => {
    // Remove the loading state immediately
    setIsLoading(false)
    console.log('Page component mounted successfully')
  }, [])

  const handleCartridgeSelect = async (cartridgeId: string) => {
    console.log('Cartridge selected:', cartridgeId)
    setSelectedCartridge(cartridgeId)
    setIsInitializing(true)
    setError(null)
    
    try {
      // Fetch the game prompt
      const response = await fetch(`/api/game-prompts/${cartridgeId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch game prompt: ${response.status}`)
      }
      const prompt: GamePrompt = await response.json()
      setGamePrompt(prompt)
      
      await initializeSession(cartridgeId)
      setShowCharacterCreator(true)
    } catch (error) {
      console.error('Failed to initialize AI session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize game session'
      setError(`Failed to initialize game session: ${errorMessage}. Please try again.`)
      setSelectedCartridge(null)
      setGamePrompt(null)
    } finally {
      setIsInitializing(false)
    }
  }

  const handleBackToCartridges = () => {
    setShowCharacterCreator(false)
    setSelectedCartridge(null)
    setCharacter(null)
    setIsGameActive(false)
  }

  const handleCharacterComplete = (newCharacter: Character) => {
    console.log('Character created:', newCharacter)
    setCharacter(newCharacter)
    setShowCharacterCreator(false)
    setIsGameActive(true)
    
    // Create new chat session when character is created
    if (gamePrompt) {
      const { createNewChatSession } = useGameStore.getState()
      createNewChatSession(gamePrompt, newCharacter)
    }
  }

  const handleCharacterBack = () => {
    setShowCharacterCreator(false)
    setSelectedCartridge(null)
  }

  const handleGameEnd = () => {
    setIsGameActive(false)
    setCharacter(null)
    setGamePrompt(null)
    setSelectedCartridge(null)
    setShowIntro(true)
  }

  const handleStartAdventure = () => {
    setShowIntro(false)
    setCurrentSection('games')
  }

  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleNavigation = (section: string) => {
    setCurrentSection(section)
    
    switch (section) {
      case 'features':
        featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'games':
        gamesRef.current?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'about':
        aboutRef.current?.scrollIntoView({ behavior: 'smooth' })
        break
      case 'contact':
        contactRef.current?.scrollIntoView({ behavior: 'smooth' })
        break
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-console-dark flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Show error if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-console-dark flex items-center justify-center">
        <div className="bg-console-darker border border-console-border rounded-lg p-6 max-w-md">
          <h2 className="text-console-accent text-xl font-gaming mb-4">Error</h2>
          <p className="text-console-text mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="bg-console-accent hover:bg-console-accent-dark text-console-dark px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-console-dark">
        <div>Debug: Page is rendering</div>
        
        {/* Header */}
        <Header onNavigation={handleNavigation} currentSection={currentSection} />

        {/* Main Content */}
        <main>
          {/* Intro Section */}
          {showIntro && (
            <HeroSection 
              onStartAdventure={handleStartAdventure}
              onScrollToFeatures={handleScrollToFeatures}
            />
          )}

          {/* Character Creator */}
          {showCharacterCreator && gamePrompt && (
            <div className="min-h-screen bg-console-dark flex items-center justify-center p-4">
              <CharacterCreator
                gamePrompt={gamePrompt}
                onComplete={handleCharacterComplete}
                onBack={handleCharacterBack}
              />
            </div>
          )}

          {/* Game Interface */}
          {isGameActive && character && gamePrompt && (
            <GameInterface
              character={character}
              gamePrompt={gamePrompt}
              onBack={handleGameEnd}
            />
          )}

          {/* Cartridge Selector */}
          {!showIntro && !showCharacterCreator && !isGameActive && (
            <div className="min-h-screen bg-console-dark flex items-center justify-center p-4">
              <CartridgeSelector onSelect={handleCartridgeSelect} />
            </div>
          )}

          {/* Features Section */}
          <div ref={featuresRef}>
            <FeaturesSection />
          </div>

          {/* Games Section */}
          <div ref={gamesRef}>
            <section className="py-16 bg-console-darker">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-gaming text-console-accent text-center mb-12">
                  Available Games
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Game cards will be populated by CartridgeSelector */}
                </div>
              </div>
            </section>
          </div>

          {/* About Section */}
          <div ref={aboutRef}>
            <section className="py-16 bg-console-dark">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-gaming text-console-accent text-center mb-12">
                  About Aethoria
                </h2>
                <div className="max-w-4xl mx-auto text-console-text text-center">
                  <p className="text-lg mb-6">
                    Aethoria is an AI-powered interactive storytelling platform that brings your favorite games and stories to life.
                  </p>
                  <p className="text-lg mb-6">
                    Experience immersive adventures with dynamic AI responses, voice interaction, and real-time game mechanics.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <div ref={contactRef}>
            <section className="py-16 bg-console-darker">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-gaming text-console-accent text-center mb-12">
                  Get in Touch
                </h2>
                <div className="max-w-2xl mx-auto text-center">
                  <p className="text-console-text mb-8">
                    Have questions or suggestions? We'd love to hear from you!
                  </p>
                  <div className="flex justify-center space-x-6">
                    <a href="#" className="text-console-accent hover:text-console-accent-dark transition-colors duration-200">
                      <Mail className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-console-accent hover:bg-console-accent-dark text-console-dark p-3 rounded-full shadow-lg transition-all duration-200 opacity-0 hover:opacity-100"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        {/* Error Logger for debugging */}
        <ErrorLogger />
      </div>
    </ErrorBoundary>
  )
} 