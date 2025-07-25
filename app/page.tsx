'use client'

import React, { useState } from 'react'
import { AIChat } from '@/components/AIChat'
import { CartridgeSelector } from '@/components/CartridgeSelector'
import { Header } from '@/components/Header'
import { APITest } from '@/components/APITest'

export default function Home() {
  const [selectedCartridge, setSelectedCartridge] = useState<string | null>(null)
  const [isGameActive, setIsGameActive] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  // Debug logging
  console.log('Page state:', { showIntro, selectedCartridge, isGameActive })

  const handleCartridgeSelect = (cartridgeId: string) => {
    console.log('Cartridge selected:', cartridgeId)
    setSelectedCartridge(cartridgeId)
    setIsGameActive(true)
  }

  const handleGameEnd = () => {
    setIsGameActive(false)
    setSelectedCartridge(null)
  }

  const handleStartAdventure = () => {
    console.log('Start adventure clicked!')
    setShowIntro(false)
  }

  return (
    <main className="min-h-screen bg-console-dark">
      <Header />
      
      {showIntro ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
            {/* Epic Title */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-gaming font-bold text-console-accent text-glow animate-pulse">
                AETHORIA
              </h1>
              <h2 className="text-2xl md:text-4xl font-gaming text-console-text-dim">
                Where AI Becomes Your Dungeon Master
              </h2>
            </div>

            {/* Epic Description */}
            <div className="space-y-6 text-lg md:text-xl text-console-text leading-relaxed">
              <p>
                Step into a world where artificial intelligence crafts the most immersive, 
                dynamic, and personalized storytelling experiences ever created.
              </p>
              <p>
                Every choice you make shapes the narrative. Every action has consequences. 
                Every adventure is unique to you.
              </p>
              <p className="text-console-accent font-gaming">
                "The greatest stories are not told, they are lived."
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="console-card text-center">
                <div className="text-3xl mb-3">🎲</div>
                <h3 className="font-gaming text-console-accent mb-2">Dynamic Storytelling</h3>
                <p className="text-sm text-console-text-dim">
                  AI that adapts to your choices and creates branching narratives in real-time
                </p>
              </div>
              <div className="console-card text-center">
                <div className="text-3xl mb-3">🎭</div>
                <h3 className="font-gaming text-console-accent mb-2">Immersive Worlds</h3>
                <p className="text-sm text-console-text-dim">
                  From fantasy realms to sci-fi adventures, every world feels alive and responsive
                </p>
              </div>
              <div className="console-card text-center">
                <div className="text-3xl mb-3">🎤</div>
                <h3 className="font-gaming text-console-accent mb-2">Voice Interaction</h3>
                <p className="text-sm text-console-text-dim">
                  Speak your actions and hear the world respond with natural voice synthesis
                </p>
              </div>
            </div>

            {/* Start Button */}
            <div className="mt-12 space-y-4">
              <button
                onClick={handleStartAdventure}
                className="console-button-primary text-xl px-8 py-4 animate-bounce cursor-pointer hover:bg-green-600 transition-colors"
                style={{ zIndex: 1000 }}
              >
                BEGIN YOUR ADVENTURE
              </button>
              
              {/* Test button */}
              <button
                onClick={() => {
                  console.log('Test button clicked!')
                  alert('Test button works!')
                }}
                className="console-button text-lg px-6 py-3 cursor-pointer"
              >
                TEST BUTTON
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {!isGameActive ? (
            <div className="space-y-8">
                          <div className="text-center">
              <h1 className="text-4xl font-gaming font-bold text-console-accent mb-4 text-glow">
                AETHORIA CONSOLE
              </h1>
              <p className="text-console-text-dim text-lg">
                Choose Your Adventure
              </p>
            </div>
            
            <APITest />
            
            <CartridgeSelector onSelect={handleCartridgeSelect} />
            </div>
          ) : (
            <AIChat 
              cartridgeId={selectedCartridge!}
              onGameEnd={handleGameEnd}
            />
          )}
        </div>
      )}
    </main>
  )
} 