import { NextRequest, NextResponse } from 'next/server'
import type { AIResponse, Character, WorldState, Quest, Item, CombatState } from '@/lib/types'

// Simple AI response generator (replace with actual AI API call)
async function generateAIResponse(
  userInput: string,
  gameState: {
    character: Character
    worldState: WorldState
    quests: Quest[]
    inventory: Item[]
    combatState: CombatState | null
  },
  gamePrompt: string
): Promise<AIResponse> {
  // This is a simplified response generator
  // In production, you would call OpenAI, Groq, or another AI service
  
  const { character, worldState, combatState } = gameState
  
  // Simple keyword-based response system
  const input = userInput.toLowerCase()
  
  // Combat responses
  if (combatState?.isActive) {
    if (input.includes('attack') || input.includes('fight')) {
      const damage = Math.max(0, character.attack - 5 + Math.floor(Math.random() * 6))
      return {
        text: `You swing your weapon and deal ${damage} damage to the enemy! The enemy looks wounded but still stands.`,
        gameState: {},
        diceRolls: [{
          type: 'Attack Roll',
          dice: 'd20',
          result: Math.floor(Math.random() * 20) + 1,
          modifier: character.attack,
          total: character.attack + Math.floor(Math.random() * 20) + 1,
          success: true
        }]
      }
    }
    
    if (input.includes('flee') || input.includes('run')) {
      const fleeChance = 0.3 + (character.speed * 0.05)
      const success = Math.random() < fleeChance
      
      return {
        text: success 
          ? "You successfully flee from combat and find yourself in a safe location."
          : "You try to flee but the enemy blocks your path!",
        gameState: success ? { location: 'Safe Haven' } : {},
        combatState: success ? { isActive: false } : {}
      }
    }
  }
  
  // Exploration responses
  if (input.includes('look') || input.includes('examine') || input.includes('search')) {
    const locations = ['Ancient Forest', 'Mysterious Cave', 'Abandoned Village', 'Dark Castle']
    const currentLocation = worldState.location === 'Unknown' 
      ? locations[Math.floor(Math.random() * locations.length)]
      : worldState.location
      
    return {
      text: `You examine your surroundings. You're in ${currentLocation}. The area is filled with mystery and adventure. What would you like to do?`,
      gameState: { location: currentLocation }
    }
  }
  
  // Movement responses
  if (input.includes('go') || input.includes('move') || input.includes('walk')) {
    const directions = ['north', 'south', 'east', 'west']
    const direction = directions.find(dir => input.includes(dir)) || 'forward'
    
    return {
      text: `You move ${direction} and discover new surroundings. The path ahead is unclear but full of possibilities.`,
      gameState: { location: `New Area - ${direction}` }
    }
  }
  
  // Inventory responses
  if (input.includes('inventory') || input.includes('items')) {
    const itemCount = gameState.inventory.length
    return {
      text: `You check your inventory. You have ${itemCount} items. ${itemCount === 0 ? 'Your pack is empty.' : 'What would you like to use?'}`
    }
  }
  
  // Quest responses
  if (input.includes('quest') || input.includes('mission')) {
    const activeQuests = gameState.quests.filter(q => q.status === 'in_progress')
    if (activeQuests.length === 0) {
      return {
        text: "You don't have any active quests at the moment. Perhaps you should explore and see what adventures await?"
      }
    } else {
      return {
        text: `You have ${activeQuests.length} active quest(s). The most recent is: "${activeQuests[0].title}". How would you like to proceed?`
      }
    }
  }
  
  // Default response
  return {
    text: "I understand you want to interact with this world. Could you be more specific about what you'd like to do? You can explore, fight, search, or interact with the environment.",
    gameState: {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, userInput, gameState } = body

    if (!userInput || !gameState) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(userInput, gameState, "You are a Game Master...")

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error('Error processing game input:', error)
    return NextResponse.json(
      { error: 'Failed to process input' },
      { status: 500 }
    )
  }
} 