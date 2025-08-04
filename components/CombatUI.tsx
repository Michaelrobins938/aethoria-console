'use client'

import React from 'react';
import { Sword, Shield, Zap, Heart, Target, X } from 'lucide-react';
import { CombatState, Character, CombatParticipant } from '@/lib/types';

interface CombatUIProps {
  onClose: () => void;
  combatState: CombatState;
  character: Character;
  combatLog: string[];
  selectedActionId: string | null;
  selectedTargetId: string | null;
  onActionSelect: (actionId: string) => void;
  onTargetSelect: (targetId: string) => void;
  onExecuteAction: () => void;
}

export function CombatUI({ 
  onClose, 
  combatState, 
  character, 
  combatLog, 
  selectedActionId, 
  selectedTargetId, 
  onActionSelect, 
  onTargetSelect, 
  onExecuteAction 
}: CombatUIProps) {

  const getHealthPercentage = (combatant: CombatParticipant) => {
    return Math.round((combatant.health / combatant.maxHealth) * 100);
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-400';
    if (percentage >= 50) return 'text-yellow-400';
    if (percentage >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const actions = [
    { id: 'attack', name: 'Attack', icon: <Sword className="w-4 h-4" /> },
    { id: 'defend', name: 'Defend', icon: <Shield className="w-4 h-4" /> },
    { id: 'cast', name: 'Cast Spell', icon: <Zap className="w-4 h-4" /> },
    { id: 'item', name: 'Use Item', icon: <Heart className="w-4 h-4" /> },
    { id: 'flee', name: 'Flee', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Sword className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Combat System</h2>
            <span className="text-console-text-dim">
              Round {combatState.round} • Turn: {combatState.initiativeOrder && combatState.participants.find(p => p.id === combatState.initiativeOrder[combatState.turn])?.name}
            </span>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="console-card mb-6">
              <h3 className="font-gaming text-console-accent mb-4">Combatants</h3>
              <div className="mb-4 p-4 border border-console-border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-gaming text-console-accent">{character.name}</h4>
                  <span className={`text-sm ${getHealthColor(getHealthPercentage(character))}`}>
                    {character.health}/{character.maxHealth} HP
                  </span>
                </div>
                <div className="w-full bg-console-border rounded-full h-2">
                  <div 
                    className="bg-console-accent h-2 rounded-full transition-all"
                    style={{ width: `${getHealthPercentage(character)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                {combatState.enemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    className={`p-3 border rounded cursor-pointer transition-all ${
                      selectedTargetId === enemy.id ? 'border-console-accent console-glow' : 'border-console-border'
                    } ${enemy.health <= 0 ? 'opacity-50' : ''}`}
                    onClick={() => enemy.health > 0 && onTargetSelect(enemy.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-gaming text-console-accent">{enemy.name}</h4>
                      <span className={`text-sm ${getHealthColor(getHealthPercentage(enemy))}`}>
                        {enemy.health}/{enemy.maxHealth} HP
                      </span>
                    </div>
                    <div className="w-full bg-console-border rounded-full h-2">
                      <div 
                        className="bg-red-400 h-2 rounded-full transition-all"
                        style={{ width: `${getHealthPercentage(enemy)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="console-card">
              <h3 className="font-gaming text-console-accent mb-4">Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => onActionSelect(action.id)}
                    disabled={combatState.initiativeOrder && combatState.participants.find(p => p.id === combatState.initiativeOrder[combatState.turn])?.id !== character.id}
                    className={`console-button flex items-center space-x-2 ${
                      selectedActionId === action.id ? 'bg-console-accent text-console-dark' : ''
                    }`}
                  >
                    {action.icon}
                    <span className="text-xs">{action.name}</span>
                  </button>
                ))}
              </div>
              
              {selectedActionId && (
                <div className="mt-4">
                  <button
                    onClick={onExecuteAction}
                    disabled={!selectedTargetId}
                    className="console-button-primary w-full"
                  >
                    Execute {selectedActionId}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="console-card">
            <h3 className="font-gaming text-console-accent mb-4">Combat Log</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-1 text-sm">
              {combatLog.map((entry, index) => (
                <div key={index} className="text-console-text-dim">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}