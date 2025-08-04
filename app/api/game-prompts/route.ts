import { NextRequest, NextResponse } from 'next/server'
import gamePrompts from './data/index.json'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(gamePrompts)
  } catch (error) {
    console.error('Error fetching game prompts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game prompts' },
      { status: 500 }
    )
  }
}