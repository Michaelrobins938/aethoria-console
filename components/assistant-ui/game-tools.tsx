'use client'

import { makeAssistantToolUI } from "@assistant-ui/react"
import { DiceRoller3D } from '@/components/DiceRoller3D'
import { DiceRoll } from '@/lib/diceEngine'

// Dice Roller Tool
export const DiceRollToolUI = makeAssistantToolUI({
  name: "dice_roller",
  description: "Roll dice for D&D 5e combat and skill checks",
  parameters: {
    type: "object",
    properties: {
      diceType: {
        type: "string",
        enum: ["d4", "d6", "d8", "d10", "d12", "d20", "d100"],
        description: "The type of dice to roll"
      },
      notation: {
        type: "string",
        description: "Complex dice notation (e.g., '2d6+3', 'd20+5adv')"
      }
    },
    required: ["diceType"]
  },
  render: ({ diceType, notation }) => {
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
})

// Character Stats Tool
export const CharacterStatsToolUI = makeAssistantToolUI({
  name: "character_stats",
  description: "View and manage character statistics",
  parameters: {
    type: "object",
    properties: {
      showDetails: {
        type: "boolean",
        description: "Show detailed character information"
      }
    }
  },
  render: ({ showDetails }) => {
    return (
      <div className="p-4 bg-console-darker rounded-lg border border-console-border">
        <h3 className="text-console-accent font-console text-lg mb-4">👤 Character Stats</h3>
        <div className="space-y-2 text-console-text-dim text-sm">
          <div>Health: 15/20</div>
          <div>Level: 3</div>
          <div>Experience: 2,450/3,000</div>
          {showDetails && (
            <>
              <div>Strength: 16 (+3)</div>
              <div>Dexterity: 14 (+2)</div>
              <div>Constitution: 12 (+1)</div>
              <div>Intelligence: 10 (+0)</div>
              <div>Wisdom: 8 (-1)</div>
              <div>Charisma: 18 (+4)</div>
            </>
          )}
        </div>
      </div>
    )
  }
})

// Combat Tool
export const CombatToolUI = makeAssistantToolUI({
  name: "combat",
  description: "Manage combat encounters and actions",
  parameters: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["attack", "cast_spell", "use_item", "roll_initiative"],
        description: "The combat action to perform"
      },
      target: {
        type: "string",
        description: "Target for the action"
      }
    },
    required: ["action"]
  },
  render: ({ action, target }) => {
    return (
      <div className="p-4 bg-console-darker rounded-lg border border-console-border">
        <h3 className="text-console-accent font-console text-lg mb-4">⚔️ Combat</h3>
        <div className="space-y-2 text-console-text-dim text-sm">
          <div>Action: {action}</div>
          {target && <div>Target: {target}</div>}
          <div>Initiative: 18</div>
          <div>Turn: 3</div>
          <div>Round: 2</div>
        </div>
      </div>
    )
  }
})

// Inventory Tool
export const InventoryToolUI = makeAssistantToolUI({
  name: "inventory",
  description: "Manage character inventory and items",
  parameters: {
    type: "object",
    properties: {
      filter: {
        type: "string",
        enum: ["all", "weapons", "armor", "consumables", "magic"],
        description: "Filter items by type"
      }
    }
  },
  render: ({ filter = "all" }) => {
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
})

// Quest Tool
export const QuestToolUI = makeAssistantToolUI({
  name: "quests",
  description: "View and manage quests",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["all", "active", "completed", "failed"],
        description: "Filter quests by status"
      }
    }
  },
  render: ({ status = "all" }) => {
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
})

// Map Tool
export const MapToolUI = makeAssistantToolUI({
  name: "map",
  description: "View the game world map and locations",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "Specific location to view"
      }
    }
  },
  render: ({ location }) => {
    return (
      <div className="p-4 bg-console-darker rounded-lg border border-console-border">
        <h3 className="text-console-accent font-console text-lg mb-4">🗺️ Map</h3>
        <div className="space-y-2 text-console-text-dim text-sm">
          <div>Current Location: Forest of Shadows</div>
          <div>Nearby Areas:</div>
          <div>• Goblin Cave (0.5 miles)</div>
          <div>• Ancient Ruins (2 miles)</div>
          <div>• Village of Eldara (5 miles)</div>
          <div>• Dragon's Peak (10 miles)</div>
        </div>
      </div>
    )
  }
}) 