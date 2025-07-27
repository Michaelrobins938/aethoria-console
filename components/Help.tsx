'use client'

import React, { useState } from 'react'
import { 
  HelpCircle, 
  BookOpen, 
  Lightbulb, 
  Info, 
  X, 
  Search,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  RotateCcw
} from 'lucide-react'

interface HelpProps {
  isOpen: boolean
  onClose: () => void
}

type HelpSection = 'getting-started' | 'controls' | 'combat' | 'voice' | 'ai' | 'tips' | 'faq'

interface HelpItem {
  id: string
  title: string
  content: string
  category: HelpSection
  tags: string[]
}

export function Help({ isOpen, onClose }: HelpProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>('getting-started')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const helpItems: HelpItem[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: `Welcome to Aethoria! This AI-powered storytelling game lets you embark on epic adventures with dynamic, responsive narratives.

To begin your journey:
1. Choose a game cartridge (story/adventure)
2. Create your character with unique abilities
3. Start exploring and interacting with the world
4. Use voice commands or text input to communicate
5. Save your progress and continue your adventure anytime`,
      category: 'getting-started',
      tags: ['tutorial', 'beginner', 'setup']
    },
    {
      id: 'character-creation',
      title: 'Character Creation',
      content: `Your character is the hero of your story. During creation, you'll:

- Choose a background (Warrior, Mage, Rogue, etc.)
- Distribute ability points (Strength, Dexterity, etc.)
- Select skills that define your expertise
- Customize your appearance and personality

Each choice affects how you interact with the world and solve challenges.`,
      category: 'getting-started',
      tags: ['character', 'creation', 'stats']
    },
    {
      id: 'voice-controls',
      title: 'Voice Controls',
      content: `Aethoria supports voice interaction for immersive gameplay:

- Click the microphone button to enable voice input
- Speak your actions naturally ("I attack the goblin")
- The AI will interpret and respond to your commands
- Voice output reads responses aloud for immersion
- Adjust voice settings in the Settings menu

Tips for better voice recognition:
- Speak clearly and at a normal pace
- Use specific action words ("attack", "cast", "examine")
- Wait for the AI to finish speaking before giving new commands`,
      category: 'voice',
      tags: ['voice', 'microphone', 'commands']
    },
    {
      id: 'text-controls',
      title: 'Text Controls',
      content: `You can also interact via text input:

- Type your actions in the chat box
- Use natural language ("I search the chest")
- Be specific about what you want to do
- The AI will respond and advance the story

Text input is great for:
- Complex actions and descriptions
- When voice isn't available
- Precise commands and dialogue
- Taking your time to think`,
      category: 'controls',
      tags: ['text', 'typing', 'commands']
    },
    {
      id: 'combat-basics',
      title: 'Combat Basics',
      content: `Combat in Aethoria is turn-based and strategic:

- Initiative determines who acts first
- Choose actions: Attack, Defend, Cast Spell, Use Item, Flee
- Target enemies or allies as appropriate
- Health bars show remaining HP
- Status effects can help or hinder you

Combat Tips:
- Use terrain and positioning to your advantage
- Conserve resources for tougher fights
- Don't be afraid to retreat if overwhelmed
- Work with your party members strategically`,
      category: 'combat',
      tags: ['combat', 'battle', 'strategy']
    },
    {
      id: 'ai-interaction',
      title: 'AI Interaction',
      content: `The AI Dungeon Master adapts to your choices:

- Every decision shapes the story
- The AI remembers your character and past actions
- Responses are personalized to your playstyle
- The world reacts dynamically to your choices

Best practices:
- Be descriptive about your actions
- Ask questions when uncertain
- Explore and experiment
- The AI will guide you if you get stuck`,
      category: 'ai',
      tags: ['ai', 'dungeon-master', 'story']
    },
    {
      id: 'inventory-management',
      title: 'Inventory Management',
      content: `Manage your equipment and items:

- Access inventory via the Items button
- Items have different types: weapons, armor, consumables, etc.
- Use items in combat or exploration
- Some items have special effects
- Organize by type, rarity, or value

Inventory Tips:
- Keep healing items handy
- Don't hoard - use items when needed
- Check item descriptions for effects
- Sell valuable items you don't need`,
      category: 'getting-started',
      tags: ['inventory', 'items', 'equipment']
    },
    {
      id: 'quest-system',
      title: 'Quest System',
      content: `Quests drive your adventure forward:

- Main quests advance the main story
- Side quests offer rewards and lore
- Check your quest log for objectives
- Some quests have time limits
- Completing quests grants experience and rewards

Quest Tips:
- Read quest descriptions carefully
- Some quests have multiple solutions
- Return to quest givers when complete
- Failed quests may have consequences`,
      category: 'getting-started',
      tags: ['quests', 'objectives', 'rewards']
    },
    {
      id: 'saving-loading',
      title: 'Saving and Loading',
      content: `Never lose your progress:

- Save manually via the Save button
- Auto-save occurs periodically
- Multiple save slots available
- Load previous saves anytime
- Cloud saves sync across devices

Save Tips:
- Save before important decisions
- Create multiple save files
- Export saves for backup
- Don't overwrite saves you might want to revisit`,
      category: 'getting-started',
      tags: ['save', 'load', 'progress']
    },
    {
      id: 'voice-troubleshooting',
      title: 'Voice Troubleshooting',
      content: `Having issues with voice input?

Common problems and solutions:
- Microphone not detected: Check browser permissions
- Poor recognition: Speak clearly and slowly
- No response: Check if voice is enabled in settings
- Background noise: Use a quiet environment
- Browser compatibility: Use Chrome or Edge

Voice Settings:
- Adjust microphone sensitivity
- Enable/disable voice output
- Test microphone in settings
- Check audio device selection`,
      category: 'voice',
      tags: ['troubleshooting', 'microphone', 'problems']
    },
    {
      id: 'performance-tips',
      title: 'Performance Tips',
      content: `Optimize your gaming experience:

- Close other browser tabs
- Use a stable internet connection
- Disable unnecessary browser extensions
- Clear browser cache if needed
- Update your browser regularly

For best performance:
- Use a modern browser (Chrome, Firefox, Edge)
- Ensure sufficient RAM (4GB+ recommended)
- Stable internet connection required
- Disable ad blockers for this site`,
      category: 'tips',
      tags: ['performance', 'optimization', 'browser']
    }
  ]

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'controls', label: 'Controls', icon: <Info className="w-4 h-4" /> },
    { id: 'combat', label: 'Combat', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'voice', label: 'Voice', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'ai', label: 'AI', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'tips', label: 'Tips', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> }
  ]

  const filteredItems = helpItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSection = activeSection === 'faq' ? true : item.category === activeSection
    return matchesSearch && matchesSection
  })

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <HelpCircle className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Help & Tutorial</h2>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-console-text-dim" />
            <input
              type="text"
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="console-input pl-10 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation */}
          <div className="lg:col-span-1">
            <div className="console-card">
              <h3 className="font-gaming text-console-accent mb-4">Topics</h3>
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as HelpSection)}
                    className={`console-button w-full flex items-center space-x-2 ${
                      activeSection === section.id ? 'bg-console-accent text-console-dark' : ''
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="console-card">
              <h3 className="font-gaming text-console-accent mb-4">
                {sections.find(s => s.id === activeSection)?.label}
              </h3>
              
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-console-text-dim">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No help topics found</p>
                    <p className="text-sm">Try adjusting your search</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.id} className="border border-console-border rounded">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-console-darker transition-colors"
                      >
                        <h4 className="font-gaming text-console-accent">{item.title}</h4>
                        {expandedItems.includes(item.id) ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronRight className="w-4 h-4" />
                        }
                      </button>
                      
                      {expandedItems.includes(item.id) && (
                        <div className="p-4 border-t border-console-border">
                          <div className="prose prose-invert max-w-none">
                            <div className="text-console-text-dim whitespace-pre-line">
                              {item.content}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-console-accent text-console-dark px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between mt-6 pt-4 border-t border-console-border">
          <div className="text-sm text-console-text-dim">
            {filteredItems.length} topics found
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setExpandedItems([])}
              className="console-button flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Collapse All</span>
            </button>
            
            <button
              onClick={() => setExpandedItems(filteredItems.map(item => item.id))}
              className="console-button flex items-center space-x-2"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Expand All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 