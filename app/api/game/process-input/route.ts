import { NextRequest, NextResponse } from 'next/server'
import { getModelForCartridge, getModelConfig, getModelDescription } from '@/lib/ai'

// Updated API route for OpenRouter integration with sophisticated model selection
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

    console.log('Processing input:', { cartridgeId, userInput })

    // Get the game prompt for this cartridge
    let gamePrompt = "You are an immersive Game Master running an interactive adventure. Respond in character, creating vivid descriptions and engaging scenarios. Keep responses concise but atmospheric."
    try {
      const promptResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/game-prompts/${cartridgeId}`)
      if (promptResponse.ok) {
        const prompt = await promptResponse.json()
        gamePrompt = prompt.content || gamePrompt
      } else {
        console.warn(`Failed to load game prompt for ${cartridgeId}: ${promptResponse.status}`)
      }
    } catch (error) {
      console.error('Failed to load game prompt:', error)
    }

    // Get the optimal model for this game genre
    const selectedModel = getModelForCartridge(cartridgeId)
    const modelConfig = getModelConfig(selectedModel)
    const modelDescription = getModelDescription(cartridgeId)

    console.log(`Using model: ${selectedModel} - ${modelDescription}`)

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { 
          error: 'OpenRouter API key not configured',
          message: 'Please set your OPENROUTER_API_KEY in the environment variables to use the AI chat feature.'
        },
        { status: 500 }
      )
    }

    // Create the system message with game state
    const systemMessage = {
      role: 'system' as const,
      content: `${gamePrompt}

Current Game State:
- Character: ${gameState?.character?.name || 'Unknown'}
- Location: ${gameState?.worldState?.location || 'Unknown'}
- Health: ${gameState?.character?.health || 0}/${gameState?.character?.maxHealth || 0}
- Level: ${gameState?.character?.level || 1}
- Active Quests: ${gameState?.quests?.filter((q: { status: string }) => q.status === 'in_progress').length || 0}
- Inventory Items: ${gameState?.inventory?.length || 0}
- In Combat: ${gameState?.combatState?.isActive ? 'Yes' : 'No'}

Model: ${selectedModel} - ${modelDescription}

IMPORTANT: After your response, include a JSON section with game state updates in this format:
{
  "gameState": {
    "location": "new location",
    "timeOfDay": "day/night",
    "weather": "clear/rainy/etc"
  },
  "characterUpdates": {
    "health": 95,
    "experience": 150
  },
  "questUpdates": [
    {
      "id": "quest_id",
      "progress": 2,
      "status": "in_progress"
    }
  ],
  "inventoryUpdates": [
    {
      "action": "add",
      "item": {
        "id": "sword",
        "name": "Iron Sword",
        "type": "weapon"
      }
    }
  ],
  "combatState": {
    "isActive": true,
    "enemies": []
  },
  "diceRolls": [
    {
      "type": "attack",
      "result": 15,
      "success": true
    }
  ]
}

Respond as the Game Master, creating an immersive and engaging experience. Keep responses concise but atmospheric.`
    }

    // Generate AI response using OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        'X-Title': 'Aethoria Console'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [systemMessage, ...messages],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        top_p: modelConfig.topP,
        frequency_penalty: modelConfig.frequencyPenalty,
        presence_penalty: modelConfig.presencePenalty,
        stream: false // Changed to false for structured response
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      return NextResponse.json(
        { 
          error: 'Failed to generate AI response',
          details: `OpenRouter API error: ${response.status}`
        },
        { status: 500 }
      )
    }

    const responseData = await response.json()
    const aiResponse = responseData.choices?.[0]?.message?.content || 'No response from AI'

    // Parse the AI response for game state updates
    let gameStateUpdates = {}
    let diceRolls = []
    let aiText = aiResponse

    // Try to extract JSON from the response
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        const parsed = JSON.parse(jsonStr)
        
        if (parsed.gameState) gameStateUpdates = parsed.gameState
        if (parsed.diceRolls) diceRolls = parsed.diceRolls
        
        // Remove the JSON from the text response
        aiText = aiResponse.replace(jsonStr, '').trim()
      }
    } catch (error) {
      console.warn('Failed to parse game state updates from AI response:', error)
    }

    // Return structured response
    return NextResponse.json({
      text: aiText,
      gameState: gameStateUpdates,
      diceRolls: diceRolls,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error processing game input:', error)
    return NextResponse.json(
      { error: 'Failed to process input' },
      { status: 500 }
    )
  }
} 