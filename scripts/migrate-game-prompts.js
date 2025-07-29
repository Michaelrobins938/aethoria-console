const fs = require('fs')
const path = require('path')

// Function to read and parse Python game prompts
function parsePythonPrompt(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // Extract title from filename
    const fileName = path.basename(filePath, '.txt')
    const title = fileName.replace(/([A-Z])/g, ' $1').trim()
    
    // Determine genre based on content and filename
    let genre = 'adventure'
    const lowerContent = content.toLowerCase()
    const lowerFileName = fileName.toLowerCase()
    
    if (lowerContent.includes('horror') || lowerContent.includes('silent hill') || lowerContent.includes('resident evil') || lowerFileName.includes('horror')) {
      genre = 'horror'
    } else if (lowerContent.includes('fantasy') || lowerContent.includes('d&d') || lowerContent.includes('magic') || lowerFileName.includes('fantasy')) {
      genre = 'fantasy'
    } else if (lowerContent.includes('sci-fi') || lowerContent.includes('portal') || lowerContent.includes('cyberpunk') || lowerFileName.includes('sci-fi')) {
      genre = 'sci-fi'
    } else if (lowerContent.includes('pokemon') || lowerContent.includes('monster') || lowerFileName.includes('pokemon')) {
      genre = 'adventure'
    }
    
    // Determine difficulty
    let difficulty = 'medium'
    if (lowerContent.includes('hard') || lowerContent.includes('expert') || lowerContent.includes('challenging')) {
      difficulty = 'hard'
    } else if (lowerContent.includes('easy') || lowerContent.includes('beginner')) {
      difficulty = 'easy'
    }
    
    // Extract themes
    const themes = []
    if (lowerContent.includes('psychological')) themes.push('psychological horror')
    if (lowerContent.includes('survival')) themes.push('survival')
    if (lowerContent.includes('mystery')) themes.push('mystery')
    if (lowerContent.includes('adventure')) themes.push('adventure')
    if (lowerContent.includes('magic')) themes.push('magic')
    if (lowerContent.includes('heroism')) themes.push('heroism')
    if (lowerContent.includes('puzzle')) themes.push('puzzle')
    if (lowerContent.includes('science')) themes.push('science')
    if (lowerContent.includes('friendship')) themes.push('friendship')
    if (lowerContent.includes('exploration')) themes.push('exploration')
    if (lowerContent.includes('collection')) themes.push('collection')
    if (lowerContent.includes('technology')) themes.push('technology')
    if (lowerContent.includes('corruption')) themes.push('corruption')
    if (lowerContent.includes('identity')) themes.push('identity')
    
    // Create web prompt object
    const webPrompt = {
      id: fileName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: title,
      description: `An immersive ${genre} adventure where ${themes.join(', ')} await.`,
      genre: genre,
      difficulty: difficulty,
      themes: themes.length > 0 ? themes : [genre],
      content: content,
      mechanics: {
        diceSystem: 'd20',
        combatSystem: genre === 'horror' ? 'survival horror' : 'turn-based tactical',
        skillSystem: 'strength, dexterity, intelligence, wisdom, charisma',
        inventorySystem: 'unlimited with weight limits',
        questSystem: 'epic storylines',
        specialRules: genre === 'horror' ? ['Sanity Meter', 'Limited Resources'] : ['Experience Points', 'Character Progression']
      }
    }
    
    return webPrompt
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error)
    return null
  }
}

// Function to migrate all game prompts
function migrateGamePrompts() {
  const gamePromptsDir = path.join(__dirname, '..', 'GamePrompts')
  const outputDir = path.join(__dirname, '..', 'app', 'api', 'game-prompts', 'data')
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const allPrompts = []
  
  // Read all directories in GamePrompts
  const gameDirs = fs.readdirSync(gamePromptsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  gameDirs.forEach(dirName => {
    const dirPath = path.join(gamePromptsDir, dirName)
    const files = fs.readdirSync(dirPath)
    
    files.forEach(file => {
      if (file.endsWith('.txt')) {
        const filePath = path.join(dirPath, file)
        const prompt = parsePythonPrompt(filePath)
        
        if (prompt) {
          allPrompts.push(prompt)
          console.log(`✓ Migrated: ${prompt.title}`)
        }
      }
    })
  })
  
  // Write individual prompt files
  allPrompts.forEach(prompt => {
    const promptFile = path.join(outputDir, `${prompt.id}.json`)
    fs.writeFileSync(promptFile, JSON.stringify(prompt, null, 2))
  })
  
  // Write index file
  const indexFile = path.join(outputDir, 'index.json')
  fs.writeFileSync(indexFile, JSON.stringify(allPrompts, null, 2))
  
  console.log(`\n🎉 Migration complete!`)
  console.log(`📁 Created ${allPrompts.length} game prompts`)
  console.log(`📂 Output directory: ${outputDir}`)
  
  return allPrompts
}

// Run migration
if (require.main === module) {
  migrateGamePrompts()
}

module.exports = { migrateGamePrompts, parsePythonPrompt } 