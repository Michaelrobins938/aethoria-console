'use client'

import React, { useState } from 'react'
import { 
  Brain, 
  Mic, 
  Volume2, 
  Gamepad2, 
  Users, 
  Shield, 
  Zap, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  details: string[]
  category: 'ai' | 'voice' | 'gameplay' | 'social'
}

const features: Feature[] = [
  {
    id: 'ai-storytelling',
    title: 'Dynamic AI Storytelling',
    description: 'Advanced AI that creates unique, branching narratives in real-time',
    icon: <Brain className="w-8 h-8" />,
    color: 'text-console-accent',
    category: 'ai',
    details: [
      'Real-time narrative generation',
      'Context-aware storytelling',
      'Character memory and development',
      'Dynamic world events',
      'Personalized quest generation'
    ]
  },
  {
    id: 'voice-interaction',
    title: 'Voice Interaction',
    description: 'Natural speech-to-text and text-to-speech for immersive gameplay',
    icon: <Mic className="w-8 h-8" />,
    color: 'text-blue-400',
    category: 'voice',
    details: [
      'Speech-to-text commands',
      'Natural language processing',
      'Voice synthesis for AI responses',
      'Multi-language support',
      'Voice customization options'
    ]
  },
  {
    id: 'character-system',
    title: 'Advanced Character System',
    description: 'Comprehensive character creation and progression mechanics',
    icon: <Users className="w-8 h-8" />,
    color: 'text-purple-400',
    category: 'gameplay',
    details: [
      '6 unique character backgrounds',
      'Point-buy ability system',
      'Skill progression trees',
      'Equipment and inventory management',
      'Character relationships and reputation'
    ]
  },
  {
    id: 'combat-system',
    title: 'Tactical Combat',
    description: 'Turn-based combat with strategic depth and dynamic encounters',
    icon: <Shield className="w-8 h-8" />,
    color: 'text-red-400',
    category: 'gameplay',
    details: [
      'Initiative-based turn order',
      'Multiple action types',
      'Environmental interactions',
      'Dynamic enemy AI',
      'Combat log and analysis'
    ]
  },
  {
    id: 'world-exploration',
    title: 'World Exploration',
    description: 'Vast, interconnected worlds with dynamic discovery systems',
    icon: <Zap className="w-8 h-8" />,
    color: 'text-green-400',
    category: 'gameplay',
    details: [
      'Procedural world generation',
      'Location discovery system',
      'Dynamic weather and time',
      'Hidden secrets and treasures',
      'World state persistence'
    ]
  },
  {
    id: 'social-features',
    title: 'Social Gaming',
    description: 'Connect with other players and share your adventures',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'text-yellow-400',
    category: 'social',
    details: [
      'Multiplayer adventures',
      'Character sharing',
      'Community challenges',
      'Story collaboration',
      'Achievement system'
    ]
  }
]

interface FeaturesSectionProps {
  onStartGame: () => void
}

export function FeaturesSection({ onStartGame }: FeaturesSectionProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'voice' | 'gameplay' | 'social'>('all')

  const filteredFeatures = activeCategory === 'all' 
    ? features 
    : features.filter(f => f.category === activeCategory)

  const selectedFeatureData = features.find(f => f.id === selectedFeature)

  return (
    <section id="features" className="py-20 px-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-console-darker/20 to-transparent"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-gaming font-bold text-glow mb-6">
            FEATURES
          </h2>
          <p className="text-xl text-console-text-dim max-w-3xl mx-auto leading-relaxed">
            Discover the cutting-edge technology that powers the most advanced 
            AI-powered gaming experience ever created.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[
            { id: 'all', label: 'All Features' },
            { id: 'ai', label: 'AI Technology' },
            { id: 'voice', label: 'Voice Systems' },
            { id: 'gameplay', label: 'Gameplay' },
            { id: 'social', label: 'Social' }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as 'ai' | 'voice' | 'gameplay' | 'social')}
              className={`console-button px-6 py-3 transition-all duration-300 ${
                activeCategory === category.id 
                  ? 'bg-console-accent text-console-dark font-bold' 
                  : 'hover:border-console-accent'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className={`console-card-hover group animate-fade-in-up`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-gaming font-bold text-lg mb-2 group-hover:text-console-accent transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-console-text-dim leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              
              {/* Expandable Details */}
              {selectedFeature === feature.id && (
                <div className="mt-6 pt-6 border-t border-console-border animate-fade-in-up">
                  <h4 className="font-gaming font-bold text-console-accent mb-4">Key Features:</h4>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-console-text">
                        <CheckCircle className="w-4 h-4 text-console-accent flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="console-panel mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-2xl font-gaming font-bold text-console-accent mb-8 text-center">
            Powered by Cutting-Edge Technology
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-gaming font-bold text-blue-400 mb-2">OpenRouter</div>
              <div className="text-sm text-console-text-dim">AI Model Access</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-gaming font-bold text-green-400 mb-2">Next.js 14</div>
              <div className="text-sm text-console-text-dim">React Framework</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-gaming font-bold text-purple-400 mb-2">Web Speech</div>
              <div className="text-sm text-console-text-dim">Voice API</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-gaming font-bold text-yellow-400 mb-2">TypeScript</div>
              <div className="text-sm text-console-text-dim">Type Safety</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <div className="console-panel max-w-2xl mx-auto">
            <h3 className="text-2xl font-gaming font-bold text-console-accent mb-4">
              Ready to Experience the Future?
            </h3>
            <p className="text-console-text-dim mb-8">
              Join thousands of players already exploring AI-powered adventures
            </p>
            <button
              onClick={onStartGame}
              className="console-button-primary text-lg px-8 py-4 group"
            >
              <div className="flex items-center space-x-2">
                <span>START PLAYING NOW</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 