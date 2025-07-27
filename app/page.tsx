'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AIChat } from '@/components/AIChat'
import { CartridgeSelector } from '@/components/CartridgeSelector'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { CharacterCreator } from '@/components/CharacterCreator'
import { Character } from '@/lib/types'
import { ArrowUp, Gamepad2, Users, BookOpen, Mail } from 'lucide-react'
import { useGameStore } from '@/lib/store'

export default function Home() {
  const [selectedCartridge, setSelectedCartridge] = useState<string | null>(null)
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
  }, [])

  const handleCartridgeSelect = async (cartridgeId: string) => {
    console.log('Cartridge selected:', cartridgeId)
    setSelectedCartridge(cartridgeId)
    setIsInitializing(true)
    setError(null)
    
    try {
      await initializeSession(cartridgeId)
      setShowCharacterCreator(true)
    } catch (error) {
      console.error('Failed to initialize AI session:', error)
      setError('Failed to initialize game session. Please try again.')
      setShowCharacterCreator(true) // Still allow character creation
    } finally {
      setIsInitializing(false)
    }
  }

  const handleCharacterComplete = (newCharacter: Character) => {
    console.log('Character created:', newCharacter)
    setCharacter(newCharacter)
    setShowCharacterCreator(false)
    setIsGameActive(true)
  }

  const handleCharacterBack = () => {
    setShowCharacterCreator(false)
    setSelectedCartridge(null)
  }

  const handleGameEnd = () => {
    setIsGameActive(false)
    setSelectedCartridge(null)
    setCharacter(null)
    setShowIntro(true)
  }

  const handleStartAdventure = () => {
    console.log('Starting adventure')
    setShowIntro(false)
    setCurrentSection('games')
    // Scroll to games section
    setTimeout(() => {
      gamesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleScrollToFeatures = () => {
    console.log('Scrolling to features')
    setCurrentSection('features')
    setTimeout(() => {
      featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleNavigation = (section: string) => {
    console.log('Navigation requested:', section)
    setCurrentSection(section)
    
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      switch (section) {
        case 'home':
          window.scrollTo({ top: 0, behavior: 'smooth' })
          break
        case 'features':
          if (featuresRef.current) {
            featuresRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            console.warn('Features ref not found, using fallback scroll')
            window.scrollTo({ top: 600, behavior: 'smooth' })
          }
          break
        case 'games':
          if (gamesRef.current) {
            gamesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            console.warn('Games ref not found, using fallback scroll')
            window.scrollTo({ top: 1200, behavior: 'smooth' })
          }
          break
        case 'about':
          if (aboutRef.current) {
            aboutRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            console.warn('About ref not found, using fallback scroll')
            window.scrollTo({ top: 1800, behavior: 'smooth' })
          }
          break
        case 'contact':
          if (contactRef.current) {
            contactRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
          } else {
            console.warn('Contact ref not found, using fallback scroll')
            window.scrollTo({ top: 2400, behavior: 'smooth' })
          }
          break
        case 'settings':
          console.log('Settings requested - modal not implemented yet')
          alert('Settings modal not implemented yet')
          break
        case 'help':
          console.log('Help requested - modal not implemented yet')
          alert('Help modal not implemented yet')
          break
        default:
          console.warn('Unknown navigation section:', section)
      }
    }, 100)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Game flow components
  if (showCharacterCreator) {
    return (
      <main className="min-h-screen bg-console-dark">
        {isInitializing && (
          <div className="fixed inset-0 bg-console-dark/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="console-panel text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-console-accent mx-auto mb-4"></div>
              <h3 className="text-xl font-gaming text-console-accent mb-2">Initializing AI</h3>
              <p className="text-console-text-dim">Loading game world and preparing your adventure...</p>
            </div>
          </div>
        )}
        <CharacterCreator 
          onComplete={handleCharacterComplete}
          onBack={handleCharacterBack}
        />
      </main>
    )
  }

  if (isGameActive) {
    return (
      <main className="min-h-screen bg-console-dark">
        <AIChat 
          cartridgeId={selectedCartridge!}
          onGameEnd={handleGameEnd}
          character={character}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-console-dark">
      <Header onNavigate={handleNavigation} />
      
      {/* Debug indicator - remove in production */}
      <div className="fixed top-20 left-4 z-50 bg-console-darker p-2 rounded border border-console-accent text-xs">
        Current: {currentSection}
      </div>
      
      {error && (
        <div className="fixed top-20 right-4 z-50 bg-red-900 p-4 rounded border border-red-500 text-white max-w-sm">
          <h3 className="font-bold mb-2">Error</h3>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-xs bg-red-700 px-2 py-1 rounded hover:bg-red-600"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {showIntro ? (
        <>
          {/* Hero Section */}
          <HeroSection 
            onStartAdventure={handleStartAdventure}
            onScrollToFeatures={handleScrollToFeatures}
          />

          {/* Features Section */}
          <div ref={featuresRef}>
            <FeaturesSection onStartGame={handleStartAdventure} />
          </div>

          {/* Games Section */}
          <section ref={gamesRef} className="py-20 px-4 relative">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-16 animate-fade-in-up">
                <h2 className="text-4xl md:text-6xl font-gaming font-bold text-glow mb-6">
                  GAME WORLDS
                </h2>
                <p className="text-xl text-console-text-dim max-w-3xl mx-auto leading-relaxed">
                  Choose from over 100 unique adventures across fantasy, horror, sci-fi, and more.
                </p>
              </div>
              
              <CartridgeSelector onSelect={handleCartridgeSelect} />
            </div>
          </section>

          {/* About Section */}
          <section ref={aboutRef} className="py-20 px-4 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-console-darker/20 to-transparent"></div>
            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="text-center mb-16 animate-fade-in-up">
                <h2 className="text-4xl md:text-6xl font-gaming font-bold text-glow mb-6">
                  ABOUT AETHORIA
                </h2>
                <p className="text-xl text-console-text-dim max-w-4xl mx-auto leading-relaxed">
                  Aethoria represents the future of interactive storytelling, combining cutting-edge AI technology 
                  with immersive gaming experiences.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="animate-slide-in-left">
                  <div className="console-panel">
                    <h3 className="text-2xl font-gaming font-bold text-console-accent mb-6">
                      Our Mission
                    </h3>
                    <p className="text-console-text leading-relaxed mb-6">
                      To revolutionize storytelling by creating dynamic, AI-powered narratives that adapt to 
                      each player's unique choices and playstyle. We believe that the best stories are those 
                      that are lived, not just told.
                    </p>
                    <p className="text-console-text leading-relaxed">
                      Aethoria combines the creativity of human imagination with the computational power of 
                      artificial intelligence to create gaming experiences that are truly one-of-a-kind.
                    </p>
                  </div>
                </div>

                <div className="animate-slide-in-right">
                  <div className="console-panel">
                    <h3 className="text-2xl font-gaming font-bold text-console-accent mb-6">
                      Technology
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-console-accent to-green-500 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="w-6 h-6 text-console-dark" />
                        </div>
                        <div>
                          <h4 className="font-gaming font-bold text-console-text">Next.js 14</h4>
                          <p className="text-sm text-console-text-dim">Modern React Framework</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-gaming font-bold text-console-text">OpenRouter AI</h4>
                          <p className="text-sm text-console-text-dim">Advanced AI Models</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-gaming font-bold text-console-text">Web Speech API</h4>
                          <p className="text-sm text-console-text-dim">Voice Interaction</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section ref={contactRef} className="py-20 px-4 relative">
            <div className="container mx-auto max-w-4xl">
              <div className="text-center mb-16 animate-fade-in-up">
                <h2 className="text-4xl md:text-6xl font-gaming font-bold text-glow mb-6">
                  GET IN TOUCH
                </h2>
                <p className="text-xl text-console-text-dim max-w-2xl mx-auto leading-relaxed">
                  Have questions, suggestions, or want to join our community? We'd love to hear from you.
                </p>
              </div>

              <div className="console-panel animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-gaming font-bold text-console-accent mb-6">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-console-accent to-green-500 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-console-dark" />
                        </div>
                        <div>
                          <h4 className="font-gaming font-bold text-console-text">Email</h4>
                          <p className="text-sm text-console-text-dim">contact@aethoria.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-gaming font-bold text-console-text">Discord</h4>
                          <p className="text-sm text-console-text-dim">Join our community</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-gaming font-bold text-console-accent mb-6">
                      Send Message
                    </h3>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="console-input w-full"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="console-input w-full"
                      />
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="console-input w-full resize-none"
                      ></textarea>
                      <button
                        type="submit"
                        className="console-button-primary w-full"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="pt-20">
          <CartridgeSelector onSelect={handleCartridgeSelect} />
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 console-button p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-40"
        title="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </main>
  )
} 