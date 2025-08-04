'use client'

import React, { useState } from 'react'
import { 
  Map, 
  MapPin, 
  Navigation, 
  Compass, 
  X, 
  Search,
  Filter,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Sword,
  Heart
} from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { WorldState, Location, LocationType } from '@/lib/types'

interface WorldMapProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (locationId: string) => void
}

export function WorldMap({ isOpen, onClose, onNavigate }: WorldMapProps) {
  const { worldState, character } = useGameStore()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<LocationType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'town': return <Users className="w-4 h-4" />
      case 'dungeon': return <Sword className="w-4 h-4" />
      case 'wilderness': return <Compass className="w-4 h-4" />
      case 'shop': return <Star className="w-4 h-4" />
      case 'quest': return <AlertTriangle className="w-4 h-4" />
      case 'safe': return <CheckCircle className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getLocationColor = (type: LocationType) => {
    switch (type) {
      case 'town': return 'text-blue-400'
      case 'dungeon': return 'text-red-400'
      case 'wilderness': return 'text-green-400'
      case 'shop': return 'text-yellow-400'
      case 'quest': return 'text-orange-400'
      case 'safe': return 'text-green-400'
      default: return 'text-console-text'
    }
  }

  const getLocationStatus = (location: Location) => {
    if (location.isCurrent) return 'text-console-accent'
    if (location.isDiscovered) return 'text-console-text'
    return 'text-console-text-dim'
  }

  const filteredLocations = worldState?.discoveredLocations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || location.type === filterType
    return matchesSearch && matchesType
  }) || []

  const getDistance = (location: Location) => {
    // Simple distance calculation based on location coordinates
    const currentLocation = worldState?.discoveredLocations.find(l => l.isCurrent)
    if (!currentLocation || !location.coordinates || !currentLocation.coordinates) return 'Unknown'
    
    const dx = location.coordinates.x - currentLocation.coordinates.x
    const dy = location.coordinates.y - currentLocation.coordinates.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance < 1) return 'Here'
    if (distance < 5) return 'Nearby'
    if (distance < 10) return 'Close'
    if (distance < 20) return 'Far'
    return 'Very Far'
  }

  const getTravelTime = (location: Location) => {
    const distance = getDistance(location)
    switch (distance) {
      case 'Here': return '0 minutes'
      case 'Nearby': return '5 minutes'
      case 'Close': return '15 minutes'
      case 'Far': return '30 minutes'
      case 'Very Far': return '1 hour'
      default: return 'Unknown'
    }
  }

  const handleNavigate = (location: Location) => {
    if (location.isCurrent) return
    onNavigate(location.id)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Map className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">World Map</h2>
            <span className="text-console-text-dim">
              {filteredLocations.length} locations discovered
            </span>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-console-text-dim" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="console-input pl-10 w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-console-text-dim" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as LocationType | 'all')}
              className="console-input"
            >
              <option value="all">All Types</option>
              <option value="town">Towns</option>
              <option value="dungeon">Dungeons</option>
              <option value="wilderness">Wilderness</option>
              <option value="shop">Shops</option>
              <option value="quest">Quest Locations</option>
              <option value="safe">Safe Havens</option>
            </select>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('map')}
              className={`console-button ${viewMode === 'map' ? 'bg-console-accent text-console-dark' : ''}`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`console-button ${viewMode === 'list' ? 'bg-console-accent text-console-dark' : ''}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="relative bg-console-darker border border-console-border rounded-lg p-8 min-h-[400px]">
            <div className="text-center text-console-text-dim mb-4">
              <Compass className="w-8 h-8 mx-auto mb-2" />
              <p>Interactive World Map</p>
              <p className="text-sm">Click on locations to navigate</p>
            </div>
            
            {/* Placeholder for actual map visualization */}
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 64 }, (_, i) => {
                const location = filteredLocations[i % filteredLocations.length]
                if (!location) return <div key={i} className="w-8 h-8 bg-console-border rounded" />
                
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedLocation(location)}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-all hover:scale-110 ${
                      location.isCurrent ? 'bg-console-accent' : 'bg-console-border hover:bg-console-accent'
                    }`}
                    title={location.name}
                  >
                    <div className={getLocationColor(location.type)}>
                      {getLocationIcon(location.type)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <div className="col-span-full text-center py-8 text-console-text-dim">
                <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No locations found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={`console-card cursor-pointer transition-all hover:border-console-accent ${
                    selectedLocation?.id === location.id ? 'border-console-accent console-glow' : ''
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={getLocationColor(location.type)}>
                        {getLocationIcon(location.type)}
                      </div>
                      <h3 className={`font-gaming ${getLocationStatus(location)}`}>
                        {location.name}
                      </h3>
                    </div>
                    {location.isCurrent && (
                      <span className="text-xs bg-console-accent text-console-dark px-2 py-1 rounded">
                        HERE
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-console-text-dim mb-2 line-clamp-2">
                    {location.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={getLocationColor(location.type)}>
                      {location.type.toUpperCase()}
                    </span>
                    <span className="text-console-text-dim">
                      {getDistance(location)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Location Details */}
        {selectedLocation && (
          <div className="mt-6 p-4 border-t border-console-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={getLocationColor(selectedLocation.type)}>
                  {getLocationIcon(selectedLocation.type)}
                </div>
                <h3 className="text-lg font-gaming text-console-accent">
                  {selectedLocation.name}
                </h3>
                {selectedLocation.isCurrent && (
                  <span className="text-xs bg-console-accent text-console-dark px-2 py-1 rounded">
                    CURRENT LOCATION
                  </span>
                )}
              </div>
              
              {!selectedLocation.isCurrent && (
                <button
                  onClick={() => handleNavigate(selectedLocation)}
                  className="console-button-primary flex items-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Travel Here</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-gaming text-console-accent mb-2">Description</h4>
                <p className="text-console-text-dim mb-4">{selectedLocation.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-console-accent" />
                    <span>Travel Time: {getTravelTime(selectedLocation)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-console-accent" />
                    <span>Distance: {getDistance(selectedLocation)}</span>
                  </div>
                  
                  {selectedLocation.danger && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Danger Level: {selectedLocation.danger}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-gaming text-console-accent mb-2">Features</h4>
                <div className="space-y-2 text-sm">
                  {selectedLocation.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-console-accent rounded-full"></div>
                      <span className="text-console-text-dim">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {selectedLocation.quests && selectedLocation.quests.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-gaming text-console-accent mb-2">Available Quests</h4>
                    <div className="space-y-1 text-sm">
                      {selectedLocation.quests.map((quest, index) => (
                        <div key={index} className="text-console-text-dim">• {quest}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 