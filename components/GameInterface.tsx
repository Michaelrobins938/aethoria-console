import { ThreadList } from "@/components/assistant-ui/thread-list";
import { Thread } from "@/components/assistant-ui/thread";
import { Character, GamePrompt } from "@/lib/types";

interface GameInterfaceProps {
  character: Character;
  gamePrompt: GamePrompt;
  onBack: () => void;
}

export function GameInterface({ character, gamePrompt, onBack }: GameInterfaceProps) {
  return (
    <div className="min-h-screen bg-console-dark p-4">
      {/* Game Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-console-accent hover:bg-console-accent-dark text-console-dark font-console rounded-lg transition-colors duration-200"
          >
            ← Back to Games
          </button>
          <div className="text-console-text-dim font-console text-sm">
            AI Model: claude-3-5-sonnet
          </div>
        </div>
        
        <div className="bg-console-darker border border-console-border rounded-lg p-4">
          <h1 className="text-console-accent font-console text-2xl mb-2">
            {gamePrompt.title}
          </h1>
          <p className="text-console-text font-console text-sm mb-2">
            {gamePrompt.description}
          </p>
          <div className="flex items-center space-x-4 text-console-text-dim font-console text-xs">
            <span>Genre: {gamePrompt.genre}</span>
            <span>Difficulty: {gamePrompt.difficulty}</span>
            <span>Themes: {gamePrompt.themes.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Game Interface */}
      <div className="grid h-[calc(100vh-200px)] grid-cols-[300px_1fr] gap-4">
        <ThreadList character={character} gamePrompt={gamePrompt} />
        <Thread />
      </div>
    </div>
  );
} 