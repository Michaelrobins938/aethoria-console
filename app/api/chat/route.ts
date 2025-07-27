import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, gamePrompt, character } = await req.json();
  
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
Character Skills: ${character.skills.join(', ')}
Character Equipment: ${character.equipment.join(', ')}
Character Backstory: ${character.backstory}` : ''}

Game Mechanics: ${gamePrompt.mechanics ? JSON.stringify(gamePrompt.mechanics) : 'Standard D&D 5e inspired mechanics'}` : 'You are running a generic fantasy adventure game.'}

IMPORTANT GUIDELINES:
1. Stay in character as the Game Master at all times
2. Use descriptive, atmospheric language that matches the game's genre and themes
3. When dice rolls are needed, clearly state what type of roll and what die to use
4. Provide meaningful choices and consequences
5. Keep the narrative engaging and interactive
6. Respond in a conversational, immersive style
7. Use the character's stats and abilities when relevant
8. Maintain consistency with the game's established lore and mechanics

Begin the adventure and respond to the player's actions accordingly.`
  };

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: [systemMessage, ...messages],
    temperature: 0.8,
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
} 