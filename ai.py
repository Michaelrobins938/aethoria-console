import os
import json
import random
import logging
from groq import Groq
from collections import deque
from langchain.schema import Document
from langchain.text_splitter import TokenTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.docstore.document import Document
from langchain_community.vectorstores import Chroma
import tiktoken
import asyncio
import aiofiles

logger = logging.getLogger(__name__)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

class AethoriaRAG:
    def __init__(self, groq_api_key):
        try:
            logger.info("Initializing AethoriaRAG with provided API key.")
            self.client = Groq(api_key=groq_api_key)
            self.model = "llama3-8b-8192"
            self.embedding_function = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
            self.text_splitter = TokenTextSplitter(chunk_size=450, chunk_overlap=20)
            self.vectorstore = Chroma(embedding_function=self.embedding_function)
            self.game_prompt = None  # Store the game prompt
        except Exception as e:
            logger.error("Error initializing AethoriaRAG", exc_info=True)
            raise

    async def load_game_prompt_async(self, prompt_file, progress_callback=None):
        prompt_path = os.path.join(os.path.dirname(__file__), "GamePrompts", prompt_file)
        logger.info(f"Attempting to open file: {prompt_path}")
        try:
            async with aiofiles.open(prompt_path, 'r', encoding='utf-8') as file:
                content = await file.read()
            
            logger.info(f"Content read, length: {len(content)}")
            chunks = self.text_splitter.split_text(content)
            logger.info(f"Text split into {len(chunks)} chunks")
            
            documents = []
            for i, chunk in enumerate(chunks):
                documents.append(Document(
                    page_content=chunk,
                    metadata={"source": os.path.basename(prompt_path), "chunk": i}
                ))
                if progress_callback and i % 10 == 0:
                    await progress_callback(i / len(chunks))
                
                if len(documents) >= 100:
                    await self.process_document_batch(documents)
                    documents = []
            
            if documents:
                await self.process_document_batch(documents)
            
            logger.info("Finished processing all chunks")
            if progress_callback:
                await progress_callback(1.0)
            
            self.game_prompt = content  # Store the loaded game prompt
            return True
        except Exception as e:
            logger.error(f"Error loading game prompt from {prompt_path}: {e}", exc_info=True)
            raise

    async def process_document_batch(self, documents):
        try:
            logger.info(f"Processing batch of {len(documents)} documents")
            await asyncio.get_event_loop().run_in_executor(
                None, self.vectorstore.add_documents, documents
            )
            logger.info("Batch processing complete")
        except Exception as e:
            logger.error(f"Error processing document batch: {e}", exc_info=True)
            raise

    async def retrieve_relevant_content_async(self, query, k=3):
        try:
            logger.info(f"Retrieving relevant content for query: {query}")
            relevant_docs = await asyncio.get_event_loop().run_in_executor(
                None, self.vectorstore.similarity_search, query, k
            )
            return relevant_docs
        except Exception as e:
            logger.error(f"Error retrieving relevant content for query: {query}", exc_info=True)
            raise

    async def generate_response_async(self, user_input, game_state):
        try:
            logger.info(f"Generating response for user input: {user_input}")
            relevant_docs = await self.retrieve_relevant_content_async(user_input)
            relevant_content = '\n\n---\n\n'.join([doc.page_content for doc in relevant_docs])
            game_state_json = json.dumps(game_state, cls=CustomJSONEncoder)
            
            system_message = "You are the AI for the Aethoria Universal Game System. Use the provided game content and current game state to respond to the user's input in character, as if you were the game world itself."
            
            if self.game_prompt:
                system_message += f"\n\nGame Prompt:\n{self.game_prompt}"
            
            messages = [
                {
                    "role": "system",
                    "content": system_message
                },
                {
                    "role": "user",
                    "content": f"Game State: {game_state_json}\n\nRelevant Game Content:\n{relevant_content}\n\nUser Input: {user_input}"
                }
            ]
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=300,
                    temperature=0.7
                )
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating response for user input: {user_input}", exc_info=True)
            raise

class NPCAI:
    def __init__(self, npc_data):
        self.name = npc_data['name']
        self.personality = npc_data['personality']
        self.knowledge = npc_data['knowledge']
        self.relationships = npc_data['relationships']
        self.mood = "neutral"
        self.conversation_history = deque(maxlen=10)

    def generate_response(self, user_input, world_state):
        context = {
            "npc_name": self.name,
            "personality": self.personality,
            "knowledge": self.knowledge,
            "mood": self.mood,
            "conversation_history": list(self.conversation_history),
            "world_state": world_state,
            "user_input": user_input
        }
        prompt = f"Generate a response for {self.name} based on their personality, knowledge, mood, and the current conversation and world state."
        response = self.rag_system.generate_response(prompt, context)
        self.conversation_history.append({"user": user_input, "npc": response})
        self.update_mood(response)
        self.update_knowledge(response)
        return response

    def update_mood(self, npc_response):
        sentiment = self.analyze_sentiment(npc_response)
        if sentiment == "positive":
            self.mood = "happy"
        elif sentiment == "negative":
            self.mood = "upset"
        else:
            self.mood = "neutral"

    def analyze_sentiment(self, text):
        text_lower = text.lower()
        positive_words = ['happy', 'glad', 'excited', 'wonderful', 'great']
        negative_words = ['sad', 'angry', 'upset', 'disappointed', 'frustrated']
        if any(word in text_lower for word in positive_words):
            return "positive"
        elif any(word in text_lower for word in negative_words):
            return "negative"
        return "neutral"

    def update_knowledge(self, npc_response):
        new_knowledge_keywords = ['learned', 'discovered', 'found out']
        for keyword in new_knowledge_keywords:
            if keyword in npc_response.lower():
                new_info = npc_response.split(keyword)[-1].strip()
                if new_info not in self.knowledge:
                    self.knowledge.append(new_info)

class NPCManager:
    def __init__(self, rag_system):
        self.npcs = {}
        self.rag_system = rag_system

    def add_npc(self, npc_data):
        npc = NPCAI(npc_data)
        self.npcs[npc.name] = npc

    def get_npc(self, name):
        return self.npcs.get(name)

    def update_npc_relationships(self, npc1_name, npc2_name, relationship_change):
        npc1 = self.npcs.get(npc1_name)
        npc2 = self.npcs.get(npc2_name)
        if npc1 and npc2:
            npc1.relationships[npc2_name] = max(-10, min(10, npc1.relationships.get(npc2_name, 0) + relationship_change))
            npc2.relationships[npc1_name] = max(-10, min(10, npc2.relationships.get(npc1_name, 0) + relationship_change))

class WorldAI:
    def __init__(self, rag_system, initial_world_state):
        self.world_state = initial_world_state
        self.event_history = []
        self.rag_system = rag_system

    def update_world_state(self, player_actions, npc_actions):
        context = {
            "current_world_state": self.world_state,
            "player_actions": player_actions,
            "npc_actions": npc_actions,
            "event_history": self.event_history[-5:]
        }
        prompt = "Update the world state based on the given context, player actions, and NPC actions. Generate any new events that might occur."
        response = self.rag_system.generate_response(prompt, context)
        new_world_state = self.parse_world_state_update(response)
        new_events = self.parse_new_events(response)
        self.world_state.update(new_world_state)
        self.event_history.extend(new_events)
        return self.world_state

    def parse_world_state_update(self, response):
        updates = response.split('\n')
        new_state = {}
        for update in updates:
            if ':' in update:
                key, value = update.split(':', 1)
                new_state[key.strip()] = value.strip()
        return new_state

    def parse_new_events(self, response):
        events = []
        lines = response.split('\n')
        for line in lines:
            if line.lower().startswith(("event:", "new event:")):
                events.append(line.split(":", 1)[1].strip())
        return events

    def get_world_description(self):
        context = {
            "world_state": self.world_state,
            "recent_events": self.event_history[-5:]
        }
        prompt = "Provide a rich, engaging description of the current state of the game world based on the given context."
        return self.rag_system.generate_response(prompt, context)

class DialogueGenerator:
    def __init__(self, rag_system, npc_manager):
        self.rag_system = rag_system
        self.npc_manager = npc_manager

    def generate_dialogue(self, npc1_name, npc2_name, topic):
        npc1 = self.npc_manager.get_npc(npc1_name)
        npc2 = self.npc_manager.get_npc(npc2_name)
        if not npc1 or not npc2:
            return "Error: One or both NPCs not found."
        context = {
            "npc1": {
                "name": npc1.name,
                "personality": npc1.personality,
                "mood": npc1.mood,
                "relationship": npc1.relationships.get(npc2.name, 0)
            },
            "npc2": {
                "name": npc2.name,
                "personality": npc2.personality,
                "mood": npc2.mood,
                "relationship": npc2.relationships.get(npc1.name, 0)
            },
            "topic": topic
        }
        prompt = f"Generate a dialogue between {npc1_name} and {npc2_name} about {topic}, considering their personalities, moods, and relationship."
        return self.rag_system.generate_response(prompt, context)