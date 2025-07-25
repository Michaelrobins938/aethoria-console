# 🎮 Aethoria - AI-Powered Gaming Console

Aethoria is a revolutionary AI-powered gaming console that transforms artificial intelligence into your personal Dungeon Master. Experience dynamic storytelling, immersive worlds, and voice interaction in a beautiful retro gaming interface.

## ✨ Features

- **🎲 Dynamic Storytelling**: AI that adapts to your choices and creates branching narratives in real-time
- **🎭 Immersive Worlds**: 100+ game prompts across fantasy, horror, sci-fi, and adventure genres
- **🎤 Voice Interaction**: Speak your actions and hear the world respond with natural voice synthesis
- **🎯 Dice Rolling System**: Interactive D&D-style dice rolling with visual feedback
- **💾 Persistent Game State**: Save and load your adventures with character progression
- **🎨 Beautiful UI**: Apple-quality console interface with retro gaming aesthetics
- **🤖 Advanced AI Chat**: Powered by [assistant-ui](https://github.com/assistant-ui/assistant-ui) for seamless AI interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- AI API keys (OpenAI, Anthropic, or Groq)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aethoria-console
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your AI API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Available Games

Aethoria comes with 100+ pre-built game prompts including:

- **Fantasy**: D&D adventures, Legend of Zelda, Final Fantasy
- **Horror**: Silent Hill, Resident Evil, Fatal Frame
- **Sci-Fi**: Portal, BioShock, Alien
- **Adventure**: Pokémon, Stardew Valley, Treasure Planet
- **And many more...**

## 🛠️ Development

### Project Structure

```
aethoria-console/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AIChat.tsx        # AI chat interface (assistant-ui)
│   ├── CartridgeSelector.tsx # Game selection
│   ├── VoiceSynthesis.tsx # Voice synthesis (Web Speech API)
│   └── DieRoller.tsx      # Dice rolling system
├── lib/                   # Utilities and types
│   ├── store.ts           # Zustand state management
│   ├── types.ts           # TypeScript definitions
│   └── ai.ts              # AI configuration
├── GamePrompts/           # Game prompt content
└── api/                   # Python AI backend
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤖 AI Integration

### Assistant-UI Integration

Aethoria uses [assistant-ui](https://github.com/assistant-ui/assistant-ui) for seamless AI chat functionality:

- **Streaming Responses**: Real-time AI responses with typing indicators
- **Auto-scrolling**: Automatic chat scrolling for smooth UX
- **Accessibility**: Full keyboard navigation and screen reader support
- **Customizable**: Fully customizable chat interface
- **Multi-provider Support**: OpenAI, Anthropic, Groq, and more

### Voice Synthesis

Replaced MeloTTS with Web Speech API for better browser compatibility:

- **No Installation Required**: Works in all modern browsers
- **Multiple Voices**: Access to system voices
- **Real-time Synthesis**: Instant voice feedback
- **Cross-platform**: Works on Windows, Mac, Linux, and mobile

### AI Providers

Configure your preferred AI provider in `lib/ai.ts`:

```typescript
// Game-specific model configurations
export const gameModels = {
  'dnd-fantasy': 'gpt-4',
  'silent-hill-echoes': 'gpt-4',
  'portal-sci-fi': 'gpt-3.5-turbo',
  'pokemon-adventure': 'gpt-3.5-turbo',
  default: 'gpt-3.5-turbo'
}
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Configure environment variables** in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `GROQ_API_KEY`

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🎨 Customization

### Adding New Games

1. Create a new game prompt file in `app/api/game-prompts/data/`
2. Add the game to `app/api/game-prompts/data/index.json`
3. The game will automatically appear in the cartridge selector

### Styling

The project uses Tailwind CSS with a custom console theme. Key color variables:

- `console-dark`: #0a0a0a (Background)
- `console-accent`: #00ff88 (Accent green)
- `console-text`: #e0e0e0 (Text)
- `console-border`: #333333 (Borders)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# AI API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI Chat powered by [assistant-ui](https://github.com/assistant-ui/assistant-ui)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
- Icons from [Lucide React](https://lucide.dev/)
- AI integration with [AI SDK](https://sdk.vercel.ai/)

## 📞 Support

For support, email support@aethoria.com or join our Discord community.

---

**Aethoria** - Where AI Becomes Your Dungeon Master 🎮✨