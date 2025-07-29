import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    const hasApiKey = !!apiKey
    const apiKeyLength = apiKey ? apiKey.length : 0
    const apiKeyPrefix = apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    
    return NextResponse.json({
      status: 'ok',
      hasApiKey,
      apiKeyLength,
      apiKeyPrefix,
      envVars: {
        OPENROUTER_API_KEY: hasApiKey ? 'present' : 'missing',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 