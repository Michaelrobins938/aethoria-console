'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sword, Shield, Zap, Heart, Target, X } from 'lucide-react'
import { useGameStore } from '@/lib/store'
import { CombatParticipant, Weapon, Armor, Spell, DiceRoll, CombatRoll, Modifier } from '@/lib/types'
import { rollInitiative, rollAttack, rollDamage, rollSavingThrow } from '@/lib/diceEngine'
import { CombatUI } from './CombatUI'

interface CombatSystemProps {
  isOpen: boolean
  onClose: () => void
}

export function CombatSystem({ isOpen, onClose }: CombatSystemProps) {
  const { combatState, character, updateCombatState, endCombat } = useGameStore()
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null)
  const [combatLog, setCombatLog] = useState<string[]>([])

  const addToCombatLog = useCallback((message: string) => {
    setCombatLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }, [])

  useEffect(() => {
    if (isOpen && combatState && !combatState.initiativeOrder) {
      const allParticipants = [character, ...combatState.enemies].map(p => ({
        ...p,
        initiative: rollInitiative(p.abilities.dexterity).roll.total
      }));
      allParticipants.sort((a, b) => b.initiative - a.initiative);
      updateCombatState({ 
        ...combatState, 
        initiativeOrder: allParticipants.map(p => p.id),
        turn: 0,
        round: 1,
      });
      addToCombatLog('Combat started! Initiative rolled.');
    }
  }, [isOpen, combatState, character, updateCombatState, addToCombatLog]);

  const handleActionSelect = (actionId: string) => {
    setSelectedActionId(actionId);
    setSelectedTargetId(null);
  };

  const handleTargetSelect = (targetId: string) => {
    setSelectedTargetId(targetId);
  };

  const handleExecuteAction = () => {
    if (!combatState || selectedActionId === null || selectedTargetId === null) return;

    const currentActor = combatState.participants.find(p => p.id === combatState.initiativeOrder[combatState.turn]);
    const target = combatState.participants.find(p => p.id === selectedTargetId);

    if (!currentActor || !target) return;

    let resultMessage = '';

    if (selectedActionId === 'attack') {
      const attackRoll = rollAttack(character.proficiencyBonus, character.abilities.strength);
      const isHit = attackRoll.roll.total >= target.armorClass;
      resultMessage = `${character.name} attacks ${target.name} and ${isHit ? 'hits' : 'misses'}.`;
      if (isHit) {
        const damageRoll = rollDamage('1d8', character.abilities.strength);
        target.health -= damageRoll.roll.total;
        resultMessage += ` dealing ${damageRoll.roll.total} damage.`
      }
    }

    addToCombatLog(resultMessage);

    const newParticipants = combatState.participants.map(p => p.id === target.id ? target : p);
    const aliveEnemies = newParticipants.filter(p => p.type === 'enemy' && p.health > 0);

    if (character.health <= 0) {
      addToCombatLog('You have been defeated!');
      endCombat();
      return;
    }

    if (aliveEnemies.length === 0) {
      addToCombatLog('Victory!');
      endCombat();
      return;
    }

    const nextTurn = (combatState.turn + 1) % combatState.initiativeOrder.length;
    const nextRound = nextTurn === 0 ? combatState.round + 1 : combatState.round;

    updateCombatState({
      ...combatState,
      participants: newParticipants,
      turn: nextTurn,
      round: nextRound,
    });
  };

  if (!isOpen || !combatState) return null;

  return (
    <CombatUI
      onClose={onClose}
      combatState={combatState}
      character={character}
      combatLog={combatLog}
      selectedActionId={selectedActionId}
      selectedTargetId={selectedTargetId}
      onActionSelect={handleActionSelect}
      onTargetSelect={handleTargetSelect}
      onExecuteAction={handleExecuteAction}
    />
  );
}