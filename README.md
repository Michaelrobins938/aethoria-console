# 🎮 Aethoria - AI-Powered Gaming Console

Aethoria is a revolutionary AI-powered gaming console that transforms artificial intelligence into your personal Dungeon Master. Experience dynamic storytelling, immersive worlds, and voice interaction in a beautiful retro gaming interface.

## ✨ Features

- **🎲 Dynamic Storytelling**: AI that adapts to your choices and creates branching narratives in real-time
- **🎭 Immersive Worlds**: 100+ game prompts across fantasy, horror, sci-fi, and adventure genres
- **🎤 Voice Interaction**: Speak your actions and hear the world respond with natural voice synthesis
- **🎯 Dice Rolling System**: Interactive D&D-style dice rolling with visual feedback
- **💾 Persistent Game State**: Save and load your adventures with character progression
- **🎨 Beautiful UI**: Apple-quality console interface with retro gaming aesthetics

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
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
│   ├── GameConsole.tsx    # Main game interface
│   ├── CartridgeSelector.tsx # Game selection
│   ├── VoiceRecorder.tsx  # Voice input
│   └── DieRoller.tsx      # Dice rolling system
├── lib/                   # Utilities and types
│   ├── store.ts           # Zustand state management
│   └── types.ts           # TypeScript definitions
├── GamePrompts/           # Game prompt content
└── api/                   # Python AI backend
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

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

3. **Follow the prompts** to connect your GitHub repository

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

1. Create a new game prompt file in `GamePrompts/`
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
# AI API Keys (for future AI integration)
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# Voice API (for future voice synthesis)
ELEVENLABS_API_KEY=your_elevenlabs_key
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
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
- Icons from [Lucide React](https://lucide.dev/)
- AI integration with [Groq](https://groq.com/)

## 📞 Support

For support, email support@aethoria.com or join our Discord community.

---

**Aethoria** - Where AI Becomes Your Dungeon Master 🎮✨