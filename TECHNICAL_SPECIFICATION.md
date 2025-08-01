# Aethoria Chatbot System - Technical Specification

## Core Implementation Details

### State Management Architecture

The system uses Zustand for state management with persistence:

```typescript
// lib/store.ts - Core state structure
interface GameState {
  // Game state
  session: string | null
  currentPrompt: GamePrompt | null
  character: Character | null
  worldState: WorldState | null
  quests: Quest[]
  inventory: Item[]
  combatState: CombatState | null
  
  // Chat state
  messages: Message[]
  isTyping: boolean
  isLoading: boolean
  
  // Voice state
  voiceState: VoiceState
  audioSettings: AudioSettings
  
  // Actions
  initializeSession: (cartridgeId: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  addMessage: (message: Message) => void
  updateCharacter: (character: Character) => void
  setCombatState: (combatState: CombatState | null) => void
}
```

### AI Integration Implementation

**Model Selection Logic:**
```typescript
// lib/ai.ts
export function getModelForCartridge(cartridgeId: string): string {
  const genre = getGenreForCartridge(cartridgeId)
  const models = getModelsForGenre(genre)
  return Object.keys(models)[0]
}

export function getGenreForCartridge(cartridgeId: string): string {
  // Maps cartridge IDs to genres
  const genreMapping: Record<string, string> = {
    'silent-hill-echoes': 'horror',
    'resident-evil-mansion': 'horror',
    'fantasy-high': 'comedy',
    // ... more mappings
  }
  return genreMapping[cartridgeId] || 'creative'
}
```

**API Integration:**
```typescript
// app/api/game/process-input/route.ts
export async function POST(request: NextRequest) {
  const { messages, cartridgeId, gameState } = await request.json()
  
  // Get optimal model for genre
  const selectedModel = getModelForCartridge(cartridgeId)
  const modelConfig = getModelConfig(selectedModel)
  
  // Create system message with game state
  const systemMessage = {
    role: 'system' as const,
    content: `${gamePrompt}
    
Current Game State:
- Character: ${gameState?.character?.name || 'Unknown'}
- Location: ${gameState?.worldState?.location || 'Unknown'}
- Health: ${gameState?.character?.health || 0}/${gameState?.character?.maxHealth || 0}
- Level: ${gameState?.character?.level || 1}
- Active Quests: ${gameState?.quests?.filter(q => q.status === 'in_progress').length || 0}
- Inventory Items: ${gameState?.inventory?.length || 0}
- In Combat: ${gameState?.combatState?.isActive ? 'Yes' : 'No'}

IMPORTANT: After your response, include a JSON section with game state updates.`
  }
  
  // Call OpenRouter API
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL,
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
      stream: false
    })
  })
  
  // Parse response and extract game state updates
  const responseData = await response.json()
  const aiResponse = responseData.choices?.[0]?.message?.content || 'No response from AI'
  
  // Extract JSON from response
  let gameStateUpdates = {}
  let diceRolls = []
  let aiText = aiResponse
  
  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const jsonStr = jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      
      if (parsed.gameState) gameStateUpdates = parsed.gameState
      if (parsed.diceRolls) diceRolls = parsed.diceRolls
      
      aiText = aiResponse.replace(jsonStr, '').trim()
    }
  } catch (error) {
    console.warn('Failed to parse game state updates from AI response:', error)
  }
  
  return NextResponse.json({
    text: aiText,
    gameState: gameStateUpdates,
    diceRolls: diceRolls,
    timestamp: new Date().toISOString()
  })
}
```

### Voice Recognition Implementation

**Web Speech API Integration:**
```typescript
// components/VoiceRecognition.tsx
useEffect(() => {
  if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
    }

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('')
      
      setInput(transcript)
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }
  }
}, [])
```

**Voice Command Processing:**
```typescript
const handleVoiceCommand = (command: string) => {
  const lowerCommand = command.toLowerCase()
  
  if (lowerCommand.includes('send') || lowerCommand.includes('submit')) {
    handleSendMessage()
  } else if (lowerCommand.includes('clear') || lowerCommand.includes('reset')) {
    setInput('')
  } else if (lowerCommand.includes('help')) {
    addMessage({
      id: Date.now().toString(),
      type: 'system',
      content: 'Available voice commands: "send", "clear", "help"',
      timestamp: new Date()
    })
  }
}
```

### Text-to-Speech Implementation

**Speech Synthesis Setup:**
```typescript
// components/VoiceSynthesis.tsx
useEffect(() => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synthesisRef.current = window.speechSynthesis
  }
}, [])

const toggleVoiceOutput = () => {
  if (!synthesisRef.current) return

  if (isSpeaking) {
    synthesisRef.current.cancel()
    setIsSpeaking(false)
  } else {
    setIsSpeaking(true)
    // Speak the last AI message
    const lastAIMessage = messages
      .filter(m => m.type === 'ai')
      .pop()
    
    if (lastAIMessage) {
      const utterance = new SpeechSynthesisUtterance(lastAIMessage.content)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      synthesisRef.current.speak(utterance)
    }
  }
}
```

### 3D Narrator Orb Implementation

**Three.js Setup:**
```typescript
// components/NarratorOrb.tsx
class NarratorOrb {
  private scene: THREE.Scene
  private camera: THREE.Camera
  private renderer: THREE.WebGLRenderer
  private analyserNode: AnalyserNode | null
  private config: any
  private frequencyData: Uint8Array
  private time: number
  private breathingPhase: number
  private lastAudioLevel: number
  private nebulaMaterial!: THREE.ShaderMaterial
  private tendrilMaterial!: THREE.ShaderMaterial
  private nebulaCore!: THREE.Points
  private nebulaTendrils!: THREE.Points
  private orbGroup!: THREE.Group

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, analyserNode: AnalyserNode | null = null, config: any = {}) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.analyserNode = analyserNode

    this.config = {
      coreParticleCount: config.coreParticleCount || 4000,
      tendrilParticleCount: config.tendrilParticleCount || 3000,
      coreRadius: config.coreRadius || 1.2,
      tendrilRadius: config.tendrilRadius || 3.5,
      baseHue: config.baseHue || 200,
      ...config
    }

    this.frequencyData = new Uint8Array(this.analyserNode ? this.analyserNode.frequencyBinCount : 1024)
    this.time = 0
    this.breathingPhase = 0
    this.lastAudioLevel = 0

    this.createNebulaOrb()
  }

  createNebulaOrb() {
    // Main nebula material with balanced intensity
    this.nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioLevel: { value: 0 },
        breathingPhase: { value: 0 },
        intensity: { value: 1.8 }
      },
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    })

    // Tendril material with balanced intensity
    this.tendrilMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioLevel: { value: 0 },
        intensity: { value: 1.5 }
      },
      vertexShader: tendrilVertexShader,
      fragmentShader: tendrilFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    })

    this.createCoreNebula()
    this.createTendrils()

    this.orbGroup = new THREE.Group()
    this.orbGroup.add(this.nebulaCore)
    this.orbGroup.add(this.nebulaTendrils)
    this.scene.add(this.orbGroup)
  }

  update(deltaTime: number) {
    this.time += deltaTime
    this.breathingPhase += deltaTime * 0.5

    // Update audio data
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(this.frequencyData)
      const audioLevel = this.frequencyData.reduce((sum, value) => sum + value, 0) / this.frequencyData.length / 255
      this.lastAudioLevel = audioLevel
    }

    // Update materials
    this.nebulaMaterial.uniforms.time.value = this.time
    this.nebulaMaterial.uniforms.audioLevel.value = this.lastAudioLevel
    this.nebulaMaterial.uniforms.breathingPhase.value = this.breathingPhase

    this.tendrilMaterial.uniforms.time.value = this.time
    this.tendrilMaterial.uniforms.audioLevel.value = this.lastAudioLevel

    // Rotate orb group
    this.orbGroup.rotation.y += deltaTime * 0.1
  }
}
```

### Combat System Implementation

**Combat State Management:**
```typescript
// lib/combatEngine.ts
export interface CombatState {
  isActive: boolean
  round: number
  turn: number
  participants: CombatParticipant[]
  initiativeOrder: string[]
  currentActor: string | null
  actions: CombatAction[]
  environment: string
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly'
}

export function initializeCombat(participants: CombatParticipant[]): CombatState {
  // Roll initiative for all participants
  const participantsWithInitiative = participants.map(participant => ({
    ...participant,
    initiative: rollInitiative(participant)
  }))

  // Sort by initiative (highest first)
  const sortedParticipants = participantsWithInitiative.sort((a, b) => b.initiative - a.initiative)
  const initiativeOrder = sortedParticipants.map(p => p.id)

  return {
    isActive: true,
    round: 1,
    turn: 1,
    participants: sortedParticipants,
    initiativeOrder,
    currentActor: initiativeOrder[0],
    actions: [],
    environment: 'default',
    difficulty: 'medium'
  }
}

export function performAttack(combatState: CombatState, actorId: string, targetId: string, weaponName: string): CombatAction {
  const actor = combatState.participants.find(p => p.id === actorId)
  const target = combatState.participants.find(p => p.id === targetId)
  
  if (!actor || !target) {
    throw new Error('Actor or target not found')
  }

  const weapon = actor.equipment.weapons.find(w => w.name === weaponName)
  if (!weapon) {
    throw new Error('Weapon not found')
  }

  // Roll attack
  const attackRoll = rollDice('d20', 1)
  const attackBonus = weapon.attackBonus + getAbilityModifier(actor.abilities.strength)
  const totalAttack = attackRoll.total + attackBonus

  // Check if hit
  const isHit = totalAttack >= target.armorClass
  let damage = 0
  let result: 'success' | 'failure' | 'critical' = 'failure'

  if (isHit) {
    // Roll damage
    const damageRoll = parseDiceNotation(weapon.damage)
    damage = damageRoll.total + weapon.damageBonus + getAbilityModifier(actor.abilities.strength)
    
    // Check for critical hit
    if (attackRoll.rolls[0] === 20) {
      damage *= 2
      result = 'critical'
    } else {
      result = 'success'
    }

    // Apply damage
    target.currentHP = Math.max(0, target.currentHP - damage)
  }

  const action: CombatAction = {
    type: 'attack',
    actor: actorId,
    target: targetId,
    weapon: weaponName,
    description: `${actor.name} attacks ${target.name} with ${weaponName}`,
    roll: {
      type: 'attack',
      baseDice: 'd20',
      modifiers: [{ source: 'weapon', value: attackBonus, type: 'bonus', description: 'Weapon attack bonus' }],
      target: target.armorClass,
      success: isHit,
      roll: { dice: 'd20', result: attackRoll.total, rolls: attackRoll.rolls, modifiers: [], total: totalAttack, critical: attackRoll.rolls[0] === 20, description: 'Attack roll' }
    },
    result,
    damage
  }

  return action
}
```

### Dice Rolling System

**Dice Engine:**
```typescript
// lib/diceEngine.ts
export function rollDice(diceNotation: string, count: number = 1): DiceRoll {
  const [dice, sides] = diceNotation.replace('d', '').split('').map(Number)
  const rolls: number[] = []
  let total = 0

  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1
    rolls.push(roll)
    total += roll
  }

  return {
    dice: diceNotation,
    result: total,
    rolls,
    modifiers: [],
    total,
    critical: rolls.some(r => r === sides),
    description: `Rolled ${count}d${sides}`
  }
}

export function parseDiceNotation(notation: string): DiceRoll {
  // Parse dice notation like "2d6+3" or "1d8"
  const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/)
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`)
  }

  const count = parseInt(match[1])
  const sides = parseInt(match[2])
  const modifier = match[3] ? parseInt(match[3]) : 0

  const baseRoll = rollDice(`d${sides}`, count)
  
  return {
    ...baseRoll,
    total: baseRoll.total + modifier,
    modifiers: modifier !== 0 ? [{ source: 'modifier', value: modifier, type: modifier > 0 ? 'bonus' : 'penalty', description: 'Dice modifier' }] : []
  }
}
```

### Session Management

**Chat History Implementation:**
```typescript
// lib/chatHistory.ts
export interface ChatSession {
  id: string
  title: string
  gamePrompt: GamePrompt
  character: Character
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  quests?: Quest[]
  inventory?: Item[]
  combatState?: CombatState | null
  worldState?: WorldState | null
}

export function createNewSession(gamePrompt: GamePrompt, character: Character): ChatSession {
  return {
    id: generateSessionId(),
    title: 'New Session',
    gamePrompt,
    character,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    quests: [],
    inventory: [],
    combatState: null,
    worldState: null
  }
}

export function generateSessionTitle(messages: Message[]): string {
  const userMessages = messages.filter(m => m.type === 'user')
  if (userMessages.length === 0) return 'New Session'

  const firstMessage = userMessages[0].content
  // Generate title from first user message
  return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage
}
```

### Type Definitions

**Core Types:**
```typescript
// lib/types.ts
export interface Character {
  name: string
  health: number
  maxHealth: number
  attack: number
  defense: number
  speed: number
  level: number
  experience: number
  inventory: Item[]
  skills: Skill[]
  statusEffects: Record<string, number>
  background: string
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
}

export interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  diceRolls?: Array<{
    type: string
    result: number
    success: boolean
  }>
}

export interface VoiceState {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  confidence: number
  error?: string
}

export interface AudioSettings {
  voiceEnabled: boolean
  voiceOutputEnabled: boolean
  volume: number
  voiceSpeed: number
  voicePitch: number
}
```

## Performance Optimizations

### React Optimization
- Use `useCallback` for event handlers
- Implement `React.memo` for expensive components
- Optimize re-renders with proper dependency arrays

### 3D Rendering Optimization
- Implement frustum culling for off-screen objects
- Use object pooling for particle systems
- Optimize shader complexity based on device capabilities

### State Management Optimization
- Implement selective persistence
- Use immer for immutable updates
- Optimize Zustand selectors

## Security Considerations

### API Security
- Validate all input data
- Implement rate limiting
- Sanitize AI responses
- Use environment variables for sensitive data

### Voice Security
- Request microphone permissions explicitly
- Handle voice data securely
- Implement timeout mechanisms

### Client-Side Security
- Validate all user inputs
- Sanitize HTML content
- Implement CSP headers

## Testing Strategy

### Unit Tests
```typescript
// __tests__/store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useGameStore } from '@/lib/store'

describe('Game Store', () => {
  it('should initialize session correctly', async () => {
    const { result } = renderHook(() => useGameStore())
    
    await act(async () => {
      await result.current.initializeSession('test-cartridge')
    })
    
    expect(result.current.session).toBe('test-cartridge')
  })
})
```

### Integration Tests
```typescript
// __tests__/api.test.ts
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/game/process-input/route'

describe('/api/game/process-input', () => {
  it('should process game input correctly', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        messages: [{ id: '1', type: 'user', content: 'Hello', timestamp: new Date() }],
        cartridgeId: 'test-cartridge',
        gameState: { character: { name: 'Test' } }
      }
    })

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
  })
})
```

## Deployment Configuration

### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "env": {
    "OPENROUTER_API_KEY": "@openrouter_api_key"
  }
}
```

### Environment Variables
```env
# Production
OPENROUTER_API_KEY=your_production_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production

# Development
OPENROUTER_API_KEY=your_development_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
DEBUG=true
```

This technical specification provides the detailed implementation patterns and code examples needed to replicate or extend the Aethoria Chatbot System. The modular architecture allows for easy customization while maintaining the core functionality. 