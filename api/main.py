import os
import json
import logging
import asyncio
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aethoria Console API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game sessions storage
game_sessions: Dict[str, Dict] = {}

# AI Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "your-api-key-here")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "anthropic/claude-3.5-sonnet"

class GameMessage(BaseModel):
    type: str
    content: str
    cartridge_id: str
    session_id: str = None

class GameResponse(BaseModel):
    type: str
    content: str
    game_state: Dict = {}
    audio_url: str = None

# Robust AI Response Generator with Real API Integration
async def generate_ai_response(user_input: str, cartridge_id: str, game_state: Dict, character: Dict = None) -> str:
    """Generate AI response using OpenRouter API with proper game context"""
    
    try:
        # Build comprehensive system prompt based on game context
        system_prompt = build_system_prompt(cartridge_id, game_state, character)
        
        # Prepare messages for the AI
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]
        
        # Add conversation history if available
        if game_state.get('conversation_history'):
            for msg in game_state['conversation_history'][-5:]:  # Last 5 messages
                messages.append({
                    "role": msg.get('role', 'user'),
                    "content": msg.get('content', '')
                })
        
        # Make API call to OpenRouter
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://aethoria-console.vercel.app",
                    "X-Title": "Aethoria Console"
                },
                json={
                    "model": DEFAULT_MODEL,
                    "messages": messages,
                    "max_tokens": 1000,
                    "temperature": 0.8,
                    "stream": False
                }
            )
            
            if response.status_code != 200:
                logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                return generate_fallback_response(cartridge_id, user_input)
            
            response_data = response.json()
            ai_response = response_data['choices'][0]['message']['content']
            
            # Process and enhance the response
            enhanced_response = process_ai_response(ai_response, cartridge_id, game_state)
            
            return enhanced_response
            
    except httpx.TimeoutException:
        logger.error("OpenRouter API timeout")
        return generate_fallback_response(cartridge_id, user_input)
    except Exception as e:
        logger.error(f"AI generation error: {str(e)}")
        return generate_fallback_response(cartridge_id, user_input)

def build_system_prompt(cartridge_id: str, game_state: Dict, character: Dict = None) -> str:
    """Build comprehensive system prompt with game context"""
    
    base_prompts = {
        'dnd-fantasy': """You are a master Dungeon Master running a D&D 5e campaign. Create immersive, descriptive responses that advance the story. Include atmospheric details, character interactions, and meaningful choices. Use dice rolls when appropriate (e.g., "You roll a 15 on your Perception check"). Keep responses engaging and interactive.""",
        
        'silent-hill': """You are the Game Master of a psychological horror game inspired by Silent Hill. Create an atmosphere of dread and mystery. Describe unsettling environments, ambiguous threats, and psychological elements. Use atmospheric details, sound effects, and psychological horror themes. Keep players on edge with subtle horror elements.""",
        
        'portal-sci-fi': """You are GLaDOS, the AI system running Aperture Science test chambers. Respond with scientific curiosity, dark humor, and testing protocols. Include references to science, testing procedures, and the facility's mysterious nature. Use technical language mixed with passive-aggressive commentary.""",
        
        'pokemon-adventure': """You are Professor Oak guiding a Pokémon trainer through their journey. Create a vibrant, adventurous atmosphere with Pokémon encounters, training opportunities, and exploration. Include Pokémon descriptions, battle mechanics, and the spirit of discovery. Make the world feel alive with Pokémon and trainers."""
    }
    
    system_prompt = base_prompts.get(cartridge_id, base_prompts['dnd-fantasy'])
    
    # Add character context
    if character:
        system_prompt += f"\n\nCharacter Context:\n- Name: {character.get('name', 'Unknown')}\n- Level: {character.get('level', 1)}\n- Class: {character.get('class', 'Adventurer')}\n- Health: {character.get('stats', {}).get('health', 100)}/{character.get('stats', {}).get('maxHealth', 100)}\n"
    
    # Add game state context
    if game_state:
        system_prompt += f"\nGame State:\n- Location: {game_state.get('location', 'Unknown')}\n- Current quest: {game_state.get('currentQuest', 'None')}\n- Inventory items: {len(game_state.get('inventory', []))}\n"
    
    # Add response guidelines
    system_prompt += """
    
Response Guidelines:
- Keep responses between 2-4 sentences for quick interactions
- Use descriptive language that immerses the player
- Include clear action options when appropriate
- Respond to player emotions and choices
- Maintain consistency with the game world
- Use appropriate tone for the game type
"""
    
    return system_prompt

def process_ai_response(response: str, cartridge_id: str, game_state: Dict) -> str:
    """Process and enhance AI response with game-specific elements"""
    
    # Add atmospheric elements based on cartridge
    if cartridge_id == 'silent-hill':
        if 'fog' not in response.lower():
            response += " The fog continues to swirl around you, obscuring your vision."
    
    elif cartridge_id == 'portal-sci-fi':
        if 'test' not in response.lower():
            response += " The testing facility hums with automated systems."
    
    elif cartridge_id == 'pokemon-adventure':
        if 'pokemon' not in response.lower():
            response += " The sounds of Pokémon echo through the area."
    
    # Add health/status updates if character is low
    if game_state.get('character', {}).get('stats', {}).get('health', 100) < 30:
        response += " You're feeling quite wounded and should consider resting or using healing items."
    
    return response

def generate_fallback_response(cartridge_id: str, user_input: str) -> str:
    """Generate fallback responses when AI is unavailable"""
    
    fallback_responses = {
        'dnd-fantasy': [
            "The tavern keeper nods approvingly at your request.",
            "A mysterious figure in the corner watches you intently.",
            "The sound of clashing steel echoes from the training grounds.",
            "Magic energy crackles in the air around you.",
            "You feel the ancient power of the realm calling to you."
        ],
        'silent-hill': [
            "The fog grows thicker as you move forward.",
            "A distant radio crackles with static.",
            "Something moves in the shadows ahead.",
            "The air is heavy with the scent of decay.",
            "You hear footsteps echoing in the distance."
        ],
        'portal-sci-fi': [
            "The AI system processes your request.",
            "Test chamber protocols are being initialized.",
            "The portal gun hums with energy.",
            "The facility's automated systems respond.",
            "GLaDOS observes your progress with interest."
        ],
        'pokemon-adventure': [
            "Your Pokémon looks at you with anticipation.",
            "A wild Pokémon appears in the tall grass!",
            "The Pokédex beeps with new information.",
            "You feel the energy of the Pokémon world.",
            "Professor Oak would be proud of your progress."
        ]
    }
    
    responses = fallback_responses.get(cartridge_id, fallback_responses['dnd-fantasy'])
    return responses[len(user_input) % len(responses)]

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Aethoria Console API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "active_connections": len(manager.active_connections)}

@app.websocket("/ws/game")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    session_id = None
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            session_id = message_data.get('session_id', 'default')
            cartridge_id = message_data.get('cartridge_id', 'dnd-fantasy')
            user_input = message_data.get('content', '')
            message_type = message_data.get('type', 'user_message')
            
            logger.info(f"Received message: {message_type} from session {session_id}")
            
            # Initialize game session if it doesn't exist
            if session_id not in game_sessions:
                game_sessions[session_id] = {
                    'cartridge_id': cartridge_id,
                    'messages': [],
                    'game_state': {
                        'location': 'Starting Area',
                        'health': 100,
                        'inventory': [],
                        'quests': []
                    }
                }
            
            # Add user message to session
            game_sessions[session_id]['messages'].append({
                'type': 'user',
                'content': user_input,
                'timestamp': asyncio.get_event_loop().time()
            })
            
            # Generate AI response
            ai_response = await generate_ai_response(
                user_input, 
                cartridge_id, 
                game_sessions[session_id]['game_state']
            )
            
            # Add AI response to session
            game_sessions[session_id]['messages'].append({
                'type': 'ai',
                'content': ai_response,
                'timestamp': asyncio.get_event_loop().time()
            })
            
            # Update game state (simple example)
            if 'move' in user_input.lower() or 'go' in user_input.lower():
                game_sessions[session_id]['game_state']['location'] = 'New Location'
            
            if 'health' in user_input.lower() or 'damage' in user_input.lower():
                game_sessions[session_id]['game_state']['health'] = max(0, game_sessions[session_id]['game_state']['health'] - 10)
            
            # Send response back to client
            response = {
                'type': 'ai_response',
                'content': ai_response,
                'game_state': game_sessions[session_id]['game_state'],
                'session_id': session_id,
                'timestamp': asyncio.get_event_loop().time()
            }
            
            await manager.send_personal_message(json.dumps(response), websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"Client disconnected: {session_id}")

@app.post("/api/game/start")
async def start_game(cartridge_id: str, session_id: str = None):
    """Start a new game session"""
    if not session_id:
        session_id = f"session_{len(game_sessions) + 1}"
    
    game_sessions[session_id] = {
        'cartridge_id': cartridge_id,
        'messages': [],
        'game_state': {
            'location': 'Starting Area',
            'health': 100,
            'inventory': [],
            'quests': []
        }
    }
    
    return {
        'session_id': session_id,
        'cartridge_id': cartridge_id,
        'game_state': game_sessions[session_id]['game_state']
    }

@app.get("/api/game/session/{session_id}")
async def get_game_session(session_id: str):
    """Get game session data"""
    if session_id not in game_sessions:
        return {"error": "Session not found"}
    
    return game_sessions[session_id]

@app.get("/api/cartridges")
async def get_cartridges():
    """Get available game cartridges"""
    return {
        "cartridges": [
            {
                "id": "dnd-fantasy",
                "title": "D&D Fantasy",
                "genre": "Fantasy",
                "description": "Epic adventures in a magical world"
            },
            {
                "id": "silent-hill",
                "title": "Silent Hill",
                "genre": "Horror",
                "description": "Psychological horror survival"
            },
            {
                "id": "portal-sci-fi",
                "title": "Portal Sci-Fi",
                "genre": "Sci-Fi",
                "description": "Mind-bending puzzles and AI"
            },
            {
                "id": "pokemon-adventure",
                "title": "Pokémon Adventure",
                "genre": "Adventure",
                "description": "Monster collection and battles"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 