import json
import re
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def parse_character_data(content):
    characters = []
    # Regex to find character blocks, this time more generic
    character_blocks = re.findall(r'(## Playable Characters|\d\.\s.*?\n(?:\s+-.+?\n)+)', content, re.DOTALL)
    
    for block in character_blocks:
        character = {
            'name': '',
            'abilities': {},
            'skills': [],
            'background': '',
        }
        
        # Extract name
        name_match = re.search(r'(?:\d\.\s)?(.*?)(?:\s\(|\n)', block)
        if name_match:
            character['name'] = name_match.group(1).strip()

        # Extract abilities
        abilities_match = re.search(r'Abilities:\s(.*?)\n', block, re.IGNORECASE)
        if abilities_match:
            abilities_str = abilities_match.group(1)
            for ability_match in re.finditer(r'(\w+)\s(\d+)', abilities_str):
                character['abilities'][ability_match.group(1).lower()] = int(ability_match.group(2))

        # Extract skills
        skills_match = re.search(r'Skills:\s(.*?)\n', block, re.IGNORECASE)
        if skills_match:
            skills_str = skills_match.group(1)
            for skill_match in re.finditer(r'([\w\s]+?)\s\+(\d+)', skills_str):
                character['skills'].append({"name": skill_match.group(1).strip(), "level": int(skill_match.group(2))})

        # Extract background
        background_match = re.search(r'Background:\s(.*?)\n', block, re.IGNORECASE)
        if background_match:
            character['background'] = background_match.group(1).strip()

        if character['name']:
            characters.append(character)
        else:
            logging.warning(f"Could not parse character name from block: {block[:100]}...")

    return characters

with open('app/api/game-prompts/data/index.json', 'r+', encoding='utf-8') as f:
    prompts = json.load(f)
    for prompt in prompts:
        if 'content' in prompt:
            try:
                prompt['characters'] = parse_character_data(prompt['content'])
                if prompt['characters']:
                    logging.info(f"Successfully parsed {len(prompt['characters'])} characters for prompt: {prompt['title']}")
            except Exception as e:
                logging.error(f"Error parsing prompt {prompt['id']}: {e}")
    f.seek(0)
    json.dump(prompts, f, indent=2)
    f.truncate()