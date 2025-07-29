'use client'

import { useState, useEffect } from "react";
import { Send, Dice1, Sword, Shield, Map, Package, BookOpen, User, Settings, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Character, GamePrompt } from "@/lib/types";
import { 
  DiceRollToolUI, 
  CharacterStatsToolUI, 
  CombatToolUI, 
  InventoryToolUI, 
  QuestToolUI, 
  MapToolUI 
} from "./game-tools";
import { AttachmentProvider } from "./attachment-provider";
import {
  ComposerAttachments,
  ComposerAddAttachment,
  UserMessageAttachments,
} from "@/components/attachment";
import { ComposerPrimitive, MessagePrimitive } from "@assistant-ui/react";
import { NarratorOrbComponent } from '../NarratorOrb'
import { useNarratorOrb } from '@/lib/hooks/useNarratorOrb'

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
    themes: ["Adventure", "Magic", "Combat"],
    mechanics: {
      diceSystem: "d20",
      combatSystem: "turn-based",
      skillSystem: "level-based",
      inventorySystem: "weight-based",
      questSystem: "multi-objective",
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

export function ThreadWithOrb() {
  const [gameState, setGameState] = useState<GameState>(getDefaultGameState);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);

  const { orbState, handleMessageActivity, handleAIThinking, handleAIResponse, handleVoiceActivity } = useNarratorOrb()

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        handleVoiceActivity(0.6);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        handleVoiceActivity(0.2);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        handleVoiceActivity(0.2);
      };

      setRecognition(recognitionInstance);
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }

    // Load saved game state
    const savedState = loadGameState();
    if (savedState) {
      setGameState(savedState);
    }
  }, [handleVoiceActivity]);

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

    setInput("");
    setIsLoading(true);
    handleMessageActivity();
    handleAIThinking();

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand your action: "${userMessage.content}". This is a simulated AI response. In a real implementation, this would be processed by the AI system.`,
        timestamp: Date.now()
      };

      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

      // Speak the response if enabled
      if (synthesis && isSpeaking) {
        const utterance = new SpeechSynthesisUtterance(aiMessage.content as string);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        synthesis.speak(utterance);
      }

      saveGameState({
        ...gameState,
        messages: [...gameState.messages, userMessage, aiMessage]
      });

    } catch (error) {
      console.error('Failed to process message:', error);
    } finally {
      setIsLoading(false);
      handleAIResponse();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const toggleVoiceOutput = () => {
    if (!synthesis) return;

    if (isSpeaking) {
      synthesis.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      // Speak the last AI message
      const lastAIMessage = gameState.messages
        .filter(m => m.role === 'assistant')
        .pop();
      
      if (lastAIMessage) {
        const utterance = new SpeechSynthesisUtterance(lastAIMessage.content as string);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        synthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* NarratorOrb Background */}
      <NarratorOrbComponent 
        isVisible={true}
        intensity={orbState.intensity}
        audioLevel={orbState.audioLevel}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Game Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Voice Controls */}
        <div className="flex items-center justify-between p-4 border-b border-console-border bg-console-darker/80 backdrop-blur-sm">
          <h2 className="text-console-accent font-console text-lg">AI Game Master</h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleVoiceInput}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-console-accent/20 text-console-accent border border-console-accent/30 hover:bg-console-accent/30'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleVoiceOutput}
              className={`p-2 rounded-lg transition-colors ${
                isSpeaking 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-console-accent/20 text-console-accent border border-console-accent/30 hover:bg-console-accent/30'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Start voice output'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {gameState.messages.length === 0 ? (
            <div className="text-center text-console-text-dim py-8">
              <p className="font-console">Start your adventure by typing a message or using voice commands</p>
            </div>
          ) : (
            gameState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-console-accent text-console-dark'
                      : 'bg-console-darker/80 backdrop-blur-sm text-console-text border border-console-border'
                  }`}
                >
                  <div className="text-sm font-console">{message.content}</div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-console-darker/80 backdrop-blur-sm text-console-text border border-console-border rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-console-accent rounded-full animate-pulse delay-200"></div>
                  <span className="text-sm font-console">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-console-border bg-console-darker/80 backdrop-blur-sm">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type your action or speak..."
              className="flex-1 bg-console-dark text-console-text border border-console-border rounded px-3 py-2 focus:outline-none focus:border-console-accent font-console"
              disabled={isLoading}
            />
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="console-button flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {isListening && (
            <div className="mt-2 text-xs text-console-text-dim font-console">
              Voice commands: &quot;send&quot;, &quot;clear&quot;, &quot;help&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 