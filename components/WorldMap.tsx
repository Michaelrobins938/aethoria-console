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
    // Robust distance calculation using Haversine formula for geographic coordinates
    const currentLocation = worldState?.discoveredLocations.find(l => l.isCurrent)
    if (!currentLocation || !location.coordinates || !currentLocation.coordinates) return 'Unknown'
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (location.coordinates.y - currentLocation.coordinates.y) * Math.PI / 180;
    const dLon = (location.coordinates.x - currentLocation.coordinates.x) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentLocation.coordinates.y * Math.PI / 180) * Math.cos(location.coordinates.y * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Add terrain modifiers for more realistic travel
    const terrainModifier = getTerrainModifier(currentLocation, location);
    const adjustedDistance = distance * terrainModifier;
    
    if (adjustedDistance < 0.1) return 'Here'
    if (adjustedDistance < 1) return 'Nearby'
    if (adjustedDistance < 5) return 'Close'
    if (adjustedDistance < 15) return 'Far'
    return 'Very Far'
  }

  const getTerrainModifier = (location1: Location, location2: Location): number => {
    // Calculate terrain difficulty between locations
    const terrainTypes = {
      'road': 1.0,
      'forest': 1.5,
      'mountain': 2.0,
      'swamp': 1.8,
      'desert': 1.3,
      'water': 2.5,
      'urban': 0.8
    };
    
    const avgTerrain = location1.terrain || location2.terrain || 'road';
    return terrainTypes[avgTerrain as keyof typeof terrainTypes] || 1.0;
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
            
            {/* Robust Interactive Map Visualization */}
            <div className="relative w-full h-[400px] bg-gradient-to-br from-console-dark to-console-darker rounded-lg border border-console-border overflow-hidden">
              {/* Map Background with Terrain */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-br from-green-900/20 via-blue-900/20 to-gray-900/20" />
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 50% 50%, rgba(107, 114, 128, 0.1) 0%, transparent 50%)`
                }} />
              </div>
              
              {/* Location Markers */}
              {filteredLocations.map((location, index) => {
                const currentLocation = worldState?.discoveredLocations.find(l => l.isCurrent);
                const isCurrent = location.isCurrent;
                const isDiscovered = location.isDiscovered !== false;
                
                // Calculate position based on coordinates or generate grid position
                const x = location.coordinates?.x || (index % 8) * 12.5;
                const y = location.coordinates?.y || Math.floor(index / 8) * 12.5;
                
                return (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125 ${
                      isCurrent ? 'z-20' : 'z-10'
                    }`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`
                    }}
                    title={`${location.name} - ${getDistance(location)} - ${getTravelTime(location)}`}
                  >
                    <div className={`relative ${isCurrent ? 'animate-pulse' : ''}`}>
                      {/* Location Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCurrent 
                          ? 'bg-console-accent border-console-accent shadow-lg shadow-console-accent/50' 
                          : isDiscovered
                            ? 'bg-console-dark border-console-border hover:border-console-accent'
                            : 'bg-console-darker border-console-border opacity-50'
                      }`}>
                        <div className={getLocationColor(location.type)}>
                          {getLocationIcon(location.type)}
                        </div>
                      </div>
                      
                      {/* Location Label */}
                      {isCurrent && (
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs bg-console-accent text-console-dark px-2 py-1 rounded font-gaming">
                            HERE
                          </span>
                        </div>
                      )}
                      
                      {/* Connection Lines */}
                      {isCurrent && isDiscovered && (
                        <div className="absolute inset-0">
                          {filteredLocations.filter(l => l.id !== location.id && l.isDiscovered !== false).map((otherLocation, otherIndex) => {
                            const otherX = otherLocation.coordinates?.x || (otherIndex % 8) * 12.5;
                            const otherY = otherLocation.coordinates?.y || Math.floor(otherIndex / 8) * 12.5;
                            const distance = Math.sqrt(Math.pow(x - otherX, 2) + Math.pow(y - otherY, 2));
                            
                            if (distance < 30) { // Only show connections to nearby locations
                              return (
                                <svg
                                  key={otherLocation.id}
                                  className="absolute inset-0 w-full h-full pointer-events-none"
                                  style={{ zIndex: 5 }}
                                >
                                  <line
                                    x1="50%"
                                    y1="50%"
                                    x2={`${((otherX - x) / 100) * 100 + 50}%`}
                                    y2={`${((otherY - y) / 100) * 100 + 50}%`}
                                    stroke="rgba(34, 197, 94, 0.3)"
                                    strokeWidth="1"
                                    strokeDasharray="3,3"
                                  />
                                </svg>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              
              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-console-dark/90 border border-console-border rounded-lg p-3 text-xs">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span className="text-console-text">Towns</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Sword className="w-3 h-3 text-red-400" />
                  <span className="text-console-text">Dungeons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Compass className="w-3 h-3 text-green-400" />
                  <span className="text-console-text">Wilderness</span>
                </div>
              </div>
              
              {/* Current Location Info */}
              {currentLocation && (
                <div className="absolute top-4 right-4 bg-console-dark/90 border border-console-border rounded-lg p-3 text-xs">
                  <div className="font-gaming text-console-accent mb-1">Current Location</div>
                  <div className="text-console-text">{currentLocation.name}</div>
                  <div className="text-console-text-dim">{currentLocation.description}</div>
                </div>
              )}
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