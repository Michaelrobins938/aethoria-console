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

// Voice synthesis function using ElevenLabs
async function synthesizeSpeech(text: string, voiceId: string = 'JoYo65swyP8hH6fVMeTO'): Promise<string> {
  try {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY || 'sk_20c16a8e731826189e8dcb33a047c314fb4bfb5e67fbd075';
    
    console.log('Attempting voice synthesis with ElevenLabs...');
    console.log('Voice ID:', voiceId);
    console.log('Text length:', text.length);
    console.log('API Key length:', elevenLabsKey.length);
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    console.log('ElevenLabs response status:', response.status);
    console.log('ElevenLabs response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('ElevenLabs API error:', response.status, errorText);
      return '';
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('Audio buffer size:', audioBuffer.byteLength);
    
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;
    
    console.log('Generated audio data URL length:', audioDataUrl.length);
    return audioDataUrl;
  } catch (error) {
    console.log('Voice synthesis error:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
    return '';
  }
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
    console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    console.log('- VERCEL_ENV:', process.env.VERCEL_ENV)

    // Try OpenRouter first, then OpenAI, then fallback
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    // Create system prompt based on game context
    let systemPrompt = 'You are an AI Game Master for Aethoria, an interactive storytelling game. Respond in character and help guide the player through their adventure.';
    
    if (gamePrompt) {
      systemPrompt += `\n\nGame Context: ${gamePrompt.title}\n${gamePrompt.description}\n\nGenre: ${gamePrompt.genre}\nDifficulty: ${gamePrompt.difficulty}`;
    }
    
    if (character) {
      systemPrompt += `\n\nPlayer Character: ${character.name}\nClass: ${character.class}\nLevel: ${character.level}`;
    }

    // Try OpenRouter API first
    if (openRouterKey) {
      try {
        console.log('Attempting OpenRouter API call...');
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://aethoria-console.vercel.app',
            'X-Title': 'Aethoria Console'
          },
          body: JSON.stringify({
            model: 'openai/gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });

        if (openRouterResponse.ok) {
          const openRouterData = await openRouterResponse.json();
          console.log('OpenRouter success:', openRouterData);

          const aiResponse = {
            role: 'assistant',
            content: openRouterData.choices[0]?.message?.content || 'No response from AI'
          };

          // Generate voice synthesis for the AI response
          const audioData = await synthesizeSpeech(aiResponse.content);

          return NextResponse.json({
            success: true,
            message: aiResponse,
            provider: 'openrouter',
            audio: audioData || null
          }, { status: 200 });
        } else {
          console.log('OpenRouter failed, trying OpenAI...');
        }
      } catch (error) {
        console.log('OpenRouter error, trying OpenAI...', error);
      }
    }

    // Try OpenAI API directly
    if (openAIKey) {
      try {
        console.log('Attempting OpenAI API call...');
        console.log('OpenAI Key length:', openAIKey.length);
        console.log('OpenAI Key prefix:', openAIKey.substring(0, 10));
        
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });

        console.log('OpenAI Response status:', openAIResponse.status);
        console.log('OpenAI Response ok:', openAIResponse.ok);

        if (openAIResponse.ok) {
          const openAIData = await openAIResponse.json();
          console.log('OpenAI success:', openAIData);

          const aiResponse = {
            role: 'assistant',
            content: openAIData.choices[0]?.message?.content || 'No response from AI'
          };

          // Generate voice synthesis for the AI response
          const audioData = await synthesizeSpeech(aiResponse.content);

          return NextResponse.json({
            success: true,
            message: aiResponse,
            provider: 'openai',
            audio: audioData || null
          }, { status: 200 });
        } else {
          const errorText = await openAIResponse.text();
          console.log('OpenAI failed with status:', openAIResponse.status);
          console.log('OpenAI error response:', errorText);
          
          // Check for quota error specifically
          if (errorText.includes('insufficient_quota') || errorText.includes('quota')) {
            const quotaErrorResponse = {
              role: 'assistant',
              content: `🎮 Welcome to Aethoria! I'm your AI Game Master. I received your message: "${messages[messages.length - 1]?.content || 'Hello'}"\n\nI can see your OpenAI API key is working, but it appears to have no available quota/credits. To enable full AI functionality, please add credits to your OpenAI account at https://platform.openai.com/account/billing\n\nFor now, I can help guide you through the game interface and explain how the system works!`
            };

            return NextResponse.json({
              success: true,
              message: quotaErrorResponse,
              provider: 'openai-quota-error',
              debug: {
                messageCount: messages.length,
                hasGamePrompt: !!gamePrompt,
                hasCharacter: !!character,
                envCheck: {
                  hasOpenRouterKey: !!openRouterKey,
                  hasOpenAIKey: !!openAIKey,
                  nodeEnv: process.env.NODE_ENV,
                  vercelEnv: process.env.VERCEL_ENV
                }
              }
            }, { status: 200 });
          }
        }
      } catch (error) {
        console.log('OpenAI error:', error);
        console.log('OpenAI error message:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Fallback response if no API keys work
    console.log('Using fallback response');
    const lastMessage = messages[messages.length - 1]?.content || 'Hello';
    const fallbackResponse = {
      role: 'assistant',
      content: `🎮 Welcome to Aethoria! I'm your AI Game Master. I received your message: "${lastMessage}"\n\nThis is a fallback response while we set up the AI connection. To enable full AI functionality, please add your OpenAI API key to the environment variables.\n\nFor now, I can help guide you through the game interface and explain how the system works!`
    };

    return NextResponse.json({
      success: true,
      message: fallbackResponse,
      provider: 'fallback',
      debug: {
        messageCount: messages.length,
        hasGamePrompt: !!gamePrompt,
        hasCharacter: !!character,
        envCheck: {
          hasOpenRouterKey: !!openRouterKey,
          hasOpenAIKey: !!openAIKey,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV
        }
      }
    }, { status: 200 });

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