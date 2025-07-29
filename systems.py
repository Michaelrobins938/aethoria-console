import random
import logging
import math
from enum import Enum

class CombatAction(Enum):
    ATTACK = 1
    DEFEND = 2
    SPECIAL = 3
    FLEE = 4

class CombatSystem:
    def __init__(self):
        self.turn_counter = 0
        self.combat_log = []

    def calculate_damage(self, attacker, defender, action):
        base_damage = attacker.attack - defender.defense
        if action == CombatAction.ATTACK:
            damage = max(0, base_damage + random.randint(1, 6))
        elif action == CombatAction.SPECIAL:
            damage = max(0, base_damage * 1.5 + random.randint(1, 8))
        else:
            damage = 0
        return round(damage)

    def apply_status_effects(self, character):
        for effect, duration in list(character.status_effects.items()):
            if effect == "poison":
                character.health -= 2
            elif effect == "regeneration":
                character.health = min(character.health + 3, character.max_health)
            
            character.status_effects[effect] -= 1
            if character.status_effects[effect] <= 0:
                del character.status_effects[effect]

    def resolve_combat(self, player, enemy):
        self.combat_log = []
        self.turn_counter = 0
        
        while player.health > 0 and enemy.health > 0:
            self.turn_counter += 1
            
            # Player's turn
            player_action = self.get_player_action(player)
            self.resolve_action(player, enemy, player_action)
            
            if enemy.health <= 0:
                break
            
            # Enemy's turn
            enemy_action = self.get_enemy_action(enemy)
            self.resolve_action(enemy, player, enemy_action)
            
            # Apply status effects
            self.apply_status_effects(player)
            self.apply_status_effects(enemy)
            
            self.combat_log.append(f"Turn {self.turn_counter} ended. Player HP: {player.health}, Enemy HP: {enemy.health}")
        
        winner = "Player" if player.health > 0 else "Enemy"
        self.combat_log.append(f"Combat ended. {winner} wins!")
        return winner, self.combat_log

    def get_player_action(self, player):
        # In a real implementation, this would get input from the user
        return random.choice(list(CombatAction))

    def get_enemy_action(self, enemy):
        if enemy.health < enemy.max_health * 0.3:
            return CombatAction.DEFEND if random.random() < 0.7 else CombatAction.ATTACK
        elif enemy.health < enemy.max_health * 0.5:
            return random.choice([CombatAction.ATTACK, CombatAction.SPECIAL])
        else:
            return CombatAction.ATTACK

    def resolve_action(self, attacker, defender, action):
        if action == CombatAction.ATTACK:
            damage = self.calculate_damage(attacker, defender, action)
            defender.health -= damage
            self.combat_log.append(f"{attacker.name} attacks {defender.name} for {damage} damage!")
        elif action == CombatAction.DEFEND:
            attacker.defense += 5
            self.combat_log.append(f"{attacker.name} takes a defensive stance!")
        elif action == CombatAction.SPECIAL:
            damage = self.calculate_damage(attacker, defender, action)
            defender.health -= damage
            self.combat_log.append(f"{attacker.name} uses a special attack on {defender.name} for {damage} damage!")
        elif action == CombatAction.FLEE:
            flee_chance = 0.3 + (attacker.speed - defender.speed) * 0.05
            if random.random() < flee_chance:
                self.combat_log.append(f"{attacker.name} successfully fled from combat!")
                attacker.health = 0  # End combat
            else:
                self.combat_log.append(f"{attacker.name} tried to flee but failed!")

class AdaptiveDifficulty:
    def __init__(self):
        self.difficulty = 5  # Scale of 1-10
        self.player_performance_history = []
        self.adjustment_threshold = 3  # Number of consistently good/bad performances before adjusting

    def record_player_performance(self, performance_score):
        self.player_performance_history.append(performance_score)
        if len(self.player_performance_history) > 10:
            self.player_performance_history.pop(0)

    def calculate_average_performance(self):
        return sum(self.player_performance_history) / len(self.player_performance_history)

    def adjust_difficulty(self):
        if len(self.player_performance_history) < self.adjustment_threshold:
            return

        avg_performance = self.calculate_average_performance()
        consistent_performance = all(score > 7 for score in self.player_performance_history[-self.adjustment_threshold:]) or \
                                 all(score < 3 for score in self.player_performance_history[-self.adjustment_threshold:])

        if consistent_performance:
            if avg_performance > 7 and self.difficulty < 10:
                self.difficulty += 1
                logging.info(f"Difficulty increased to {self.difficulty}")
            elif avg_performance < 3 and self.difficulty > 1:
                self.difficulty -= 1
                logging.info(f"Difficulty decreased to {self.difficulty}")

    def get_enemy_stats(self, base_stats):
        difficulty_multiplier = 0.8 + (self.difficulty * 0.04)  # 0.84 to 1.2
        return {stat: math.ceil(value * difficulty_multiplier) for stat, value in base_stats.items()}

    def adjust_loot_quality(self, base_loot):
        quality_multiplier = 0.9 + (self.difficulty * 0.02)  # 0.92 to 1.1
        return {item: math.ceil(value * quality_multiplier) for item, value in base_loot.items()}

    def modify_puzzle_complexity(self, base_complexity):
        return base_complexity + (self.difficulty - 5)  # -4 to +5 adjustment

class ProceduralGenerator:
    def __init__(self):
        self.biomes = ["Forest", "Desert", "Mountain", "Swamp", "Tundra"]
        self.enemy_types = ["Goblin", "Orc", "Troll", "Dragon", "Undead"]
        self.item_types = ["Weapon", "Armor", "Potion", "Scroll", "Artifact"]

    def generate_terrain(self, size):
        terrain = [[random.choice(self.biomes) for _ in range(size)] for _ in range(size)]
        # Apply cellular automata to smooth out the terrain
        for _ in range(5):
            new_terrain = [row[:] for row in terrain]
            for i in range(size):
                for j in range(size):
                    neighbors = self.get_neighbors(terrain, i, j, size)
                    most_common = max(set(neighbors), key=neighbors.count)
                    if neighbors.count(most_common) >= 5:
                        new_terrain[i][j] = most_common
            terrain = new_terrain
        return terrain

    def get_neighbors(self, grid, x, y, size):
        neighbors = []
        for i in range(-1, 2):
            for j in range(-1, 2):
                if i == 0 and j == 0:
                    continue
                nx, ny = x + i, y + j
                if 0 <= nx < size and 0 <= ny < size:
                    neighbors.append(grid[nx][ny])
        return neighbors

    def generate_encounter(self, player_level, difficulty):
        enemy_level = max(1, player_level + random.randint(-2, 2))
        enemy_type = random.choice(self.enemy_types)
        enemy_count = random.randint(1, 3)
        
        base_stats = {
            "health": 20 + (enemy_level * 5),
            "attack": 5 + (enemy_level * 2),
            "defense": 3 + enemy_level,
            "speed": 5 + (enemy_level // 2)
        }
        
        difficulty_multiplier = 0.8 + (difficulty * 0.04)
        enemy_stats = {stat: math.ceil(value * difficulty_multiplier) for stat, value in base_stats.items()}
        
        special_abilities = []
        if random.random() < 0.3:
            special_abilities.append(random.choice(["Fireball", "Heal", "Stun", "Poison"]))
        
        return {
            "type": enemy_type,
            "count": enemy_count,
            "level": enemy_level,
            "stats": enemy_stats,
            "abilities": special_abilities
        }

    def generate_loot(self, enemy_level, difficulty):
        loot_count = random.randint(1, 3)
        loot = []
        for _ in range(loot_count):
            item_type = random.choice(self.item_types)
            quality = random.choice(["Common", "Uncommon", "Rare", "Epic", "Legendary"])
            base_value = (enemy_level * 10) * (1 + ["Common", "Uncommon", "Rare", "Epic", "Legendary"].index(quality) * 0.5)
            value = math.ceil(base_value * (0.9 + (difficulty * 0.02)))
            
            if item_type in ["Weapon", "Armor"]:
                stat_bonus = math.ceil(enemy_level * (0.8 + (difficulty * 0.04)))
                loot.append({
                    "type": item_type,
                    "quality": quality,
                    "value": value,
                    "stat_bonus": stat_bonus
                })
            elif item_type == "Potion":
                effect = random.choice(["Healing", "Strength", "Defense", "Speed"])
                potency = math.ceil(enemy_level * (0.8 + (difficulty * 0.04)))
                loot.append({
                    "type": item_type,
                    "quality": quality,
                    "value": value,
                    "effect": effect,
                    "potency": potency
                })
            elif item_type == "Scroll":
                spell = random.choice(["Fireball", "Ice Storm", "Lightning Bolt", "Heal", "Teleport"])
                loot.append({
                    "type": item_type,
                    "quality": quality,
                    "value": value,
                    "spell": spell
                })
            elif item_type == "Artifact":
                special_effect = random.choice(["Double Damage", "Invulnerability", "Flight", "Time Stop"])
                duration = math.ceil(30 * (0.8 + (difficulty * 0.04)))
                loot.append({
                    "type": item_type,
                    "quality": quality,
                    "value": value,
                    "effect": special_effect,
                    "duration": duration
                })
        
        return loot

    def generate_quest(self, player_level, difficulty):
        quest_types = ["Fetch", "Kill", "Escort", "Explore", "Solve"]
        quest_type = random.choice(quest_types)
        
        if quest_type == "Fetch":
            item = random.choice(["Ancient Artifact", "Rare Herb", "Lost Heirloom", "Magical Gemstone"])
            location = self.generate_location()
            return {
                "type": "Fetch",
                "description": f"Retrieve the {item} from {location}",
                "difficulty": difficulty,
                "reward": self.generate_reward(player_level, difficulty)
            }
        elif quest_type == "Kill":
            target = self.generate_encounter(player_level, difficulty)
            return {
                "type": "Kill",
                "description": f"Defeat {target['count']} {target['type']}(s) in {self.generate_location()}",
                "difficulty": difficulty,
                "reward": self.generate_reward(player_level, difficulty),
                "target": target
            }
        elif quest_type == "Escort":
            npc = random.choice(["Merchant", "Noble", "Scholar", "Refugee"])
            destination = self.generate_location()
            return {
                "type": "Escort",
                "description": f"Safely escort the {npc} to {destination}",
                "difficulty": difficulty,
                "reward": self.generate_reward(player_level, difficulty),
                "encounters": [self.generate_encounter(player_level, difficulty) for _ in range(random.randint(1, 3))]
            }
        elif quest_type == "Explore":
            location = self.generate_location()
            objective = random.choice(["map the area", "find a hidden treasure", "discover ancient ruins"])
            return {
                "type": "Explore",
                "description": f"Explore {location} to {objective}",
                "difficulty": difficulty,
                "reward": self.generate_reward(player_level, difficulty),
                "map_size": random.randint(5, 10),
                "points_of_interest": random.randint(3, 7)
            }
        elif quest_type == "Solve":
            puzzle_type = random.choice(["Riddle", "Mechanism", "Code", "Pattern"])
            return {
                "type": "Solve",
                "description": f"Solve the {puzzle_type} puzzle in {self.generate_location()}",
                "difficulty": difficulty,
                "reward": self.generate_reward(player_level, difficulty),
                "puzzle_complexity": 5 + difficulty,
                "clues": random.randint(1, 3)
            }

    def generate_location(self):
        adjectives = ["Dark", "Misty", "Ancient", "Cursed", "Enchanted", "Forgotten"]
        nouns = ["Forest", "Cave", "Ruin", "Tower", "Dungeon", "Island"]
        return f"The {random.choice(adjectives)} {random.choice(nouns)}"

    def generate_reward(self, player_level, difficulty):
        base_gold = player_level * 50
        gold_reward = math.ceil(base_gold * (0.8 + (difficulty * 0.04)))
        exp_reward = math.ceil((player_level * 100) * (0.8 + (difficulty * 0.04)))
        item_reward = random.choice(self.generate_loot(player_level, difficulty)) if random.random() < 0.5 else None
        
        return {
            "gold": gold_reward,
            "experience": exp_reward,
            "item": item_reward
        }

def generate_random_encounter():
    encounters = [
        "A mysterious stranger approaches you with an intriguing offer.",
        "You stumble upon an ancient artifact, its purpose unknown.",
        "A distress signal emanates from a nearby abandoned structure.",
        "A sudden atmospheric disturbance reveals a hidden path.",
        "An enigmatic message appears on your communications device.",
        "A wounded traveler collapses on the road ahead, pleading for help.",
        "You discover a hidden cave entrance, obscured by dense foliage.",
        "A group of merchants invites you to join their caravan for mutual protection.",
        "You witness a meteor crashing nearby, leaving a glowing impact crater.",
        "A magical portal suddenly materializes before you, shimmering with unknown energies.",
        "You come across an abandoned campsite with signs of a hasty departure.",
        "A majestic, mythical creature appears in the distance, beckoning you to follow.",
        "You find a weathered map that seems to lead to a legendary treasure.",
        "A time anomaly causes the environment around you to rapidly shift between past, present, and future.",
        "You encounter a group of refugees fleeing from an unknown catastrophe.",
        "A sentient plant creature offers you a symbiotic partnership.",
        "You stumble upon an ancient battlefield frozen in time.",
        "A holographic projection appears, warning of an impending cosmic event.",
        "You discover a hidden underground city, long forgotten by the surface dwellers.",
        "A shape-shifting entity challenges you to a battle of wits and transformations."
    ]
    return random.choice(encounters)

class WeatherSystem:
    def __init__(self):
        self.current_weather = "Clear"
        self.weather_conditions = ["Clear", "Cloudy", "Rainy", "Stormy", "Foggy", "Windy", "Snowy"]
        self.weather_effects = {
            "Clear": {"visibility": 1.0, "movement_speed": 1.0},
            "Cloudy": {"visibility": 0.8, "movement_speed": 1.0},
            "Rainy": {"visibility": 0.6, "movement_speed": 0.9},
            "Stormy": {"visibility": 0.4, "movement_speed": 0.8},
            "Foggy": {"visibility": 0.3, "movement_speed": 0.9},
            "Windy": {"visibility": 0.9, "movement_speed": 0.9},
            "Snowy": {"visibility": 0.5, "movement_speed": 0.7}
        }

    def update_weather(self):
        change_chance = random.random()
        if change_chance < 0.2:
            self.current_weather = random.choice(self.weather_conditions)
        return self.current_weather

    def get_weather_effects(self):
        return self.weather_effects[self.current_weather]

class EconomySystem:
    def __init__(self):
        self.base_prices = {
            "Sword": 100,
            "Shield": 75,
            "Potion": 50,
            "Armor": 150,
            "Bow": 120
        }
        self.market_factors = {
            "demand": 1.0,
            "supply": 1.0,
            "inflation": 1.0
        }

    def update_market_factors(self):
        for factor in self.market_factors:
            change = random.uniform(-0.1, 0.1)
            self.market_factors[factor] = max(0.5, min(1.5, self.market_factors[factor] + change))

    def get_item_price(self, item):
        if item not in self.base_prices:
            return None
        
        base_price = self.base_prices[item]
        adjusted_price = base_price * self.market_factors["demand"] / self.market_factors["supply"] * self.market_factors["inflation"]
        return round(adjusted_price, 2)

    def trade(self, item, is_buying):
        price = self.get_item_price(item)
        if price is None:
            return False, 0

        if is_buying:
            self.market_factors["demand"] += 0.05
            self.market_factors["supply"] -= 0.05
        else:
            self.market_factors["demand"] -= 0.05
            self.market_factors["supply"] += 0.05

        self.market_factors = {k: max(0.5, min(1.5, v)) for k, v in self.market_factors.items()}
        return True, price

class FactionSystem:
    def __init__(self):
        self.factions = {
            "Merchants Guild": {"reputation": 0, "power": 5},
            "City Watch": {"reputation": 0, "power": 7},
            "Thieves Guild": {"reputation": 0, "power": 4},
            "Mages Circle": {"reputation": 0, "power": 6},
            "Royal Court": {"reputation": 0, "power": 8}
        }
        self.relationships = {
            ("Merchants Guild", "City Watch"): 2,
            ("Merchants Guild", "Thieves Guild"): -3,
            ("City Watch", "Thieves Guild"): -5,
            ("Mages Circle", "Royal Court"): 3,
            ("Thieves Guild", "Royal Court"): -4
        }

    def change_reputation(self, faction, amount):
        if faction in self.factions:
            self.factions[faction]["reputation"] = max(-10, min(10, self.factions[faction]["reputation"] + amount))
            self.update_faction_power(faction)

    def update_faction_power(self, faction):
        reputation = self.factions[faction]["reputation"]
        self.factions[faction]["power"] = max(1, min(10, 5 + reputation // 2))

    def get_faction_attitude(self, faction1, faction2):
        key = tuple(sorted([faction1, faction2]))
        return self.relationships.get(key, 0)

    def resolve_conflict(self, faction1, faction2):
        attitude = self.get_faction_attitude(faction1, faction2)
        power_diff = self.factions[faction1]["power"] - self.factions[faction2]["power"]
        
        conflict_result = attitude + power_diff + random.randint(-2, 2)
        
        if conflict_result > 0:
            winner, loser = faction1, faction2
        else:
            winner, loser = faction2, faction1
        
        self.change_reputation(winner, 1)
        self.change_reputation(loser, -1)
        
        key = tuple(sorted([faction1, faction2]))
        self.relationships[key] = max(-5, min(5, self.relationships.get(key, 0) + conflict_result))

        return winner, abs(conflict_result)

class SkillSystem:
    def __init__(self):
        self.skills = {
            "Swordsmanship": 0,
            "Archery": 0,
            "Magic": 0,
            "Stealth": 0,
            "Persuasion": 0,
            "Crafting": 0,
            "Survival": 0,
            "Athletics": 0
        }
        self.skill_caps = {skill: 100 for skill in self.skills}

    def gain_experience(self, skill, amount):
        if skill in self.skills:
            current_level = self.get_skill_level(skill)
            self.skills[skill] = min(self.skill_caps[skill], self.skills[skill] + amount / (current_level + 1))

    def get_skill_level(self, skill):
        if skill in self.skills:
            return int(self.skills[skill] // 10)
        return 0

    def skill_check(self, skill, difficulty):
        if skill not in self.skills:
            return False
        skill_level = self.get_skill_level(skill)
        roll = random.randint(1, 20)
        return roll + skill_level >= difficulty

    def upgrade_skill_cap(self, skill, amount):
        if skill in self.skill_caps:
            self.skill_caps[skill] = min(1000, self.skill_caps[skill] + amount)

class TimeSystem:
    def __init__(self):
        self.current_time = 0
        self.day_length = 24 * 60  # 24 hours in minutes
        self.year_length = 360  # 360 days in a year
        self.events = []

    def advance_time(self, minutes):
        self.current_time += minutes
        self.check_events()

    def get_time_of_day(self):
        hour = (self.current_time // 60) % 24
        if 6 <= hour < 12:
            return "Morning"
        elif 12 <= hour < 18:
            return "Afternoon"
        elif 18 <= hour < 22:
            return "Evening"
        else:
            return "Night"

    def get_season(self):
        day = (self.current_time // self.day_length) % self.year_length
        if day < 90:
            return "Spring"
        elif day < 180:
            return "Summer"
        elif day < 270:
            return "Autumn"
        else:
            return "Winter"

    def schedule_event(self, event, trigger_time):
        self.events.append((event, self.current_time + trigger_time))

    def check_events(self):
        current_events = [event for event, time in self.events if time <= self.current_time]
        for event in current_events:
            self.trigger_event(event)
        self.events = [(event, time) for event, time in self.events if time > self.current_time]

    def trigger_event(self, event):
        # This method would be called when an event is triggered
        # The specific implementation would depend on how events are handled in the game
        pass

# This completes the systems.py file with complex implementations for various game systems.