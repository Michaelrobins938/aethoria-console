import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30;

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

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
    const response = NextResponse.json({
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
    }, { status: 200 })
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return response

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