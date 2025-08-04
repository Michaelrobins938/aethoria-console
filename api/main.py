from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import asyncio
import os
from typing import Dict, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aethoria Console API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game state storage
game_sessions: Dict[str, Dict] = {}

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

# AI Response Generator (placeholder - replace with actual AI integration)
async def generate_ai_response(user_input: str, cartridge_id: str, game_state: Dict) -> str:
    """Generate AI response based on user input and game context"""
    
    # Simple response generation (replace with actual AI API calls)
    responses = {
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
    
    cartridge_responses = responses.get(cartridge_id, responses['dnd-fantasy'])
    return cartridge_responses[len(user_input) % len(cartridge_responses)]

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