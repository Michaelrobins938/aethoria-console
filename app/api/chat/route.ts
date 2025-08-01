import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Call the Python AI backend
    const response = await fetch('http://localhost:8000/api/game/process-input', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'user_input',
        content: message,
        cartridge_id: 'default',
        session_id: sessionId || 'default-session'
      })
    })

    if (!response.ok) {
      throw new Error(`Backend API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      response: data.content || 'I apologize, but I encountered an error processing your request.',
      sessionId: data.session_id || sessionId
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Fallback response if backend is not available
    return NextResponse.json({
      response: `I understand you said: "${message}". This is a fallback response while the AI backend is being configured.`,
      sessionId: sessionId || 'default-session'
    })
  }
} 