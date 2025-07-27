'use client'

import React, { useState, useMemo } from 'react'
import { 
  Package, 
  X, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Play, 
  Trash2,
  Info,
  Sword,
  Shield,
  Heart,
  Zap,
  BookOpen,
  Coins
} from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { Item, InventoryItem, ItemType, ItemRarity } from '@/lib/types'

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

  // Convert Item[] to InventoryItem[] for display
  const inventoryItems: InventoryItem[] = useMemo(() => {
    return inventory.map(item => ({
      ...item,
      quantity: 1, // Default quantity for items
      effects: item.effects ? Object.entries(item.effects).map(([type, value]) => ({
        type,
        value,
        description: `${type}: ${value}`
      })) : undefined
    }))
  }, [inventory])

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

  const getTypeColor = (type: Item['type']) => {
    switch (type) {
      case 'weapon': return 'text-red-400'
      case 'armor': return 'text-blue-400'
      case 'consumable': return 'text-green-400'
      case 'quest': return 'text-yellow-400'
      case 'misc': return 'text-console-text'
      default: return 'text-console-text'
    }
  }

  const getTypeIcon = (type: Item['type']) => {
    switch (type) {
      case 'weapon': return <Sword className="w-4 h-4" />
      case 'armor': return <Shield className="w-4 h-4" />
      case 'consumable': return <Heart className="w-4 h-4" />
      case 'quest': return <BookOpen className="w-4 h-4" />
      case 'misc': return <Package className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const itemTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'weapon', label: 'Weapons' },
    { value: 'armor', label: 'Armor' },
    { value: 'consumable', label: 'Consumables' },
    { value: 'magical', label: 'Magical' },
    { value: 'quest', label: 'Quest Items' },
    { value: 'currency', label: 'Currency' }
  ]

  const handleUseItem = (item: InventoryItem) => {
    // TODO: Implement item usage logic
    // Using item
    
    // Remove consumable items after use
    if (item.type === 'consumable' && item.quantity) {
      if (item.quantity > 1) {
        updateInventory(inventory.map(i => 
          i.id === item.id ? { ...i, quantity: (i as any).quantity! - 1 } : i
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

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || item.type === selectedType
      return matchesSearch && matchesType
    })

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'rarity':
          aValue = a.rarity
          bValue = b.rarity
          break
        case 'value':
          aValue = a.value
          bValue = b.value
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [inventoryItems, searchTerm, selectedType, sortBy, sortDirection])

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
              {inventoryItems.length} items • {character?.name || 'Unknown'}
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
                className={`console-card cursor-pointer transition-all ${
                  selectedItem?.id === item.id ? 'border-console-accent console-glow' : ''
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-gaming font-bold text-lg mb-1 group-hover:text-console-accent transition-colors duration-300">
                      {item.name}
                    </h3>
                    <p className="text-sm text-console-text-dim leading-relaxed mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className={getTypeColor(item.type)}>
                        {item.type.toUpperCase()}
                      </div>
                      {item.quantity && item.quantity > 1 && (
                        <div className="text-console-accent font-gaming">
                          x{item.quantity}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${getRarityColor(item.rarity)}`}>
                        {item.rarity.toUpperCase()}
                      </span>
                      <span className="text-xs text-console-text-dim">
                        {item.value} gold
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Item Effects */}
                {item.effects && item.effects.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-console-border">
                    <h4 className="text-xs font-gaming text-console-accent mb-2">Effects:</h4>
                    <div className="space-y-1">
                      {item.effects.map((effect, index) => (
                        <div key={index} className="text-xs text-console-text-dim">
                          {effect.description}
                        </div>
                      ))}
                    </div>
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
              <h3 className="font-gaming text-console-accent">Item Details</h3>
              <button onClick={() => setSelectedItem(null)} className="console-button">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-gaming text-console-accent mb-2">{selectedItem.name}</h4>
                <p className="text-sm text-console-text-dim mb-3">{selectedItem.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div><span className="text-console-accent">Type:</span> {selectedItem.type}</div>
                  <div><span className="text-console-accent">Rarity:</span> {selectedItem.rarity}</div>
                  <div><span className="text-console-accent">Value:</span> {selectedItem.value} gold</div>
                  <div><span className="text-console-accent">Weight:</span> {selectedItem.weight} lbs</div>
                  {selectedItem.quantity && (
                    <div><span className="text-console-accent">Quantity:</span> {selectedItem.quantity}</div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                                 <button
                   onClick={() => handleUseItem(selectedItem)}
                   disabled={selectedItem.type !== 'consumable'}
                   className="console-button flex items-center space-x-2"
                 >
                   <Play className="w-4 h-4" />
                   <span>Use Item</span>
                 </button>
                
                <button
                  onClick={() => handleDropItem(selectedItem)}
                  className="console-button flex items-center space-x-2 text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Drop Item</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 