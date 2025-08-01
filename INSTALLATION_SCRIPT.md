# 🚀 Quick Installation Script for Aethoria Chat Interface

## One-Click Setup

### Step 1: Create New Project
```bash
# Create new Next.js project
npx create-next-app@latest my-aethoria-chat --typescript --tailwind --app --src-dir --import-alias "@/*"

# Navigate to project
cd my-aethoria-chat
```

### Step 2: Install Dependencies
```bash
# Core dependencies
npm install @assistant-ui/react @assistant-ui/react-ai-sdk
npm install zustand lucide-react three @types/three
npm install react-slick slick-carousel
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-scroll-area @radix-ui/react-slot @radix-ui/react-tooltip
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate

# Development dependencies
npm install -D @types/node typescript eslint
```

### Step 3: Environment Setup
Create `.env.local`:
```env
# Required for AI functionality
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional settings
VOICE_RECOGNITION_ENABLED=true
VOICE_SYNTHESIS_ENABLED=true
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 4: Copy Core Files

**Essential Files to Copy:**

1. **State Management**:
   - `lib/store.ts` - Zustand store
   - `lib/types.ts` - TypeScript types
   - `lib/chatHistory.ts` - Chat session management

2. **Components**:
   - `components/assistant-ui/` - All assistant UI components
   - `components/NarratorOrb.tsx` - 3D orb
   - `components/DiceRoller3D.tsx` - 3D dice
   - `components/VoiceRecognition.tsx` - Voice input
   - `components/VoiceSynthesis.tsx` - Voice output
   - `components/ErrorLogger.tsx` - Error tracking

3. **API Routes**:
   - `app/api/chat/route.ts` - Chat API
   - `app/api/game/process-input/route.ts` - Game processing

4. **Hooks**:
   - `lib/hooks/useVoiceCommands.ts` - Voice commands
   - `lib/hooks/useVoiceRecognition.ts` - Voice recognition
   - `lib/hooks/useVoiceSynthesis.ts` - Voice synthesis
   - `lib/hooks/useNarratorOrb.ts` - Orb management

5. **Utilities**:
   - `lib/utils.ts` - Utility functions
   - `lib/combatEngine.ts` - Combat system
   - `lib/diceEngine.ts` - Dice rolling

### Step 5: Update Configuration

**Update `tailwind.config.ts`**:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'console-dark': '#0a0a0a',
        'console-darker': '#050505',
        'console-border': '#333333',
        'console-text': '#00ff41',
        'console-text-dim': '#00cc33',
        'console-accent': '#ff6b35',
        'console-accent-dim': '#cc552a',
      },
      fontFamily: {
        'console': ['Courier New', 'monospace'],
        'gaming': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff41' },
          '100%': { boxShadow: '0 0 20px #00ff41, 0 0 30px #00ff41' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Update `app/globals.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --console-dark: #0a0a0a;
  --console-darker: #050505;
  --console-border: #333333;
  --console-text: #00ff41;
  --console-text-dim: #00cc33;
  --console-accent: #ff6b35;
  --console-accent-dim: #cc552a;
}

body {
  background-color: var(--console-dark);
  color: var(--console-text);
  font-family: 'Courier New', monospace;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--console-darker);
}

::-webkit-scrollbar-thumb {
  background: var(--console-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--console-text-dim);
}
```

### Step 6: Create Basic Pages

**Update `app/page.tsx`**:
```tsx
'use client'

import { AssistantModal } from '@/components/assistant-ui/assistant-modal'
import { ErrorLogger } from '@/components/ErrorLogger'

export default function Home() {
  return (
    <main className="min-h-screen bg-console-dark">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-gaming text-console-accent mb-8">
          Aethoria Chat Interface
        </h1>
        
        <AssistantModal 
          title="AI Game Master"
          description="Your AI assistant is ready to help!"
          placeholder="Ask about your adventure..."
          apiEndpoint="/api/chat"
        />
      </div>
      
      <ErrorLogger />
    </main>
  )
}
```

### Step 7: Test the Installation

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

### Step 8: Verify Components

**Test Chat Interface**:
- Click the chat button
- Send a test message
- Verify AI response

**Test Voice Features**:
- Click microphone button
- Speak a command
- Verify voice recognition

**Test 3D Components**:
- Visit `/dice-roller` for 3D dice
- Check narrator orb animations

## 🎯 Quick Customization

### Change Theme Colors
```css
/* In app/globals.css */
:root {
  --console-dark: #1a1a2e;    /* Dark blue */
  --console-darker: #16213e;   /* Darker blue */
  --console-border: #0f3460;   /* Blue border */
  --console-text: #e94560;     /* Pink text */
  --console-accent: #f39c12;   /* Orange accent */
}
```

### Add Custom Voice Commands
```typescript
// In lib/hooks/useVoiceCommands.ts
const customCommands = [
  {
    pattern: /custom command (.+)/i,
    action: (params) => console.log('Custom command:', params[0]),
    description: 'Custom voice command',
    category: 'custom'
  }
]
```

### Modify AI Behavior
```typescript
// In app/api/chat/route.ts
const systemMessage = {
  role: 'system',
  content: 'You are a custom AI assistant. Respond in your own style.'
}
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables (Vercel)
- `OPENROUTER_API_KEY` - Your OpenRouter API key
- `VOICE_RECOGNITION_ENABLED` - true/false
- `VOICE_SYNTHESIS_ENABLED` - true/false

## 📋 Checklist

- [ ] Project created with Next.js 14
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Core files copied
- [ ] Configuration updated
- [ ] Basic pages created
- [ ] Development server running
- [ ] Chat interface working
- [ ] Voice features tested
- [ ] 3D components rendering
- [ ] Deployed to production

## 🆘 Troubleshooting

**Common Issues:**

1. **Voice not working**: Ensure HTTPS in production
2. **AI not responding**: Check OpenRouter API key
3. **3D not rendering**: Install Three.js dependencies
4. **Build errors**: Check TypeScript configuration

**Debug Mode**:
```bash
# Enable detailed logging
NODE_ENV=development npm run dev
```

## 🎮 Next Steps

1. **Customize the theme** to match your brand
2. **Add your own game prompts** in the GamePrompts folder
3. **Implement custom voice commands** for your use case
4. **Extend the AI system** with your own models
5. **Add multiplayer features** if needed
6. **Create custom 3D components** for your game

---

**🎯 You now have a fully functional AI-powered chat interface with voice interaction, 3D visualizations, and game mechanics!** 