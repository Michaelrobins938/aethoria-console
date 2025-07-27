'use client'

import { useState, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function Thread() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
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
          }
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = '';
      const assistantMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      }]);

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
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: assistantMessage }
                    : msg
                ));
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-console-dark border border-console-border rounded-lg">
      {/* Thread Header */}
      <div className="flex items-center justify-between p-4 border-b border-console-border bg-console-darker">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-console-text font-console text-lg">Aethoria Console</h2>
        </div>
        <div className="text-console-text-dim text-sm font-console">
          AI Status: ACTIVE
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-console-accent text-console-dark'
                  : 'bg-console-darker text-console-text border border-console-border'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
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
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your action or speak..."
            className="flex-1 bg-console-dark border border-console-border rounded-lg px-4 py-2 text-console-text font-console placeholder-console-text-dim focus:outline-none focus:border-console-accent focus:ring-1 focus:ring-console-accent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-console-accent hover:bg-console-accent-dark disabled:bg-console-border disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-console-dark" />
          </button>
        </form>
        
        {/* Quick Actions */}
        <div className="mt-3 flex space-x-2">
          <button
            type="button"
            className="px-3 py-1 bg-console-dark border border-console-border rounded text-console-text-dim text-xs font-console hover:bg-console-accent/20 transition-colors duration-200"
            onClick={() => setInput("I want to explore the area")}
          >
            Explore
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-console-dark border border-console-border rounded text-console-text-dim text-xs font-console hover:bg-console-accent/20 transition-colors duration-200"
            onClick={() => setInput("What can I do here?")}
          >
            Actions
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-console-dark border border-console-border rounded text-console-text-dim text-xs font-console hover:bg-console-accent/20 transition-colors duration-200"
            onClick={() => setInput("Tell me about my character")}
          >
            Character
          </button>
        </div>
      </div>
    </div>
  );
} 