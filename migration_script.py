import json
import re

def parse_character_data(content):
    characters = []
    # Regex to find character blocks
    character_blocks = re.findall(r'\n1\.\s(.*?)\n\s+-.*?\n\s+-.*?\n', content, re.DOTALL)
    for block in character_blocks:
        character = {}
        name_match = re.search(r'^(.*?)\n', block)
        if name_match:
            character['name'] = name_match.group(1).strip()
        
        abilities = {}
        abilities_match = re.search(r'Abilities:\s(.*?)\n', block)
        if abilities_match:
            abilities_str = abilities_match.group(1)
            for ability_match in re.finditer(r'(\w+)\s(\d+)', abilities_str):
                abilities[ability_match.group(1).lower()] = int(ability_match.group(2))
        character['abilities'] = abilities

        skills = []
        skills_match = re.search(r'Skills:\s(.*?)\n', block)
        if skills_match:
            skills_str = skills_match.group(1)
            for skill_match in re.finditer(r'(\w+\s*\w*)\s\+(\d+)', skills_str):
                skills.append({"name": skill_match.group(1).strip(), "level": int(skill_match.group(2))})
        character['skills'] = skills
        
        characters.append(character)
    return characters

with open('app/api/game-prompts/data/index.json', 'r+') as f:
    prompts = json.load(f)
    for prompt in prompts:
        if 'content' in prompt:
            prompt['characters'] = parse_character_data(prompt['content'])
    f.seek(0)
    json.dump(prompts, f, indent=2)
    f.truncate()
