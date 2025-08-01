'use client'

import { useState, useCallback, useEffect } from 'react'

interface VoiceCommand {
  pattern: string | RegExp
  action: (params: string[]) => void
  description: string
  category: 'game' | 'ui' | 'system' | 'combat'
}

interface VoiceCommandResult {
  command: string
  params: string[]
  confidence: number
  executed: boolean
}

interface VoiceCommandsOptions {
  onCommandExecuted?: (result: VoiceCommandResult) => void
  onCommandNotFound?: (transcript: string) => void
  enableAutoExecution?: boolean
  confidenceThreshold?: number
}

export function useVoiceCommands(options: VoiceCommandsOptions = {}) {
  const [commands, setCommands] = useState<VoiceCommand[]>([])
  const [isEnabled, setIsEnabled] = useState(true)
  const [lastResult, setLastResult] = useState<VoiceCommandResult | null>(null)

  // Default game commands
  const defaultCommands: VoiceCommand[] = [
    // Dice commands
    {
      pattern: /roll\s+(?:a\s+)?(\w+)\s+dice/i,
      action: (params) => {
        console.log(`Rolling ${params[0]} dice`)
        // This will be connected to the dice system
      },
      description: 'Roll dice (e.g., "roll d20", "roll a d6")',
      category: 'game'
    },
    {
      pattern: /roll\s+(\d+)\s*d\s*(\d+)/i,
      action: (params) => {
        const count = parseInt(params[0])
        const sides = parseInt(params[1])
        console.log(`Rolling ${count}d${sides}`)
        // This will be connected to the dice system
      },
      description: 'Roll multiple dice (e.g., "roll 3d6")',
      category: 'game'
    },

    // Inventory commands
    {
      pattern: /check\s+inventory/i,
      action: () => {
        console.log('Opening inventory')
        // This will be connected to the inventory system
      },
      description: 'Check inventory',
      category: 'game'
    },
    {
      pattern: /use\s+(.+)/i,
      action: (params) => {
        console.log(`Using item: ${params[0]}`)
        // This will be connected to the inventory system
      },
      description: 'Use an item (e.g., "use sword")',
      category: 'game'
    },

    // Character commands
    {
      pattern: /check\s+(?:my\s+)?(health|hp)/i,
      action: () => {
        console.log('Checking health')
        // This will be connected to the character system
      },
      description: 'Check health/HP',
      category: 'game'
    },
    {
      pattern: /check\s+(?:my\s+)?(stats?|statistics)/i,
      action: () => {
        console.log('Checking stats')
        // This will be connected to the character system
      },
      description: 'Check character stats',
      category: 'game'
    },

    // Quest commands
    {
      pattern: /check\s+(?:my\s+)?quests?/i,
      action: () => {
        console.log('Checking quests')
        // This will be connected to the quest system
      },
      description: 'Check active quests',
      category: 'game'
    },
    {
      pattern: /(?:what\s+)?(?:is\s+)?my\s+current\s+quest/i,
      action: () => {
        console.log('Checking current quest')
        // This will be connected to the quest system
      },
      description: 'Check current quest',
      category: 'game'
    },

    // Combat commands
    {
      pattern: /attack\s+(.+)/i,
      action: (params) => {
        console.log(`Attacking: ${params[0]}`)
        // This will be connected to the combat system
      },
      description: 'Attack a target (e.g., "attack goblin")',
      category: 'combat'
    },
    {
      pattern: /defend/i,
      action: () => {
        console.log('Taking defensive stance')
        // This will be connected to the combat system
      },
      description: 'Take defensive stance',
      category: 'combat'
    },

    // Movement commands
    {
      pattern: /go\s+(?:to\s+)?(.+)/i,
      action: (params) => {
        console.log(`Moving to: ${params[0]}`)
        // This will be connected to the movement system
      },
      description: 'Move to a location (e.g., "go north", "go to tavern")',
      category: 'game'
    },
    {
      pattern: /(?:look\s+)?around/i,
      action: () => {
        console.log('Looking around')
        // This will be connected to the environment system
      },
      description: 'Look around the current area',
      category: 'game'
    },

    // UI commands
    {
      pattern: /(?:open\s+)?(?:the\s+)?(map|inventory|quests?|character|stats?)/i,
      action: (params) => {
        console.log(`Opening ${params[0]}`)
        // This will be connected to the UI system
      },
      description: 'Open UI panels (e.g., "open map", "inventory")',
      category: 'ui'
    },
    {
      pattern: /close\s+(?:the\s+)?(.+)/i,
      action: (params) => {
        console.log(`Closing ${params[0]}`)
        // This will be connected to the UI system
      },
      description: 'Close UI panels',
      category: 'ui'
    },

    // System commands
    {
      pattern: /(?:turn\s+)?(?:voice\s+)?(?:on|off)/i,
      action: (params) => {
        const isOn = params[0].toLowerCase().includes('on')
        console.log(`Voice ${isOn ? 'enabled' : 'disabled'}`)
        // This will be connected to the voice system
      },
      description: 'Toggle voice features',
      category: 'system'
    },
    {
      pattern: /(?:save|save\s+game)/i,
      action: () => {
        console.log('Saving game')
        // This will be connected to the save system
      },
      description: 'Save the current game',
      category: 'system'
    },
    {
      pattern: /(?:load|load\s+game)/i,
      action: () => {
        console.log('Loading game')
        // This will be connected to the save system
      },
      description: 'Load a saved game',
      category: 'system'
    },

    // D&D 5e Combat Commands
    {
      pattern: /roll\s+initiative/i,
      action: () => {
        console.log('Rolling initiative')
        // This will be connected to the combat system
      },
      description: 'Roll initiative for combat',
      category: 'combat'
    },
    {
      pattern: /attack\s+(.+)\s+with\s+(.+)/i,
      action: (params) => {
        console.log(`Attacking ${params[0]} with ${params[1]}`)
        // This will be connected to the combat system
      },
      description: 'Attack with specific weapon (e.g., "attack goblin with sword")',
      category: 'combat'
    },
    {
      pattern: /cast\s+(.+)\s+at\s+(.+)/i,
      action: (params) => {
        console.log(`Casting ${params[0]} at ${params[1]}`)
        // This will be connected to the combat system
      },
      description: 'Cast spell at target (e.g., "cast fireball at goblin")',
      category: 'combat'
    },
    {
      pattern: /use\s+(.+)\s+on\s+(.+)/i,
      action: (params) => {
        console.log(`Using ${params[0]} on ${params[1]}`)
        // This will be connected to the combat system
      },
      description: 'Use item on target (e.g., "use healing potion on ally")',
      category: 'combat'
    },
    {
      pattern: /roll\s+attack\s+(?:with\s+)?advantage/i,
      action: () => {
        console.log('Rolling attack with advantage')
        // This will be connected to the combat system
      },
      description: 'Roll attack with advantage',
      category: 'combat'
    },
    {
      pattern: /roll\s+attack\s+(?:with\s+)?disadvantage/i,
      action: () => {
        console.log('Rolling attack with disadvantage')
        // This will be connected to the combat system
      },
      description: 'Roll attack with disadvantage',
      category: 'combat'
    },
    {
      pattern: /roll\s+damage\s+(?:for\s+)?critical\s+hit/i,
      action: () => {
        console.log('Rolling damage for critical hit')
        // This will be connected to the combat system
      },
      description: 'Roll damage for critical hit',
      category: 'combat'
    },
    {
      pattern: /make\s+a\s+(.+)\s+saving\s+throw/i,
      action: (params) => {
        console.log(`Making ${params[0]} saving throw`)
        // This will be connected to the combat system
      },
      description: 'Make saving throw (e.g., "make a strength saving throw")',
      category: 'combat'
    },
    {
      pattern: /roll\s+(.+)\s+check/i,
      action: (params) => {
        console.log(`Rolling ${params[0]} check`)
        // This will be connected to the combat system
      },
      description: 'Roll skill check (e.g., "roll perception check")',
      category: 'combat'
    },
    {
      pattern: /end\s+turn/i,
      action: () => {
        console.log('Ending turn')
        // This will be connected to the combat system
      },
      description: 'End current turn in combat',
      category: 'combat'
    },
    {
      pattern: /next\s+turn/i,
      action: () => {
        console.log('Advancing to next turn')
        // This will be connected to the combat system
      },
      description: 'Advance to next turn in combat',
      category: 'combat'
    },
    {
      pattern: /check\s+combat\s+status/i,
      action: () => {
        console.log('Checking combat status')
        // This will be connected to the combat system
      },
      description: 'Check current combat status',
      category: 'combat'
    }
  ]

  // Initialize default commands
  useEffect(() => {
    setCommands(defaultCommands)
  }, [])

  // Process transcript for commands
  const processTranscript = useCallback((transcript: string, confidence: number = 1) => {
    if (!isEnabled) return null

    const normalizedTranscript = transcript.toLowerCase().trim()

    // Check each command pattern
    for (const command of commands) {
      const pattern = typeof command.pattern === 'string'
        ? new RegExp(command.pattern, 'i')
        : command.pattern

      const match = normalizedTranscript.match(pattern)

      if (match) {
        const params = match.slice(1) // Remove the full match, keep only groups
        const result: VoiceCommandResult = {
          command: command.description,
          params,
          confidence,
          executed: false
        }

        // Execute command if auto-execution is enabled
        if (options.enableAutoExecution !== false) {
          try {
            command.action(params)
            result.executed = true
          } catch (error) {
            console.error('Error executing voice command:', error)
          }
        }

        setLastResult(result)
        options.onCommandExecuted?.(result)
        return result
      }
    }

    // No command found
    options.onCommandNotFound?.(transcript)
    return null
  }, [commands, isEnabled, options])

  // Add custom command
  const addCommand = useCallback((command: VoiceCommand) => {
    setCommands(prev => [...prev, command])
  }, [])

  // Remove command
  const removeCommand = useCallback((pattern: string | RegExp) => {
    setCommands(prev => prev.filter(cmd => cmd.pattern !== pattern))
  }, [])

  // Get all commands
  const getCommands = useCallback((category?: 'game' | 'ui' | 'system' | 'combat') => {
    if (category) {
      return commands.filter(cmd => cmd.category === category)
    }
    return commands
  }, [commands])

  // Enable/disable voice commands
  const enableCommands = useCallback(() => {
    setIsEnabled(true)
  }, [])

  const disableCommands = useCallback(() => {
    setIsEnabled(false)
  }, [])

  // Clear last result
  const clearLastResult = useCallback(() => {
    setLastResult(null)
  }, [])

  return {
    // State
    isEnabled,
    lastResult,
    commands: getCommands(),

    // Actions
    processTranscript,
    addCommand,
    removeCommand,
    enableCommands,
    disableCommands,
    clearLastResult,

    // Utilities
    getCommands,
    hasCommands: commands.length > 0,
    isProcessing: false // Could be used for processing state
  }
} 