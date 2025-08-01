import { Gamepad2, Settings, Map, User, BookOpen, Package, Mic, Heart, Shield, Zap, Target } from "lucide-react";
import { Character, GamePrompt, WorldState, Quest, Item, CombatState } from "@/lib/types";

interface ThreadListProps {
  character?: Character;
  gamePrompt?: GamePrompt;
  worldState?: WorldState;
  quests?: Quest[];
  inventory?: Item[];
  combatState?: CombatState | null;
}

export function ThreadList({ 
  character, 
  gamePrompt, 
  worldState, 
  quests = [], 
  inventory = [], 
  combatState 
}: ThreadListProps) {
  const activeQuests = quests.filter(q => q.status === 'active' || q.status === 'in_progress')
  const completedQuests = quests.filter(q => q.status === 'completed')

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
          <span>Quests ({activeQuests.length})</span>
        </button>
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-console-darker hover:bg-console-accent/20 border border-console-border rounded-lg transition-colors duration-200 text-console-text font-console text-sm">
          <Package className="w-4 h-4" />
          <span>Items ({inventory.length})</span>
        </button>
        <button className="w-full flex items-center space-x-2 px-3 py-2 bg-console-darker hover:bg-console-accent/20 border border-console-border rounded-lg transition-colors duration-200 text-console-text font-console text-sm">
          <Mic className="w-4 h-4" />
          <span>Voice</span>
        </button>
      </div>

      {/* Game State Panel */}
      {character && (
        <div className="p-4 border-t border-console-border">
          <h3 className="text-console-accent font-console text-sm mb-3">Character Status</h3>
          
          {/* Character Info */}
          <div className="mb-4">
            <h4 className="text-console-text font-console text-xs mb-2 flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{character.name}</span>
            </h4>
            <div className="space-y-1 text-console-text-dim text-xs">
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span>Health: {character.health}/{character.maxHealth}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-blue-400" />
                <span>Level: {character.level}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-3 h-3 text-green-400" />
                <span>Attack: {character.attack}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-purple-400" />
                <span>Defense: {character.defense}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Speed: {character.speed}</span>
              </div>
            </div>
          </div>

          {/* World Info */}
          {worldState && (
            <div className="mb-4">
              <h4 className="text-console-text font-console text-xs mb-2 flex items-center space-x-1">
                <Map className="w-3 h-3" />
                <span>World</span>
              </h4>
              <div className="space-y-1 text-console-text-dim text-xs">
                <div>Location: {worldState.location}</div>
                <div>Time: {worldState.timeOfDay}</div>
                <div>Weather: {worldState.weather}</div>
                {worldState.activeEvents.length > 0 && (
                  <div>Events: {worldState.activeEvents.length}</div>
                )}
              </div>
            </div>
          )}

          {/* Combat Status */}
          {combatState && combatState.isActive && (
            <div className="mb-4">
              <h4 className="text-console-accent font-console text-xs mb-2 flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>Combat</span>
              </h4>
              <div className="space-y-1 text-console-text-dim text-xs">
                <div>Turn: {combatState.turn}</div>
                <div>Enemies: {combatState.participants.filter(p => p.name !== character.name).length}</div>
                <div>Current: {combatState.currentActor}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div className="p-4 border-t border-console-border">
          <h3 className="text-console-accent font-console text-sm mb-3 flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>Active Quests ({activeQuests.length})</span>
          </h3>
          <div className="space-y-2">
            {activeQuests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="p-2 bg-console-darker rounded border border-console-border">
                <div className="font-console text-console-text text-xs">{quest.title}</div>
                <div className="text-console-text-dim text-xs">{quest.description}</div>
                <div className="text-console-accent text-xs mt-1">
                  Progress: {quest.progress}/{quest.maxProgress}
                </div>
              </div>
            ))}
            {activeQuests.length > 3 && (
              <div className="text-console-text-dim text-xs">
                +{activeQuests.length - 3} more quests...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory */}
      {inventory.length > 0 && (
        <div className="p-4 border-t border-console-border">
          <h3 className="text-console-accent font-console text-sm mb-3 flex items-center space-x-1">
            <Package className="w-4 h-4" />
            <span>Inventory ({inventory.length})</span>
          </h3>
          <div className="space-y-1">
            {inventory.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-console-text-dim text-xs">
                <span>{item.name}</span>
                <span className="text-console-accent">{item.type}</span>
              </div>
            ))}
            {inventory.length > 5 && (
              <div className="text-console-text-dim text-xs">
                +{inventory.length - 5} more items...
              </div>
            )}
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

      {/* Recent Activity */}
      <div className="flex-1 overflow-y-auto p-4 border-t border-console-border">
        <h3 className="text-console-accent font-console text-sm mb-3">Recent Activity</h3>
        <div className="space-y-2 text-console-text-dim text-xs">
          {completedQuests.length > 0 && (
            <div className="p-2 bg-green-900/20 rounded border border-green-500/30">
              <div className="font-console text-green-400">Quest Completed!</div>
              <div className="text-green-300">You&apos;ve completed {completedQuests.length} quest(s)</div>
            </div>
          )}
          {combatState && combatState.isActive && (
            <div className="p-2 bg-red-900/20 rounded border border-red-500/30">
              <div className="font-console text-red-400">Combat Active</div>
              <div className="text-red-300">Turn {combatState.turn}</div>
            </div>
          )}
          <div className="p-2 bg-console-darker rounded border border-console-border">
            <div className="font-console text-console-text">Welcome to Aethoria!</div>
            <div className="text-console-text-dim">Your adventure begins...</div>
          </div>
        </div>
      </div>
    </div>
  );
} 