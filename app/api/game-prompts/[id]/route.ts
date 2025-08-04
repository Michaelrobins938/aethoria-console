import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Load individual game prompt
function loadGamePrompt(id: string) {
  try {
    const dataDir = path.join(process.cwd(), 'app', 'api', 'game-prompts', 'data')
    const promptFile = path.join(dataDir, `${id}.json`)
    
    if (fs.existsSync(promptFile)) {
      const data = fs.readFileSync(promptFile, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error loading game prompt ${id}:`, error)
  }
  
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prompt = loadGamePrompt(params.id)
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Game prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error('Error fetching game prompt:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game prompt' },
      { status: 500 }
    )
  }
} 