'use client'

import React, { useState } from 'react'
import { 
  Package, 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  BookOpen, 
  Coins, 
  X, 
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { InventoryItem, ItemType, ItemRarity } from '@/lib/types'

interface InventoryProps {
  isOpen: boolean
  onClose: () => void
}

type SortOption = 'name' | 'type' | 'rarity' | 'value'
type SortDirection = 'asc' | 'desc'

export function Inventory({ isOpen, onClose }: InventoryProps) {
  const { inventory, character, updateInventory } = useGameStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const itemTypes: { value: ItemType | 'all'; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Items', icon: <Package className="w-4 h-4" /> },
    { value: 'weapon', label: 'Weapons', icon: <Sword className="w-4 h-4" /> },
    { value: 'armor', label: 'Armor', icon: <Shield className="w-4 h-4" /> },
    { value: 'consumable', label: 'Consumables', icon: <Heart className="w-4 h-4" /> },
    { value: 'magical', label: 'Magical', icon: <Zap className="w-4 h-4" /> },
    { value: 'quest', label: 'Quest Items', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'currency', label: 'Currency', icon: <Coins className="w-4 h-4" /> }
  ]

  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'uncommon': return 'text-green-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-console-text'
    }
  }

  const getTypeColor = (type: ItemType) => {
    switch (type) {
      case 'weapon': return 'text-red-400'
      case 'armor': return 'text-blue-400'
      case 'consumable': return 'text-green-400'
      case 'magical': return 'text-purple-400'
      case 'quest': return 'text-yellow-400'
      case 'currency': return 'text-yellow-400'
      default: return 'text-console-text'
    }
  }

  const filteredAndSortedItems = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || item.type === selectedType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'rarity':
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
          comparison = (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0)
          break
        case 'value':
          comparison = (a.value || 0) - (b.value || 0)
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const handleUseItem = (item: InventoryItem) => {
    // TODO: Implement item usage logic
    console.log('Using item:', item)
    
    // Remove consumable items after use
    if (item.type === 'consumable' && item.quantity) {
      if (item.quantity > 1) {
        updateInventory(inventory.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity! - 1 } : i
        ))
      } else {
        updateInventory(inventory.filter(i => i.id !== item.id))
      }
    }
  }

  const handleDropItem = (item: InventoryItem) => {
    if (confirm(`Are you sure you want to drop ${item.name}?`)) {
      updateInventory(inventory.filter(i => i.id !== item.id))
    }
  }

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Package className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Inventory</h2>
            <span className="text-console-text-dim">
              {inventory.length} items • {character?.name || 'Unknown'}
            </span>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-console-text-dim" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="console-input pl-10 w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-console-text-dim" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ItemType | 'all')}
              className="console-input"
            >
              {itemTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="console-input"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="rarity">Rarity</option>
              <option value="value">Value</option>
            </select>
            <button
              onClick={toggleSortDirection}
              className="console-button"
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
          {filteredAndSortedItems.length === 0 ? (
            <div className="col-span-full text-center py-8 text-console-text-dim">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No items found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredAndSortedItems.map((item) => (
              <div
                key={item.id}
                className={`console-card cursor-pointer transition-all hover:border-console-accent ${
                  selectedItem?.id === item.id ? 'border-console-accent console-glow' : ''
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={getTypeColor(item.type)}>
                      {itemTypes.find(t => t.value === item.type)?.icon}
                    </div>
                    <h3 className="font-gaming text-console-accent">{item.name}</h3>
                  </div>
                  {item.quantity && item.quantity > 1 && (
                    <span className="text-xs bg-console-accent text-console-dark px-2 py-1 rounded">
                      x{item.quantity}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-console-text-dim mb-2 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className={getRarityColor(item.rarity)}>
                    {item.rarity.toUpperCase()}
                  </span>
                  {item.value && (
                    <span className="text-console-text-dim">
                      {item.value} gp
                    </span>
                  )}
                </div>
                
                {item.effects && item.effects.length > 0 && (
                  <div className="mt-2 text-xs text-console-text-dim">
                    <div className="font-gaming text-console-accent mb-1">Effects:</div>
                    {item.effects.map((effect, index) => (
                      <div key={index} className="text-xs">
                        • {effect.type}: {effect.value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Item Details Panel */}
        {selectedItem && (
          <div className="mt-6 p-4 border-t border-console-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-gaming text-console-accent">
                {selectedItem.name}
              </h3>
              <div className="flex space-x-2">
                {selectedItem.type === 'consumable' && (
                  <button
                    onClick={() => handleUseItem(selectedItem)}
                    className="console-button-primary text-xs"
                  >
                    Use Item
                  </button>
                )}
                <button
                  onClick={() => handleDropItem(selectedItem)}
                  className="console-button text-xs text-red-400 hover:text-red-300"
                >
                  Drop
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-console-text-dim mb-2">{selectedItem.description}</p>
                <div className="space-y-1 text-sm">
                  <div><span className="text-console-accent">Type:</span> {selectedItem.type}</div>
                  <div><span className="text-console-accent">Rarity:</span> 
                    <span className={getRarityColor(selectedItem.rarity)}> {selectedItem.rarity}</span>
                  </div>
                  {selectedItem.value && (
                    <div><span className="text-console-accent">Value:</span> {selectedItem.value} gp</div>
                  )}
                  {selectedItem.weight && (
                    <div><span className="text-console-accent">Weight:</span> {selectedItem.weight} lbs</div>
                  )}
                </div>
              </div>
              
              {selectedItem.effects && selectedItem.effects.length > 0 && (
                <div>
                  <h4 className="font-gaming text-console-accent mb-2">Effects</h4>
                  <div className="space-y-1 text-sm">
                    {selectedItem.effects.map((effect, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{effect.type}:</span>
                        <span className={effect.value >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {effect.value >= 0 ? '+' : ''}{effect.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 