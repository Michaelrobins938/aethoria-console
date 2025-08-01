'use client'

import React from 'react'
import { DiceRoller3D } from '@/components/DiceRoller3D'
import { DiceRoll } from '@/lib/diceEngine'

export default function DiceRollerPage() {
  const handleRollComplete = (result: DiceRoll) => {
    console.log('Dice roll completed:', result)
  }

  return (
    <div className="min-h-screen bg-console-dark text-console-text p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-gaming text-console-accent mb-4">
            3D Dice Roller
          </h1>
          <p className="text-console-text-dim text-lg">
            Experience the thrill of rolling dice in 3D, just like at dm.tools/dice
          </p>
        </div>

        {/* Dice Roller */}
        <div className="bg-console-darker rounded-lg border border-console-border p-6">
          <DiceRoller3D onRollComplete={handleRollComplete} />
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-console-darker rounded-lg border border-console-border p-4">
            <h3 className="text-console-accent font-console text-lg mb-2">🎲 All Dice Types</h3>
            <p className="text-console-text-dim text-sm">
              Support for d4, d6, d8, d10, d12, d20, and d100 with accurate 3D geometry
            </p>
          </div>
          
          <div className="bg-console-darker rounded-lg border border-console-border p-4">
            <h3 className="text-console-accent font-console text-lg mb-2">⚡ Smooth Animation</h3>
            <p className="text-console-text-dim text-sm">
              Realistic 3D dice rolling animation with physics-based movement
            </p>
          </div>
          
          <div className="bg-console-darker rounded-lg border border-console-border p-4">
            <h3 className="text-console-accent font-console text-lg mb-2">🎯 D&D 5e Integration</h3>
            <p className="text-console-text-dim text-sm">
              Seamlessly integrated with your existing D&D 5e dice engine and combat system
            </p>
          </div>
        </div>

        {/* Integration Info */}
        <div className="mt-8 bg-console-darker rounded-lg border border-console-border p-6">
          <h2 className="text-console-accent font-console text-xl mb-4">Integration with Your Combat System</h2>
          <div className="space-y-2 text-console-text-dim text-sm">
            <p>✅ Connects to your existing <code className="bg-console-dark px-1 rounded">rollDice()</code> function</p>
            <p>✅ Supports complex dice notation like &quot;2d6+3&quot; and &quot;d20+5adv&quot;</p>
            <p>✅ Integrates with your voice command system</p>
            <p>✅ Works with your combat engine and initiative system</p>
            <p>✅ Matches your console/gaming theme</p>
          </div>
        </div>
      </div>
    </div>
  )
} 