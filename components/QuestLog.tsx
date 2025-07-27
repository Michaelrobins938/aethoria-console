'use client'

import React, { useState } from 'react'
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  X, 
  MapPin, 
  Clock, 
  Star,
  Award,
  Target,
  Users,
  Sword
} from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { Quest, QuestStatus, QuestType } from '@/lib/types'

interface QuestLogProps {
  isOpen: boolean
  onClose: () => void
}

export function QuestLog({ isOpen, onClose }: QuestLogProps) {
  const { quests, character } = useGameStore()
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [filterStatus, setFilterStatus] = useState<QuestStatus | 'all'>('all')
  const [filterType, setFilterType] = useState<QuestType | 'all'>('all')

  const getStatusIcon = (status: QuestStatus) => {
    switch (status) {
      case 'active': return <Circle className="w-4 h-4 text-yellow-400" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed': return <X className="w-4 h-4 text-red-400" />
      default: return <Circle className="w-4 h-4 text-console-text-dim" />
    }
  }

  const getTypeIcon = (type: QuestType) => {
    switch (type) {
      case 'main': return <Star className="w-4 h-4 text-yellow-400" />
      case 'side': return <BookOpen className="w-4 h-4 text-blue-400" />
      case 'bounty': return <Target className="w-4 h-4 text-red-400" />
      case 'guild': return <Users className="w-4 h-4 text-purple-400" />
      case 'exploration': return <MapPin className="w-4 h-4 text-green-400" />
      default: return <BookOpen className="w-4 h-4 text-console-text-dim" />
    }
  }

  const getTypeColor = (type: QuestType) => {
    switch (type) {
      case 'main': return 'text-yellow-400'
      case 'side': return 'text-blue-400'
      case 'bounty': return 'text-red-400'
      case 'guild': return 'text-purple-400'
      case 'exploration': return 'text-green-400'
      default: return 'text-console-text'
    }
  }

  const getStatusColor = (status: QuestStatus) => {
    switch (status) {
      case 'active': return 'text-yellow-400'
      case 'completed': return 'text-green-400'
      case 'failed': return 'text-red-400'
      default: return 'text-console-text-dim'
    }
  }

  const filteredQuests = quests.filter(quest => {
    const matchesStatus = filterStatus === 'all' || quest.status === filterStatus
    const matchesType = filterType === 'all' || quest.type === filterType
    return matchesStatus && matchesType
  })

  const getObjectiveProgress = (quest: Quest) => {
    const completed = quest.objectives.filter(obj => obj.completed).length
    const total = quest.objectives.length
    return { completed, total, percentage: Math.round((completed / total) * 100) }
  }

  const getQuestRewards = (quest: Quest) => {
    const rewards = []
    if (quest.rewards.experience) rewards.push(`${quest.rewards.experience} XP`)
    if (quest.rewards.gold) rewards.push(`${quest.rewards.gold} Gold`)
    if (quest.rewards.items && quest.rewards.items.length > 0) {
      rewards.push(...quest.rewards.items.map(item => item.name))
    }
    return rewards.join(', ')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <BookOpen className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Quest Log</h2>
            <span className="text-console-text-dim">
              {quests.length} quests • {character?.name || 'Unknown'}
            </span>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-console-text-dim text-sm">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as QuestStatus | 'all')}
              className="console-input text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-console-text-dim text-sm">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as QuestType | 'all')}
              className="console-input text-sm"
            >
              <option value="all">All</option>
              <option value="main">Main Quest</option>
              <option value="side">Side Quest</option>
              <option value="bounty">Bounty</option>
              <option value="guild">Guild Quest</option>
              <option value="exploration">Exploration</option>
            </select>
          </div>
        </div>

        {/* Quest List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {filteredQuests.length === 0 ? (
            <div className="col-span-full text-center py-8 text-console-text-dim">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No quests found</p>
              <p className="text-sm">Try adjusting your filters or start a new adventure</p>
            </div>
          ) : (
            filteredQuests.map((quest) => {
              const progress = getObjectiveProgress(quest)
              return (
                <div
                  key={quest.id}
                  className={`console-card cursor-pointer transition-all hover:border-console-accent ${
                    selectedQuest?.id === quest.id ? 'border-console-accent console-glow' : ''
                  }`}
                  onClick={() => setSelectedQuest(quest)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(quest.type)}
                      <h3 className="font-gaming text-console-accent">{quest.title}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(quest.status)}
                      <span className={`text-xs ${getStatusColor(quest.status)}`}>
                        {quest.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-console-text-dim mb-2 line-clamp-2">
                    {quest.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className={getTypeColor(quest.type)}>
                      {quest.type.toUpperCase()}
                    </span>
                    {quest.level && (
                      <span className="text-console-text-dim">
                        Level {quest.level}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-console-text-dim mb-1">
                      <span>Progress</span>
                      <span>{progress.completed}/{progress.total}</span>
                    </div>
                    <div className="w-full bg-console-border rounded-full h-2">
                      <div 
                        className="bg-console-accent h-2 rounded-full transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Quick Objectives */}
                  <div className="text-xs text-console-text-dim">
                    {quest.objectives.slice(0, 2).map((objective, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        {objective.completed ? 
                          <CheckCircle className="w-3 h-3 text-green-400" /> : 
                          <Circle className="w-3 h-3" />
                        }
                        <span className={objective.completed ? 'line-through' : ''}>
                          {objective.description}
                        </span>
                      </div>
                    ))}
                    {quest.objectives.length > 2 && (
                      <div className="text-xs text-console-text-dim">
                        +{quest.objectives.length - 2} more objectives
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Quest Details Panel */}
        {selectedQuest && (
          <div className="mt-6 p-4 border-t border-console-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getTypeIcon(selectedQuest.type)}
                <h3 className="text-lg font-gaming text-console-accent">
                  {selectedQuest.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(selectedQuest.status)}`}>
                  {selectedQuest.status.toUpperCase()}
                </span>
              </div>
              
              {selectedQuest.status === 'active' && (
                <button className="console-button-primary text-xs">
                  Track Quest
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-gaming text-console-accent mb-2">Description</h4>
                <p className="text-console-text-dim mb-4">{selectedQuest.description}</p>
                
                {selectedQuest.location && (
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-console-accent" />
                    <span className="text-sm">{selectedQuest.location}</span>
                  </div>
                )}
                
                {selectedQuest.timeLimit && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-console-accent" />
                    <span className="text-sm">Time Limit: {selectedQuest.timeLimit}</span>
                  </div>
                )}
                
                {selectedQuest.questGiver && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-console-accent" />
                    <span className="text-sm">From: {selectedQuest.questGiver}</span>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-gaming text-console-accent mb-2">Objectives</h4>
                <div className="space-y-2 mb-4">
                  {selectedQuest.objectives.map((objective, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {objective.completed ? 
                        <CheckCircle className="w-4 h-4 text-green-400" /> : 
                        <Circle className="w-4 h-4 text-console-text-dim" />
                      }
                      <span className={`text-sm ${objective.completed ? 'line-through text-console-text-dim' : ''}`}>
                        {objective.description}
                      </span>
                      {objective.progress && (
                        <span className="text-xs text-console-text-dim">
                          ({objective.progress.current}/{objective.progress.required})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                <h4 className="font-gaming text-console-accent mb-2">Rewards</h4>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-console-text-dim">
                    {getQuestRewards(selectedQuest)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 