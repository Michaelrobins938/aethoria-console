'use client'

import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { useState, useEffect } from "react";
import { Character, GamePrompt } from "@/lib/types";
import { useSearchParams } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AssistantUIPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [gamePrompt, setGamePrompt] = useState<GamePrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  // Initialize with character and game prompt from URL parameters or defaults
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Try to get character and game from URL parameters
        const characterParam = searchParams.get('character');
        const gameParam = searchParams.get('game');

        let characterData: Character | null = null;
        let gameData: GamePrompt | null = null;

        if (characterParam && gameParam) {
          try {
            characterData = JSON.parse(decodeURIComponent(characterParam));
            gameData = JSON.parse(decodeURIComponent(gameParam));
          } catch (error) {
            console.error('Failed to parse URL parameters:', error);
          }
        }

        // If no valid data from URL, use defaults
        if (!characterData) {
          characterData = {
            id: "default-character",
            name: "Adventurer",
            health: 100,
            maxHealth: 100,
            armorClass: 10,
            attack: 10,
            level: 1,
            experience: 0,
            experienceToNextLevel: 1000,
            proficiencyBonus: 2,
            inventory: [],
            skills: [
              { name: "Sword Fighting", level: 1, experience: 0, maxLevel: 5, description: "Basic sword combat", type: "combat" as const },
              { name: "Stealth", level: 1, experience: 0, maxLevel: 5, description: "Moving silently", type: "exploration" as const }
            ],
            statusEffects: {},
            background: "A mysterious traveler seeking adventure",
            abilities: {
              strength: 14,
              dexterity: 12,
              constitution: 16,
              intelligence: 10,
              wisdom: 8,
              charisma: 12
            },
            type: 'player'
          };
        }

        if (!gameData) {
          gameData = {
            id: "fantasy-adventure",
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
          };
        }

        setCharacter(characterData);
        setGamePrompt(gameData);
      } catch (error) {
        console.error('Error initializing game:', error);
        // Set defaults on error
        setCharacter({
          id: "default-character",
          name: "Adventurer",
          health: 100,
          maxHealth: 100,
          armorClass: 10,
          attack: 10,
          level: 1,
          experience: 0,
          experienceToNextLevel: 1000,
          proficiencyBonus: 2,
          inventory: [],
          skills: [
            { name: "Sword Fighting", level: 1, experience: 0, maxLevel: 5, description: "Basic sword combat", type: "combat" as const },
            { name: "Stealth", level: 1, experience: 0, maxLevel: 5, description: "Moving silently", type: "exploration" as const }
          ],
          statusEffects: {},
          background: "A mysterious traveler seeking adventure",
          abilities: {
            strength: 14,
            dexterity: 12,
            constitution: 16,
            intelligence: 10,
            wisdom: 8,
            charisma: 12
          },
          type: 'player'
        });
        setGamePrompt({
          id: "fantasy-adventure",
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
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-console-dark flex items-center justify-center">
        <div className="text-console-text font-console text-lg">Loading your adventure...</div>
      </div>
    );
  }

  if (!character || !gamePrompt) {
    return (
      <div className="min-h-screen bg-console-dark flex items-center justify-center">
        <div className="text-console-text font-console text-lg">Failed to load game data. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-console-dark p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="bg-console-darker border border-console-border rounded-lg p-4">
          <h1 className="text-console-accent font-console text-2xl mb-2">
            {gamePrompt.title}
          </h1>
          <p className="text-console-text font-console text-sm mb-2">
            {gamePrompt.description}
          </p>
          <div className="flex items-center space-x-4 text-console-text-dim font-console text-xs">
            <span>Genre: {gamePrompt.genre}</span>
            <span>Difficulty: {gamePrompt.difficulty}</span>
            <span>Themes: {gamePrompt.themes.join(', ')}</span>
            <span>Character: {character.name}</span>
          </div>
        </div>
      </div>

      {/* Assistant-UI Interface */}
      <div className="grid h-[calc(100vh-200px)] grid-cols-[300px_1fr] gap-4">
        <ThreadList character={character} gamePrompt={gamePrompt} />
        <Thread />
      </div>
    </div>
  );
} 