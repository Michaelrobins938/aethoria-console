import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Load migrated game prompts
function loadGamePrompts() {
  try {
    const dataDir = path.join(process.cwd(), 'app', 'api', 'game-prompts', 'data')
    const indexFile = path.join(dataDir, 'index.json')
    
    if (fs.existsSync(indexFile)) {
      const data = fs.readFileSync(indexFile, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading game prompts:', error)
  }
  
  // Fallback to default prompts if migration data not found
  return [
    {
      id: 'silent-hill-echoes',
      title: 'Silent Hill: Echoes of the Fog',
      description: 'A psychological horror adventure where reality and nightmare blur together in a fog-shrouded town.',
      genre: 'horror',
      difficulty: 'hard' as const,
      themes: ['psychological horror', 'survival', 'mystery'],
      mechanics: {
        diceSystem: 'd20',
        combatSystem: 'turn-based with sanity mechanics',
        skillSystem: 'investigation, perception, survival',
        inventorySystem: 'limited resources',
        questSystem: 'psychological progression',
        specialRules: ['Sanity Meter', 'Reality Shifting', 'Radio Detection']
      }
    },
    {
      id: 'dnd-fantasy',
      title: 'D&D Fantasy Adventure',
      description: 'A classic fantasy adventure in the world of Aetheria, filled with magic, monsters, and epic quests.',
      genre: 'fantasy',
      difficulty: 'medium' as const,
      themes: ['adventure', 'magic', 'heroism'],
      mechanics: {
        diceSystem: 'd20',
        combatSystem: 'turn-based tactical',
        skillSystem: 'strength, dexterity, intelligence, wisdom, charisma',
        inventorySystem: 'unlimited with weight limits',
        questSystem: 'epic storylines',
        specialRules: ['Spellcasting', 'Character Classes', 'Experience Points']
      }
    }
  ]
}

const gamePrompts = loadGamePrompts()

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(gamePrompts)
  } catch (error) {
    console.error('Error fetching game prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game prompts' },
      { status: 500 }
    )
  }
} 