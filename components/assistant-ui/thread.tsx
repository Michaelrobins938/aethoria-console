'use client'

import { useState, useEffect } from "react";
import { Send, Dice1, Sword, Shield, Map, Package, BookOpen, User, Settings } from "lucide-react";
import { Character, GamePrompt } from "@/lib/types";
import { 
  DiceRollToolUI, 
  CharacterStatsToolUI, 
  CombatToolUI, 
  InventoryToolUI, 
  QuestToolUI, 
  MapToolUI 
} from "./game-tools.jsx";
import { AttachmentProvider } from "./attachment-provider";
import {
  ComposerAttachments,
  ComposerAddAttachment,
  UserMessageAttachments,
} from "@/components/attachment.jsx";
import { ComposerPrimitive, MessagePrimitive } from "@assistant-ui/react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image'; text?: string; image?: string }>;
  timestamp: number;
  attachments?: any[];
}

interface GameState {
  character: Character;
  gamePrompt: GamePrompt;
  messages: Message[];
  currentLocation: string;
  activeQuests: any[];
  inventory: any[];
  combatState: {
    isActive: boolean;
    enemies: any[];
    turn: number;
  };
}

// Persistent memory storage
const MEMORY_KEY = 'aethoria_game_state';

const loadGameState = (): GameState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(MEMORY_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

const saveGameState = (state: GameState) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

// Default game state
const getDefaultGameState = (): GameState => ({
  character: {
    name: "Adventurer",
    health: 100,
    maxHealth: 100,
    attack: 10,
    defense: 5,
    speed: 10,
    level: 1,
    experience: 0,
    inventory: [],
    skills: [
      { name: "Sword Fighting", level: 1, experience: 0, maxLevel: 5, description: "Basic sword combat", type: "combat" as const },
      { name: "Stealth", level: 1, experience: 0, maxLevel: 5, description: "Moving silently", type: "exploration" as const }
    ],
    statusEffects: {},
    background: "A mysterious traveler seeking adventure",
    abilities: {
      strength: 14,
      dexterity: 12,
      constitution: 16,
      intelligence: 10,
      wisdom: 8,
      charisma: 12
    }
  },
  gamePrompt: {
    id: "fantasy-adventure",
    title: "Fantasy Adventure",
    description: "An epic journey through a mystical realm filled with magic, monsters, and ancient secrets.",
    content: "You are in a mystical realm filled with magic, monsters, and ancient secrets. Your adventure begins...",
    genre: "Fantasy",
    difficulty: "medium",
    themes: ["Adventure", "Magic", "Exploration"],
    mechanics: {
      diceSystem: "D20",
      combatSystem: "Turn-based",
      skillSystem: "D&D 5e inspired",
      inventorySystem: "Weight-based",
      questSystem: "Objective-based",
      specialRules: ["Magic casting", "Stealth mechanics"]
    }
  },
  messages: [],
  currentLocation: "The Crossroads",
  activeQuests: [],
  inventory: [],
  combatState: {
    isActive: false,
    enemies: [],
    turn: 0
  }
});

export function Thread() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGameState();
    return saved || getDefaultGameState();
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Save game state whenever it changes
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...gameState.messages, userMessage],
          gamePrompt: gameState.gamePrompt,
          character: gameState.character,
          gameState: {
            currentLocation: gameState.currentLocation,
            activeQuests: gameState.activeQuests,
            inventory: gameState.inventory,
            combatState: gameState.combatState
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = '';
      const assistantMessageId = (Date.now() + 1).toString();

      const assistantMessageObj: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };

      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessageObj]
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'text-delta' && parsed.textDelta) {
                assistantMessage += parsed.textDelta;
                setGameState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: assistantMessage }
                      : msg
                  )
                }));
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: Date.now()
      };
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action buttons
  const quickActions = [
    { icon: Dice1, label: "Roll Dice", action: () => setInput("Roll a d20 for me") },
    { icon: Sword, label: "Attack", action: () => setInput("I want to attack") },
    { icon: Shield, label: "Defend", action: () => setInput("I take a defensive stance") },
    { icon: Map, label: "Explore", action: () => setInput("I explore the area") },
    { icon: Package, label: "Inventory", action: () => setInput("Show me my inventory") },
    { icon: BookOpen, label: "Quests", action: () => setInput("What quests do I have?") }
  ];

  return (
    <AttachmentProvider>
      <div className="h-full flex flex-col bg-console-dark border border-console-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-console-border bg-console-darker">
        <div className="flex items-center justify-between">
          <h2 className="text-console-text font-console text-lg flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Aethoria Console</span>
          </h2>
          <div className="text-console-text-dim text-sm font-console">
            AI Status: ACTIVE
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-console-border bg-console-darker">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center space-x-2 px-3 py-2 bg-console-accent hover:bg-console-accent-dark text-console-dark font-console rounded-lg transition-colors duration-200 text-sm"
            >
              <action.icon className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {gameState.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-console-accent/20 text-console-text' 
                  : 'bg-console-darker text-console-text border border-console-border'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-console ${
                  message.role === 'user' 
                    ? 'bg-console-accent text-console-dark' 
                    : 'bg-console-text text-console-dark'
                }`}>
                  {message.role === 'user' ? 'U' : 'AI'}
                </div>
                                  <div className="flex-1">
                    <div className="text-sm whitespace-pre-wrap">
                      {typeof message.content === 'string' 
                        ? message.content 
                        : message.content.map((part, index) => {
                            if (part.type === 'text') {
                              return <div key={index}>{part.text}</div>;
                            } else if (part.type === 'image') {
                              return (
                                <div key={index} className="mt-2">
                                  <img 
                                    src={part.image} 
                                    alt="Uploaded content" 
                                    className="max-w-full h-auto rounded-lg border border-console-border"
                                    style={{ maxHeight: '200px' }}
                                  />
                                </div>
                              );
                            }
                            return null;
                          })
                      }
                    </div>
                    <div className="text-console-text-dim text-xs mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-console-text-dim">
            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-console-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="font-console text-sm">AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-console-border bg-console-darker">
        <ComposerPrimitive.Root className="space-y-3">
          {/* Attachments Display */}
          <ComposerAttachments />
          
          {/* Input and Send */}
          <div className="flex space-x-2">
            <ComposerPrimitive.Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your action or command..."
              className="flex-1 bg-console-dark border border-console-border rounded-lg px-4 py-2 text-console-text font-console placeholder-console-text-dim focus:outline-none focus:border-console-accent focus:ring-1 focus:ring-console-accent"
              disabled={isLoading}
            />
            <ComposerAddAttachment />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-console-accent hover:bg-console-accent-dark disabled:bg-console-border disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-console-dark" />
            </button>
          </div>
        </ComposerPrimitive.Root>
      </div>

      {/* Tool UIs */}
      <DiceRollToolUI />
      <CharacterStatsToolUI />
      <CombatToolUI />
      <InventoryToolUI />
      <QuestToolUI />
      <MapToolUI />
      </div>
    </AttachmentProvider>
  );
} 