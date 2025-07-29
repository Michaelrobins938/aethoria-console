import os
import json
import networkx as nx
from typing import List, Dict, Any, Optional
import tiktoken

# Global variables
session_data: Dict[str, Any] = {"events": []}
character_data: Dict[str, Any] = {}

class KnowledgeGraphManager:
    def __init__(self):
        self.graph = nx.Graph()

knowledge_graph_manager = KnowledgeGraphManager()

def setup_new_transcript_file(transcript_dir: str) -> str:
    """
    Initializes a new transcript file in the specified directory.
    Creates the directory if it doesn't exist and writes an initial line to the transcript file.
    """
    if not os.path.exists(transcript_dir):
        os.makedirs(transcript_dir)
    transcript_path = os.path.join(transcript_dir, 'transcript.txt')
    with open(transcript_path, 'w') as f:
        f.write("Transcript initialized.\n")
    print(f"New transcript file created at {transcript_path}")
    return transcript_path

def save_journal_entry(journal_entry: str, journal_path: str = "journal.txt") -> None:
    """
    Appends a journal entry to the specified journal file.
    Creates the file if it doesn't exist.
    """
    with open(journal_path, 'a') as f:
        f.write(journal_entry + "\n")
    print(f"Journal entry saved to {journal_path}")

def save_transcript(transcript: str, transcript_path: str) -> None:
    """
    Appends a transcript entry to the specified transcript file.
    """
    with open(transcript_path, 'a') as f:
        f.write(transcript + "\n")
    print(f"Transcript saved to {transcript_path}")

def save_session_data() -> None:
    """
    Saves the session data to a JSON file.
    """
    with open("session_data.json", "w") as f:
        json.dump(session_data, f)

def save_character_data() -> None:
    """
    Saves the character data to a JSON file.
    """
    with open("character_data.json", "w") as f:
        json.dump(character_data, f)

def save_knowledge_graph() -> None:
    """
    Saves the knowledge graph to a GPickle file.
    """
    nx.write_gpickle(knowledge_graph_manager.graph, "knowledge_graph.gpickle")

def load_session_data() -> None:
    """
    Loads session data from a JSON file. Initializes to an empty session if the file is not found.
    """
    global session_data
    try:
        with open("session_data.json", "r") as f:
            session_data = json.load(f)
    except FileNotFoundError:
        session_data = {"events": []}

def load_character_data() -> None:
    """
    Loads character data from a JSON file. Initializes to an empty dictionary if the file is not found.
    """
    global character_data
    try:
        with open("character_data.json", "r") as f:
            character_data = json.load(f)
    except FileNotFoundError:
        character_data = {}

def load_knowledge_graph() -> None:
    """
    Loads the knowledge graph from a GPickle file. Initializes to an empty graph if the file is not found.
    """
    global knowledge_graph_manager
    try:
        with open("knowledge_graph.gpickle", "rb") as f:
            knowledge_graph_manager.graph = nx.Graph()
    except FileNotFoundError:
        knowledge_graph_manager.graph = nx.Graph()

def num_tokens_from_messages(messages: List[Dict[str, str]]) -> int:
    """
    Calculates the number of tokens used in a series of messages for a specific model.
    This is useful for managing token limits in AI models like GPT-3/4.
    """
    enc = tiktoken.encoding_for_model("gpt-4")
    num_tokens = 0
    for message in messages:
        num_tokens += 4  # every message follows the <im_start>{role/name}\n{content}<im_end>\n pattern
        for key, value in message.items():
            num_tokens += len(enc.encode(value))
            if key == "name":  # if there's a name, the role is omitted
                num_tokens += -1  # role is always required and always 1 token
    num_tokens += 2  # every reply is primed with <im_start>assistant
    return num_tokens
