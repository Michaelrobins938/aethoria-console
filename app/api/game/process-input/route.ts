import { NextRequest, NextResponse } from 'next/server'
import { streamText } from 'ai'
import { getModelForCartridge, getAIProvider } from '@/lib/ai'

// Updated API route for assistant-ui integration
export async function POST(request: NextRequest) {
  try {
    const { messages, cartridgeId, gameState } = await request.json()
    
    if (!messages || !cartridgeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    const userInput = lastMessage.content

    // Get the game prompt for this cartridge
    let gamePrompt = "You are an immersive Game Master running an interactive adventure. Respond in character, creating vivid descriptions and engaging scenarios. Keep responses concise but atmospheric."
    try {
      const promptResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/game-prompts/${cartridgeId}`)
      if (promptResponse.ok) {
        const prompt = await promptResponse.json()
        gamePrompt = prompt.content || gamePrompt
      }
    } catch (error) {
      console.error('Failed to load game prompt:', error)
    }

    // Get the appropriate model for this cartridge
    const model = getModelForCartridge(cartridgeId)
    const aiProvider = getAIProvider(model)

    // Generate AI response with streaming
    return streamText({
      model: aiProvider,
      messages: [
        {
          role: 'system',
          content: `${gamePrompt}

Current Game State:
- Character: ${gameState?.character?.name || 'Unknown'}
- Location: ${gameState?.worldState?.location || 'Unknown'}
- Health: ${gameState?.character?.health || 0}/${gameState?.character?.maxHealth || 0}
- Level: ${gameState?.character?.level || 1}
- Active Quests: ${gameState?.quests?.filter((q: any) => q.status === 'in_progress').length || 0}
- Inventory Items: ${gameState?.inventory?.length || 0}
- In Combat: ${gameState?.combatState?.isActive ? 'Yes' : 'No'}

Respond as the Game Master, creating an immersive and engaging experience. Keep responses concise but atmospheric.`
        },
        ...messages
      ],
      temperature: 0.8,
      maxTokens: 500,
    })
  } catch (error) {
    console.error('Error processing game input:', error)
    return NextResponse.json(
      { error: 'Failed to process input' },
      { status: 500 }
    )
  }
} 