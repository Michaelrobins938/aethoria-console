'use client'

import React from 'react'
import { DiceRoller3D } from '@/components/DiceRoller3D'
import { DiceRoll } from '@/lib/diceEngine'

// Dice Roller Tool
export const DiceRollToolUI = () => {
  const handleRollComplete = (result: DiceRoll) => {
    console.log('Dice roll result:', result)
    // This will be integrated with the chat system
  }

  return (
    <div className="p-4 bg-console-darker rounded-lg border border-console-border">
      <h3 className="text-console-accent font-console text-lg mb-4">🎲 3D Dice Roller</h3>
      <DiceRoller3D 
        onRollComplete={handleRollComplete}
        className="w-full"
      />
    </div>
  )
}

// Character Stats Tool
export const CharacterStatsToolUI = () => {
  return (
    <div className="p-4 bg-console-darker rounded-lg border border-console-border">
      <h3 className="text-console-accent font-console text-lg mb-4">👤 Character Stats</h3>
      <div className="space-y-2 text-console-text-dim text-sm">
        <div>Health: 15/20</div>
        <div>Level: 3</div>
        <div>Experience: 2,450/3,000</div>
        <div>Strength: 16 (+3)</div>
        <div>Dexterity: 14 (+2)</div>
        <div>Constitution: 12 (+1)</div>
        <div>Intelligence: 10 (+0)</div>
        <div>Wisdom: 8 (-1)</div>
        <div>Charisma: 18 (+4)</div>
      </div>
    </div>
  )
}

// Combat Tool
export const CombatToolUI = () => {
  return (
    <div className="p-4 bg-console-darker rounded-lg border border-console-border">
      <h3 className="text-console-accent font-console text-lg mb-4">⚔️ Combat</h3>
      <div className="space-y-2 text-console-text-dim text-sm">
        <div>Action: Attack</div>
        <div>Target: Goblin</div>
        <div>Initiative: 18</div>
        <div>Turn: 3</div>
        <div>Round: 2</div>
      </div>
    </div>
  )
}

// Inventory Tool
export const InventoryToolUI = () => {
  return (
    <div className="p-4 bg-console-darker rounded-lg border border-console-border">
      <h3 className="text-console-accent font-console text-lg mb-4">🎒 Inventory</h3>
      <div className="space-y-2 text-console-text-dim text-sm">
        <div>Longsword (1d8 slashing)</div>
        <div>Leather Armor (AC 11)</div>
        <div>Healing Potion (2d4+2)</div>
        <div>Torch (1)</div>
        <div>Rope, 50ft (1)</div>
      </div>
    </div>
  )
}

// Quest Tool
export const QuestToolUI = () => {
  return (
    <div className="p-4 bg-console-darker rounded-lg border border-console-border">
      <h3 className="text-console-accent font-console text-lg mb-4">📜 Quests</h3>
      <div className="space-y-2 text-console-text-dim text-sm">
        <div>✅ Clear the Goblin Cave (Completed)</div>
        <div>🔄 Find the Lost Artifact (Active)</div>
        <div>⏳ Defeat the Dragon (Active)</div>
        <div>❌ Save the Village (Failed)</div>
      </div>
    </div>
  )
}

// Map Tool
export const MapToolUI = () => {
  return (
    <div className="p-4 bg-console-darker rounded-lg border border-console-border">
      <h3 className="text-console-accent font-console text-lg mb-4">🗺️ Map</h3>
      <div className="space-y-2 text-console-text-dim text-sm">
        <div>Current Location: Forest of Shadows</div>
        <div>Nearby Areas:</div>
        <div>• Goblin Cave (0.5 miles)</div>
        <div>• Ancient Ruins (2 miles)</div>
        <div>• Village of Eldara (5 miles)</div>
        <div>• Dragon&apos;s Peak (10 miles)</div>
      </div>
    </div>
  )
} 