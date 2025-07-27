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
      const parsed = JSON.parse(data)
      console.log(`Loaded ${parsed.length} game prompts from migration data`)
      return parsed
    } else {
      console.log('Migration data not found, using fallback prompts')
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
    },
    {
      id: 'portal-rattmann',
      title: 'Portal: Rattmann\'s Descent',
      description: 'Navigate through Aperture Science\'s testing chambers with the help of your trusty portal gun.',
      genre: 'sci-fi',
      difficulty: 'medium' as const,
      themes: ['puzzle', 'science', 'humor'],
      mechanics: {
        diceSystem: 'd6',
        combatSystem: 'puzzle-based',
        skillSystem: 'logic, spatial reasoning, creativity',
        inventorySystem: 'portal gun only',
        questSystem: 'test chamber progression',
        specialRules: ['Portal Physics', 'GLaDOS Commentary', 'Test Chamber Logic']
      }
    },
    {
      id: 'pokemon-legends-olympus',
      title: 'Pokémon Legends: Olympus',
      description: 'Explore the ancient world of Olympus where Pokémon and Greek mythology intertwine.',
      genre: 'adventure',
      difficulty: 'easy' as const,
      themes: ['exploration', 'mythology', 'friendship'],
      mechanics: {
        diceSystem: 'd20',
        combatSystem: 'turn-based Pokémon battles',
        skillSystem: 'trainer skills, Pokémon bonding, exploration',
        inventorySystem: 'Pokémon team, items, Poké Balls',
        questSystem: 'mythological quests',
        specialRules: ['Pokémon Evolution', 'Mythical Encounters', 'Olympian Trials']
      }
    }
  ]
}

const gamePrompts = loadGamePrompts()

export async function GET(request: NextRequest) {
  try {
    console.log(`Returning ${gamePrompts.length} game prompts`)
    return NextResponse.json(gamePrompts)
  } catch (error) {
    console.error('Error fetching game prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game prompts' },
      { status: 500 }
    )
  }
} 