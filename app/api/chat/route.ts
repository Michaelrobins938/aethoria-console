import { NextRequest, NextResponse } from 'next/server'
import { getModelForCartridge, getModelConfig, getModelDescription } from '@/lib/ai'
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, gamePrompt, character } = await req.json();
    
    if (!messages) {
      return NextResponse.json(
        { error: 'Missing messages' },
        { status: 400 }
      )
    }

    // Determine the game genre and select appropriate model
    const genre = gamePrompt?.genre?.toLowerCase() || 'fantasy'
    let cartridgeId = 'fantasy-adventure' // default
    
    // Map genre to cartridge ID for model selection
    if (genre.includes('horror')) {
      cartridgeId = 'horror-adventure'
    } else if (genre.includes('sci-fi') || genre.includes('scifi')) {
      cartridgeId = 'scifi-adventure'
    } else if (genre.includes('comedy')) {
      cartridgeId = 'comedy-adventure'
    } else if (genre.includes('drama')) {
      cartridgeId = 'drama-adventure'
    }

    // Get the optimal model for this game genre
    const selectedModel = getModelForCartridge(cartridgeId)
    const modelConfig = getModelConfig(selectedModel)
    const modelDescription = getModelDescription(cartridgeId)

    console.log(`Using model: ${selectedModel} - ${modelDescription}`)

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OpenRouter API key missing')
      return NextResponse.json(
        { 
          error: 'OpenRouter API key not configured',
          message: 'Please set your OPENROUTER_API_KEY in the environment variables to use the AI chat feature.',
          debug: {
            hasApiKey: false,
            envVars: {
              OPENROUTER_API_KEY: 'missing',
              NODE_ENV: process.env.NODE_ENV,
              VERCEL_ENV: process.env.VERCEL_ENV
            }
          }
        },
        { status: 500 }
      )
    }

    // Process messages to handle attachments
    const processedMessages = messages.map((msg: any) => {
      if (msg.role === "user" && msg.content && Array.isArray(msg.content)) {
        // Handle messages with attachments
        const textParts = msg.content.filter((part: any) => part.type === "text").map((part: any) => part.text).join("\n");
        const imageParts = msg.content.filter((part: any) => part.type === "image");
        
        if (imageParts.length > 0) {
          // Format for vision-capable models
          return {
            role: "user",
            content: [
              { type: "text", text: textParts },
              ...imageParts.map((part: any) => ({
                type: "image_url",
                image_url: { url: part.image }
              }))
            ]
          };
        } else {
          return {
            role: msg.role,
            content: textParts
          };
        }
      }
      
      // Regular text messages
      return {
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : msg.content?.filter((part: any) => part.type === "text").map((part: any) => part.text).join("\n") || ""
      };
    });

    // Create a system message that includes game context
    const systemMessage = {
      role: "system" as const,
      content: `You are an AI Game Master for Aethoria, an interactive storytelling game. 

${gamePrompt ? `Current Game: ${gamePrompt.title}
Genre: ${gamePrompt.genre}
Themes: ${gamePrompt.themes.join(', ')}
Difficulty: ${gamePrompt.difficulty}

Game Description: ${gamePrompt.description}

${character ? `Player Character: ${character.name}
Character Stats: STR ${character.abilities.strength}, DEX ${character.abilities.dexterity}, CON ${character.abilities.constitution}, INT ${character.abilities.intelligence}, WIS ${character.abilities.wisdom}, CHA ${character.abilities.charisma}
Character Skills: ${character.skills.map((s: any) => s.name).join(', ')}
Character Background: ${character.background}` : ''}

Game Mechanics: ${gamePrompt.mechanics ? JSON.stringify(gamePrompt.mechanics) : 'Standard D&D 5e inspired mechanics'}` : 'You are running a generic fantasy adventure game.'}

Model: ${selectedModel} - ${modelDescription}

IMPORTANT GUIDELINES:
1. Stay in character as the Game Master at all times
2. Use descriptive, atmospheric language that matches the game's genre and themes
3. When dice rolls are needed, clearly state what type of roll and what die to use
4. Provide meaningful choices and consequences
5. Keep the narrative engaging and interactive
6. Respond in a conversational, immersive style
7. Use the character's stats and abilities when relevant
8. Maintain consistency with the game's established lore and mechanics
9. If the player uploads images, describe what you see and incorporate it into the game narrative
10. If the player uploads character sheets or documents, use that information to enhance the game

Begin the adventure and respond to the player's actions accordingly.`
    };

    // Define game tools
    const gameTools = {
      rollDice: {
        description: "Roll dice for skill checks, attacks, or other game mechanics",
        parameters: z.object({
          dice: z.string().describe("Dice notation (e.g., 'd20', '2d6', 'd100')"),
          reason: z.string().optional().describe("Reason for the roll (e.g., 'attack roll', 'stealth check')")
        }),
        execute: async ({ dice, reason }: { dice: string; reason?: string }) => {
          // Parse dice notation (e.g., "2d6" = 2 dice with 6 sides)
          const match = dice.match(/^(\d+)?d(\d+)$/);
          if (!match) {
            throw new Error(`Invalid dice notation: ${dice}`);
          }
          
          const numDice = parseInt(match[1]) || 1;
          const sides = parseInt(match[2]);
          
          const rolls = [];
          let total = 0;
          
          for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
          }
          
          return {
            result: total,
            rolls: rolls,
            total: total
          };
        }
      },
      
      updateCharacter: {
        description: "Update character stats, health, experience, or other attributes",
        parameters: z.object({
          action: z.string().optional().describe("What action was taken that caused the update")
        }),
        execute: async ({ action }: { action?: string }) => {
          // This would typically update the character in a database
          // For now, we'll return a mock character update
          return {
            character: {
              name: "Adventurer",
              health: 95,
              maxHealth: 100,
              level: 1,
              experience: 150,
              abilities: {
                strength: 14,
                dexterity: 12,
                constitution: 16,
                intelligence: 10,
                wisdom: 8,
                charisma: 12
              }
            },
            changes: action ? `Character updated due to: ${action}` : "Character stats updated"
          };
        }
      },
      
      combatAction: {
        description: "Execute combat actions like attacks, spells, or defensive maneuvers",
        parameters: z.object({
          action: z.string().describe("The combat action (attack, cast spell, defend, etc.)"),
          target: z.string().optional().describe("Target of the action")
        }),
        execute: async ({ action, target }: { action: string; target?: string }) => {
          // Simulate combat action
          const hit = Math.random() > 0.3; // 70% hit chance
          const damage = hit ? Math.floor(Math.random() * 10) + 1 : 0;
          
          return {
            result: {
              hit: hit,
              damage: damage,
              remainingHealth: 85
            },
            combatState: {
              turn: 2,
              enemies: [{ name: "Goblin", health: 15 }]
            }
          };
        }
      },
      
      manageInventory: {
        description: "Add, remove, or view items in the character's inventory",
        parameters: z.object({
          action: z.string().describe("The inventory action (add, remove, view, use)"),
          item: z.string().optional().describe("Item name if applicable")
        }),
        execute: async ({ action, item }: { action: string; item?: string }) => {
          // Mock inventory management
          const mockInventory = [
            { name: "Health Potion", type: "Consumable", quantity: 3 },
            { name: "Iron Sword", type: "Weapon", quantity: 1 },
            { name: "Leather Armor", type: "Armor", quantity: 1 }
          ];
          
          return {
            inventory: mockInventory,
            changes: `${action} ${item || 'items'}`
          };
        }
      },
      
      manageQuests: {
        description: "View, accept, complete, or update quest progress",
        parameters: z.object({
          action: z.string().describe("The quest action (view, accept, complete, update)"),
          questId: z.string().optional().describe("Quest identifier if applicable")
        }),
        execute: async ({ action, questId }: { action: string; questId?: string }) => {
          // Mock quest management
          const mockQuests = [
            {
              title: "Clear the Goblin Cave",
              description: "Defeat the goblins threatening the village",
              status: "in_progress",
              progress: { current: 2, total: 5 }
            },
            {
              title: "Find the Lost Artifact",
              description: "Locate the ancient artifact in the ruins",
              status: "active",
              progress: { current: 0, total: 1 }
            }
          ];
          
          return {
            quests: mockQuests,
            changes: `${action} quest${questId ? `: ${questId}` : ''}`
          };
        }
      },
      
      navigateMap: {
        description: "Move to different locations on the game map",
        parameters: z.object({
          action: z.string().describe("The navigation action (move, explore, travel)"),
          location: z.string().optional().describe("Target location name")
        }),
        execute: async ({ action, location }: { action: string; location?: string }) => {
          // Mock map navigation
          const availableLocations = [
            "The Crossroads",
            "Dark Forest",
            "Ancient Ruins",
            "Village of Elders",
            "Mystic Tower"
          ];
          
          return {
            currentLocation: location || "The Crossroads",
            availableLocations: availableLocations,
            description: `You are now at ${location || "The Crossroads"}. The air is thick with adventure.`
          };
        }
      }
    };

    // Generate AI response using OpenRouter (simplified without tools for now)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        'X-Title': 'Aethoria Console'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [systemMessage, ...processedMessages],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        top_p: modelConfig.topP,
        frequency_penalty: modelConfig.frequencyPenalty,
        presence_penalty: modelConfig.presencePenalty,
        stream: true
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      return NextResponse.json(
        { 
          error: 'Failed to generate AI response',
          details: `OpenRouter API error: ${response.status}`,
          debug: {
            status: response.status,
            statusText: response.statusText,
            errorData: errorData.substring(0, 500), // Limit error data length
            requestBody: {
              model: selectedModel,
              messageCount: processedMessages.length,
              hasSystemMessage: !!systemMessage
            }
          }
        },
        { status: 500 }
      )
    }

    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Sorry, there was an error processing your request. Please try again.'
      },
      { status: 500 }
    )
  }
} 