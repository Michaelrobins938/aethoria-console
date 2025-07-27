import { NextRequest, NextResponse } from 'next/server'
import { getModelForCartridge, getModelConfig, getModelDescription } from '@/lib/ai'

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, gamePrompt, character } = await req.json();
    
    if (!messages) {
      return NextResponse.json(
        { error: 'Missing messages' },
        { status: 400 }
      )
    }

    // Determine the game genre and select appropriate model
    const genre = gamePrompt?.genre?.toLowerCase() || 'fantasy'
    let cartridgeId = 'fantasy-adventure' // default
    
    // Map genre to cartridge ID for model selection
    if (genre.includes('horror')) {
      cartridgeId = 'horror-adventure'
    } else if (genre.includes('sci-fi') || genre.includes('scifi')) {
      cartridgeId = 'scifi-adventure'
    } else if (genre.includes('comedy')) {
      cartridgeId = 'comedy-adventure'
    } else if (genre.includes('drama')) {
      cartridgeId = 'drama-adventure'
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

    // Create a system message that includes game context
    const systemMessage = {
      role: "system" as const,
      content: `You are an AI Game Master for Aethoria, an interactive storytelling game. 

${gamePrompt ? `Current Game: ${gamePrompt.title}
Genre: ${gamePrompt.genre}
Themes: ${gamePrompt.themes.join(', ')}
Difficulty: ${gamePrompt.difficulty}

Game Description: ${gamePrompt.description}

${character ? `Player Character: ${character.name}
Character Stats: STR ${character.abilities.strength}, DEX ${character.abilities.dexterity}, CON ${character.abilities.constitution}, INT ${character.abilities.intelligence}, WIS ${character.abilities.wisdom}, CHA ${character.abilities.charisma}
Character Skills: ${character.skills.map((s: any) => s.name).join(', ')}
Character Background: ${character.background}` : ''}

Game Mechanics: ${gamePrompt.mechanics ? JSON.stringify(gamePrompt.mechanics) : 'Standard D&D 5e inspired mechanics'}` : 'You are running a generic fantasy adventure game.'}

Model: ${selectedModel} - ${modelDescription}

IMPORTANT GUIDELINES:
1. Stay in character as the Game Master at all times
2. Use descriptive, atmospheric language that matches the game's genre and themes
3. When dice rolls are needed, clearly state what type of roll and what die to use
4. Provide meaningful choices and consequences
5. Keep the narrative engaging and interactive
6. Respond in a conversational, immersive style
7. Use the character's stats and abilities when relevant
8. Maintain consistency with the game's established lore and mechanics

Begin the adventure and respond to the player's actions accordingly.`
    };

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
        stream: true
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

    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Sorry, there was an error processing your request. Please try again.'
      },
      { status: 500 }
    )
  }
} 