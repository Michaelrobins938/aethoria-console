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
- Active Quests: ${gameState?.quests?.filter((q: any) => q.status === 'in_progress').length || 0}
- Inventory Items: ${gameState?.inventory?.length || 0}
- In Combat: ${gameState?.combatState?.isActive ? 'Yes' : 'No'}

Model: ${selectedModel} - ${modelDescription}

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

    // Create a readable stream from the OpenRouter response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No response body')
          }

          const decoder = new TextDecoder()
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
                  break
                }

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.choices?.[0]?.delta?.content) {
                    const text = parsed.choices[0].delta.content
                    // Format for AI SDK streaming
                    const streamData = `data: ${JSON.stringify({ content: text })}\n\n`
                    controller.enqueue(new TextEncoder().encode(streamData))
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                  continue
                }
              }
            }
          }
          
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error processing game input:', error)
    return NextResponse.json(
      { error: 'Failed to process input' },
      { status: 500 }
    )
  }
} 