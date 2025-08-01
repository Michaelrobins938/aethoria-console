import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Cache for game prompts to avoid repeated file reads
const promptCache = new Map<string, any>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Check cache first
    const cached = promptCache.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // Load game prompts data
    const promptsPath = path.join(process.cwd(), 'app/api/game-prompts/data/index.json')
    
    if (!fs.existsSync(promptsPath)) {
      return NextResponse.json(
        { error: 'Game prompts data not found' },
        { status: 404 }
      )
    }

    const promptsData = JSON.parse(fs.readFileSync(promptsPath, 'utf8'))
    const prompt = promptsData.find((p: any) => p.id === id)

    if (!prompt) {
      return NextResponse.json(
        { error: 'Game prompt not found' },
        { status: 404 }
      )
    }

    // Cache the result
    promptCache.set(id, {
      data: prompt,
      timestamp: Date.now()
    })

    return NextResponse.json(prompt)
  } catch (error) {
    console.error('Error loading game prompt:', error)
    return NextResponse.json(
      { error: 'Failed to load game prompt' },
      { status: 500 }
    )
  }
} 