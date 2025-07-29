import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    console.log('=== CHAT API CALLED ===')
    
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { messages, gamePrompt, character } = body;
    
    if (!messages) {
      console.log('No messages provided')
      return NextResponse.json(
        { error: 'Missing messages' },
        { status: 400 }
      )
    }

    console.log('Environment check:')
    console.log('- OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY)
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    console.log('- VERCEL_ENV:', process.env.VERCEL_ENV)

    // For now, just return a simple response to test the flow
    const testResponse = {
      role: 'assistant',
      content: `Hello! I'm your AI Game Master. I received your message: "${messages[messages.length - 1]?.content || 'No message'}"\n\nThis is a test response to make sure the API is working. Once we confirm this works, I'll connect to the real AI.`
    };

    console.log('Sending test response:', testResponse)

    // Return a simple JSON response instead of streaming for now
    return NextResponse.json({
      success: true,
      message: testResponse,
      debug: {
        messageCount: messages.length,
        hasGamePrompt: !!gamePrompt,
        hasCharacter: !!character,
        envCheck: {
          hasApiKey: !!process.env.OPENROUTER_API_KEY,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV
        }
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Sorry, there was an error processing your request. Please try again.',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    )
  }
} 