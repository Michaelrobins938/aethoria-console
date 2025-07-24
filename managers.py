import logging
import networkx as nx
import random
from enum import Enum

class QuestStatus(Enum):
    NOT_STARTED = 0
    IN_PROGRESS = 1
    COMPLETED = 2
    FAILED = 3

class InventoryManager:
    def __init__(self):
        try:
            logging.info("Initializing InventoryManager.")
            self.inventories = {"player": []}
        except Exception as e:
            logging.error("Error initializing InventoryManager", exc_info=True)
            raise

    def add_item(self, character, item):
        try:
            logging.info(f"Adding item '{item}' to {character}'s inventory.")
            if character not in self.inventories:
                self.inventories[character] = []
            self.inventories[character].append(item)
        except Exception as e:
            logging.error(f"Error adding item '{item}' to {character}'s inventory", exc_info=True)
            raise

    def remove_item(self, character, item):
        try:
            logging.info(f"Removing item '{item}' from {character}'s inventory.")
            if character in self.inventories and item in self.inventories[character]:
                self.inventories[character].remove(item)
        except Exception as e:
            logging.error(f"Error removing item '{item}' from {character}'s inventory", exc_info=True)
            raise

    def get_inventory(self, character):
        try:
            logging.info(f"Getting inventory for {character}.")
            return self.inventories.get(character, [])
        except Exception as e:
            logging.error(f"Error getting inventory for {character}", exc_info=True)
            raise

    def update_from_message(self, message, entities):
        try:
            logging.info("Updating inventory from message.")
            new_items = []
            item_keywords = ["received", "found", "acquired", "given", "picked up", "looted"]
            for keyword in item_keywords:
                if keyword in message.lower():
                    for entity in entities:
                        if entity[1] == "ITEM":
                            item = entity[0]
                            self.add_item("player", item)
                            new_items.append(item)
            return new_items
        except Exception as e:
            logging.error("Error updating inventory from message", exc_info=True)
            raise

class QuestManager:
    def __init__(self):
        try:
            logging.info("Initializing QuestManager.")
            self.quests = {}
            self.active_quests = []
            self.completed_quests = []
            self.failed_quests = []
            self.quest_dependencies = nx.DiGraph()
        except Exception as e:
            logging.error("Error initializing QuestManager", exc_info=True)
            raise

    def add_quest(self, quest_id, quest_data):
        try:
            logging.info(f"Adding quest '{quest_id}'.")
            self.quests[quest_id] = quest_data
            self.quests[quest_id]['status'] = QuestStatus.NOT_STARTED
            if 'dependencies' in quest_data:
                for dep in quest_data['dependencies']:
                    self.quest_dependencies.add_edge(dep, quest_id)
        except Exception as e:
            logging.error(f"Error adding quest '{quest_id}'", exc_info=True)
            raise

    def start_quest(self, quest_id):
        try:
            logging.info(f"Starting quest '{quest_id}'.")
            if quest_id in self.quests and self.quests[quest_id]['status'] == QuestStatus.NOT_STARTED:
                if self.check_dependencies(quest_id):
                    self.quests[quest_id]['status'] = QuestStatus.IN_PROGRESS
                    self.active_quests.append(quest_id)
                    return True
            return False
        except Exception as e:
            logging.error(f"Error starting quest '{quest_id}'", exc_info=True)
            raise

    def complete_quest(self, quest_id):
        try:
            logging.info(f"Completing quest '{quest_id}'.")
            if quest_id in self.active_quests:
                self.quests[quest_id]['status'] = QuestStatus.COMPLETED
                self.active_quests.remove(quest_id)
                self.completed_quests.append(quest_id)
                self.check_dependent_quests(quest_id)
                return True
            return False
        except Exception as e:
            logging.error(f"Error completing quest '{quest_id}'", exc_info=True)
            raise

    def fail_quest(self, quest_id):
        try:
            logging.info(f"Failing quest '{quest_id}'.")
            if quest_id in self.active_quests:
                self.quests[quest_id]['status'] = QuestStatus.FAILED
                self.active_quests.remove(quest_id)
                self.failed_quests.append(quest_id)
                self.check_dependent_quests(quest_id)
                return True
            return False
        except Exception as e:
            logging.error(f"Error failing quest '{quest_id}'", exc_info=True)
            raise

    def check_dependencies(self, quest_id):
        try:
            logging.info(f"Checking dependencies for quest '{quest_id}'.")
            for dep in self.quest_dependencies.predecessors(quest_id):
                if self.quests[dep]['status'] != QuestStatus.COMPLETED:
                    return False
            return True
        except Exception as e:
            logging.error(f"Error checking dependencies for quest '{quest_id}'", exc_info=True)
            raise

    def check_dependent_quests(self, completed_quest_id):
        try:
            logging.info(f"Checking dependent quests for completed quest '{completed_quest_id}'.")
            for dep_quest in self.quest_dependencies.successors(completed_quest_id):
                if self.check_dependencies(dep_quest):
                    self.start_quest(dep_quest)
        except Exception as e:
            logging.error(f"Error checking dependent quests for completed quest '{completed_quest_id}'", exc_info=True)
            raise

    def get_active_quests(self):
        try:
            logging.info("Getting active quests.")
            return [self.quests[quest_id] for quest_id in self.active_quests]
        except Exception as e:
            logging.error("Error getting active quests", exc_info=True)
            raise

    def get_quest_status(self, quest_id):
        try:
            logging.info(f"Getting status for quest '{quest_id}'.")
            return self.quests[quest_id]['status'] if quest_id in self.quests else None
        except Exception as e:
            logging.error(f"Error getting status for quest '{quest_id}'", exc_info=True)
            raise

    def update_quest_progress(self, quest_id, progress):
        try:
            logging.info(f"Updating progress for quest '{quest_id}' with progress {progress}.")
            if quest_id in self.active_quests:
                self.quests[quest_id]['progress'] = progress
                if progress >= self.quests[quest_id]['goal']:
                    self.complete_quest(quest_id)
        except Exception as e:
            logging.error(f"Error updating progress for quest '{quest_id}'", exc_info=True)
            raise

    def update_from_message(self, message, entities):
        try:
            logging.info("Updating quests from message.")
            for quest_id in self.active_quests:
                quest = self.quests[quest_id]
                if quest['type'] == 'kill':
                    for entity in entities:
                        if entity[1] == 'PERSON' and entity[0].lower() in quest['target'].lower():
                            self.update_quest_progress(quest_id, quest['progress'] + 1)
                elif quest['type'] == 'collect':
                    for entity in entities:
                        if entity[1] == 'ITEM' and entity[0].lower() in quest['item'].lower():
                            self.update_quest_progress(quest_id, quest['progress'] + 1)
                elif quest['type'] == 'explore':
                    for entity in entities:
                        if entity[1] == 'LOCATION' and entity[0].lower() in quest['location'].lower():
                            self.update_quest_progress(quest_id, quest['goal'])

            # Check for quest-related keywords
            quest_keywords = ['quest', 'mission', 'task', 'objective']
            for keyword in quest_keywords:
                if keyword in message.lower():
                    for entity in entities:
                        if entity[1] == 'QUEST':
                            quest_name = entity[0]
                            matching_quests = [q_id for q_id, q in self.quests.items() if q['name'].lower() == quest_name.lower()]
                            if matching_quests:
                                quest_id = matching_quests[0]
                                if 'accept' in message.lower() or 'start' in message.lower():
                                    self.start_quest(quest_id)
                                elif 'complete' in message.lower() or 'finish' in message.lower():
                                    self.complete_quest(quest_id)
                                elif 'abandon' in message.lower() or 'fail' in message.lower():
                                    self.fail_quest(quest_id)
        except Exception as e:
            logging.error("Error updating quests from message", exc_info=True)
            raise

    def update_from_response(self, response):
        try:
            logging.info("Updating quests from response.")
            quest_keywords = ['new quest', 'quest completed', 'quest failed', 'quest updated']
            for keyword in quest_keywords:
                if keyword in response.lower():
                    quest_info = response.split(keyword)[-1].split('.')[0].strip()
                    if keyword == 'new quest':
                        quest_id = f"quest_{len(self.quests) + 1}"
                        quest_data = self.parse_quest_info(quest_info)
                        self.add_quest(quest_id, quest_data)
                        self.start_quest(quest_id)
                    elif keyword == 'quest completed':
                        matching_quests = [q_id for q_id, q in self.quests.items() if q['name'].lower() in quest_info.lower()]
                        if matching_quests:
                            self.complete_quest(matching_quests[0])
                    elif keyword == 'quest failed':
                        matching_quests = [q_id for q_id, q in self.quests.items() if q['name'].lower() in quest_info.lower()]
                        if matching_quests:
                            self.fail_quest(matching_quests[0])
                    elif keyword == 'quest updated':
                        matching_quests = [q_id for q_id, q in self.quests.items() if q['name'].lower() in quest_info.lower()]
                        if matching_quests:
                            quest_id = matching_quests[0]
                            progress_info = quest_info.split('progress:')[-1].strip()
                            try:
                                progress = int(progress_info)
                                self.update_quest_progress(quest_id, progress)
                            except ValueError:
                                logging.warning("Progress info not in expected format, skipping.")
        except Exception as e:
            logging.error("Error updating quests from response", exc_info=True)
            raise

    def parse_quest_info(self, quest_info):
        try:
            logging.info(f"Parsing quest info: {quest_info}")
            quest_data = {
                'name': quest_info,
                'description': quest_info,
                'type': 'generic',
                'goal': 1,
                'progress': 0,
                'reward': {'experience': 100, 'gold': 50}
            }
            return quest_data
        except Exception as e:
            logging.error(f"Error parsing quest info: {quest_info}", exc_info=True)
            raise

class WorldStateManager:
    def __init__(self):
        try:
            logging.info("Initializing WorldStateManager.")
            self.state = {
                "current_location": "Unknown",
                "time_of_day": "Unknown",
                "weather": "Unknown",
                "active_events": [],
                "discovered_locations": set(),
                "npc_states": {}
            }
        except Exception as e:
            logging.error("Error initializing WorldStateManager", exc_info=True)
            raise

    def get_state(self):
        return self.state

    def update_location(self, location):
        try:
            logging.info(f"Updating location to {location}.")
            self.state["current_location"] = location
            self.state["discovered_locations"].add(location)
        except Exception as e:
            logging.error(f"Error updating location to {location}", exc_info=True)
            raise

    def update_time(self, time_of_day):
        try:
            logging.info(f"Updating time of day to {time_of_day}.")
            self.state["time_of_day"] = time_of_day
        except Exception as e:
            logging.error(f"Error updating time of day to {time_of_day}", exc_info=True)
            raise

    def update_weather(self, weather):
        try:
            logging.info(f"Updating weather to {weather}.")
            self.state["weather"] = weather
        except Exception as e:
            logging.error(f"Error updating weather to {weather}", exc_info=True)
            raise

    def add_active_event(self, event):
        try:
            logging.info(f"Adding active event: {event}.")
            self.state["active_events"].append(event)
        except Exception as e:
            logging.error(f"Error adding active event: {event}", exc_info=True)
            raise

    def remove_active_event(self, event):
        try:
            logging.info(f"Removing active event: {event}.")
            if event in self.state["active_events"]:
                self.state["active_events"].remove(event)
        except Exception as e:
            logging.error(f"Error removing active event: {event}", exc_info=True)
            raise

    def update_npc_state(self, npc_name, new_state):
        try:
            logging.info(f"Updating NPC '{npc_name}' state to {new_state}.")
            self.state["npc_states"][npc_name] = new_state
        except Exception as e:
            logging.error(f"Error updating NPC '{npc_name}' state to {new_state}", exc_info=True)
            raise

    def get_current_state_description(self):
        try:
            logging.info("Getting current world state description.")
            return self.state
        except Exception as e:
             logging.error("Error getting current world state description", exc_info=True)
             raise

    def update_from_message(self, message, entities):
        try:
            logging.info("Updating world state from message.")
            new_location = None
            location_keywords = ["arrived at", "entered", "reached"]
            for keyword in location_keywords:
                if keyword in message.lower():
                    for entity in entities:
                        if entity[1] == 'LOCATION':
                            new_location = entity[0]
                            self.update_location(new_location)
                            break
                    if new_location:
                        break

            time_keywords = ["morning", "afternoon", "evening", "night"]
            for keyword in time_keywords:
                if keyword in message.lower():
                    self.update_time(keyword.capitalize())
                    break

            weather_keywords = ["sunny", "rainy", "cloudy", "stormy", "snowy"]
            for keyword in weather_keywords:
                if keyword in message.lower():
                    self.update_weather(keyword.capitalize())
                    break

            for entity in entities:
                if entity[1] == 'PERSON':
                    npc_name = entity[0]
                    if "arrived" in message.lower() or "appeared" in message.lower():
                        self.update_npc_state(npc_name, "present")
                    elif "left" in message.lower() or "disappeared" in message.lower():
                        self.update_npc_state(npc_name, "absent")

            return new_location
        except Exception as e:
            logging.error("Error updating world state from message", exc_info=True)
            raise

    def update_from_response(self, response):
        try:
            logging.info("Updating world state from response.")
            event_keywords = ["event started", "event ended"]
            for keyword in event_keywords:
                if keyword in response.lower():
                    event_info = response.split(keyword)[-1].split('.')[0].strip()
                    if keyword == "event started":
                        self.add_active_event(event_info)
                    elif keyword == "event ended":
                        self.remove_active_event(event_info)
        except Exception as e:
            logging.error("Error updating world state from response", exc_info=True)
            raise

    def apply_world_update(self, world_update):
        self.state.update(world_update)

class KnowledgeGraphManager:
    def __init__(self):
        try:
            logging.info("Initializing KnowledgeGraphManager.")
            self.graph = nx.Graph()
            self.entity_types = set()
        except Exception as e:
            logging.error("Error initializing KnowledgeGraphManager", exc_info=True)
            raise

    def add_entity(self, entity, entity_type):
        try:
            logging.info(f"Adding entity '{entity}' of type '{entity_type}' to the knowledge graph.")
            if not self.graph.has_node(entity):
                self.graph.add_node(entity, type=entity_type)
                self.entity_types.add(entity_type)
        except Exception as e:
            logging.error(f"Error adding entity '{entity}' to the knowledge graph", exc_info=True)
            raise

    def add_relationship(self, entity1, entity2, relationship):
        try:
            logging.info(f"Adding relationship '{relationship}' between '{entity1}' and '{entity2}'.")
            self.graph.add_edge(entity1, entity2, relationship=relationship)
        except Exception as e:
            logging.error(f"Error adding relationship '{relationship}' between '{entity1}' and '{entity2}'", exc_info=True)
            raise

    def get_related_entities(self, entity):
        try:
            logging.info(f"Getting related entities for '{entity}'.")
            if entity in self.graph:
                return list(self.graph.neighbors(entity))
            return []
        except Exception as e:
            logging.error(f"Error getting related entities for '{entity}'", exc_info=True)
            raise

    def get_entity_info(self, entity):
        try:
            logging.info(f"Getting info for entity '{entity}'.")
            if entity in self.graph:
                return self.graph.nodes[entity]
            return None
        except Exception as e:
            logging.error(f"Error getting info for entity '{entity}'", exc_info=True)
            raise

    def get_relationship(self, entity1, entity2):
        try:
            logging.info(f"Getting relationship between '{entity1}' and '{entity2}'.")
            if self.graph.has_edge(entity1, entity2):
                return self.graph[entity1][entity2]['relationship']
            return None
        except Exception as e:
            logging.error(f"Error getting relationship between '{entity1}' and '{entity2}'", exc_info=True)
            raise

    def get_entities_by_type(self, entity_type):
        try:
            logging.info(f"Getting entities of type '{entity_type}'.")
            return [node for node, data in self.graph.nodes(data=True) if data['type'] == entity_type]
        except Exception as e:
            logging.error(f"Error getting entities of type '{entity_type}'", exc_info=True)
            raise

    def get_relevant_info(self, context_entities, max_depth=2):
        try:
            logging.info("Getting relevant info from the knowledge graph.")
            relevant_subgraph = nx.Graph()
            for entity in context_entities:
                if entity in self.graph:
                    subgraph = nx.ego_graph(self.graph, entity, radius=max_depth)
                    relevant_subgraph = nx.compose(relevant_subgraph, subgraph)

            relationships = []
            for edge in relevant_subgraph.edges(data=True):
                relationships.append(f"{edge[0]} is {edge[2]['relationship']} to {edge[1]}")
            return ". ".join(relationships)
        except Exception as e:
            logging.error("Error getting relevant info from the knowledge graph", exc_info=True)
            raise

    def update_from_message(self, message, entities):
        try:
            logging.info("Updating knowledge graph from message.")
            for entity in entities:
                self.add_entity(entity[0], entity[1])

            words = message.lower().split()
            for i, word in enumerate(words):
                if word in ["is", "are", "was", "were"]:
                    if i > 0 and i < len(words) - 1:
                        entity1 = words[i-1]
                        entity2 = words[i+1]
                        relationship = "related to"
                        if i+2 < len(words) and words[i+2] in ["of", "to", "from", "by"]:
                            relationship = f"{words[i+1]} {words[i+2]}"
                            entity2 = words[i+3] if i+3 < len(words) else ""
                        self.add_relationship(entity1, entity2, relationship)
        except Exception as e:
            logging.error("Error updating knowledge graph from message", exc_info=True)
            raise

    def update_from_response(self, response):
        try:
            logging.info("Updating knowledge graph from response.")
            relationship_keywords = ["is", "are", "was", "were", "has", "have"]
            sentences = response.split('.')
            for sentence in sentences:
                words = sentence.lower().split()
                for keyword in relationship_keywords:
                    if keyword in words:
                        idx = words.index(keyword)
                        if idx > 0 and idx < len(words) - 1:
                            entity1 = words[idx-1]
                            entity2 = words[idx+1]
                            relationship = keyword
                            self.add_entity(entity1, "UNKNOWN")
                            self.add_entity(entity2, "UNKNOWN")
                            self.add_relationship(entity1, entity2, relationship)
        except Exception as e:
            logging.error("Error updating knowledge graph from response", exc_info=True)
            raise

    def get_graph(self):
        try:
            logging.info("Getting the full knowledge graph.")
            return nx.node_link_data(self.graph)
        except Exception as e:
            logging.error("Error getting the full knowledge graph", exc_info=True)
            raise

    def set_graph(self, graph_data):
        try:
            logging.info("Setting the knowledge graph.")
            self.graph = nx.node_link_graph(graph_data)
            self.entity_types = set(data['type'] for _, data in self.graph.nodes(data=True))
        except Exception as e:
            logging.error("Error setting the knowledge graph", exc_info=True)
            raise
