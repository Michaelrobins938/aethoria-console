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
    console.log('- OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY?.length || 0)
    console.log('- OPENROUTER_API_KEY prefix:', process.env.OPENROUTER_API_KEY?.substring(0, 10) || 'none')
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    console.log('- VERCEL_ENV:', process.env.VERCEL_ENV)
    console.log('- All env vars:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('ROUTER')))

    // Try to use the actual OpenRouter API
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.log('No API key found, returning test response');
      const testResponse = {
        role: 'assistant',
        content: `Hello! I'm your AI Game Master. I received your message: "${messages[messages.length - 1]?.content || 'No message'}"\n\nThis is a test response to make sure the API is working. Once we confirm this works, I'll connect to the real AI.`
      };

      return NextResponse.json({
        success: true,
        message: testResponse,
        debug: {
          messageCount: messages.length,
          hasGamePrompt: !!gamePrompt,
          hasCharacter: !!character,
          envCheck: {
            hasApiKey: false,
            apiKeyLength: 0,
            apiKeyPrefix: 'none',
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV,
            envVars: Object.keys(process.env).filter(key => key.includes('API') || key.includes('ROUTER'))
          }
        }
      }, { status: 200 });
    }

    console.log('API key found, attempting OpenRouter call');
    
    try {
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aethoria-console.vercel.app',
          'X-Title': 'Aethoria Console'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an AI Game Master for Aethoria, an interactive storytelling game. Respond in character and help guide the player through their adventure.'
            },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        console.error('OpenRouter API error:', openRouterResponse.status, errorText);
        
        return NextResponse.json({
          success: false,
          error: 'OpenRouter API error',
          details: `${openRouterResponse.status}: ${errorText}`,
          debug: {
            hasApiKey: true,
            apiKeyLength: apiKey.length,
            apiKeyPrefix: apiKey.substring(0, 10),
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV
          }
        }, { status: 500 });
      }

      const openRouterData = await openRouterResponse.json();
      console.log('OpenRouter response:', openRouterData);

      const aiResponse = {
        role: 'assistant',
        content: openRouterData.choices[0]?.message?.content || 'No response from AI'
      };

      return NextResponse.json({
        success: true,
        message: aiResponse,
        debug: {
          messageCount: messages.length,
          hasGamePrompt: !!gamePrompt,
          hasCharacter: !!character,
          envCheck: {
            hasApiKey: true,
            apiKeyLength: apiKey.length,
            apiKeyPrefix: apiKey.substring(0, 10),
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV
          }
        }
      }, { status: 200 });

    } catch (error) {
      console.error('Error calling OpenRouter:', error);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to call OpenRouter API',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          hasApiKey: true,
          apiKeyLength: apiKey.length,
          apiKeyPrefix: apiKey.substring(0, 10),
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV
        }
      }, { status: 500 });
    }

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