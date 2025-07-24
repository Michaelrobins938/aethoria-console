import json
import os
import logging

logger = logging.getLogger(__name__)

class SaveLoadSystem:
    @staticmethod
    def json_default(obj):
        if isinstance(obj, set):
            return list(obj)
        raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

    @staticmethod
    def save_session_data(session_data):
        try:
            with open('session_data.json', 'w') as f:
                json.dump(session_data, f, default=SaveLoadSystem.json_default)
            logger.info("Session data saved successfully")
        except Exception as e:
            logger.error(f"Error saving session data: {e}", exc_info=True)

    @staticmethod
    def load_session_data():
        file_path = "session_data.json"
        try:
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                with open(file_path, 'r') as f:
                    return json.load(f)
            else:
                logger.warning(f"Session data file {file_path} does not exist or is empty.")
                return {}
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON in {file_path}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error loading session data: {e}")
            return {}

    @staticmethod
    def save_character_data(character_data):
        try:
            with open('character_data.json', 'w') as f:
                json.dump(character_data, f, default=SaveLoadSystem.json_default)
            logger.info("Character data saved successfully")
        except Exception as e:
            logger.error(f"Error saving character data: {e}", exc_info=True)

    @staticmethod
    def load_character_data():
        file_path = "character_data.json"
        try:
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                with open(file_path, 'r') as f:
                    return json.load(f)
            else:
                logger.warning(f"Character data file {file_path} does not exist or is empty.")
                return {}
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON in {file_path}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error loading character data: {e}")
            return {}

    @staticmethod
    def save_knowledge_graph(knowledge_graph):
        try:
            with open('knowledge_graph.json', 'w') as f:
                json.dump(knowledge_graph, f, default=SaveLoadSystem.json_default)
            logger.info("Knowledge graph saved successfully")
        except Exception as e:
            logger.error(f"Error saving knowledge graph: {e}", exc_info=True)

    @staticmethod
    def load_knowledge_graph():
        file_path = "knowledge_graph.json"
        try:
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                with open(file_path, 'r') as f:
                    return json.load(f)
            else:
                logger.warning(f"Knowledge graph file {file_path} does not exist or is empty.")
                return {}
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON in {file_path}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error loading knowledge graph: {e}")
            return {}