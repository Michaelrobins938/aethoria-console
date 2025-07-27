import { Gamepad2, Settings, Map, User, BookOpen, Package, Mic } from "lucide-react";

interface GameStateProps {
  character?: any;
  gamePrompt?: any;
}

export function ThreadList({ character, gamePrompt }: GameStateProps) {
  return (
    <div className="h-full flex flex-col bg-console-dark border border-console-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-console-border bg-console-darker">
        <h2 className="text-console-text font-console text-lg flex items-center space-x-2">
          <Gamepad2 className="w-5 h-5" />
          <span>Game Console</span>
        </h2>
      </div>

      {/* Navigation Buttons */}
      <div className="p-4 space-y-2">
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-console-darker hover:bg-console-accent/20 border border-console-border rounded-lg transition-colors duration-200 text-console-text font-console text-sm">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-console-darker hover:bg-console-accent/20 border border-console-border rounded-lg transition-colors duration-200 text-console-text font-console text-sm">
          <Map className="w-4 h-4" />
          <span>Map</span>
        </button>
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-console-darker hover:bg-console-accent/20 border border-console-border rounded-lg transition-colors duration-200 text-console-text font-console text-sm">
          <User className="w-4 h-4" />
          <span>Character</span>
        </button>
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-console-darker hover:bg-console-accent/20 border border-console-border rounded-lg transition-colors duration-200 text-console-text font-console text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Quests</span>
        </button>
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-console-darker hover:bg-console-accent/20 border border-console-border rounded-lg transition-colors duration-200 text-console-text font-console text-sm">
          <Package className="w-4 h-4" />
          <span>Items</span>
        </button>
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-console-darker hover:bg-console-accent/20 border border-console-border rounded-lg transition-colors duration-200 text-console-text font-console text-sm">
          <Mic className="w-4 h-4" />
          <span>Voice</span>
        </button>
      </div>

      {/* Game State Panel */}
      {character && (
        <div className="p-4 border-t border-console-border">
          <h3 className="text-console-accent font-console text-sm mb-3">Game State</h3>
          
          {/* Character Info */}
          <div className="mb-4">
            <h4 className="text-console-text font-console text-xs mb-2">Character</h4>
            <div className="space-y-1 text-console-text-dim text-xs">
              <div>Name: {character.name}</div>
              <div>Health: {character.health || 100}/100</div>
              <div>Level: {character.level || 1}</div>
              <div>Attack: {character.attack || 10}</div>
              <div>Defense: {character.defense || 9}</div>
            </div>
          </div>

          {/* World Info */}
          <div>
            <h4 className="text-console-text font-console text-xs mb-2">World</h4>
            <div className="space-y-1 text-console-text-dim text-xs">
              <div>Location: {character.location || 'Unknown'}</div>
              <div>Time: {character.time || 'day'}</div>
              <div>Weather: {character.weather || 'clear'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Game Info */}
      {gamePrompt && (
        <div className="p-4 border-t border-console-border">
          <h3 className="text-console-accent font-console text-sm mb-3">Game Info</h3>
          <div className="space-y-1 text-console-text-dim text-xs">
            <div>Title: {gamePrompt.title}</div>
            <div>Genre: {gamePrompt.genre}</div>
            <div>Difficulty: {gamePrompt.difficulty}</div>
            <div>Themes: {gamePrompt.themes?.join(', ')}</div>
          </div>
        </div>
      )}

      {/* Recent Messages */}
      <div className="flex-1 overflow-y-auto p-4 border-t border-console-border">
        <h3 className="text-console-accent font-console text-sm mb-3">Recent Activity</h3>
        <div className="space-y-2 text-console-text-dim text-xs">
          <div className="p-2 bg-console-darker rounded border border-console-border">
            <div className="font-console text-console-text">Welcome to Aethoria!</div>
            <div className="text-console-text-dim">Your adventure begins...</div>
          </div>
        </div>
      </div>
    </div>
  );
} 