'use client'

// @ts-nocheck
import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useEffect } from "react";
import { Dice1, Sword, Shield, Heart, Star, Package, BookOpen, Map, Target, Zap, User } from "lucide-react";

// Dice Roll Component
const DiceRollComponent = ({ args, result, status }: {
  args: { dice: string; reason?: string };
  result?: { result: number; rolls: number[]; total: number };
  status: { type: string };
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [rollAnimation, setRollAnimation] = useState(0);

  useEffect(() => {
    if (status.type === "running") {
      setIsRolling(true);
      const interval = setInterval(() => {
        setRollAnimation(Math.floor(Math.random() * 20) + 1);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setIsRolling(false);
    }
  }, [status.type]);

  if (status.type === "running") {
    return (
      <div className="flex items-center space-x-3 p-4 bg-console-darker border border-console-border rounded-lg">
        <div className="w-12 h-12 bg-console-accent rounded-lg flex items-center justify-center animate-spin">
          <Dice1 className="w-6 h-6 text-console-dark" />
        </div>
        <div>
          <div className="text-console-text font-console">Rolling {args.dice}...</div>
          <div className="text-2xl font-bold text-console-accent">{rollAnimation}</div>
          {args.reason && (
            <div className="text-console-text-dim text-sm">Reason: {args.reason}</div>
          )}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="p-4 bg-console-darker border border-console-border rounded-lg">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-console-accent rounded-lg flex items-center justify-center">
            <Dice1 className="w-5 h-5 text-console-dark" />
          </div>
          <div>
            <div className="text-console-text font-console">Dice Roll Result</div>
            <div className="text-console-text-dim text-sm">{args.dice}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-console-accent">{result.total}</div>
            <div className="text-console-text-dim text-sm">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-console text-console-text">
              {result.rolls.join(', ')}
            </div>
            <div className="text-console-text-dim text-sm">Rolls</div>
          </div>
        </div>
        
        {args.reason && (
          <div className="mt-3 p-2 bg-console-dark rounded text-console-text-dim text-sm">
            <strong>Reason:</strong> {args.reason}
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Dice Roll Tool UI
export const DiceRollToolUI = makeAssistantToolUI<
  { dice: string; reason?: string },
  { result: number; rolls: number[]; total: number }
>({
  toolName: "rollDice",
  render: ({ args, result, status }) => (
    <DiceRollComponent args={args} result={result} status={status} />
  ),
});

// Character Stats Tool UI
export const CharacterStatsToolUI = makeAssistantToolUI<
  { action?: string },
  { character: any; changes?: any }
>({
  toolName: "updateCharacter",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center space-x-3 p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="w-8 h-8 bg-console-accent rounded-full flex items-center justify-center animate-spin">
            <User className="w-4 h-4 text-console-dark" />
          </div>
          <div className="text-console-text font-console">
            Updating character stats...
          </div>
        </div>
      );
    }

    if (result?.character) {
      const char = result.character;
      return (
        <div className="p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-console-accent rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-console-dark" />
            </div>
            <div>
              <div className="text-console-text font-console text-lg">{char.name}</div>
              <div className="text-console-text-dim text-sm">Level {char.level} Adventurer</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-console-text font-console">{char.health}/{char.maxHealth}</div>
                <div className="text-console-text-dim text-xs">Health</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <div className="text-console-text font-console">{char.experience}</div>
                <div className="text-console-text-dim text-xs">Experience</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-console-dark rounded">
              <div className="text-console-accent font-console">{char.abilities?.strength || 10}</div>
              <div className="text-console-text-dim">STR</div>
            </div>
            <div className="text-center p-2 bg-console-dark rounded">
              <div className="text-console-accent font-console">{char.abilities?.dexterity || 10}</div>
              <div className="text-console-text-dim">DEX</div>
            </div>
            <div className="text-center p-2 bg-console-dark rounded">
              <div className="text-console-accent font-console">{char.abilities?.constitution || 10}</div>
              <div className="text-console-text-dim">CON</div>
            </div>
            <div className="text-center p-2 bg-console-dark rounded">
              <div className="text-console-accent font-console">{char.abilities?.intelligence || 10}</div>
              <div className="text-console-text-dim">INT</div>
            </div>
            <div className="text-center p-2 bg-console-dark rounded">
              <div className="text-console-accent font-console">{char.abilities?.wisdom || 10}</div>
              <div className="text-console-text-dim">WIS</div>
            </div>
            <div className="text-center p-2 bg-console-dark rounded">
              <div className="text-console-accent font-console">{char.abilities?.charisma || 10}</div>
              <div className="text-console-text-dim">CHA</div>
            </div>
          </div>

          {result.changes && (
            <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded text-green-400 text-sm">
              <strong>Changes:</strong> {JSON.stringify(result.changes)}
            </div>
          )}
        </div>
      );
    }

    return null;
  },
});

// Combat Tool UI
export const CombatToolUI = makeAssistantToolUI<
  { action: string; target?: string },
  { result: any; combatState: any }
>({
  toolName: "combatAction",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center space-x-3 p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <Sword className="w-4 h-4 text-white" />
          </div>
          <div className="text-console-text font-console">
            Executing {args.action}...
          </div>
        </div>
      );
    }

    if (result) {
      return (
        <div className="p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-console-text font-console text-lg">Combat Action</div>
              <div className="text-console-text-dim text-sm">{args.action}</div>
            </div>
          </div>

          <div className="space-y-2">
            {(result as any).damage && (
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-red-500" />
                <span className="text-console-text">Damage: <span className="text-red-400 font-console">{(result as any).damage}</span></span>
              </div>
            )}
            {(result as any).hit !== undefined && (
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-console-text">Hit: <span className="text-yellow-400 font-console">{(result as any).hit ? 'Yes' : 'No'}</span></span>
              </div>
            )}
            {(result as any).remainingHealth && (
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-green-500" />
                <span className="text-console-text">Remaining Health: <span className="text-green-400 font-console">{(result as any).remainingHealth}</span></span>
              </div>
            )}
          </div>

          {result.combatState && (
            <div className="mt-3 p-2 bg-console-dark rounded">
              <div className="text-console-text-dim text-sm mb-1">Combat State:</div>
              <div className="text-xs text-console-text">
                Turn: {result.combatState.turn} | 
                Enemies: {result.combatState.enemies?.length || 0}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  },
});

// Inventory Tool UI
export const InventoryToolUI = makeAssistantToolUI<
  { action: string; item?: string },
  { inventory: any[]; changes?: any }
>({
  toolName: "manageInventory",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center space-x-3 p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="w-8 h-8 bg-console-accent rounded-full flex items-center justify-center animate-spin">
            <Package className="w-4 h-4 text-console-dark" />
          </div>
          <div className="text-console-text font-console">
            Managing inventory...
          </div>
        </div>
      );
    }

    if (result?.inventory) {
      return (
        <div className="p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-console-accent rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-console-dark" />
            </div>
            <div>
              <div className="text-console-text font-console text-lg">Inventory</div>
              <div className="text-console-text-dim text-sm">{args.action}</div>
            </div>
          </div>

          {result.inventory.length === 0 ? (
            <div className="text-console-text-dim text-center py-4">
              Inventory is empty
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {result.inventory.map((item: any, index: number) => (
                <div key={index} className="p-2 bg-console-dark rounded border border-console-border">
                  <div className="text-console-text font-console text-sm">{item.name}</div>
                  <div className="text-console-text-dim text-xs">{item.type}</div>
                  {item.quantity && (
                    <div className="text-console-accent text-xs">x{item.quantity}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.changes && (
            <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-sm">
              <strong>Changes:</strong> {JSON.stringify(result.changes)}
            </div>
          )}
        </div>
      );
    }

    return null;
  },
});

// Quest Tool UI
export const QuestToolUI = makeAssistantToolUI<
  { action: string; questId?: string },
  { quests: any[]; changes?: any }
>({
  toolName: "manageQuests",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center space-x-3 p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="w-8 h-8 bg-console-accent rounded-full flex items-center justify-center animate-spin">
            <BookOpen className="w-4 h-4 text-console-dark" />
          </div>
          <div className="text-console-text font-console">
            Managing quests...
          </div>
        </div>
      );
    }

    if (result?.quests) {
      return (
        <div className="p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-console-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-console-dark" />
            </div>
            <div>
              <div className="text-console-text font-console text-lg">Quests</div>
              <div className="text-console-text-dim text-sm">{args.action}</div>
            </div>
          </div>

          {result.quests.length === 0 ? (
            <div className="text-console-text-dim text-center py-4">
              No active quests
            </div>
          ) : (
            <div className="space-y-3">
              {result.quests.map((quest: any, index: number) => (
                <div key={index} className="p-3 bg-console-dark rounded border border-console-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-console-text font-console">{quest.title}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      quest.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      quest.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {quest.status}
                    </div>
                  </div>
                  <div className="text-console-text-dim text-sm mb-2">{quest.description}</div>
                  {quest.progress && (
                    <div className="w-full bg-console-border rounded-full h-2">
                      <div 
                        className="bg-console-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(quest.progress.current / quest.progress.total) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.changes && (
            <div className="mt-3 p-2 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 text-sm">
              <strong>Changes:</strong> {JSON.stringify(result.changes)}
            </div>
          )}
        </div>
      );
    }

    return null;
  },
});

// Map Navigation Tool UI
export const MapToolUI = makeAssistantToolUI<
  { action: string; location?: string },
  { currentLocation: string; availableLocations: string[]; description?: string }
>({
  toolName: "navigateMap",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return (
        <div className="flex items-center space-x-3 p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="w-8 h-8 bg-console-accent rounded-full flex items-center justify-center animate-spin">
            <Map className="w-4 h-4 text-console-dark" />
          </div>
          <div className="text-console-text font-console">
            Navigating...
          </div>
        </div>
      );
    }

    if (result) {
      return (
        <div className="p-4 bg-console-darker border border-console-border rounded-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-console-accent rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-console-dark" />
            </div>
            <div>
              <div className="text-console-text font-console text-lg">Map Navigation</div>
              <div className="text-console-text-dim text-sm">{args.action}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-console-text font-console mb-1">Current Location:</div>
            <div className="text-console-accent font-console">{result.currentLocation}</div>
          </div>

          {result.description && (
            <div className="mb-3 p-2 bg-console-dark rounded text-console-text-dim text-sm">
              {result.description}
            </div>
          )}

          {result.availableLocations && result.availableLocations.length > 0 && (
            <div>
              <div className="text-console-text font-console mb-2">Available Locations:</div>
              <div className="grid grid-cols-2 gap-2">
                {result.availableLocations.map((location: string, index: number) => (
                  <div key={index} className="p-2 bg-console-dark rounded border border-console-border text-console-text text-sm">
                    {location}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  },
}); 