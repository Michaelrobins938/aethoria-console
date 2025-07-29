const fs = require('fs')
const path = require('path')

// Function to convert text prompts to JSON format
function convertPromptsToJSON() {
  const promptsDir = path.join(__dirname, '..', 'GamePrompts')
  const outputDir = path.join(__dirname, '..', 'app', 'api', 'game-prompts', 'data')
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const prompts = []
  
  // Read all directories in GamePrompts
  const gameDirs = fs.readdirSync(promptsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  gameDirs.forEach(gameDir => {
    const gamePath = path.join(promptsDir, gameDir)
    const files = fs.readdirSync(gamePath)
    
    // Find the .txt file
    const txtFile = files.find(file => file.endsWith('.txt'))
    if (txtFile) {
      const filePath = path.join(gamePath, txtFile)
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Extract title from the first line (usually starts with #)
      const lines = content.split('\n')
      let title = gameDir.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      
      // Try to find title in the content
      const titleMatch = content.match(/^#\s*(.+)$/m)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }
      
      // Determine genre based on directory name
      let genre = 'creative'
      const normalizedDir = gameDir.toLowerCase()
      
      if (normalizedDir.includes('silent') || normalizedDir.includes('resident') || 
          normalizedDir.includes('fatal') || normalizedDir.includes('blair') ||
          normalizedDir.includes('eternal') || normalizedDir.includes('corpse') ||
          normalizedDir.includes('nosferatu') || normalizedDir.includes('rule') ||
          normalizedDir.includes('haunting') || normalizedDir.includes('cryostasis') ||
          normalizedDir.includes('stay-alive') || normalizedDir.includes('scream') ||
          normalizedDir.includes('friday') || normalizedDir.includes('halloween') ||
          normalizedDir.includes('child') || normalizedDir.includes('freddy') ||
          normalizedDir.includes('johnny') || normalizedDir.includes('beetlejuice') ||
          normalizedDir.includes('sleepy') || normalizedDir.includes('mist') ||
          normalizedDir.includes('1408') || normalizedDir.includes('evil') ||
          normalizedDir.includes('alien') || normalizedDir.includes('mouth') ||
          normalizedDir.includes('sherlock')) {
        genre = 'horror'
      } else if (normalizedDir.includes('dnd') || normalizedDir.includes('zelda') ||
                 normalizedDir.includes('final') || normalizedDir.includes('god') ||
                 normalizedDir.includes('diablo') || normalizedDir.includes('gauntlet') ||
                 normalizedDir.includes('legacy') || normalizedDir.includes('shadows') ||
                 normalizedDir.includes('game') || normalizedDir.includes('fantasy') ||
                 normalizedDir.includes('misfits') || normalizedDir.includes('fantastic') ||
                 normalizedDir.includes('crown') || normalizedDir.includes('escape') ||
                 normalizedDir.includes('pirates') || normalizedDir.includes('heroes') ||
                 normalizedDir.includes('luminaries')) {
        genre = 'fantasy'
      } else if (normalizedDir.includes('portal') || normalizedDir.includes('bioshock') ||
                 normalizedDir.includes('detroit') || normalizedDir.includes('invader') ||
                 normalizedDir.includes('ben-10') || normalizedDir.includes('digimon') ||
                 normalizedDir.includes('code') || normalizedDir.includes('teen') ||
                 normalizedDir.includes('danny')) {
        genre = 'scifi'
      } else if (normalizedDir.includes('pokemon') || normalizedDir.includes('treasure') ||
                 normalizedDir.includes('atlantis') || normalizedDir.includes('dinosaur') ||
                 normalizedDir.includes('jurassic') || normalizedDir.includes('stardew') ||
                 normalizedDir.includes('borderlands') || normalizedDir.includes('luigi') ||
                 normalizedDir.includes('mario') || normalizedDir.includes('samurai') ||
                 normalizedDir.includes('courage') || normalizedDir.includes('grim') ||
                 normalizedDir.includes('kids') || normalizedDir.includes('corpse-bride') ||
                 normalizedDir.includes('fight') || normalizedDir.includes('9-stitch')) {
        genre = 'adventure'
      } else if (normalizedDir.includes('death') || normalizedDir.includes('sherlock') ||
                 normalizedDir.includes('copy')) {
        genre = 'mystery'
      } else if (normalizedDir.includes('doom') || normalizedDir.includes('ninja') ||
                 normalizedDir.includes('naruto') || normalizedDir.includes('jujutsu') ||
                 normalizedDir.includes('inuyasha') || normalizedDir.includes('dragon') ||
                 normalizedDir.includes('one-piece') || normalizedDir.includes('bleach') ||
                 normalizedDir.includes('hero')) {
        genre = 'action'
      } else if (normalizedDir.includes('beetlejuice') || normalizedDir.includes('billy') ||
                 normalizedDir.includes('spongebob') || normalizedDir.includes('family') ||
                 normalizedDir.includes('simpsons') || normalizedDir.includes('futurama') ||
                 normalizedDir.includes('rick') || normalizedDir.includes('south') ||
                 normalizedDir.includes('archer') || normalizedDir.includes('bob')) {
        genre = 'comedy'
      } else if (normalizedDir.includes('assassin') || normalizedDir.includes('red-dead') ||
                 normalizedDir.includes('kingdom') || normalizedDir.includes('mount') ||
                 normalizedDir.includes('total') || normalizedDir.includes('civilization') ||
                 normalizedDir.includes('age') || normalizedDir.includes('europa') ||
                 normalizedDir.includes('crusader') || normalizedDir.includes('hearts')) {
        genre = 'historical'
      } else if (normalizedDir.includes('harvest') || normalizedDir.includes('story') ||
                 normalizedDir.includes('rune') || normalizedDir.includes('fire') ||
                 normalizedDir.includes('persona') || normalizedDir.includes('tales') ||
                 normalizedDir.includes('atelier') || normalizedDir.includes('otome')) {
        genre = 'romance'
      }
      
      // Determine difficulty based on genre
      let difficulty = 'medium'
      if (genre === 'horror') {
        difficulty = 'hard'
      } else if (genre === 'adventure' || genre === 'comedy') {
        difficulty = 'easy'
      }
      
      const prompt = {
        id: gameDir,
        title: title,
        description: `An immersive ${genre} adventure experience.`,
        genre: genre,
        difficulty: difficulty,
        content: content,
        themes: [genre, 'storytelling', 'interactive'],
        mechanics: {
          diceSystem: 'd20',
          combatSystem: 'turn-based',
          skillSystem: 'character-driven',
          inventorySystem: 'unlimited',
          questSystem: 'dynamic',
          specialRules: ['AI-driven storytelling', 'Voice interaction', 'Dynamic world']
        }
      }
      
      prompts.push(prompt)
      
      // Save individual prompt file
      const promptFile = path.join(outputDir, `${gameDir}.json`)
      fs.writeFileSync(promptFile, JSON.stringify(prompt, null, 2))
      console.log(`Created: ${promptFile}`)
    }
  })
  
  // Save index file
  const indexFile = path.join(outputDir, 'index.json')
  fs.writeFileSync(indexFile, JSON.stringify(prompts, null, 2))
  console.log(`Created: ${indexFile}`)
  
  console.log(`\nConversion complete! Created ${prompts.length} game prompts.`)
  console.log(`Output directory: ${outputDir}`)
}

// Run the conversion
convertPromptsToJSON() 