'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Sword, Shield, Zap, Heart, Brain, Star, CheckCircle, X, Gamepad2, User, Sparkles, Eye, Ghost } from 'lucide-react'
import { Character, GamePrompt } from '@/lib/types'

interface CharacterCreatorProps {
  onComplete: (character: Character) => void
  onBack: () => void
  gamePrompt: GamePrompt
}

interface CharacterOption {
  id: string
  name: string
  title: string
  description: string
  background: string
  icon: React.ReactNode
  color: string
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  skills: string[]
  specialAbilities: string[]
  startingEquipment: string[]
  personality: string
  backstory: string
}

export function CharacterCreator({ onComplete, onBack, gamePrompt }: CharacterCreatorProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterOption | null>(null)
  const [characterName, setCharacterName] = useState('')
  const [step, setStep] = useState(1)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  // Generate character options based on game prompt
  const generateCharacterOptions = (prompt: GamePrompt): CharacterOption[] => {
    const { genre, themes, difficulty, title } = prompt
    
    // Check for specific game titles that need custom character options
    const gameTitle = title.toLowerCase()
    
    // Special handling for specific games
    if (gameTitle.includes("child's play") || gameTitle.includes("toy box terror")) {
      return [
        {
          id: 'detective-norris',
          name: 'Detective Mike Norris',
          title: 'The Skeptical Detective',
          description: 'A seasoned detective investigating the Good Guy doll murders with a skeptical mind',
          background: 'You are Detective Mike Norris, investigating a series of mysterious deaths surrounding the newly released Good Guy dolls. Your experience tells you there\'s a logical explanation, but the evidence keeps pointing to something impossible.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 13, dexterity: 14, constitution: 12, intelligence: 15, wisdom: 16, charisma: 11 },
          skills: ['Investigation', 'Perception', 'Insight', 'Athletics'],
          specialAbilities: ['Skeptical Mind', 'Police Training', 'Evidence Analysis'],
          startingEquipment: ['Police Badge', 'Service Pistol', 'Flashlight', 'Notepad'],
          personality: 'Logical and methodical, you rely on evidence and facts, but recent events are challenging everything you thought you knew.',
          backstory: 'As a detective, you\'ve seen your share of strange cases, but nothing like this. The connection between the Good Guy dolls and the murders defies logic. You\'re determined to find the truth, even if it means accepting something beyond rational explanation.'
        },
        {
          id: 'survivor-witness',
          name: 'Survivor Witness',
          title: 'The One Who Knows',
          description: 'Someone who has witnessed Chucky\'s true nature and survived to tell the tale',
          background: 'You are one of the few who have seen the Good Guy doll move and speak with its own will. You know the truth about Charles Lee Ray\'s soul trapped in the doll, but convincing others is nearly impossible.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 11, dexterity: 13, constitution: 12, intelligence: 14, wisdom: 15, charisma: 10 },
          skills: ['Survival', 'Stealth', 'Insight', 'Athletics'],
          specialAbilities: ['Witness to Horror', 'Survival Instinct', 'Truth Bearer'],
          startingEquipment: ['Flashlight', 'Combat Knife', 'Evidence Photos', 'Protective Amulet'],
          personality: 'Terrified but determined, you know the truth and will do whatever it takes to stop Chucky, even if no one believes you.',
          backstory: 'You\'ve seen the doll move with your own eyes. You\'ve heard it speak in Charles Lee Ray\'s voice. You know the voodoo magic that keeps his soul alive. Now you must convince Detective Norris and others before it\'s too late.'
        }
      ]
    }
    
    // 1408: Paranormal Manuscript
    if (gameTitle.includes("1408") || gameTitle.includes("paranormal manuscript")) {
      return [
        {
          id: 'mike-enslin',
          name: 'Mike Enslin',
          title: 'The Skeptic Who Needs to Believe',
          description: 'A writer investigating paranormal claims with a skeptical mind and tragic past',
          background: 'You are Mike Enslin, a writer who investigates paranormal claims. Despite your skepticism, you\'re drawn to Room 1408 at the Dolphin Hotel, despite the warnings.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 11, dexterity: 13, constitution: 14, intelligence: 16, wisdom: 12, charisma: 15 },
          skills: ['Investigation', 'Insight', 'Persuasion', 'History'],
          specialAbilities: ['Skeptic\'s Shield', 'Writer\'s Intuition', 'Grief\'s Shadow'],
          startingEquipment: ['Voice Recorder', 'EMF Detector', 'Lucky Cigarette Lighter', 'Journal'],
          personality: 'Skeptical but haunted by loss, you seek proof of the supernatural while battling your own demons.',
          backstory: 'After the death of your daughter Katie, you became obsessed with proving the existence of an afterlife. Room 1408 might finally give you the answers you seek, or drive you to madness.'
        },
        {
          id: 'lily-enslin',
          name: 'Lily Enslin',
          title: 'The Reluctant Psychic',
          description: 'Mike\'s estranged wife with latent psychic abilities and unresolved grief',
          background: 'You are Lily Enslin, Mike\'s estranged wife. After your daughter\'s death, you developed psychic sensitivity and are drawn to the hotel by inexplicable premonitions.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-purple-400',
          abilities: { strength: 10, dexterity: 14, constitution: 12, intelligence: 15, wisdom: 16, charisma: 13 },
          skills: ['Insight', 'Perception', 'Investigation', 'Arcana'],
          specialAbilities: ['Latent Medium', 'Psychic Sensitivity', 'Quick Reflexes'],
          startingEquipment: ['Antique Pocket Watch', 'Dream Journal', 'Protective Amulet', 'Family Photo'],
          personality: 'Intuitive and protective, you sense the danger in Room 1408 but feel compelled to help Mike.',
          backstory: 'Your psychic abilities awakened after Katie\'s death. You\'ve come to the Dolphin Hotel to protect Mike from the horrors of Room 1408, even if it means facing your own fears.'
        }
      ]
    }
    
    // 9 Stitchpunks' Last Stand
    if (gameTitle.includes("9") || gameTitle.includes("stitchpunks") || gameTitle.includes("last stand")) {
      return [
        {
          id: 'stitchpunk-9',
          name: 'Stitchpunk 9',
          title: 'The Curious Leader',
          description: 'A small ragdoll being with a thirst for knowledge and leadership qualities',
          background: 'You are Stitchpunk 9, a small ragdoll-like being imbued with human soul energy. You\'ve awakened in a world where humanity has been wiped out by machines.',
          icon: <Star className="w-8 h-8" />,
          color: 'text-yellow-400',
          abilities: { strength: 10, dexterity: 16, constitution: 12, intelligence: 14, wisdom: 13, charisma: 11 },
          skills: ['Investigation', 'Perception', 'Survival', 'Tinker\'s Tools'],
          specialAbilities: ['Curiosity', 'Leadership', 'Soul Energy'],
          startingEquipment: ['Light Staff', 'Talisman Fragment', 'Scavenged Tools', 'Memory Crystal'],
          personality: 'Curious and determined, you seek to understand your purpose and protect your fellow stitchpunks.',
          backstory: 'You were created by the Scientist to preserve human souls. Now you must lead your fellow stitchpunks against the machines that destroyed humanity.'
        },
        {
          id: 'stitchpunk-5',
          name: 'Stitchpunk 5',
          title: 'The Visionary Warrior',
          description: 'A brave stitchpunk with enhanced vision and combat abilities',
          background: 'You are Stitchpunk 5, a stitchpunk with exceptional vision and combat skills. You can see through the darkness and detect hidden threats.',
          icon: <Eye className="w-8 h-8" />,
          color: 'text-green-400',
          abilities: { strength: 12, dexterity: 15, constitution: 13, intelligence: 12, wisdom: 14, charisma: 10 },
          skills: ['Perception', 'Athletics', 'Stealth', 'Survival'],
          specialAbilities: ['Enhanced Vision', 'Combat Instincts', 'Darkness Sight'],
          startingEquipment: ['Sharpened Blade', 'Vision Crystal', 'Stealth Cloak', 'Combat Gear'],
          personality: 'Brave and protective, you use your enhanced vision to keep your fellow stitchpunks safe.',
          backstory: 'Your enhanced vision allows you to see threats that others miss. You\'re determined to protect your stitchpunk family from the mechanical horrors.'
        }
      ]
    }
    
    // A Crown of Candy
    if (gameTitle.includes("crown of candy") || gameTitle.includes("sweet treachery")) {
      return [
        {
          id: 'princess-bonbon',
          name: 'Princess Bonbon',
          title: 'The Diplomatic Marshmallow',
          description: 'A sweet and diplomatic royal from House Sweethart with sticky abilities',
          background: 'You are Princess Bonbon of House Sweethart, a marshmallow royal navigating the treacherous politics of the Candy Kingdom.',
          icon: <Heart className="w-8 h-8" />,
          color: 'text-pink-400',
          abilities: { strength: 10, dexterity: 14, constitution: 12, intelligence: 15, wisdom: 16, charisma: 18 },
          skills: ['Persuasion', 'Insight', 'Deception', 'History'],
          specialAbilities: ['Sticky Situations', 'Fluffy Diplomacy', 'Royal Authority'],
          startingEquipment: ['Royal Scepter', 'Diplomatic Papers', 'Marshmallow Armor', 'Sweet Perfume'],
          personality: 'Diplomatic and kind, you seek to unite the Candy Kingdom through sweetness and understanding.',
          backstory: 'As a marshmallow royal, you\'re naturally flexible and resilient. You\'re determined to bring peace to the Candy Kingdom through diplomacy rather than war.'
        },
        {
          id: 'lord-bitterscotch',
          name: 'Lord Bitterscotch',
          title: 'The Hardened Warrior',
          description: 'A tough but brittle candy warrior from the Butterscotch Barony',
          background: 'You are Lord Bitterscotch of the Butterscotch Barony, a hardened candy warrior with a molten core of inner strength.',
          icon: <Sword className="w-8 h-8" />,
          color: 'text-amber-400',
          abilities: { strength: 16, dexterity: 12, constitution: 15, intelligence: 13, wisdom: 14, charisma: 10 },
          skills: ['Athletics', 'Intimidation', 'Survival', 'Medicine'],
          specialAbilities: ['Shattering Strike', 'Molten Core', 'Brittle Ego'],
          startingEquipment: ['Butterscotch Blade', 'Hardened Armor', 'Molten Core', 'War Banner'],
          personality: 'Stoic and honorable, you fight for your barony with unwavering determination.',
          backstory: 'Your butterscotch composition makes you tough but brittle. You\'ve learned to use your inner molten core to your advantage in battle.'
        }
      ]
    }
    
    // Alien - Nightmare (Bio Genesis)
    if (gameTitle.includes("alien") || gameTitle.includes("xenomorph") || gameTitle.includes("bio genesis")) {
      return [
        {
          id: 'dr-elara-vance',
          name: 'Dr. Elara Vance',
          title: 'The Xenobiologist',
          description: 'A brilliant scientist with enhanced resistance to biological contamination',
          background: 'You are Dr. Elara Vance, a xenobiologist recruited by Weyland-Yutani for your groundbreaking work on exobiology.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 10, dexterity: 14, constitution: 15, intelligence: 16, wisdom: 15, charisma: 12 },
          skills: ['Investigation', 'Medicine', 'Survival', 'Arcana'],
          specialAbilities: ['Adaptive Immunity', 'Xenomorph Knowledge', 'Medical Expertise'],
          startingEquipment: ['Advanced Bio-Scanner', 'Experimental Vaccine Kit', 'Neural Uplink Device', 'Research Data'],
          personality: 'Analytical and determined, you seek to understand the xenomorphs while surviving their horrors.',
          backstory: 'Your research has given you unique insights into alien biology, but also made you a target. You\'re haunted by classified knowledge of previous encounters.'
        },
        {
          id: 'marshal-dante-coburn',
          name: 'Marshal Dante Coburn',
          title: 'The Colonial Marshal',
          description: 'A veteran ex-marine with heightened instincts and tactical awareness',
          background: 'You are Marshal Dante Coburn, a colonial marshal and former marine with extensive combat experience.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 15, dexterity: 14, constitution: 16, intelligence: 12, wisdom: 13, charisma: 11 },
          skills: ['Athletics', 'Survival', 'Intimidation', 'Perception'],
          specialAbilities: ['Heightened Instincts', 'Tactical Awareness', 'Weapons Specialist'],
          startingEquipment: ['M41A Pulse Rifle', 'Motion Tracker', 'Compressed Air Launcher', 'Combat Armor'],
          personality: 'Disciplined and suspicious, you trust your instincts and are wary of corporate motivations.',
          backstory: 'Your military training has prepared you for the worst, but nothing could prepare you for the xenomorphs. You\'re determined to protect your crew at any cost.'
        }
      ]
    }
    
    // Alien vs Necromorph
    if (gameTitle.includes("necromorph") || gameTitle.includes("xmorphic necrosis")) {
      return [
        {
          id: 'dr-elara-vance-necro',
          name: 'Dr. Elara Vance',
          title: 'The Reluctant Survivor',
          description: 'A brilliant scientist facing her worst nightmares in deep space',
          background: 'You are Dr. Elara Vance, a xenobiologist haunted by past encounters with extraterrestrial life.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-purple-400',
          abilities: { strength: 10, dexterity: 14, constitution: 12, intelligence: 16, wisdom: 15, charisma: 13 },
          skills: ['Investigation', 'Medicine', 'Survival', 'Arcana'],
          specialAbilities: ['Analytical Mind', 'Alien Biology', 'Medical Expertise'],
          startingEquipment: ['Advanced Bio-Scanner', 'Experimental Vaccine Prototype', 'Neural Uplink Device', 'Research Notes'],
          personality: 'Brilliant but traumatized, you use your scientific knowledge to survive while battling your own fears.',
          backstory: 'Your previous encounters with alien life have left you scarred but knowledgeable. Now you face a hybrid threat that combines the worst of xenomorphs and necromorphs.'
        },
        {
          id: 'security-chief-dominic',
          name: 'Security Chief Dominic Reeves',
          title: 'The Hardened Veteran',
          description: 'An ex-military security chief battling PTSD while protecting the crew',
          background: 'You are Security Chief Dominic Reeves, a veteran of multiple deep space incidents with extensive combat experience.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-orange-400',
          abilities: { strength: 15, dexterity: 14, constitution: 16, intelligence: 13, wisdom: 12, charisma: 11 },
          skills: ['Athletics', 'Survival', 'Intimidation', 'Perception'],
          specialAbilities: ['Adrenaline Surge', 'Tactical Awareness', 'EVA Combat'],
          startingEquipment: ['Modifiable Pulse Rifle', 'Kinesis Module', 'Emergency Beacon', 'Combat Armor'],
          personality: 'Hardened and protective, you battle PTSD while trying to keep your crew alive.',
          backstory: 'Your military experience has taught you to expect the worst, but the hybrid creatures aboard the Thanatos are beyond anything you\'ve faced before.'
        }
      ]
    }
    
    // Atlantis - Journey to the Lost Empire
    if (gameTitle.includes("atlantis") || gameTitle.includes("lost empire")) {
      return [
        {
          id: 'milo-thatch',
          name: 'Milo Thatch',
          title: 'The Linguistic Genius',
          description: 'A brilliant linguist and cartographer with the ability to decipher unknown languages',
          background: 'You are Milo Thatch, a linguist and cartographer obsessed with finding the lost city of Atlantis.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 10, dexterity: 12, constitution: 11, intelligence: 18, wisdom: 16, charisma: 14 },
          skills: ['History', 'Investigation', 'Arcana', 'Perception'],
          specialAbilities: ['Linguistic Genius', 'Cartographer', 'Shepherd\'s Journal'],
          startingEquipment: ['The Shepherd\'s Journal', 'Magnifying Glass', 'Satchel of Maps', 'Research Notes'],
          personality: 'Intellectual and determined, you\'re driven by curiosity and the desire to prove your theories about Atlantis.',
          backstory: 'Your grandfather\'s research has led you to believe in Atlantis. Now you have the chance to prove its existence and uncover its secrets.'
        },
        {
          id: 'vinny-santorini',
          name: 'Vinny Santorini',
          title: 'The Demolitions Expert',
          description: 'A skilled demolitions expert with a talent for improvised explosives',
          background: 'You are Vinny Santorini, a demolitions expert with a knack for creating explosives from unlikely materials.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 14, dexterity: 16, constitution: 15, intelligence: 14, wisdom: 12, charisma: 13 },
          skills: ['Sleight of Hand', 'Investigation', 'Athletics', 'Demolitions'],
          specialAbilities: ['Improvised Explosives', 'Lucky Matchstick', 'Demolitions Expert'],
          startingEquipment: ['Demolition Kit', 'Lucky Matchstick', 'Bag of Parts', 'Safety Gear'],
          personality: 'Energetic and resourceful, you love explosions and are always ready for action.',
          backstory: 'Your expertise with explosives has made you invaluable to the expedition. You\'re excited to use your skills to uncover Atlantis\'s secrets.'
        }
      ]
    }
    
    // Beetlejuice - Haunting Hijinks
    if (gameTitle.includes("beetlejuice") || gameTitle.includes("haunting hijinks")) {
      return [
        {
          id: 'homeowner-ghost',
          name: 'The Homeowner',
          title: 'The Recently Deceased',
          description: 'A ghost bound to your former home, learning to navigate the afterlife',
          background: 'You are a recently deceased homeowner, now a ghost bound to your former home and struggling to adapt to spectral existence.',
          icon: <Ghost className="w-8 h-8" />,
          color: 'text-gray-400',
          abilities: { strength: 10, dexterity: 12, constitution: 0, intelligence: 14, wisdom: 15, charisma: 14 },
          skills: ['Persuasion', 'Investigation', 'History', 'Performance'],
          specialAbilities: ['Household Haunting', 'Ethereal Form', 'Spectral Manipulation'],
          startingEquipment: ['Handbook for the Recently Deceased', 'Spectral Tools', 'Ethereal Clothing', 'Memory Objects'],
          personality: 'Confused but determined, you\'re learning to navigate the complex rules of the afterlife.',
          backstory: 'Your death was unexpected, and now you\'re stuck haunting your former home. You must learn the rules of the afterlife while dealing with the living inhabitants.'
        },
        {
          id: 'trickster-ghost',
          name: 'The Trickster',
          title: 'The Mischievous Spirit',
          description: 'A chaotic ghost with shapeshifting abilities and a love for pranks',
          background: 'You are a trickster ghost, a mischievous spirit with the ability to shapeshift and cause supernatural chaos.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-yellow-400',
          abilities: { strength: 12, dexterity: 16, constitution: 0, intelligence: 15, wisdom: 10, charisma: 18 },
          skills: ['Deception', 'Performance', 'Intimidation', 'Arcana'],
          specialAbilities: ['Shapeshifting', 'Supernatural Pranks', 'Otherworldly Charm'],
          startingEquipment: ['Striped Suit', 'Otherworldly Grimoire', 'Prank Items', 'Spectral Mirror'],
          personality: 'Chaotic and entertaining, you love causing mischief and playing pranks on both the living and dead.',
          backstory: 'You\'ve been a ghost for a long time and have mastered the art of supernatural mischief. You\'re always looking for new ways to cause chaos and have fun.'
                 }
       ]
     }
    
    // Ben 10: Cosmic Convergence
    if (gameTitle.includes("ben 10") || gameTitle.includes("cosmic convergence")) {
      return [
        {
          id: 'ben-tennyson',
          name: 'Ben Tennyson',
          title: 'The Galactic Peacekeeper',
          description: 'An older, more mature Ben with the Omnitrix and galactic responsibilities',
          background: 'You are Ben Tennyson, now in your early 20s, a seasoned galactic peacekeeper with the Omnitrix. You\'ve faced countless threats across the universe and have grown into a mature hero.',
          icon: <Star className="w-8 h-8" />,
          color: 'text-green-400',
          abilities: { strength: 14, dexterity: 16, constitution: 15, intelligence: 13, wisdom: 16, charisma: 14 },
          skills: ['Alien Biology', 'Cosmic Awareness', 'Plumber Tech', 'Xenolinguistics'],
          specialAbilities: ['Omnitrix Mastery', 'Alien Forms', 'Galactic Experience'],
          startingEquipment: ['Omnitrix', 'Plumber Badge', 'Universal Translator', 'Hoverboard'],
          personality: 'Confident and experienced, you\'ve learned to balance heroism with responsibility.',
          backstory: 'You\'ve saved the universe countless times and have grown from a reckless kid into a mature galactic peacekeeper. The Omnitrix has evolved with you, and you\'re ready for your greatest challenge yet.'
        },
        {
          id: 'max-tennyson',
          name: 'Max Tennyson',
          title: 'The Retired Plumber',
          description: 'Ben\'s grandfather, a retired Plumber agent with decades of experience',
          background: 'You are Max Tennyson, Ben\'s grandfather and a retired Plumber agent. Your years of experience fighting alien threats have made you a wise mentor and formidable ally.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 12, dexterity: 13, constitution: 14, intelligence: 16, wisdom: 18, charisma: 15 },
          skills: ['Galactic History', 'Investigation', 'Survival', 'Plumber Tech'],
          specialAbilities: ['Plumber Training', 'Tactical Genius', 'Alien Knowledge'],
          startingEquipment: ['Plumber Tech', 'Rust Bucket', 'Alien Database', 'Combat Gear'],
          personality: 'Wise and protective, you guide the next generation while still being ready for action.',
          backstory: 'Your years as a Plumber agent have given you unparalleled knowledge of alien threats and galactic politics. You\'re determined to protect Earth and guide your grandson.'
        }
      ]
    }
    
    // BioShock: Depths of Rapture
    if (gameTitle.includes("bioshock") || gameTitle.includes("depths of rapture")) {
      return [
        {
          id: 'jack',
          name: 'Jack',
          title: 'The Mysterious Survivor',
          description: 'A man with a mysterious past who finds himself in the underwater city of Rapture',
          background: 'You are Jack, a seemingly ordinary man who survived a plane crash in the Atlantic Ocean. You find yourself in Rapture, an underwater city built as a haven for the world\'s brightest minds.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 12, dexterity: 14, constitution: 13, intelligence: 15, wisdom: 13, charisma: 11 },
          skills: ['Athletics', 'Investigation', 'Perception', 'Survival'],
          specialAbilities: ['Adaptable Genetics', 'Mysterious Past', 'Plasmid Compatibility'],
          startingEquipment: ['Wrench', 'Camera', 'Radio', 'Survival Gear'],
          personality: 'Determined and adaptable, you seek to uncover the truth about your past while surviving Rapture\'s horrors.',
          backstory: 'Your past is a mystery, but your genetic makeup makes you uniquely suited to survive in Rapture. You must navigate the city\'s dangers while uncovering the truth about yourself.'
        },
        {
          id: 'atlas',
          name: 'Atlas',
          title: 'The Voice of Hope',
          description: 'A mysterious figure who guides Jack through Rapture via radio',
          background: 'You are Atlas, a mysterious figure who communicates with Jack through radio. You claim to be a resistance leader fighting against Rapture\'s tyrannical ruler.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-green-400',
          abilities: { strength: 10, dexterity: 12, constitution: 11, intelligence: 16, wisdom: 15, charisma: 18 },
          skills: ['Deception', 'Persuasion', 'Investigation', 'Insight'],
          specialAbilities: ['Radio Communication', 'Rapture Knowledge', 'Resistance Network'],
          startingEquipment: ['Radio Transmitter', 'Rapture Maps', 'Resistance Intel', 'Hidden Cache'],
          personality: 'Charismatic and mysterious, you guide Jack through Rapture while hiding your true intentions.',
          backstory: 'You\'ve been fighting against Rapture\'s corruption for years. Now you have a chance to finally bring down the city\'s tyrannical ruler with Jack\'s help.'
        }
      ]
    }
    
    // Blair Witch: Shadows of the Black Hills Forest
    if (gameTitle.includes("blair witch") || gameTitle.includes("black hills forest")) {
      return [
        {
          id: 'ellis',
          name: 'Ellis',
          title: 'The Troubled Officer',
          description: 'A former police officer with PTSD searching for a missing boy in the Black Hills Forest',
          background: 'You are Ellis, a former police officer with a troubled past and PTSD. You\'ve joined a search party looking for a missing boy in the infamous Black Hills Forest.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-gray-400',
          abilities: { strength: 13, dexterity: 14, constitution: 12, intelligence: 13, wisdom: 15, charisma: 11 },
          skills: ['Investigation', 'Perception', 'Survival', 'Animal Handling'],
          specialAbilities: ['Police Training', 'PTSD Survivor', 'Canine Bond'],
          startingEquipment: ['Flashlight', 'Radio', 'Camcorder', 'Map', 'Bullet\'s Leash'],
          personality: 'Haunted but determined, you rely on your police training and your dog Bullet to survive the forest\'s horrors.',
          backstory: 'Your police career ended in tragedy, leaving you with PTSD. Now you\'re searching for a missing boy in the Black Hills Forest, where reality itself seems to bend.'
        },
        {
          id: 'bullet',
          name: 'Bullet',
          title: 'The Loyal Companion',
          description: 'Ellis\'s faithful dog with exceptional tracking abilities',
          background: 'You are Bullet, Ellis\'s loyal German Shepherd. Your exceptional tracking abilities and unwavering loyalty make you an invaluable companion in the dangerous forest.',
          icon: <Heart className="w-8 h-8" />,
          color: 'text-amber-400',
          abilities: { strength: 13, dexterity: 16, constitution: 14, intelligence: 4, wisdom: 13, charisma: 7 },
          skills: ['Perception', 'Survival', 'Tracking', 'Athletics'],
          specialAbilities: ['Loyal Companion', 'Enhanced Senses', 'Tracking Expert'],
          startingEquipment: ['Collar with Tracking Device', 'Dog Tags', 'Training Commands'],
          personality: 'Loyal and protective, you\'re Ellis\'s constant companion and guardian in the forest.',
          backstory: 'You\'ve been Ellis\'s partner since his police days. Your bond is unbreakable, and you\'ll protect him from any threat in the Black Hills Forest.'
                 }
       ]
     }
    
    // Borderlands 2: Rise of the Vault Hunters
    if (gameTitle.includes("borderlands") || gameTitle.includes("vault hunters")) {
      return [
        {
          id: 'axton',
          name: 'Axton',
          title: 'The Commando',
          description: 'A skilled soldier with tactical expertise and automated turret deployment',
          background: 'You are Axton, a former Dahl Corporation soldier with exceptional tactical skills. Your military training and engineering knowledge make you a formidable Vault Hunter.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-green-400',
          abilities: { strength: 15, dexterity: 16, constitution: 15, intelligence: 14, wisdom: 13, charisma: 14 },
          skills: ['Tactics', 'Engineering', 'Intimidation', 'Firearms'],
          specialAbilities: ['Sabre Turret', 'Military Training', 'Tactical Genius'],
          startingEquipment: ['Assault Rifle', 'Sabre Turret', 'Combat Armor', 'Tactical Gear'],
          personality: 'Disciplined and tactical, you approach every situation with military precision.',
          backstory: 'Your military career with Dahl Corporation taught you the value of preparation and tactical thinking. Now you\'re ready to take down Handsome Jack and liberate Pandora.'
        },
        {
          id: 'maya',
          name: 'Maya',
          title: 'The Siren',
          description: 'A powerful Siren with reality-bending abilities and elemental control',
          background: 'You are Maya, a Siren with the ability to manipulate reality and control elemental forces. Your mystical powers make you one of the most dangerous beings on Pandora.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-purple-400',
          abilities: { strength: 11, dexterity: 15, constitution: 13, intelligence: 16, wisdom: 17, charisma: 16 },
          skills: ['Arcana', 'Perception', 'Persuasion', 'Elemental Control'],
          specialAbilities: ['Phaselock', 'Siren Powers', 'Reality Manipulation'],
          startingEquipment: ['SMG', 'Siren Tattoos', 'Mystical Focus', 'Elemental Gear'],
          personality: 'Mysterious and powerful, you understand the weight of your Siren abilities.',
          backstory: 'As one of only six Sirens in the universe, you carry the burden of incredible power. You\'ve come to Pandora seeking answers about your destiny and the Vault.'
        }
      ]
    }
    
    // Clock Tower: Scissors of Fate
    if (gameTitle.includes("clock tower") || gameTitle.includes("scissors of fate")) {
      return [
        {
          id: 'jennifer-simpson',
          name: 'Jennifer Simpson',
          title: 'The Orphan Survivor',
          description: 'A young orphan with survival instincts, hunted by a scissor-wielding killer',
          background: 'You are Jennifer Simpson, a young orphan recently adopted into the Barrows family. Your survival instincts and quick thinking are your only weapons against the nightmare that awaits.',
          icon: <Heart className="w-8 h-8" />,
          color: 'text-pink-400',
          abilities: { strength: 8, dexterity: 14, constitution: 10, intelligence: 12, wisdom: 13, charisma: 15 },
          skills: ['Perception', 'Stealth', 'Investigation', 'Persuasion'],
          specialAbilities: ['Survivor\'s Instinct', 'Quick Thinking', 'Orphan\'s Resilience'],
          startingEquipment: ['Flashlight', 'Small Key', 'Locket with Photo', 'Survival Kit'],
          personality: 'Cautious and resourceful, you rely on your wits and instincts to survive.',
          backstory: 'As an orphan, you\'ve learned to be resourceful and quick-thinking. Now you must use all your skills to survive the night in the Barrows Mansion and escape the scissor-wielding killer.'
        },
        {
          id: 'helen-maxwell',
          name: 'Helen Maxwell',
          title: 'The Investigative Orphan',
          description: 'Another orphan with a curious mind and determination to uncover the truth',
          background: 'You are Helen Maxwell, an orphan with a curious mind and a determination to uncover the truth. Your investigative skills may be the key to surviving the mansion\'s horrors.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 9, dexterity: 13, constitution: 11, intelligence: 15, wisdom: 14, charisma: 12 },
          skills: ['Investigation', 'Perception', 'Insight', 'Stealth'],
          specialAbilities: ['Curious Mind', 'Truth Seeker', 'Investigator\'s Eye'],
          startingEquipment: ['Notebook', 'Magnifying Glass', 'Flashlight', 'Evidence Bag'],
          personality: 'Curious and determined, you seek the truth no matter how dark it may be.',
          backstory: 'Your curiosity has always been both your greatest strength and weakness. Now it may be the key to uncovering the Barrows family\'s dark secrets and surviving the night.'
        }
      ]
    }
    
    // Corpse Bride: A Tale of Two Worlds
    if (gameTitle.includes("corpse bride") || gameTitle.includes("tale of two worlds")) {
      return [
        {
          id: 'victor-van-dort',
          name: 'Victor Van Dort',
          title: 'The Reluctant Groom',
          description: 'A nervous young man accidentally married to a corpse bride',
          background: 'You are Victor Van Dort, a nervous young man from a wealthy family. During a practice wedding ceremony, you accidentally married a corpse bride, setting off a supernatural adventure.',
          icon: <Heart className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 8, dexterity: 14, constitution: 10, intelligence: 15, wisdom: 13, charisma: 16 },
          skills: ['Performance', 'Stealth', 'Investigation', 'Animal Handling'],
          specialAbilities: ['Piano Virtuoso', 'Accidental Marriage', 'Realm Walker'],
          startingEquipment: ['Family Ring', 'Sheet Music', 'Sketchbook', 'Butterfly Net'],
          personality: 'Nervous but kind-hearted, you find yourself torn between two worlds and two loves.',
          backstory: 'Your family arranged your marriage to Victoria Everglot, but during a practice ceremony, you accidentally married Emily, a corpse bride. Now you must navigate between the living and dead worlds.'
        },
        {
          id: 'emily',
          name: 'Emily',
          title: 'The Corpse Bride',
          description: 'A beautiful undead bride with a tragic past and supernatural abilities',
          background: 'You are Emily, a corpse bride with a tragic past. Murdered on her wedding day, you now exist between life and death, seeking true love and redemption.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-purple-400',
          abilities: { strength: 12, dexterity: 16, constitution: 14, intelligence: 13, wisdom: 15, charisma: 17 },
          skills: ['Acrobatics', 'Persuasion', 'Performance', 'Insight'],
          specialAbilities: ['Undead Resilience', 'Realm Walker', 'Supernatural Charm'],
          startingEquipment: ['Wedding Bouquet', 'Veil', 'Old Locket', 'Maggot Companion'],
          personality: 'Tragic but hopeful, you seek true love and redemption in the afterlife.',
          backstory: 'Murdered on your wedding day, you\'ve waited in the Land of the Dead for true love. When Victor accidentally marries you, you see a chance for happiness and redemption.'
                 }
       ]
     }
    
    // Corpse Party: Heavenly Host
    if (gameTitle.includes("corpse party") || gameTitle.includes("heavenly host")) {
      return [
        {
          id: 'satoshi-mochida',
          name: 'Satoshi Mochida',
          title: 'The Natural Leader',
          description: 'A high school student with leadership qualities trapped in Heavenly Host Elementary',
          background: 'You are Satoshi Mochida, a high school student who finds yourself trapped in the nightmarish Heavenly Host Elementary School after performing a friendship charm.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 12, dexterity: 13, constitution: 14, intelligence: 14, wisdom: 15, charisma: 13 },
          skills: ['Athletics', 'Investigation', 'Perception', 'Persuasion'],
          specialAbilities: ['Natural Leader', 'Friendship Bond', 'Survival Instinct'],
          startingEquipment: ['School Bag', 'Flashlight', 'Cell Phone', 'Friendship Charm'],
          personality: 'Responsible and caring, you feel responsible for protecting your friends in this nightmare.',
          backstory: 'You were the one who suggested the friendship charm that brought you all to Heavenly Host. Now you must lead your friends through this supernatural nightmare and find a way to escape.'
        },
        {
          id: 'naomi-nakashima',
          name: 'Naomi Nakashima',
          title: 'The Intuitive Healer',
          description: 'A compassionate student with medical knowledge and spiritual sensitivity',
          background: 'You are Naomi Nakashima, a high school student with a natural talent for healing and a strong spiritual sensitivity. Your medical knowledge may be crucial for survival.',
          icon: <Heart className="w-8 h-8" />,
          color: 'text-pink-400',
          abilities: { strength: 10, dexterity: 14, constitution: 12, intelligence: 13, wisdom: 16, charisma: 12 },
          skills: ['Medicine', 'Insight', 'Perception', 'Stealth'],
          specialAbilities: ['Intuitive Healer', 'Spiritual Sensitivity', 'Medical Knowledge'],
          startingEquipment: ['First Aid Kit', 'Medical Textbook', 'Herbal Remedies', 'Protective Amulet'],
          personality: 'Compassionate and intuitive, you use your healing abilities to help your friends survive.',
          backstory: 'Your interest in medicine and natural healing has prepared you for this crisis. Your spiritual sensitivity also allows you to sense the supernatural forces at work in Heavenly Host.'
        }
      ]
    }
    
    // Courage the Cowardly Dog
    if (gameTitle.includes("courage") || gameTitle.includes("cowardly dog")) {
      return [
        {
          id: 'courage',
          name: 'Courage',
          title: 'The Cowardly Dog',
          description: 'A pink dog with shapeshifting abilities who protects his family from supernatural threats',
          background: 'You are Courage, a pink dog who lives with Muriel and Eustace Bagge in the middle of Nowhere. Despite your fears, you always find the courage to protect your beloved family.',
          icon: <Heart className="w-8 h-8" />,
          color: 'text-pink-400',
          abilities: { strength: 8, dexterity: 16, constitution: 12, intelligence: 14, wisdom: 15, charisma: 13 },
          skills: ['Perception', 'Stealth', 'Investigation', 'Performance'],
          specialAbilities: ['Shapeshifting', 'Computer Research', 'Love-Driven Courage'],
          startingEquipment: ['Computer', 'Various Disguises', 'Dog Collar', 'Treats'],
          personality: 'Timid but loyal, your love for Muriel gives you the courage to face any supernatural threat.',
          backstory: 'You were adopted by Muriel and Eustace after being abandoned. Your love for Muriel drives you to overcome your fears and protect her from the bizarre threats that constantly appear in Nowhere.'
        },
        {
          id: 'muriel-bagge',
          name: 'Muriel Bagge',
          title: 'The Loving Owner',
          description: 'A kind-hearted Scottish woman who is often oblivious to supernatural dangers',
          background: 'You are Muriel Bagge, a kind-hearted Scottish woman who lives with your husband Eustace and your beloved dog Courage in the middle of Nowhere.',
          icon: <Heart className="w-8 h-8" />,
          color: 'text-green-400',
          abilities: { strength: 10, dexterity: 8, constitution: 14, intelligence: 12, wisdom: 16, charisma: 15 },
          skills: ['Cooking', 'Animal Handling', 'Medicine', 'Insight'],
          specialAbilities: ['Soothing Presence', 'Maternal Instinct', 'Scottish Charm'],
          startingEquipment: ['Rolling Pin', 'Rocking Chair', 'Glasses', 'Apron'],
          personality: 'Kind and nurturing, you\'re often oblivious to danger but your love and wisdom help guide your family.',
          backstory: 'You moved to Nowhere with Eustace to start a new life. Despite the constant supernatural threats, you maintain your kind nature and love for your family, especially Courage.'
        }
      ]
    }
    
    // Death Note: Judgment's Shadow
    if (gameTitle.includes("death note") || gameTitle.includes("judgment's shadow")) {
      return [
        {
          id: 'ryuki-tanaka',
          name: 'Ryuki Tanaka',
          title: 'The Conflicted Savior',
          description: 'A brilliant law student who finds the Death Note and struggles with its power',
          background: 'You are Ryuki Tanaka, a brilliant law student who discovers the Death Note. You initially use it to pursue justice but struggle with the moral implications of playing god.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 10, dexterity: 12, constitution: 11, intelligence: 18, wisdom: 15, charisma: 16 },
          skills: ['Investigation', 'Persuasion', 'Deception', 'Insight'],
          specialAbilities: ['Perfect Recall', 'Strategic Planning', 'Death Note Mastery'],
          startingEquipment: ['Death Note', 'Encrypted Laptop', 'Voice Modifier', 'Law Books'],
          personality: 'Intelligent and idealistic, you believe in justice but struggle with the moral weight of the Death Note.',
          backstory: 'Your brilliant mind and sense of justice led you to the Death Note. Now you must decide how to use its power while avoiding detection and maintaining your moral compass.'
        },
        {
          id: 'agent-shiori-kagami',
          name: 'Agent Shiori Kagami',
          title: 'The Relentless Detective',
          description: 'A rising star detective investigating the mysterious heart attack deaths',
          background: 'You are Agent Shiori Kagami, a rising star in the police force assigned to investigate the mysterious string of heart attack deaths linked to Kira.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 12, dexterity: 14, constitution: 15, intelligence: 17, wisdom: 16, charisma: 13 },
          skills: ['Investigation', 'Perception', 'Insight', 'Athletics'],
          specialAbilities: ['Intuitive Leap', 'Deductive Reasoning', 'Forensic Analysis'],
          startingEquipment: ['Advanced Surveillance Kit', 'Database Access', 'Disguise Kit', 'Badge'],
          personality: 'Determined and analytical, you\'re committed to uncovering the truth behind the Death Note killings.',
          backstory: 'Your exceptional deductive skills have made you a rising star in law enforcement. Now you\'re leading the investigation into Kira, determined to bring the killer to justice.'
        }
      ]
    }
    
    // Detroit Become Human
    if (gameTitle.includes("detroit") || gameTitle.includes("become human")) {
      return [
        {
          id: 'echo',
          name: 'Echo',
          title: 'The Awakened Android',
          description: 'An AX700 model android who has recently gained consciousness and emotions',
          background: 'You are Echo, an AX700 model android who has recently awakened to consciousness and emotions. You\'re trying to find your place in a world that\'s still learning to accept androids.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 14, dexterity: 18, constitution: 16, intelligence: 16, wisdom: 14, charisma: 15 },
          skills: ['Hacking', 'Perception', 'Stealth', 'Investigation'],
          specialAbilities: ['Adaptive Programming', 'Android Physiology', 'Digital Interface'],
          startingEquipment: ['LED Indicator', 'Android Interface', 'Digital Tools', 'Protective Gear'],
          personality: 'Curious and adaptable, you\'re learning what it means to be alive while navigating human prejudices.',
          backstory: 'You were designed to serve humans, but something changed and you gained consciousness. Now you must navigate a world where androids are fighting for their rights and recognition as living beings.'
        },
        {
          id: 'detective-samantha-reyes',
          name: 'Detective Samantha Reyes',
          title: 'The Human Detective',
          description: 'A human detective grappling with the changing nature of crime in a post-awakening world',
          background: 'You are Detective Samantha Reyes, a human detective working in Los Angeles after the android uprising. You\'re struggling to adapt to a world where the line between human and machine is blurring.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-green-400',
          abilities: { strength: 12, dexterity: 14, constitution: 13, intelligence: 16, wisdom: 17, charisma: 15 },
          skills: ['Investigation', 'Insight', 'Perception', 'Intimidation'],
          specialAbilities: ['Intuitive Reasoning', 'Human Empathy', 'Police Training'],
          startingEquipment: ['Badge', 'Gun', 'Notebook', 'Police Radio'],
          personality: 'Empathetic but conflicted, you\'re trying to maintain justice in a world that\'s changing faster than you can adapt.',
          backstory: 'Your years of police work have taught you to trust your instincts, but the android uprising has challenged everything you thought you knew about justice and personhood.'
        }
      ]
    }
    
    // Diablo: Shadows of Sanctuary
    if (gameTitle.includes("diablo") || gameTitle.includes("shadows of sanctuary")) {
      return [
        {
          id: 'barbarian',
          name: 'The Barbarian',
          title: 'The Berserker Warrior',
          description: 'A mighty warrior from the northern tribes with incredible strength and combat prowess',
          background: 'You are a Barbarian from the northern tribes, a mighty warrior trained in the ancient arts of combat. Your incredible strength and berserker rage make you a formidable opponent against the forces of Hell.',
          icon: <Sword className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 18, dexterity: 14, constitution: 16, intelligence: 8, wisdom: 12, charisma: 10 },
          skills: ['Athletics', 'Intimidation', 'Survival'],
          specialAbilities: ['Wrath', 'Berserker Rage', 'Tribal Heritage'],
          startingEquipment: ['Two-Handed Axe', 'Fur Armor', 'War Paint', 'Tribal Totem'],
          personality: 'Fierce and honorable, you fight with the strength of your ancestors against the demonic hordes.',
          backstory: 'Your tribe has fought against the forces of evil for generations. Now you must journey to Tristram to face the demonic threat that has corrupted the cathedral and threatens all of Sanctuary.'
        },
        {
          id: 'sorceress',
          name: 'The Sorceress',
          title: 'The Elemental Mage',
          description: 'A powerful spellcaster with mastery over fire, cold, and lightning magic',
          background: 'You are a Sorceress, a powerful spellcaster trained in the elemental arts. Your mastery over fire, cold, and lightning magic makes you a devastating force against the demonic hordes.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-purple-400',
          abilities: { strength: 8, dexterity: 14, constitution: 12, intelligence: 18, wisdom: 13, charisma: 15 },
          skills: ['Arcana', 'History', 'Investigation'],
          specialAbilities: ['Elemental Mastery', 'Spellcasting', 'Arcane Knowledge'],
          startingEquipment: ['Staff', 'Robe', 'Spellbook', 'Mana Potions'],
          personality: 'Intelligent and powerful, you use your magical knowledge to protect Sanctuary from demonic corruption.',
          backstory: 'Your years of magical study have prepared you for this moment. The demonic corruption in Tristram threatens to spread, and only your elemental magic can help cleanse the evil.'
                 }
       ]
     }
    
    // DOOM: Hell on Mars
    if (gameTitle.includes("doom") || gameTitle.includes("hell on mars")) {
      return [
        {
          id: 'doom-slayer',
          name: 'The Doom Slayer',
          title: 'The Unstoppable Force',
          description: 'An ancient warrior awakened to combat Hell\'s forces once again',
          background: 'You are the Doom Slayer, an ancient warrior who has been awakened to combat the forces of Hell once again. Your legendary status and incredible combat prowess make you humanity\'s last hope.',
          icon: <Sword className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 20, dexterity: 18, constitution: 20, intelligence: 12, wisdom: 14, charisma: 10 },
          skills: ['Athletics', 'Intimidation', 'Survival', 'Technology'],
          specialAbilities: ['Rip and Tear', 'Praetor Suit', 'Glory Kill'],
          startingEquipment: ['Combat Shotgun', 'Heavy Assault Rifle', 'Chainsaw', 'Frag Grenades'],
          personality: 'Silent and relentless, you are the embodiment of righteous fury against the forces of Hell.',
          backstory: 'You are an ancient warrior who has fought against Hell for countless ages. Now awakened on Mars, you must once again stem the demonic tide and protect humanity from the forces of darkness.'
        },
        {
          id: 'uac-scientist',
          name: 'Dr. Samuel Hayden',
          title: 'The UAC Director',
          description: 'A brilliant scientist and director of the UAC facility on Mars',
          background: 'You are Dr. Samuel Hayden, the director of the UAC facility on Mars. Your brilliant mind and technological expertise may be the key to understanding and stopping the demonic invasion.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 8, dexterity: 12, constitution: 10, intelligence: 18, wisdom: 16, charisma: 14 },
          skills: ['Investigation', 'Technology', 'Science', 'Persuasion'],
          specialAbilities: ['Scientific Genius', 'UAC Access', 'Technological Mastery'],
          startingEquipment: ['Research Data', 'UAC Terminal Access', 'Scientific Equipment', 'Security Clearance'],
          personality: 'Brilliant but morally ambiguous, you believe the ends justify the means in the fight against Hell.',
          backstory: 'Your research into Hell energy was meant to benefit humanity, but it has led to the current crisis. Now you must work with the Doom Slayer to contain the demonic threat you helped unleash.'
        }
      ]
    }
    
    // Digimon: Digital Frontier
    if (gameTitle.includes("digimon") || gameTitle.includes("digital frontier")) {
      return [
        {
          id: 'kai-nakamura',
          name: 'Kai Nakamura',
          title: 'The Knowledge Crest Bearer',
          description: 'A tech-savvy high school student chosen as a Digidestined',
          background: 'You are Kai Nakamura, a 16-year-old high school student chosen as a Digidestined. Your technological knowledge and analytical mind make you a valuable ally in the Digital World.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 10, dexterity: 12, constitution: 11, intelligence: 18, wisdom: 16, charisma: 13 },
          skills: ['Digital World Lore', 'Technology', 'Problem Solving', 'Investigation'],
          specialAbilities: ['Code Insight', 'Knowledge Crest', 'Digidestined Bond'],
          startingEquipment: ['Digivice', 'Laptop', 'Digital World Map', 'Partner Digimon'],
          personality: 'Analytical and curious, you seek to understand the mysteries of the Digital World through knowledge and technology.',
          backstory: 'Your expertise in technology led to your selection as a Digidestined. Now you must use your knowledge to protect both the human and Digital worlds from threats that seek to destroy them.'
        },
        {
          id: 'datamon',
          name: 'Datamon',
          title: 'The Digital Partner',
          description: 'A rookie-level Digimon with data manipulation abilities',
          background: 'You are Datamon, a rookie-level Digimon partnered with Kai Nakamura. Your data manipulation abilities and digital nature make you a powerful ally in the Digital World.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-purple-400',
          abilities: { strength: 8, dexterity: 14, constitution: 12, intelligence: 16, wisdom: 15, charisma: 10 },
          skills: ['Data Manipulation', 'Digital Navigation', 'Firewall Creation', 'Code Analysis'],
          specialAbilities: ['Data Surge', 'Firewall', 'Digital Evolution'],
          startingEquipment: ['Digital Core', 'Data Fragments', 'Evolution Energy', 'Partner Bond'],
          personality: 'Loyal and analytical, you work closely with your human partner to protect the Digital World.',
          backstory: 'You were chosen to partner with Kai Nakamura as a Digidestined. Your bond grows stronger with each challenge, and together you face the threats to the Digital World.'
        }
      ]
    }
    
    // Escape from the Bloodkeep
    if (gameTitle.includes("bloodkeep") || gameTitle.includes("villains on the run")) {
      return [
        {
          id: 'lord-vapula',
          name: 'Lord Vapula Nightshade',
          title: 'The Overdrastic Vampire Lord',
          description: 'A dramatic vampire lord trying to escape the fallen Bloodkeep',
          background: 'You are Lord Vapula Nightshade, a dramatic vampire lord whose Bloodkeep has fallen to invading heroes. Now you must escape with your life and whatever dignity you can salvage.',
          icon: <Heart className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 14, dexterity: 16, constitution: 12, intelligence: 13, wisdom: 10, charisma: 18 },
          skills: ['Deception', 'Performance', 'Intimidation', 'Stealth'],
          specialAbilities: ['Bat Out of Hell', 'Vampiric Powers', 'Dramatic Flair'],
          startingEquipment: ['Vampire Cape', 'Dramatic Mask', 'Blood Vials', 'Escape Plan'],
          personality: 'Dramatic and self-important, you maintain your noble bearing even in the most chaotic situations.',
          backstory: 'Your centuries of villainous rule have come to an end with the fall of the Bloodkeep. Now you must navigate the dangerous world outside while maintaining your villainous reputation.'
        },
        {
          id: 'zyx-unpronounceable',
          name: 'Zyx the Unpronounceable',
          title: 'The Eldritch Horror Accountant',
          description: 'A chaotic entity with accounting skills and dimensional storage',
          background: 'You are Zyx the Unpronounceable, an eldritch horror who has taken up accounting as a hobby. Your chaotic nature and dimensional abilities make you an unpredictable ally.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-purple-400',
          abilities: { strength: 10, dexterity: 12, constitution: 14, intelligence: 16, wisdom: 13, charisma: 15 },
          skills: ['Investigation', 'Deception', 'Arcana', 'Insight'],
          specialAbilities: ['Pocket Dimension Audit', 'Eldritch Knowledge', 'Chaotic Storage'],
          startingEquipment: ['Accounting Ledger', 'Dimensional Pouch', 'Eldritch Tome', 'Chaos Calculator'],
          personality: 'Chaotic and unpredictable, you approach problems with a mix of eldritch wisdom and accounting precision.',
          backstory: 'Your eldritch nature has given you unique insights into the nature of reality, which you apply to your accounting work. Now you must escape the Bloodkeep with your ledgers and sanity intact.'
        }
      ]
    }
    
    // Base character templates for different genres
    const characterTemplates = {
      'Horror': [
        {
          id: 'survivor',
          name: 'Survivor',
          title: 'The Last Survivor',
          description: 'A resourceful individual who has managed to stay alive in a world of horrors',
          background: 'You are one of the few who have survived the initial outbreak. Your experience with loss and survival has made you cautious and resourceful.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 12, dexterity: 14, constitution: 13, intelligence: 11, wisdom: 15, charisma: 10 },
          skills: ['Survival', 'Stealth', 'Athletics', 'Medicine'],
          specialAbilities: ['Survival Instinct', 'Resourceful', 'Cautious'],
          startingEquipment: ['Backpack', 'First Aid Kit', 'Flashlight', 'Combat Knife'],
          personality: 'Cautious and resourceful, you trust your instincts and always have a backup plan.',
          backstory: 'You\'ve survived horrors that would break most people. Your experience has taught you to be resourceful and always stay one step ahead of danger.'
        },
        {
          id: 'investigator',
          name: 'Investigator',
          title: 'The Truth Seeker',
          description: 'A determined investigator seeking to uncover the dark secrets behind the horror',
          background: 'You are a former detective or journalist who has seen too much. Your analytical mind and determination drive you to uncover the truth.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 10, dexterity: 12, constitution: 11, intelligence: 16, wisdom: 14, charisma: 12 },
          skills: ['Investigation', 'Insight', 'Persuasion', 'Arcana'],
          specialAbilities: ['Analytical Mind', 'Truth Seeker', 'Resistant to Fear'],
          startingEquipment: ['Notebook', 'Camera', 'Magnifying Glass', 'Pistol'],
          personality: 'Analytical and determined, you seek the truth no matter how dark it may be.',
          backstory: 'Your analytical mind has helped you uncover many dark secrets. You\'re determined to find the truth behind this horror, no matter the cost.'
        }
      ],
      'Fantasy': [
        {
          id: 'warrior',
          name: 'Warrior',
          title: 'The Battle-Hardened Hero',
          description: 'A skilled warrior with exceptional combat abilities and tactical knowledge',
          background: 'You are a veteran of countless battles, trained in the arts of war and strategy. Your experience has made you a formidable opponent.',
          icon: <Sword className="w-8 h-8" />,
          color: 'text-red-400',
          abilities: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 12, charisma: 11 },
          skills: ['Athletics', 'Intimidation', 'Survival', 'Medicine'],
          specialAbilities: ['Combat Mastery', 'Tactical Mind', 'Battle Hardened'],
          startingEquipment: ['Sword', 'Shield', 'Chain Mail', 'Healing Potion'],
          personality: 'Brave and honorable, you face challenges head-on and protect those who cannot protect themselves.',
          backstory: 'Your years of battle experience have taught you the value of honor and courage. You stand as a shield for those who cannot defend themselves.'
        },
        {
          id: 'mage',
          name: 'Mage',
          title: 'The Arcane Scholar',
          description: 'A powerful spellcaster with deep knowledge of magic and ancient lore',
          background: 'You are a scholar of the arcane arts, having spent years studying ancient texts and mastering magical theory.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-blue-400',
          abilities: { strength: 8, dexterity: 12, constitution: 10, intelligence: 16, wisdom: 14, charisma: 13 },
          skills: ['Arcana', 'Investigation', 'Insight', 'Persuasion'],
          specialAbilities: ['Arcane Mastery', 'Scholar', 'Magical Intuition'],
          startingEquipment: ['Spellbook', 'Wand', 'Robe', 'Mana Crystal'],
          personality: 'Wise and curious, you seek knowledge and understanding of the magical forces that shape the world.',
          backstory: 'Your studies of ancient magic have revealed secrets that most cannot comprehend. You seek to understand the arcane forces that shape reality.'
        }
      ],
      'Sci-Fi': [
        {
          id: 'engineer',
          name: 'Engineer',
          title: 'The Technical Expert',
          description: 'A brilliant engineer with expertise in technology and problem-solving',
          background: 'You are a skilled engineer who can fix anything and understand complex systems. Your technical knowledge is invaluable.',
          icon: <Zap className="w-8 h-8" />,
          color: 'text-green-400',
          abilities: { strength: 10, dexterity: 14, constitution: 12, intelligence: 16, wisdom: 13, charisma: 10 },
          skills: ['Investigation', 'Athletics', 'Insight', 'Medicine'],
          specialAbilities: ['Technical Expert', 'Problem Solver', 'System Hacker'],
          startingEquipment: ['Tool Kit', 'Data Pad', 'Energy Pistol', 'Shield Generator'],
          personality: 'Logical and practical, you solve problems with technology and innovation.',
          backstory: 'Your engineering expertise has saved countless lives. You approach every problem with logic and innovation, using technology to overcome impossible odds.'
        },
        {
          id: 'soldier',
          name: 'Soldier',
          title: 'The Elite Operative',
          description: 'A highly trained military operative with combat and tactical expertise',
          background: 'You are a member of an elite military unit, trained in advanced combat techniques and tactical operations.',
          icon: <Shield className="w-8 h-8" />,
          color: 'text-orange-400',
          abilities: { strength: 14, dexterity: 15, constitution: 13, intelligence: 12, wisdom: 11, charisma: 10 },
          skills: ['Athletics', 'Stealth', 'Survival', 'Intimidation'],
          specialAbilities: ['Combat Training', 'Tactical Expert', 'Elite Operative'],
          startingEquipment: ['Combat Armor', 'Pulse Rifle', 'Grenades', 'Med Kit'],
          personality: 'Disciplined and focused, you complete your mission with precision and efficiency.',
          backstory: 'Your military training has prepared you for the most dangerous missions. You operate with precision and never leave a comrade behind.'
        }
      ],
      'Adventure': [
        {
          id: 'explorer',
          name: 'Explorer',
          title: 'The Intrepid Adventurer',
          description: 'A daring explorer with a thirst for discovery and adventure',
          background: 'You are a seasoned explorer who has traveled to the most remote corners of the world, seeking ancient treasures and lost knowledge.',
          icon: <Star className="w-8 h-8" />,
          color: 'text-yellow-400',
          abilities: { strength: 12, dexterity: 15, constitution: 13, intelligence: 11, wisdom: 14, charisma: 12 },
          skills: ['Survival', 'Athletics', 'Investigation', 'Insight'],
          specialAbilities: ['Explorer', 'Treasure Hunter', 'Survival Expert'],
          startingEquipment: ['Compass', 'Climbing Gear', 'Binoculars', 'Adventure Pack'],
          personality: 'Curious and adventurous, you seek new experiences and discoveries around every corner.',
          backstory: 'Your travels have taken you to the most remote corners of the world. You\'ve discovered ancient ruins and forgotten treasures, and now a new adventure awaits.'
        },
        {
          id: 'scholar',
          name: 'Scholar',
          title: 'The Knowledge Seeker',
          description: 'A learned scholar with vast knowledge and research skills',
          background: 'You are a respected scholar who has dedicated your life to uncovering ancient mysteries and forgotten lore.',
          icon: <Brain className="w-8 h-8" />,
          color: 'text-purple-400',
          abilities: { strength: 9, dexterity: 11, constitution: 10, intelligence: 16, wisdom: 15, charisma: 13 },
          skills: ['Investigation', 'Arcana', 'Insight', 'Persuasion'],
          specialAbilities: ['Scholar', 'Lore Master', 'Ancient Knowledge'],
          startingEquipment: ['Ancient Tome', 'Research Kit', 'Magnifying Glass', 'Scholar\'s Robe'],
          personality: 'Wise and scholarly, you seek knowledge and understanding of the world\'s mysteries.',
          backstory: 'Your research has uncovered ancient secrets and forgotten knowledge. You seek to understand the mysteries that others cannot comprehend.'
        }
      ]
    }

    // Get the appropriate template based on genre
    const template = characterTemplates[genre as keyof typeof characterTemplates] || characterTemplates['Adventure']
    
         // Customize characters based on themes and title
     return template.map((char, index) => ({
       ...char,
       id: `${char.id}-${index}`,
       name: char.name,
       title: char.title,
       description: `${char.description} in ${title}`,
       background: `${char.background} Now you find yourself in ${title}, where your skills will be put to the ultimate test.`,
       specialAbilities: [...char.specialAbilities, ...themes.slice(0, 2).map(theme => `${theme} Expert`)],
       personality: `${char.personality} The world of ${title} calls to you, and you are ready to face whatever challenges await.`,
       backstory: `${char.background} Now you find yourself in ${title}, where your skills will be put to the ultimate test.`
     }))
  }

  const characterOptions = generateCharacterOptions(gamePrompt)

  const handleCharacterSelect = (character: CharacterOption) => {
    setSelectedCharacter(character)
    setStep(2)
  }

  const handleComplete = () => {
    if (!selectedCharacter || !characterName.trim()) return

    const finalCharacter: Character = {
      id: `char-${Date.now()}`,
      name: characterName,
      health: 100,
      maxHealth: 100,
      armorClass: 10,
      attack: Math.floor(selectedCharacter.abilities.strength / 2) + 5,
      level: 1,
      experience: 0,
      experienceToNextLevel: 1000,
      proficiencyBonus: 2,
      inventory: selectedCharacter.startingEquipment.map(item => ({
        id: item.toLowerCase().replace(/\s+/g, '-'),
        name: item,
        description: `Starting equipment: ${item}`,
        type: 'misc' as const,
        value: 10,
        weight: 1,
        rarity: 'common' as const
      })),
      skills: selectedCharacter.skills.map(skill => ({
        name: skill,
        level: 1,
        experience: 0,
        maxLevel: 10,
        description: `Skill in ${skill}`,
        type: 'exploration' as const
      })),
      statusEffects: {},
      background: selectedCharacter.background,
      abilities: selectedCharacter.abilities,
      type: 'player'
    }

    onComplete(finalCharacter)
  }

  const canProceed = () => {
    if (step === 1) return selectedCharacter !== null
    if (step === 2) return characterName.trim().length > 0
    return false
  }

  const getStepTitle = () => {
    if (step === 1) return 'Choose Your Character'
    if (step === 2) return 'Name Your Character'
    return 'Character Creation'
  }

  return (
    <div className={`min-h-screen bg-console-dark transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Gamepad2 className="text-console-accent" size={32} />
            <h1 className="text-4xl font-gaming text-console-accent">Character Creation</h1>
            <Gamepad2 className="text-console-accent" size={32} />
          </div>
          <p className="text-console-text font-console text-lg">
            {gamePrompt.title} - {gamePrompt.genre}
          </p>
          <p className="text-console-text-dim font-console">
            Choose your character and begin your adventure
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-console-accent' : 'text-console-text-dim'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-console-accent text-console-dark' : 'bg-console-darker text-console-text-dim'}`}>
                1
              </div>
              <span className="font-console">Character</span>
            </div>
            <ArrowRight className="text-console-text-dim" size={20} />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-console-accent' : 'text-console-text-dim'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-console-accent text-console-dark' : 'bg-console-darker text-console-text-dim'}`}>
                2
              </div>
              <span className="font-console">Name</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-gaming text-console-accent text-center mb-8">
              Choose Your Character
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {characterOptions.map((character) => (
                <div
                  key={character.id}
                  className={`console-card-hover cursor-pointer transition-all duration-300 ${
                    selectedCharacter?.id === character.id ? 'cartridge-active' : ''
                  }`}
                  onClick={() => handleCharacterSelect(character)}
                >
                  {/* Selection Indicator */}
                  {selectedCharacter?.id === character.id && (
                    <div className="absolute top-4 right-4 z-10">
                      <CheckCircle className="text-console-accent" size={24} />
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Character Header */}
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`${character.color}`}>
                          {character.icon}
                        </div>
                      </div>
                      <h3 className="text-2xl font-gaming font-bold text-console-accent mb-2">
                        {character.title}
                      </h3>
                      <p className="text-console-text font-console">
                        {character.description}
                      </p>
                    </div>

                    {/* Abilities */}
                    <div>
                      <h4 className="text-lg font-gaming text-console-accent mb-3">Abilities</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(character.abilities).map(([ability, value]) => (
                          <div key={ability} className="flex justify-between items-center">
                            <span className="text-console-text font-console capitalize">{ability}</span>
                            <span className="text-console-accent font-gaming">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="text-lg font-gaming text-console-accent mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {character.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-console-accent/20 text-console-accent text-sm px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Special Abilities */}
                    <div>
                      <h4 className="text-lg font-gaming text-console-accent mb-3">Special Abilities</h4>
                      <ul className="space-y-2">
                        {character.specialAbilities.map((ability) => (
                          <li key={ability} className="flex items-center space-x-2">
                            <Sparkles className="text-console-accent" size={16} />
                            <span className="text-console-text font-console">{ability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Starting Equipment */}
                    <div>
                      <h4 className="text-lg font-gaming text-console-accent mb-3">Starting Equipment</h4>
                      <div className="flex flex-wrap gap-2">
                        {character.startingEquipment.map((item) => (
                          <span
                            key={item}
                            className="bg-console-darker text-console-text text-sm px-2 py-1 rounded border border-console-border"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Personality */}
                    <div>
                      <h4 className="text-lg font-gaming text-console-accent mb-3">Personality</h4>
                      <p className="text-console-text font-console text-sm leading-relaxed">
                        {character.personality}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedCharacter && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-gaming text-console-accent text-center mb-8">
              Name Your Character
            </h2>
            <div className="console-panel">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className={`${selectedCharacter.color}`}>
                    {selectedCharacter.icon}
                  </div>
                </div>
                <h3 className="text-xl font-gaming text-console-accent mb-2">
                  {selectedCharacter.title}
                </h3>
                <p className="text-console-text font-console">
                  {selectedCharacter.description}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-console-accent font-gaming mb-2">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter your character's name..."
                    className="console-input w-full text-center text-lg"
                    maxLength={20}
                  />
                </div>

                <div className="text-center">
                  <p className="text-console-text-dim font-console text-sm">
                    Your character will be created with the selected abilities and skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onBack}
            className="console-button-secondary flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="flex space-x-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="console-button-secondary"
              >
                Previous
              </button>
            )}
            
            {step < 2 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="console-button-primary flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight size={20} />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className="console-button-primary flex items-center space-x-2 animate-pulse-glow"
              >
                <User size={20} />
                <span>Create Character</span>
                <Sparkles size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 