# Aethoria - AI-Powered Interactive Storytelling Game

Aethoria is a next-generation interactive storytelling game that combines the power of artificial intelligence with immersive role-playing elements. Players can embark on epic adventures with dynamic, responsive narratives that adapt to their choices and actions.

## 🎮 Features

### Core Systems ✅
- **Dynamic AI Storytelling**: Real-time narrative generation using OpenRouter API
- **Character Creation**: Comprehensive character builder with backgrounds, abilities, and skills
- **Voice Interaction**: Speech-to-text and text-to-speech capabilities
- **Save/Load System**: Persistent game state with cloud-ready architecture
- **Inventory Management**: Advanced item system with categories, effects, and rarity
- **Quest System**: Multi-layered quest tracking with objectives and rewards
- **Combat System**: Turn-based combat with initiative, actions, and tactical elements
- **World Map**: Interactive world navigation with location discovery
- **Settings Management**: Comprehensive game configuration options
- **Help System**: In-game tutorials and documentation

### Technical Features ✅
- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Full type safety and developer experience
- **Zustand**: Lightweight state management with persistence
- **Tailwind CSS**: Utility-first styling with custom console theme
- **AI SDK**: Seamless integration with multiple AI models
- **Voice Recognition**: Web Speech API integration
- **Responsive Design**: Mobile and desktop optimized

### AI Integration ✅
- **Dynamic Model Selection**: AI models chosen based on game genre
- **Streaming Responses**: Real-time AI response streaming
- **Context Awareness**: AI remembers character, world state, and history
- **Multi-Modal Input**: Text and voice input support
- **Adaptive Storytelling**: AI adapts narrative based on player choices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key (for AI functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AethoriaWindows-Copy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Game Flow

### 1. Game Selection
- Choose from 100+ pre-built game cartridges
- Each cartridge represents a unique adventure or story
- AI model automatically selected based on genre

### 2. Character Creation
- **Background Selection**: Warrior, Mage, Rogue, Cleric, Ranger, Scholar
- **Ability Points**: Distribute 27 points across 6 abilities
- **Skill Selection**: Choose 4 skills from 10 available options
- **Character Review**: Finalize your character before starting

### 3. Gameplay
- **Voice Commands**: Speak your actions naturally
- **Text Input**: Type commands for precise control
- **AI Responses**: Dynamic storytelling that adapts to your choices
- **Combat**: Turn-based tactical encounters
- **Exploration**: Discover locations and uncover secrets

### 4. Game Management
- **Save System**: Multiple save slots with cloud sync
- **Inventory**: Manage items, equipment, and consumables
- **Quest Log**: Track objectives and progress
- **Character Sheet**: View stats, skills, and progression
- **World Map**: Navigate between discovered locations

## 🛠️ Project Structure

```
AethoriaWindows-Copy/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── AIChat.tsx         # Main game interface
│   ├── CharacterCreator.tsx # Character creation
│   ├── CharacterSheet.tsx # Character management
│   ├── CombatSystem.tsx   # Combat interface
│   ├── Help.tsx           # Help and tutorials
│   ├── Inventory.tsx      # Inventory management
│   ├── QuestLog.tsx       # Quest tracking
│   ├── SaveManager.tsx    # Save/load system
│   ├── Settings.tsx       # Game settings
│   ├── VoiceRecognition.tsx # Voice input
│   ├── VoiceSynthesis.tsx # Voice output
│   ├── WorldMap.tsx       # World navigation
│   └── ...                # Other UI components
├── lib/                   # Core libraries
│   ├── ai.ts              # AI integration
│   ├── store.ts           # State management
│   └── types.ts           # TypeScript definitions
├── GamePrompts/           # Game cartridge data
├── scripts/               # Utility scripts
└── ...                    # Other assets
```

## 🎨 UI/UX Design

### Console Theme
- **Dark Mode**: Retro console aesthetic
- **Gaming Fonts**: Custom typography for immersive feel
- **Glow Effects**: Neon accents and visual feedback
- **Responsive Layout**: Adapts to different screen sizes

### Component Design
- **Modal System**: Overlay components for game features
- **Tab Navigation**: Organized information display
- **Progress Indicators**: Visual feedback for actions
- **Status Icons**: Clear visual communication

## 🔧 Configuration

### AI Models
The system automatically selects AI models based on game genre:

- **Fantasy/Adventure**: Claude 3.5 Sonnet
- **Horror/Thriller**: GPT-4 Turbo
- **Sci-Fi**: Claude 3.5 Haiku
- **Comedy**: Mixtral 8x7B
- **Drama**: Llama 3.1 8B

### Voice Settings
- **Input**: Web Speech API with confidence scoring
- **Output**: Text-to-speech with adjustable speed/pitch
- **Languages**: Multi-language support
- **Accessibility**: Screen reader compatible

### Game Settings
- **Audio**: Master, voice, music, and SFX volume controls
- **Display**: Theme, font size, and animation options
- **Controls**: Keyboard layout and sensitivity settings
- **Gameplay**: Difficulty, auto-save, and tutorial options

## 🎲 Game Systems

### Character System
- **6 Core Abilities**: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- **Background Bonuses**: Starting bonuses based on character background
- **Skill Progression**: Level-based skill advancement
- **Status Effects**: Temporary buffs and debuffs

### Combat System
- **Initiative**: Dexterity-based turn order
- **Actions**: Attack, Defend, Cast Spell, Use Item, Flee
- **Targeting**: Select enemies or allies
- **Damage Calculation**: Attack vs Defense with dice rolls
- **Combat Log**: Detailed action history

### Inventory System
- **Item Categories**: Weapons, Armor, Consumables, Magical, Quest, Currency
- **Rarity Levels**: Common, Uncommon, Rare, Epic, Legendary
- **Item Effects**: Stat bonuses and special abilities
- **Quantity Management**: Stackable items and weight limits

### Quest System
- **Quest Types**: Main, Side, Bounty, Guild, Exploration
- **Objectives**: Multi-step quest progression
- **Rewards**: Experience, gold, and items
- **Time Limits**: Optional quest deadlines

## 🚀 Development Status

### ✅ Completed Features
- [x] Core game architecture
- [x] Character creation system
- [x] AI integration with OpenRouter
- [x] Voice recognition and synthesis
- [x] Save/load system
- [x] Inventory management
- [x] Quest system
- [x] Combat system
- [x] World map navigation
- [x] Settings management
- [x] Help and tutorial system
- [x] UI/UX design system
- [x] TypeScript type definitions
- [x] State management with Zustand

### 🔄 In Progress
- [ ] Enhanced combat AI
- [ ] Multiplayer features
- [ ] Advanced voice commands
- [ ] Mobile app development
- [ ] Cloud save synchronization

### 📋 Planned Features
- [ ] Character customization (appearance)
- [ ] Advanced crafting system
- [ ] Faction system
- [ ] Weather and time systems
- [ ] NPC relationship system
- [ ] Advanced quest branching
- [ ] Mod support
- [ ] Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter**: AI model access and integration
- **Next.js Team**: Amazing React framework
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful icon library

## 📞 Support

For support, questions, or feature requests:
- Create an issue on GitHub
- Join our Discord community
- Email: support@aethoria.com

---

**Aethoria** - Where AI Becomes Your Dungeon Master

*"The greatest stories are not told, they are lived."*