'use client'

import { useState, useEffect } from "react";
import { Send, Dice1, Sword, Shield, Map, Package, BookOpen, User, Settings, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";
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
  audio?: string; // Add audio field for ElevenLabs audio data
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
      id: "default-character",
      name: "Adventurer",
      health: 100,
      maxHealth: 100,
      armorClass: 10,
      attack: 10,
      level: 1,
      experience: 0,
      experienceToNextLevel: 1000,
      proficiencyBonus: 2,
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
      },
      type: 'player'
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

interface ThreadWithOrbProps {
  gamePrompt?: GamePrompt;
  character?: Character;
}

export function ThreadWithOrb({ gamePrompt, character }: ThreadWithOrbProps) {
  const { orbState, handleAIThinking, handleAIResponse, handleMessageActivity, handleVoiceActivity } = useNarratorOrb();

  const [gameState, setGameState] = useState<GameState>(() => {
    // Use provided props or default state
    if (gamePrompt && character) {
      return {
        character,
        gamePrompt,
        messages: [],
        currentLocation: 'Starting Area',
        activeQuests: [],
        inventory: [],
        combatState: {
          isActive: false,
          enemies: [],
          turn: 1
        }
      };
    }
    
    // Load from localStorage or use default
    const savedState = loadGameState();
    return savedState || getDefaultGameState();
  });

  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0.3); // Track actual audio level for orb reactivity
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [recognition, setRecognition] = useState<any>(null)
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null)

  // Set up audio analyzer for real-time frequency analysis
  const setupAudioAnalyzer = (audio: HTMLAudioElement) => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContext) {
        const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(newAudioContext);
      }

      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser node
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      setAnalyserNode(analyser);

      // Create source from audio element
      const source = ctx.createMediaElementSource(audio);
      setAudioSource(source);

      // Connect the audio graph
      source.connect(analyser);
      analyser.connect(ctx.destination);

      // Start audio context if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      return analyser;
    } catch (error) {
      console.error('Failed to setup audio analyzer:', error);
      return null;
    }
  };

  // Function to get real-time audio level from analyser
  const getAudioLevel = () => {
    if (!analyserNode) return 0.3;

    const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(frequencyData);
    
    // Calculate average frequency level
    const sum = frequencyData.reduce((a, b) => a + b, 0);
    const average = sum / frequencyData.length / 255;
    
    // Apply some smoothing and scaling
    return Math.max(average * 2, 0.1); // Scale up and ensure minimum level
  };

  // Update audio level in real-time
  useEffect(() => {
    if (!analyserNode || !isSpeaking) return;

    const updateAudioLevel = () => {
      const level = getAudioLevel();
      setAudioLevel(level);
    };

    const interval = setInterval(updateAudioLevel, 50); // Update 20 times per second

    return () => clearInterval(interval);
  }, [analyserNode, isSpeaking]);

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

  // Initialize AI with game context when game starts
  useEffect(() => {
    if (gamePrompt && character && gameState.messages.length === 0) {
      // Send initial message to set up the game
      const initializeGame = async () => {
        console.log('=== GAME INITIALIZATION STARTED ===');
        console.log('GamePrompt:', gamePrompt);
        console.log('Character:', character);
        
        setIsLoading(true);
        handleAIThinking();

        try {
          const initialMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: `Start the game "${gamePrompt.title}". I am ${character.name}, a ${character.background}. Please introduce the game and set the scene.`,
            timestamp: Date.now()
          };

          console.log('Initial message:', initialMessage);
          console.log('Making initialization API call...');

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [initialMessage],
              gamePrompt,
              character
            })
          });

          console.log('Initialization API Response status:', response.status);
          console.log('Initialization API Response ok:', response.ok);

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const responseData = await response.json();
          console.log('Game Initialization Response:', responseData);

          if (!responseData.success) {
            throw new Error(responseData.error || 'API returned error');
          }

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseData.message.content,
            timestamp: Date.now(),
            audio: responseData.audio
          };

          console.log('Initialization AI Message created:', aiMessage);

          setGameState(prev => ({
            ...prev,
            messages: [initialMessage, aiMessage]
          }));

          // Play the initial audio if available
          if (responseData.audio && isSpeaking && isVoiceEnabled) {
            try {
              const audio = new Audio(responseData.audio);
              setCurrentAudio(audio);
              
              // Set up audio analyzer for real-time frequency analysis
              const analyser = setupAudioAnalyzer(audio);
              
              audio.onended = () => {
                setIsSpeaking(false);
                setAudioLevel(0.3);
                setCurrentAudio(null);
                setAnalyserNode(null);
                setAudioSource(null);
              };
              audio.onerror = () => {
                setIsSpeaking(false);
                setAudioLevel(0.3);
                setCurrentAudio(null);
                setAnalyserNode(null);
                setAudioSource(null);
              };
              
              // Make the orb audio-reactive during playback
              const handleTimeUpdate = () => {
                if (audio.duration > 0) {
                  // Use real-time audio analysis instead of playback progress
                  const currentLevel = getAudioLevel();
                  setAudioLevel(currentLevel);
                }
              };
              
              audio.addEventListener('timeupdate', handleTimeUpdate);
              audio.addEventListener('ended', () => {
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                setIsSpeaking(false);
                setAudioLevel(0.3);
                setCurrentAudio(null);
                setAnalyserNode(null);
                setAudioSource(null);
              });
              
              setAudioLevel(0.8); // Initial level when starting
              audio.play();
            } catch (error) {
              console.error('Failed to play initial audio:', error);
              setIsSpeaking(false);
              setAudioLevel(0.3);
            }
          }

        } catch (error) {
          console.error('Failed to initialize game:', error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeGame();
    }
  }, [gamePrompt, character, gameState.messages.length]); // Fixed dependency array

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('Input:', input);
    console.log('GameState:', gameState);

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
      console.log('Making API call to /api/chat...');
      // Call the AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...gameState.messages, userMessage],
          gamePrompt: gameState.gamePrompt,
          character: gameState.character
        })
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle the response
      const responseData = await response.json();
      console.log('API Response Data:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.error || 'API returned error');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseData.message.content,
        timestamp: Date.now(),
        audio: responseData.audio // Store the ElevenLabs audio data
      };

      console.log('AI Message created:', aiMessage);

      // Add the AI message to the state
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));

          // Play ElevenLabs audio if available
          if (responseData.audio && isSpeaking && isVoiceEnabled) {
            try {
              const audio = new Audio(responseData.audio);
              setCurrentAudio(audio);
              
              // Set up audio analyzer for real-time frequency analysis
              const analyser = setupAudioAnalyzer(audio);
              
              audio.onended = () => {
                setIsSpeaking(false);
                setAudioLevel(0.3);
                setCurrentAudio(null);
                setAnalyserNode(null);
                setAudioSource(null);
              };
              audio.onerror = () => {
                setIsSpeaking(false);
                setAudioLevel(0.3);
                setCurrentAudio(null);
                setAnalyserNode(null);
                setAudioSource(null);
              };
              
              // Make the orb audio-reactive during playback
              const handleTimeUpdate = () => {
                if (audio.duration > 0) {
                  // Use real-time audio analysis instead of playback progress
                  const currentLevel = getAudioLevel();
                  setAudioLevel(currentLevel);
                }
              };
              
              audio.addEventListener('timeupdate', handleTimeUpdate);
              audio.addEventListener('ended', () => {
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                setIsSpeaking(false);
                setAudioLevel(0.3);
                setCurrentAudio(null);
                setAnalyserNode(null);
                setAudioSource(null);
              });
              
              setAudioLevel(0.8); // Initial level when starting
              audio.play();
            } catch (error) {
              console.error('Failed to play audio:', error);
              setIsSpeaking(false);
              setAudioLevel(0.3);
            }
          }

      saveGameState({
        ...gameState,
        messages: [...gameState.messages, userMessage, aiMessage]
      });

    } catch (error) {
      console.error('Failed to process message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error processing your request. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      };

      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
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
    if (isSpeaking) {
      // Stop current audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setCurrentAudio(null);
      }
      setIsSpeaking(false);
      setAudioLevel(0.3);
    } else {
      // Try to play the last AI message audio
      const lastAIMessage = gameState.messages
        .filter(msg => msg.role === 'assistant')
        .pop();
      
      if (lastAIMessage?.audio && isVoiceEnabled) {
        try {
          const audio = new Audio(lastAIMessage.audio);
          setCurrentAudio(audio);
          
          // Set up audio analyzer for real-time frequency analysis
          const analyser = setupAudioAnalyzer(audio);

          audio.onended = () => {
            setIsSpeaking(false);
            setAudioLevel(0.3);
            setCurrentAudio(null);
            setAnalyserNode(null);
            setAudioSource(null);
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            setAudioLevel(0.3);
            setCurrentAudio(null);
            setAnalyserNode(null);
            setAudioSource(null);
          };
          
          // Make the orb audio-reactive during playback
          const handleTimeUpdate = () => {
            if (audio.duration > 0) {
              // Use real-time audio analysis instead of playback progress
              const currentLevel = getAudioLevel();
              setAudioLevel(currentLevel);
            }
          };
          
          audio.addEventListener('timeupdate', handleTimeUpdate);
          audio.addEventListener('ended', () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            setIsSpeaking(false);
            setAudioLevel(0.3);
            setCurrentAudio(null);
            setAnalyserNode(null);
            setAudioSource(null);
          });
          
          setAudioLevel(0.8); // Initial level when starting
          audio.play();
          setIsSpeaking(true);
        } catch (error) {
          console.error('Failed to play audio:', error);
          setIsSpeaking(false);
          setAudioLevel(0.3);
        }
      }
    }
  };

  const toggleVoiceEnabled = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      setIsSpeaking(false); // Stop any current speech when disabling
    }
  };

  const clearChat = () => {
    setGameState(prev => ({
      ...prev,
      messages: []
    }));
    setInput('');
    setIsSpeaking(false);
    console.log('Chat cleared - starting fresh instance');
  };

  return (
    <div className="h-full flex flex-col relative mobile-full-height">
      {/* NarratorOrb Background - Enhanced prominence */}
      <NarratorOrbComponent 
        isVisible={true}
        intensity={orbState.intensity}
        audioLevel={audioLevel} // Use dynamic audio level for reactivity
        analyserNode={analyserNode} // Pass the analyser for real-time frequency analysis
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Game Content - No background, only chat bubbles */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Voice Controls */}
        <div className="mobile-chat-header bg-console-darker/80 backdrop-blur-sm border-b border-console-border">
          <h2 className="text-console-accent font-console text-lg">AI Game Master</h2>
          
          <div className="flex items-center space-x-2">
            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="mobile-button bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              title="Clear chat and start fresh"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Quick Dice Roll Button */}
            <button
              onClick={() => {
                const result = Math.floor(Math.random() * 20) + 1;
                console.log(`Quick d20 roll: ${result}`);
                // You can add logic to send this to the AI
              }}
              className="mobile-button bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
              title="Roll d20"
            >
              <Dice1 className="w-4 h-4" />
            </button>
            
            {/* Voice Enable/Disable Button */}
            <button
              onClick={toggleVoiceEnabled}
              className={`mobile-button transition-colors ${
                isVoiceEnabled 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
              title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleVoiceInput}
              className={`mobile-button transition-colors ${
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
              disabled={!isVoiceEnabled}
              className={`mobile-button transition-colors ${
                !isVoiceEnabled 
                  ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed' 
                  : isSpeaking 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'bg-console-accent/20 text-console-accent border border-console-accent/30 hover:bg-console-accent/30'
              }`}
              title={!isVoiceEnabled ? 'Voice disabled' : isSpeaking ? 'Stop speaking' : 'Start voice output'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="mobile-chat-messages bg-transparent">
          {gameState.messages.length === 0 ? (
            <div className="text-center text-console-text-dim py-8 bg-console-darker/10 backdrop-blur-sm rounded-lg m-2">
              <p className="font-console text-sm md:text-base">Start your adventure by typing a message or using voice commands</p>
            </div>
          ) : (
            gameState.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`${
                    message.role === 'user'
                      ? 'mobile-message-user'
                      : 'mobile-message-ai'
                  } bg-console-darker/15 backdrop-blur-sm`}
                >
                  <div className="text-sm font-console leading-relaxed">
                    {typeof message.content === 'string' 
                      ? message.content 
                      : message.content.map((item, index) => (
                          <div key={index}>
                            {item.type === 'text' && item.text}
                            {item.type === 'image' && item.image && (
                              <img src={item.image} alt="Attachment" className="max-w-full h-auto mt-2 rounded" />
                            )}
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="mobile-message-ai bg-console-darker/15 backdrop-blur-sm">
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
        <div className="mobile-chat-input bg-console-darker/30 backdrop-blur-sm border-t border-console-border">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type your action or speak..."
              className="mobile-input"
              disabled={isLoading}
            />
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="mobile-button bg-console-accent/20 text-console-accent border border-console-accent/30 hover:bg-console-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
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