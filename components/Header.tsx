'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X, Settings, HelpCircle, Github, ExternalLink } from 'lucide-react'

interface HeaderProps {
  onNavigate?: (section: string) => void
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (section: string) => {
    setIsMenuOpen(false)
    if (onNavigate) {
      onNavigate(section)
    }
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-console-darker/95 backdrop-blur-md border-b border-console-border shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div 
              className="cursor-pointer group"
              onClick={() => handleNavigation('home')}
            >
              <div className="flex items-center space-x-3">
                {/* Animated Logo */}
                <div className="relative">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-console-accent to-green-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <span className="text-console-dark font-gaming font-bold text-lg lg:text-xl">A</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-console-accent to-green-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
                </div>
                
                {/* Text Logo */}
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-gaming font-bold gradient-text">
                    AETHORIA
                  </h1>
                  <p className="text-xs text-console-text-dim font-gaming">
                    AI Gaming Console
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('features')}
              className="text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider hover:scale-105"
            >
              Features
            </button>
            <button
              onClick={() => handleNavigation('games')}
              className="text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider hover:scale-105"
            >
              Games
            </button>
            <button
              onClick={() => handleNavigation('about')}
              className="text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider hover:scale-105"
            >
              About
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className="text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider hover:scale-105"
            >
              Contact
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Settings Button */}
            <button
              onClick={() => handleNavigation('settings')}
              className="console-button p-2 rounded-lg hover:scale-110 transition-transform duration-300"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Help Button */}
            <button
              onClick={() => handleNavigation('help')}
              className="console-button p-2 rounded-lg hover:scale-110 transition-transform duration-300"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com/your-username/aethoria"
              target="_blank"
              rel="noopener noreferrer"
              className="console-button p-2 rounded-lg hover:scale-110 transition-transform duration-300 group"
              title="View on GitHub"
            >
              <Github className="w-5 h-5 group-hover:text-console-accent transition-colors duration-300" />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden console-button p-2 rounded-lg hover:scale-110 transition-transform duration-300"
              title="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden animate-slide-in-left">
            <div className="console-panel mt-4 mb-4">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => handleNavigation('features')}
                  className="text-left text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider py-2 border-b border-console-border hover:border-console-accent"
                >
                  Features
                </button>
                <button
                  onClick={() => handleNavigation('games')}
                  className="text-left text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider py-2 border-b border-console-border hover:border-console-accent"
                >
                  Games
                </button>
                <button
                  onClick={() => handleNavigation('about')}
                  className="text-left text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider py-2 border-b border-console-border hover:border-console-accent"
                >
                  About
                </button>
                <button
                  onClick={() => handleNavigation('contact')}
                  className="text-left text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider py-2"
                >
                  Contact
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Animated Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-console-accent to-transparent opacity-50"></div>
    </header>
  )
} 