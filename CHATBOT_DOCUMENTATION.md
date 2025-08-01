# 🎮 Aethoria Chat Interface & Chatbot System - Complete Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Components](#architecture--components)
3. [Core Features](#core-features)
4. [Installation Guide](#installation-guide)
5. [API Documentation](#api-documentation)
6. [Component Documentation](#component-documentation)
7. [State Management](#state-management)
8. [Voice Integration](#voice-integration)
9. [Game Mechanics Integration](#game-mechanics-integration)
10. [Customization Guide](#customization-guide)
11. [Troubleshooting](#troubleshooting)
12. [Deployment Guide](#deployment-guide)

---

## 🎯 System Overview

The Aethoria Chat Interface is a comprehensive AI-powered gaming chatbot system built with Next.js 14, TypeScript, and the Assistant-UI library. It provides a complete RPG gaming experience with voice interaction, 3D dice rolling, combat systems, and immersive storytelling.

### Key Features
- **AI-Powered Game Master**: Real-time AI responses with streaming
- **Voice Recognition & Synthesis**: Full voice interaction capabilities
- **3D Dice Rolling**: Animated 3D dice with Three.js
- **Combat System**: D&D 5e style combat mechanics
- **Character Management**: RPG character stats and progression
- **Quest System**: Dynamic quest tracking and management
- **Inventory System**: Item management with effects
- **Multi-Modal Interface**: Text, voice, and visual interactions

---

## 🏗️ Architecture & Components

### Core Architecture
```
Aethoria Chat System
├── Frontend (Next.js 14 + TypeScript)
│   ├── Chat Interface Components
│   ├── Game Mechanics
│   ├── Voice Integration
│   └── 3D Visualizations
├── Backend (Next.js API Routes)
│   ├── AI Integration (OpenRouter)
│   ├── Game State Management
│   └── Voice Processing
└── State Management (Zustand)
    ├── Game State
    ├── Chat History
    └── Voice Settings
```

### Component Structure
```
components/
├── assistant-ui/           # Main chat interface
│   ├── thread.tsx         # Primary chat component
│   ├── thread-with-orb.tsx # Chat with 3D orb
│   ├── thread-list.tsx    # Sidebar with game state
│   ├── assistant-modal.tsx # Modal chat interface
│   └── game-tools.tsx     # Game-specific tools
├── GameInterface.tsx       # Main game interface
├── NarratorOrb.tsx        # 3D animated orb
├── DiceRoller3D.tsx       # 3D dice rolling
├── VoiceRecognition.tsx   # Voice input
├── VoiceSynthesis.tsx     # Voice output
└── ErrorLogger.tsx        # Error tracking
```

---

## ⚡ Core Features

### 1. AI Chat Interface
- **Real-time streaming responses**
- **Context-aware conversations**
- **Game state integration**
- **Multi-modal message support**

### 2. Voice Integration
- **Speech-to-Text**: Real-time voice recognition
- **Text-to-Speech**: AI voice synthesis
- **Voice Commands**: Game control via voice
- **Voice Settings**: Customizable voice parameters

### 3. 3D Visualizations
- **Narrator Orb**: Animated 3D orb with particle effects
- **Dice Roller**: 3D animated dice with physics
- **Interactive Elements**: Clickable 3D objects

### 4. Game Mechanics
- **D&D 5e Combat System**: Turn-based combat
- **Character Progression**: Stats, levels, experience
- **Quest Management**: Dynamic quest tracking
- **Inventory System**: Item management with effects

### 5. Advanced Features
- **Chat History**: Persistent conversation storage
- **Session Management**: Multiple game sessions
- **Error Handling**: Comprehensive error tracking
- **Responsive Design**: Mobile and desktop optimized

---

## 🚀 Installation Guide

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd aethoria-chat-system

# Install dependencies
npm install
```

### Step 2: Environment Configuration
Create `.env.local`:
```env
# AI Integration
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional: Voice settings
VOICE_RECOGNITION_ENABLED=true
VOICE_SYNTHESIS_ENABLED=true

# Optional: Database (if using)
DATABASE_URL=your_database_url
```

### Step 3: Install Dependencies
```bash
# Core dependencies
npm install @assistant-ui/react @assistant-ui/react-ai-sdk
npm install zustand lucide-react three @types/three
npm install react-slick slick-carousel

# Development dependencies
npm install -D @types/node typescript eslint
```

### Step 4: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the chat interface.

---

## 📚 API Documentation

### Chat API (`/api/chat`)

**Endpoint**: `POST /api/chat`

**Request Body**:
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  gamePrompt?: GamePrompt
  character?: Character
  gameState?: {
    currentLocation: string
    activeQuests: Quest[]
    inventory: Item[]
    combatState?: CombatState
  }
}
```

**Response**: Streaming text response

**Example Usage**:
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Hello AI!' }],
    gamePrompt: currentGamePrompt,
    character: playerCharacter
  })
})

const reader = response.body?.getReader()
// Handle streaming response...
```

### Game Processing API (`/api/game/process-input`)

**Endpoint**: `POST /api/game/process-input`

**Purpose**: Process game-specific input and return structured game state updates

**Request Body**:
```typescript
{
  input: string
  gameState: GameState
  character: Character
}
```

**Response**:
```typescript
{
  text: string
  gameState: Partial<WorldState>
  characterUpdates?: Partial<Character>
  questUpdates?: Partial<Quest>[]
  inventoryUpdates?: Item[]
  combatState?: Partial<CombatState>
  diceRolls?: DiceRoll[]
}
```

---

## 🧩 Component Documentation

### 1. Thread Component (`components/assistant-ui/thread.tsx`)

**Purpose**: Main chat interface component

**Props**:
```typescript
interface ThreadProps {
  onSendMessage?: (content: string) => Promise<void>
  messages?: Message[]
  isTyping?: boolean
  isLoading?: boolean
}
```

**Features**:
- Real-time message streaming
- File attachment support
- Voice input integration
- Game state display

**Usage**:
```tsx
import { Thread } from '@/components/assistant-ui/thread'

<Thread 
  onSendMessage={handleSendMessage}
  messages={messages}
  isTyping={isTyping}
  isLoading={isLoading}
/>
```

### 2. ThreadWithOrb Component (`components/assistant-ui/thread-with-orb.tsx`)

**Purpose**: Chat interface with 3D animated orb

**Features**:
- 3D narrator orb with particle effects
- Voice recognition and synthesis
- Game tools integration
- Advanced UI controls

**Usage**:
```tsx
import { ThreadWithOrb } from '@/components/assistant-ui/thread-with-orb'

<ThreadWithOrb 
  onSendMessage={handleSendMessage}
  messages={messages}
  isTyping={isTyping}
  isLoading={isLoading}
/>
```

### 3. Assistant Modal (`components/assistant-ui/assistant-modal.tsx`)

**Purpose**: Modal chat interface

**Props**:
```typescript
interface AssistantModalProps {
  className?: string
  title?: string
  description?: string
  placeholder?: string
  apiEndpoint?: string
}
```

**Usage**:
```tsx
import { AssistantModal } from '@/components/assistant-ui/assistant-modal'

<AssistantModal 
  title="AI Assistant"
  description="Ask me anything!"
  placeholder="Type your message..."
  apiEndpoint="/api/chat"
/>
```

### 4. Narrator Orb (`components/NarratorOrb.tsx`)

**Purpose**: 3D animated orb with particle effects

**Features**:
- Three.js 3D rendering
- Particle system effects
- Shader materials
- Animation loops

**Usage**:
```tsx
import { NarratorOrbComponent } from '@/components/NarratorOrb'

<NarratorOrbComponent 
  isActive={isSpeaking}
  intensity={voiceIntensity}
/>
```

### 5. Dice Roller 3D (`components/DiceRoller3D.tsx`)

**Purpose**: 3D animated dice rolling

**Features**:
- Multiple dice types (d4, d6, d8, d10, d12, d20)
- Physics-based animations
- Sound effects
- Result display

**Usage**:
```tsx
import { DiceRoller3D } from '@/components/DiceRoller3D'

<DiceRoller3D 
  onRollComplete={(result) => console.log(result)}
  className="custom-styles"
/>
```

---

## 🗃️ State Management

### Zustand Store (`lib/store.ts`)

**Core State Structure**:
```typescript
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
  
  // Chat history
  chatSessions: ChatSession[]
  activeSessionId: string | null
  
  // Voice state
  voiceState: {
    enabled: boolean
    autoSpeak: boolean
    voice: string
    rate: number
    pitch: number
    volume: number
    isListening: boolean
  }
}
```

**Key Actions**:
```typescript
// Game actions
initializeSession: (cartridgeId: string) => Promise<void>
updateCharacter: (character: Character) => void
updateWorldState: (worldState: WorldState) => void

// Chat actions
sendMessage: (content: string) => Promise<void>
addMessage: (message: Message) => void

// Combat actions
performCombatAction: (action: string, target?: string) => void
rollDice: (diceType: string, count?: number) => { total: number }

// Voice actions
updateVoiceState: (updates: Partial<VoiceState>) => void
setAudioSettings: (settings: Partial<AudioSettings>) => void
```

**Usage**:
```typescript
import { useGameStore } from '@/lib/store'

const {
  character,
  messages,
  sendMessage,
  updateCharacter
} = useGameStore()
```

---

## 🎤 Voice Integration

### Voice Recognition (`components/VoiceRecognition.tsx`)

**Features**:
- Real-time speech-to-text
- Voice command recognition
- Confidence scoring
- Error handling

**Usage**:
```tsx
import { VoiceRecognition } from '@/components/VoiceRecognition'

<VoiceRecognition 
  onTranscript={(text) => handleVoiceInput(text)}
  onCommand={(command) => executeVoiceCommand(command)}
  isListening={isListening}
  setIsListening={setIsListening}
/>
```

### Voice Synthesis (`components/VoiceSynthesis.tsx`)

**Features**:
- Text-to-speech conversion
- Multiple voice options
- Speed and pitch control
- Queue management

**Usage**:
```tsx
import { VoiceSynthesis } from '@/components/VoiceSynthesis'

<VoiceSynthesis 
  text={textToSpeak}
  voice={selectedVoice}
  rate={speechRate}
  pitch={speechPitch}
  onSpeakComplete={() => console.log('Speech complete')}
/>
```

### Voice Commands (`lib/hooks/useVoiceCommands.ts`)

**Predefined Commands**:
```typescript
const defaultCommands = [
  {
    pattern: /roll (\w+)/i,
    action: (params) => rollDice(params[0]),
    description: 'Roll dice (e.g., "roll d20")',
    category: 'game'
  },
  {
    pattern: /attack (.+)/i,
    action: (params) => performAttack(params[0]),
    description: 'Attack target (e.g., "attack goblin")',
    category: 'combat'
  },
  {
    pattern: /use (.+)/i,
    action: (params) => useItem(params[0]),
    description: 'Use item (e.g., "use potion")',
    category: 'game'
  }
]
```

---

## ⚔️ Game Mechanics Integration

### Combat System (`lib/combatEngine.ts`)

**Core Functions**:
```typescript
// Combat initialization
initializeCombat(participants: CombatParticipant[]): CombatState

// Combat actions
performAttack(actorId: string, targetId: string, weaponName: string): CombatAction
performSpellCast(actorId: string, targetId: string, spellName: string): CombatAction
performUseItem(actorId: string, targetId: string, itemName: string): CombatAction

// Turn management
advanceTurn(): void
getCurrentActor(): CombatParticipant | null

// Combat state
isCombatOver(): boolean
getCombatResult(): 'victory' | 'defeat' | 'ongoing'
```

### Dice Engine (`lib/diceEngine.ts`)

**Dice Types Supported**:
- d4, d6, d8, d10, d12, d20
- Custom dice (e.g., 2d6+3)
- Advantage/disadvantage rolls
- Critical hit detection

**Usage**:
```typescript
import { rollDice } from '@/lib/diceEngine'

const result = rollDice('d20', { advantage: true, modifiers: [{ source: 'strength', value: 3 }] })
console.log(result) // { total: 18, rolls: [15, 18], critical: false }
```

### Character System

**Character Structure**:
```typescript
interface Character {
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
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
}
```

---

## 🎨 Customization Guide

### 1. Styling Customization

**CSS Variables** (in `app/globals.css`):
```css
:root {
  --console-dark: #0a0a0a;
  --console-darker: #050505;
  --console-border: #333333;
  --console-text: #00ff41;
  --console-text-dim: #00cc33;
  --console-accent: #ff6b35;
  --console-accent-dim: #cc552a;
}
```

**Custom Theme**:
```css
/* Custom gaming theme */
:root {
  --console-dark: #1a1a2e;
  --console-darker: #16213e;
  --console-border: #0f3460;
  --console-text: #e94560;
  --console-accent: #f39c12;
}
```

### 2. Component Customization

**Custom Chat Interface**:
```tsx
// Create custom chat component
const CustomChat = () => {
  const { messages, sendMessage } = useGameStore()
  
  return (
    <div className="custom-chat-container">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <input 
        onKeyPress={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
        placeholder="Type your message..."
      />
    </div>
  )
}
```

### 3. AI Integration Customization

**Custom AI Provider**:
```typescript
// lib/ai-providers/custom-provider.ts
export class CustomAIProvider {
  async generateResponse(messages: Message[], context: GameContext) {
    // Custom AI logic
    const response = await fetch('your-ai-endpoint', {
      method: 'POST',
      body: JSON.stringify({ messages, context })
    })
    return response.json()
  }
}
```

### 4. Voice Customization

**Custom Voice Commands**:
```typescript
// lib/hooks/useCustomVoiceCommands.ts
export const useCustomVoiceCommands = () => {
  const customCommands = [
    {
      pattern: /custom command (.+)/i,
      action: (params) => customAction(params[0]),
      description: 'Custom voice command',
      category: 'custom'
    }
  ]
  
  return { customCommands }
}
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Voice Recognition Not Working**
```bash
# Check browser permissions
# Ensure HTTPS in production
# Check microphone access
```

**2. AI Responses Not Streaming**
```typescript
// Check API endpoint
// Verify OpenRouter API key
// Check network connectivity
```

**3. 3D Components Not Rendering**
```bash
# Install Three.js dependencies
npm install three @types/three
# Check WebGL support
```

**4. State Management Issues**
```typescript
// Clear local storage
localStorage.clear()
// Reset store state
useGameStore.getState().clearAllSessions()
```

### Debug Tools

**Error Logger Component**:
```tsx
import { ErrorLogger } from '@/components/ErrorLogger'

// Add to any page for error tracking
<ErrorLogger />
```

**Development Mode**:
```bash
# Enable detailed logging
NODE_ENV=development npm run dev
```

---

## 🚀 Deployment Guide

### Vercel Deployment

**1. Prepare for Deployment**:
```bash
# Build the project
npm run build

# Test production build
npm start
```

**2. Deploy to Vercel**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**3. Environment Variables**:
Set in Vercel dashboard:
- `OPENROUTER_API_KEY`
- `VOICE_RECOGNITION_ENABLED`
- `VOICE_SYNTHESIS_ENABLED`

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  aethoria-chat:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
```

### Performance Optimization

**1. Bundle Optimization**:
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'three']
  }
}
```

**2. Image Optimization**:
```tsx
import Image from 'next/image'

<Image 
  src="/images/character.png"
  alt="Character"
  width={200}
  height={200}
  priority
/>
```

---

## 📊 Performance Metrics

### Key Performance Indicators

**Chat Interface**:
- Message rendering: < 50ms
- AI response time: < 2s
- Voice recognition latency: < 100ms

**3D Components**:
- Frame rate: 60 FPS
- Memory usage: < 100MB
- Load time: < 3s

**State Management**:
- Store updates: < 10ms
- Persistence: < 50ms
- Memory footprint: < 50MB

### Monitoring

**Error Tracking**:
```typescript
// Add error boundary
<ErrorBoundary fallback={<ErrorComponent />}>
  <ChatInterface />
</ErrorBoundary>
```

**Performance Monitoring**:
```typescript
// Add performance marks
performance.mark('chat-start')
// ... chat operations
performance.mark('chat-end')
performance.measure('chat-duration', 'chat-start', 'chat-end')
```

---

## 🔮 Future Enhancements

### Planned Features

**1. Advanced AI Integration**:
- Multi-modal AI (text, voice, image)
- Context-aware responses
- Personality adaptation

**2. Enhanced Voice Features**:
- Voice cloning
- Emotion detection
- Multi-language support

**3. Extended Game Mechanics**:
- Multiplayer support
- Advanced combat systems
- Mod support

**4. Performance Improvements**:
- WebAssembly integration
- Service worker caching
- Progressive web app features

---

## 📞 Support & Community

### Getting Help

**Documentation**: This comprehensive guide
**Issues**: GitHub issues repository
**Discussions**: GitHub discussions
**Email**: Support email address

### Contributing

**Development Setup**:
```bash
git clone <repo>
cd aethoria-chat-system
npm install
npm run dev
```

**Code Standards**:
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Unit test coverage

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎯 Conclusion

The Aethoria Chat Interface is a comprehensive, feature-rich chatbot system designed for immersive gaming experiences. With its modular architecture, extensive customization options, and robust feature set, it provides a solid foundation for building AI-powered interactive applications.

For questions, support, or contributions, please refer to the project documentation and community resources. 