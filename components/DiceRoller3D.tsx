'use client'

import React, { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { rollDice, DiceRoll } from '@/lib/diceEngine'

interface DiceRoller3DProps {
  onRollComplete?: (result: DiceRoll) => void
  className?: string
}

interface DiceGeometry {
  geometry: THREE.BufferGeometry
  material: THREE.MeshStandardMaterial
  mesh: THREE.Mesh
  originalPosition: THREE.Vector3
  originalRotation: THREE.Euler
}

export function DiceRoller3D({ onRollComplete, className = '' }: DiceRoller3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const diceRef = useRef<DiceGeometry | null>(null)
  const animationRef = useRef<number>()
  
  const [isRolling, setIsRolling] = useState(false)
  const [selectedDice, setSelectedDice] = useState<string>('d20')
  const [rollResult, setRollResult] = useState<DiceRoll | null>(null)
  const [showResult, setShowResult] = useState(false)

  const diceTypes = [
    { value: 'd4', label: 'd4', sides: 4 },
    { value: 'd6', label: 'd6', sides: 6 },
    { value: 'd8', label: 'd8', sides: 8 },
    { value: 'd10', label: 'd10', sides: 10 },
    { value: 'd12', label: 'd12', sides: 12 },
    { value: 'd20', label: 'd20', sides: 20 },
    { value: 'd100', label: 'd100', sides: 100 }
  ]

  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    // Camera position
    camera.position.z = 5

    // Create dice based on selected type
    createDice(scene, selectedDice)

    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      
      if (diceRef.current && isRolling) {
        // Animate dice during roll
        const dice = diceRef.current.mesh
        dice.rotation.x += 0.1
        dice.rotation.y += 0.15
        dice.rotation.z += 0.05
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return
      
      const width = container.clientWidth
      const height = container.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Create dice geometry based on type
  const createDice = (scene: THREE.Scene, diceType: string) => {
    // Remove existing dice
    if (diceRef.current) {
      scene.remove(diceRef.current.mesh)
      diceRef.current.material.dispose()
      diceRef.current.geometry.dispose()
    }

    let geometry: THREE.BufferGeometry

    switch (diceType) {
      case 'd4':
        geometry = new THREE.TetrahedronGeometry(1)
        break
      case 'd6':
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
        break
      case 'd8':
        geometry = new THREE.OctahedronGeometry(1)
        break
      case 'd10':
        geometry = new THREE.DodecahedronGeometry(1)
        break
      case 'd12':
        geometry = new THREE.DodecahedronGeometry(1)
        break
      case 'd20':
        geometry = new THREE.IcosahedronGeometry(1)
        break
      case 'd100':
        geometry = new THREE.SphereGeometry(1, 32, 32)
        break
      default:
        geometry = new THREE.IcosahedronGeometry(1)
    }

    // Create material with dice-like appearance
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.8,
      transparent: true,
      opacity: 0.9
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    diceRef.current = {
      geometry,
      material,
      mesh,
      originalPosition: mesh.position.clone(),
      originalRotation: mesh.rotation.clone()
    }
  }

  // Handle dice type change
  useEffect(() => {
    if (sceneRef.current) {
      createDice(sceneRef.current, selectedDice)
    }
  }, [selectedDice])

  // Roll the dice
  const handleRollDice = async () => {
    if (isRolling) return

    setIsRolling(true)
    setShowResult(false)
    setRollResult(null)

    // Animate dice for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Perform actual dice roll
    const result = rollDice(selectedDice)
    setRollResult(result)
    setShowResult(true)
    setIsRolling(false)

    // Reset dice position
    if (diceRef.current) {
      diceRef.current.mesh.position.copy(diceRef.current.originalPosition)
      diceRef.current.mesh.rotation.copy(diceRef.current.originalRotation)
    }

    // Callback
    onRollComplete?.(result)
  }

  // Clear result
  const clearResult = () => {
    setRollResult(null)
    setShowResult(false)
  }

  return (
    <div className={`dice-roller-3d ${className}`}>
      {/* Dice Type Selector */}
      <div className="dice-selector mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {diceTypes.map((dice) => (
            <button
              key={dice.value}
              onClick={() => setSelectedDice(dice.value)}
              className={`px-4 py-2 rounded-lg font-console text-sm transition-colors duration-200 ${
                selectedDice === dice.value
                  ? 'bg-console-accent text-console-dark'
                  : 'bg-console-darker text-console-text hover:bg-console-border'
              }`}
            >
              {dice.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Dice Display */}
      <div className="dice-container mb-4">
        <div 
          ref={containerRef} 
          className="w-full h-64 bg-console-dark rounded-lg border border-console-border overflow-hidden"
        />
      </div>

      {/* Controls */}
      <div className="dice-controls flex gap-2 justify-center">
        <button
          onClick={handleRollDice}
          disabled={isRolling}
          className="px-6 py-3 bg-console-accent hover:bg-console-accent-dark disabled:bg-console-border disabled:cursor-not-allowed text-console-dark font-console rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <span className="text-lg">🎲</span>
          <span>{isRolling ? 'Rolling...' : 'Throw'}</span>
        </button>
        
        {showResult && (
          <button
            onClick={clearResult}
            className="px-6 py-3 bg-console-darker hover:bg-console-border text-console-text font-console rounded-lg transition-colors duration-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Result Display */}
      {showResult && rollResult && (
        <div className="result-display mt-4 p-4 bg-console-darker rounded-lg border border-console-border">
          <div className="text-center">
            <h3 className="text-console-accent font-console text-lg mb-2">Roll Result</h3>
            <div className="text-console-text font-console text-2xl mb-2">
              {rollResult.total}
            </div>
            <div className="text-console-text-dim text-sm">
              {rollResult.dice} = {rollResult.rolls.join(' + ')}
              {rollResult.modifiers.length > 0 && 
                ` + ${rollResult.modifiers.map(mod => mod.value).join(' + ')}`
              }
              {rollResult.critical && ' (CRITICAL!)'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 