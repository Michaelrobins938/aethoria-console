'use client'

import React, { useState, useRef, useEffect } from 'react';
import { CartridgeSelector } from '@/components/CartridgeSelector';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { LoadingOverlay } from '@/components/LoadingSpinner';
import { FeaturesSection } from '@/components/FeaturesSection';
import { CharacterCreator } from '@/components/CharacterCreator';
import { GameInterface } from '@/components/GameInterface';
import { Character, GamePrompt } from '@/lib/types';
import { ArrowUp, Gamepad2, Users, BookOpen, Mail } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { AssistantModal } from '@/components/assistant-ui/assistant-modal';

export default function Home() {
  const [selectedCartridge, setSelectedCartridge] = useState<string | null>(null);
  const [gamePrompt, setGamePrompt] = useState<GamePrompt | null>(null);
  const [characters, setCharacters] = useState<Partial<Character>[] | undefined>(undefined);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('home');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const featuresRef = useRef<HTMLDivElement>(null);
  const gamesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const { initializeSession } = useGameStore();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleCartridgeSelect = async (cartridgeId: string, characters?: Partial<Character>[]) => {
    setSelectedCartridge(cartridgeId);
    setIsInitializing(true);
    setError(null);

    try {
      const response = await fetch(`/api/game-prompts/${cartridgeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game prompt');
      }
      const prompt: GamePrompt = await response.json();
      setGamePrompt(prompt);
      setCharacters(characters);

      await initializeSession(cartridgeId);

      if (characters && characters.length > 0) {
        setIsGameActive(true);
      } else {
        setShowCharacterCreator(true);
      }
    } catch (error) {
      console.error('Failed to initialize AI session:', error);
      setError('Failed to initialize game session. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleBackToCartridges = () => {
    setShowCharacterCreator(false);
    setSelectedCartridge(null);
    setCharacter(null);
    setIsGameActive(false);
  };

  const handleCharacterComplete = (newCharacter: Character) => {
    setCharacter(newCharacter);
    setShowCharacterCreator(false);
    setIsGameActive(true);
  };

  const handleGameEnd = () => {
    setIsGameActive(false);
    setSelectedCartridge(null);
    setCharacter(null);
    setShowIntro(true);
  };

  // ... (rest of the component remains the same)

  if (showCharacterCreator) {
    return (
      <main className="min-h-screen bg-console-dark mobile-full-height">
        {isInitializing && (
          <LoadingOverlay
            message="Initializing AI - Loading game world and preparing your adventure..."
            variant="gaming"
          />
        )}
        {gamePrompt && (
          <CharacterCreator
            onComplete={handleCharacterComplete}
            onBack={handleBackToCartridges}
            gamePrompt={gamePrompt}
          />
        )}
      </main>
    );
  }

  if (isGameActive && gamePrompt) {
    return (
      <GameInterface
        characters={characters}
        gamePrompt={gamePrompt}
        onBack={handleGameEnd}
      />
    );
  }

  return (
    <main className="min-h-screen bg-console-dark mobile-full-height">
      <Header onNavigate={() => {}} />
      {/* ... (rest of the JSX remains the same) */}
      <CartridgeSelector onCartridgeSelect={handleCartridgeSelect} />
    </main>
  );
}