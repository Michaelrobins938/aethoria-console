'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X, Settings, HelpCircle, Github, ExternalLink, Gamepad2 } from 'lucide-react'

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-console-darker/95 backdrop-blur-console border-b border-console-accent/30 shadow-console' 
        : 'bg-transparent'
    }`}>
      {/* Animated background scan line */}
      <div className="absolute inset-0 scan-line opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
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
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-console-accent to-console-accent-dark rounded-lg flex items-center justify-center shadow-console group-hover:shadow-console-hover transition-all duration-300 group-hover:scale-110 animate-pulse-glow">
                    <Gamepad2 className="w-6 h-6 text-console-dark" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-console-accent to-console-accent-dark rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
                </div>
                
                {/* Text Logo */}
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-gaming font-bold gradient-text">
                    AETHORIA
                  </h1>
                  <p className="text-xs text-console-text-dim font-console tracking-wider">
                    AI GAMING CONSOLE
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('features')}
              className="nav-link"
            >
              FEATURES
            </button>
            <button
              onClick={() => handleNavigation('games')}
              className="nav-link"
            >
              GAMES
            </button>
            <button
              onClick={() => handleNavigation('about')}
              className="nav-link"
            >
              ABOUT
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className="nav-link"
            >
              CONTACT
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="status-online"></div>
              <span className="text-xs text-console-text-dim font-console">ONLINE</span>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => handleNavigation('settings')}
              className="console-button p-2 rounded-lg hover:scale-110 transition-transform duration-300 group"
              title="Settings"
            >
              <Settings className="w-5 h-5 group-hover:text-console-accent transition-colors duration-300" />
            </button>

            {/* Help Button */}
            <button
              onClick={() => handleNavigation('help')}
              className="console-button p-2 rounded-lg hover:scale-110 transition-transform duration-300 group"
              title="Help"
            >
              <HelpCircle className="w-5 h-5 group-hover:text-console-accent transition-colors duration-300" />
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
              className="lg:hidden console-button p-2 rounded-lg hover:scale-110 transition-transform duration-300 group"
              title="Menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 group-hover:text-console-accent transition-colors duration-300" />
              ) : (
                <Menu className="w-5 h-5 group-hover:text-console-accent transition-colors duration-300" />
              )}
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
                  className="text-left text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider py-3 border-b border-console-border hover:border-console-accent group"
                >
                  <span className="group-hover:animate-glitch">FEATURES</span>
                </button>
                <button
                  onClick={() => handleNavigation('games')}
                  className="text-left text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider py-3 border-b border-console-border hover:border-console-accent group"
                >
                  <span className="group-hover:animate-glitch">GAMES</span>
                </button>
                <button
                  onClick={() => handleNavigation('about')}
                  className="text-left text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider py-3 border-b border-console-border hover:border-console-accent group"
                >
                  <span className="group-hover:animate-glitch">ABOUT</span>
                </button>
                <button
                  onClick={() => handleNavigation('contact')}
                  className="text-left text-console-text hover:text-console-accent transition-colors duration-300 font-gaming text-sm uppercase tracking-wider py-3 group"
                >
                  <span className="group-hover:animate-glitch">CONTACT</span>
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