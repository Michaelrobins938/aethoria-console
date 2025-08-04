'use client'

import React from 'react';
import { Character } from '@/lib/types';

interface CharacterSelectorProps {
  characters?: Partial<Character>[];
  onCharacterSelect: (character: Character) => void;
}

export function CharacterSelector({ characters, onCharacterSelect }: CharacterSelectorProps) {
  if (!characters || characters.length === 0) {
    // Handle the case where there are no characters
    return <div>No characters available for this game.</div>;
  }

  return (
    <div className="min-h-screen bg-console-dark flex items-center justify-center">
      <div className="console-card w-full max-w-md mx-4">
        <h2 className="text-2xl font-gaming text-console-accent mb-6">Select Your Character</h2>
        <div className="space-y-4">
          {characters.map((character, index) => (
            <div
              key={index}
              className="p-4 border border-console-border rounded cursor-pointer transition-all hover:border-console-accent hover:console-glow"
              onClick={() => onCharacterSelect(character as Character)}
            >
              <h3 className="font-gaming text-console-accent">{character.name}</h3>
              <p className="text-sm text-console-text-dim">{character.background}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
