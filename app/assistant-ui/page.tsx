'use client'

import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { useState, useEffect } from "react";
import { Character, GamePrompt } from "@/lib/types";

export default function AssistantUIPage() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [gamePrompt, setGamePrompt] = useState<GamePrompt | null>(null);

  // Initialize with a default character and game prompt for demo
  useEffect(() => {
    const defaultCharacter: Character = {
      name: "Adventurer",
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      speed: 10,
      level: 1,
      experience: 0,
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


    };

    const defaultGamePrompt: GamePrompt = {
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

    setCharacter(defaultCharacter);
    setGamePrompt(defaultGamePrompt);
  }, []);

  if (!character || !gamePrompt) {
    return (
      <div className="min-h-screen bg-console-dark flex items-center justify-center">
        <div className="text-console-text font-console">Loading Assistant-UI...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-console-dark p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="bg-console-darker border border-console-border rounded-lg p-4">
          <h1 className="text-console-accent font-console text-2xl mb-2">
            Assistant-UI Chat Interface
          </h1>
          <p className="text-console-text font-console text-sm mb-2">
            {gamePrompt.title} - {gamePrompt.description}
          </p>
          <div className="flex items-center space-x-4 text-console-text-dim font-console text-xs">
            <span>Genre: {gamePrompt.genre}</span>
            <span>Difficulty: {gamePrompt.difficulty}</span>
            <span>Themes: {gamePrompt.themes.join(', ')}</span>
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