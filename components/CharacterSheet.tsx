'use client'

import React, { useState } from 'react';
import { User, Heart, Sword, Shield, Zap, Brain, Star, TrendingUp, Award, BookOpen, Target, Activity, X } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { Character, Skill } from '@/lib/types';

interface CharacterSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterSheet({ isOpen, onClose }: CharacterSheetProps) {
  const { character } = useGameStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'combat' | 'skills' | 'inventory' | 'progression'>('overview');

  if (!character || !isOpen) return null;

  const getAbilityModifier = (value: number) => {
    return Math.floor((value - 10) / 2);
  };

  const getAbilityColor = (value: number) => {
    if (value >= 18) return 'text-purple-400';
    if (value >= 16) return 'text-blue-400';
    if (value >= 14) return 'text-green-400';
    if (value >= 12) return 'text-yellow-400';
    if (value >= 10) return 'text-console-text';
    return 'text-red-400';
  };

  const getSkillTypeIcon = (type: string) => {
    switch (type) {
      case 'combat': return <Sword className="w-3 h-3" />;
      case 'social': return <User className="w-3 h-3" />;
      case 'exploration': return <Target className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'combat': return 'text-red-400';
      case 'social': return 'text-blue-400';
      case 'exploration': return 'text-green-400';
      default: return 'text-console-text';
    }
  };

  const calculateTotalSkillBonus = (skill: Skill) => {
    const abilityMod = getAbilityModifier(character.abilities[skill.primaryAbility || 'strength']);
    return abilityMod + character.proficiencyBonus + skill.level;
  };

  const getHealthPercentage = () => {
    return Math.round((character.health / character.maxHealth) * 100);
  };

  const getHealthColor = () => {
    const percentage = getHealthPercentage();
    if (percentage >= 75) return 'text-green-400';
    if (percentage >= 50) return 'text-yellow-400';
    if (percentage >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getExperienceProgress = () => {
    const expForNextLevel = character.level * 1000;
    const progress = (character.experience / expForNextLevel) * 100;
    return Math.min(progress, 100);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'combat', label: 'Combat', icon: <Sword className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Award className="w-4 h-4" /> },
    { id: 'progression', label: 'Progression', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="console-card w-full max-w-6xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <User className="w-6 h-6 text-console-accent" />
            <h2 className="text-2xl font-gaming text-console-accent">Character Sheet</h2>
            <span className="text-console-text-dim">
              {character.name} • Level {character.level}
            </span>
          </div>
          <button onClick={onClose} className="console-button">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'combat' | 'skills' | 'inventory' | 'progression')}
              className={`console-button flex items-center space-x-2 ${
                activeTab === tab.id ? 'bg-console-accent text-console-dark' : ''
              }`}
            >
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {activeTab === 'overview' && (
            // ... (overview tab content remains the same)
          )}

          {activeTab === 'combat' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Combat Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-console-accent">Armor Class</div>
                      <div className="text-lg font-gaming">{character.armorClass}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-sm text-console-accent">Hit Points</div>
                      <div className="text-lg font-gaming">{character.health}/{character.maxHealth}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-sm text-console-accent">Proficiency Bonus</div>
                      <div className="text-lg font-gaming">+{character.proficiencyBonus}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="console-card">
                <h3 className="font-gaming text-console-accent mb-4">Status Effects</h3>
                {Object.keys(character.statusEffects).length === 0 ? (
                  <p className="text-console-text-dim text-sm">No active status effects</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(character.statusEffects).map(([effect, details]) => (
                      <div key={effect} className="text-sm">
                        <div className="text-console-accent">{effect}</div>
                        <div className="text-console-text-dim">{details.toString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            // ... (skills tab content remains the same)
          )}

          {activeTab === 'inventory' && (
            // ... (inventory tab content remains the same)
          )}

          {activeTab === 'progression' && (
            // ... (progression tab content remains the same)
          )}
        </div>
      </div>
    </div>
  );
}