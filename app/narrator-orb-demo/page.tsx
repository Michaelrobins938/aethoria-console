'use client'

import React, { useState } from 'react'
import { AIChat } from '@/components/AIChat'
import { Header } from '@/components/Header'

export default function NarratorOrbDemo() {
  const [isChatVisible, setIsChatVisible] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        {/* Background with subtle nebula effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            NarratorOrb Demo
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the future of AI-powered storytelling with our reactive nebula orb. 
            Watch as it responds to your voice, AI interactions, and game events in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsChatVisible(true)}
              className="px-8 py-4 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors font-semibold"
            >
              Start AI Chat Demo
            </button>
            
            <button
              onClick={() => setIsChatVisible(false)}
              className="px-8 py-4 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors font-semibold"
            >
              Close Demo
            </button>
          </div>
          
          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/20 border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">Voice Reactive</h3>
              <p className="text-gray-400 text-sm">
                The orb responds to your voice input with dynamic animations and color changes
              </p>
            </div>
            
            <div className="bg-black/20 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">AI Responsive</h3>
              <p className="text-gray-400 text-sm">
                Watch the orb pulse and glow as the AI processes your requests and generates responses
              </p>
            </div>
            
            <div className="bg-black/20 border border-pink-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-pink-400 mb-2">Real-time Feedback</h3>
              <p className="text-gray-400 text-sm">
                Experience immediate visual feedback for all interactions and game events
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Chat Demo */}
      {isChatVisible && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-cyan-500/30">
              <h2 className="text-xl font-semibold text-cyan-400">AI Chat with NarratorOrb</h2>
              <button
                onClick={() => setIsChatVisible(false)}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="flex-1 relative">
              <AIChat className="h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 