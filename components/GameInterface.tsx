import { ThreadList } from "@/components/assistant-ui/thread-list";
import { ThreadWithOrb } from "@/components/assistant-ui/thread-with-orb";
import { Character, GamePrompt } from "@/lib/types";
import { NarratorOrbComponent } from './NarratorOrb'
import { useNarratorOrb } from '@/lib/hooks/useNarratorOrb'
import { useState } from 'react'
import { Menu, X, ChevronLeft, ChevronRight, Dice1 } from 'lucide-react'

interface GameInterfaceProps {
  character: Character;
  gamePrompt: GamePrompt;
  onBack: () => void;
}

export function GameInterface({ character, gamePrompt, onBack }: GameInterfaceProps) {
  const { orbState } = useNarratorOrb()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null)

  const handleDiceRoll = (result: number) => {
    setLastDiceRoll(result);
    // You can add additional logic here, like sending the dice roll to the AI
    console.log(`Dice roll result: ${result}`);
  };

  return (
    <div className="min-h-screen bg-console-dark p-2 md:p-4 relative mobile-full-height">
      {/* NarratorOrb Background */}
      <NarratorOrbComponent 
        isVisible={true}
        intensity={orbState.intensity}
        audioLevel={orbState.audioLevel}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Game Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Game Header */}
        <div className="mb-2 md:mb-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="mobile-button bg-console-accent hover:bg-console-accent-dark text-console-dark font-console rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Back to Games</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mobile-button md:hidden bg-console-accent/20 text-console-accent border border-console-accent/30 hover:bg-console-accent/30"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            
            <div className="text-console-text-dim font-console text-xs md:text-sm">
              <span className="hidden md:inline">AI Model: </span>
              claude-3-5-sonnet
            </div>
          </div>
          
          <div className="bg-console-darker/80 backdrop-blur-sm border border-console-border rounded-lg p-3 md:p-4">
            <h1 className="text-console-accent font-console text-lg md:text-2xl mb-2">
              {gamePrompt.title}
            </h1>
            <p className="text-console-text font-console text-xs md:text-sm mb-2">
              {gamePrompt.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-console-text-dim font-console text-xs">
              <span>Genre: {gamePrompt.genre}</span>
              <span>Difficulty: {gamePrompt.difficulty}</span>
              <span className="hidden sm:inline">Themes: {gamePrompt.themes.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Game Interface - Mobile Responsive */}
        <div className="flex-1 flex relative">
          {/* Sidebar - Mobile Overlay */}
          <div className={`
            md:hidden fixed inset-0 z-30 transition-all duration-300
            ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar Content - Slide from right */}
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-console-darker/95 backdrop-blur-sm border-l border-console-border transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-console-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-console-accent font-console text-lg">Game Tools</h3>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="mobile-button bg-console-accent/20 text-console-accent border border-console-accent/30"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ThreadList character={character} gamePrompt={gamePrompt} onDiceRoll={handleDiceRoll} />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:block w-80 bg-console-darker/80 backdrop-blur-sm border border-console-border rounded-lg overflow-hidden">
            <ThreadList character={character} gamePrompt={gamePrompt} onDiceRoll={handleDiceRoll} />
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 bg-console-darker/80 backdrop-blur-sm border border-console-border rounded-lg overflow-hidden">
            <ThreadWithOrb gamePrompt={gamePrompt} character={character} />
          </div>
        </div>

        {/* Floating Action Button for Mobile Menu */}
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mobile-button bg-console-accent hover:bg-console-accent-dark text-console-dark font-console rounded-full w-14 h-14 shadow-lg border-2 border-console-accent/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
            title={sidebarOpen ? "Close Menu" : "Open Game Menu"}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Dice Roll Display */}
        {lastDiceRoll && (
          <div className="md:hidden fixed bottom-20 right-4 z-40">
            <div className="bg-console-accent/90 backdrop-blur-sm text-console-dark font-console rounded-lg px-3 py-2 shadow-lg border border-console-accent/30">
              <div className="text-xs">Last Roll:</div>
              <div className="text-lg font-bold">{lastDiceRoll}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 