'use client'

import React, { useEffect, useState } from 'react'
import { Play, ArrowRight, Sparkles, Zap, Shield, Gamepad2, Cpu, Users } from 'lucide-react'

interface HeroSectionProps {
  onStartAdventure: () => void
  onScrollToFeatures: () => void
}

export function HeroSection({ onStartAdventure, onScrollToFeatures }: HeroSectionProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8
    }))
    setParticles(newParticles)

    // Trigger animations after mount
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Particles */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute text-console-accent font-console text-xs animate-matrix-rain"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {Array.from({ length: 20 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)).join('')}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-12 max-w-6xl mx-auto px-4 pt-20">
        {/* Epic Title */}
        <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-gaming font-black text-glow neon-text animate-text-glow">
              AETHORIA
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-console-accent via-console-accent-dark to-console-accent opacity-20 blur-3xl animate-pulse"></div>
          </div>
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-gaming text-console-text-dim font-light">
            Where AI Becomes Your
            <span className="text-console-accent font-bold ml-3 gradient-text">Dungeon Master</span>
          </h2>
        </div>

        {/* Epic Description */}
        <div className={`space-y-8 text-lg md:text-xl lg:text-2xl text-console-text leading-relaxed max-w-4xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="font-light">
            Step into a world where artificial intelligence crafts the most immersive, 
            dynamic, and personalized storytelling experiences ever created.
          </p>
          <p className="font-light">
            Every choice you make shapes the narrative. Every action has consequences. 
            Every adventure is unique to you.
          </p>
          <p className="text-console-accent font-gaming text-xl md:text-2xl font-bold animate-pulse-glow">
            "The greatest stories are not told, they are lived."
          </p>
        </div>

        {/* Feature Highlights */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="console-card-hover group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="mx-auto text-console-accent" />
            </div>
            <h3 className="font-gaming text-console-accent mb-3 text-lg font-bold">Dynamic Storytelling</h3>
            <p className="text-sm text-console-text-dim leading-relaxed">
              AI that adapts to your choices and creates branching narratives in real-time, 
              ensuring no two adventures are ever the same.
            </p>
          </div>
          
          <div className="console-card-hover group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="mx-auto text-blue-400" />
            </div>
            <h3 className="font-gaming text-blue-400 mb-3 text-lg font-bold">Immersive Worlds</h3>
            <p className="text-sm text-console-text-dim leading-relaxed">
              From fantasy realms to sci-fi adventures, every world feels alive and responsive 
              to your presence and decisions.
            </p>
          </div>
          
          <div className="console-card-hover group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="mx-auto text-purple-400" />
            </div>
            <h3 className="font-gaming text-purple-400 mb-3 text-lg font-bold">Voice Interaction</h3>
            <p className="text-sm text-console-text-dim leading-relaxed">
              Speak your actions and hear the world respond with natural voice synthesis, 
              creating a truly immersive experience.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`space-y-6 mt-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onStartAdventure}
              className="console-button-primary text-xl px-12 py-6 animate-pulse-glow group hover:animate-none"
            >
              <div className="flex items-center space-x-3">
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span>BEGIN YOUR ADVENTURE</span>
              </div>
            </button>
            
            <button
              onClick={onScrollToFeatures}
              className="console-button-secondary text-lg px-8 py-4 group"
            >
              <div className="flex items-center space-x-2">
                <span>EXPLORE FEATURES</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
          
          <p className="text-console-text-dim text-sm font-console">
            Experience the future of interactive storytelling
          </p>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-gaming font-bold text-console-accent mb-2 group-hover:scale-110 transition-transform duration-300">100+</div>
            <div className="text-sm text-console-text-dim font-console">GAME WORLDS</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-gaming font-bold text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">∞</div>
            <div className="text-sm text-console-text-dim font-console">STORY POSSIBILITIES</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-gaming font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
            <div className="text-sm text-console-text-dim font-console">AI AVAILABLE</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl font-gaming font-bold text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">0</div>
            <div className="text-sm text-console-text-dim font-console">LOADING SCREENS</div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className={`mt-16 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="console-panel">
            <h3 className="text-2xl font-gaming font-bold text-console-accent mb-6 text-center">
              POWERED BY
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-br from-console-accent to-console-accent-dark rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="w-6 h-6 text-console-dark" />
                </div>
                <div className="text-left">
                  <h4 className="font-gaming font-bold text-console-text">Next.js 14</h4>
                  <p className="text-sm text-console-text-dim font-console">Modern React Framework</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-gaming font-bold text-console-text">OpenRouter AI</h4>
                  <p className="text-sm text-console-text-dim font-console">Advanced AI Models</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-gaming font-bold text-console-text">Web Speech API</h4>
                  <p className="text-sm text-console-text-dim font-console">Voice Interaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-console-accent rounded-full flex justify-center shadow-console">
          <div className="w-1 h-3 bg-console-accent rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
} 