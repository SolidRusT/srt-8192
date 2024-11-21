import { 
    ServerUnit, 
    UnitType, 
    SpecialAbility, 
    PlayerId, 
    ResourceCost,
    CombatStats
  } from '../types';
  
  export class UnitManager {
    private units: Map<string, ServerUnit> = new Map();
    private readonly baseStats: Record<UnitType, CombatStats> = {
      INFANTRY: { attack: 3, defense: 2, mobility: 2, range: 1 },
      MECHANIZED: { attack: 4, defense: 4, mobility: 3, range: 2 },
      AERIAL: { attack: 5, defense: 2, mobility: 5, range: 4 },
      NAVAL: { attack: 6, defense: 5, mobility: 2, range: 5 },
      SPECIAL: { attack: 4, defense: 3, mobility: 3, range: 3 }
    };
  
    private readonly specialAbilities: Record<UnitType, SpecialAbility[]> = {
      INFANTRY: [{
        id: 'entrench',
        name: 'Entrench',
        description: 'Increase defense at cost of mobility',
        cooldown: 2,
        resourceCost: { morale: 1 },
        effect: { type: 'buff', magnitude: 2, duration: 2 }
      }],
      MECHANIZED: [{
        id: 'breakthrough',
        name: 'Breakthrough',
        description: 'Increased attack and mobility for one turn',
        cooldown: 3,
        resourceCost: { energy: 2 },
        effect: { type: 'buff', magnitude: 2, duration: 1 }
      }],
      AERIAL: [{
        id: 'surgical_strike',
        name: 'Surgical Strike',
        description: 'High precision attack ignoring some defense',
        cooldown: 3,
        resourceCost: { intelligence: 2 },
        effect: { type: 'damage', magnitude: 3, duration: 1 }
      }],
      NAVAL: [{
        id: 'coastal_bombardment',
        name: 'Coastal Bombardment',
        description: 'Long-range attack affecting multiple units',
        cooldown: 4,
        resourceCost: { materials: 3 },
        effect: { type: 'damage', magnitude: 2, duration: 1 }
      }],
      SPECIAL: [{
        id: 'sabotage',
        name: 'Sabotage',
        description: 'Reduce enemy unit effectiveness',
        cooldown: 3,
        resourceCost: { intelligence: 2, morale: 1 },
        effect: { type: 'debuff', magnitude: 2, duration: 2 }
      }]
    };
  
    createUnit(
      type: UnitType, 
      playerId: PlayerId, 
      position: { x: number, y: number }
    ): ServerUnit {
      const unitId = `${type}_${playerId}_${Date.now()}`;
      const unit: ServerUnit = {
        id: unitId,
        type,
        ownerId: playerId,
        position,
        stats: { ...this.baseStats[type] },
        health: 100,
        experience: 0,
        level: 1,
        specialAbilities: [...this.specialAbilities[type]],
        abilityCooldowns: new Map(),
        status: {
          buffs: [],
          debuffs: [],
          isEngaged: false
        }
      };
  
      this.units.set(unitId, unit);
      return unit;
    }
  
    getUnit(unitId: string): ServerUnit | undefined {
      return this.units.get(unitId);
    }
  
    updateUnit(unit: ServerUnit): void {
      this.units.set(unit.id, unit);
    }
  
    deleteUnit(unitId: string): boolean {
      return this.units.delete(unitId);
    }
  
    useSpecialAbility(
      unitId: string, 
      abilityId: string, 
      targetUnitIds: string[]
    ): boolean {
      const unit = this.units.get(unitId);
      if (!unit) return false;
  
      const ability = unit.specialAbilities.find(a => a.id === abilityId);
      if (!ability) return false;
  
      const currentCooldown = unit.abilityCooldowns.get(abilityId) || 0;
      if (currentCooldown > 0) return false;
  
      // Apply ability effects to target units
      targetUnitIds.forEach(targetId => {
        const targetUnit = this.units.get(targetId);
        if (targetUnit) {
          this.applyAbilityEffect(ability, targetUnit);
        }
      });
  
      // Set cooldown
      unit.abilityCooldowns.set(abilityId, ability.cooldown);
      return true;
    }
  
    private applyAbilityEffect(ability: SpecialAbility, targetUnit: ServerUnit): void {
      const { effect } = ability;
      
      switch (effect.type) {
        case 'damage':
          targetUnit.health = Math.max(0, targetUnit.health - effect.magnitude);
          break;
        case 'buff':
          targetUnit.status.buffs.push({
            type: ability.id,
            magnitude: effect.magnitude,
            remainingTurns: effect.duration
          });
          break;
        case 'debuff':
          targetUnit.status.debuffs.push({
            type: ability.id,
            magnitude: effect.magnitude,
            remainingTurns: effect.duration
          });
          break;
        case 'utility':
          // Handle utility effects (e.g., mobility changes, vision range)
          break;
      }
  
      this.updateUnit(targetUnit);
    }
  
    processTurnEnd(): void {
      for (const unit of this.units.values()) {
        // Reduce cooldowns
        for (const [abilityId, cooldown] of unit.abilityCooldowns.entries()) {
          if (cooldown > 0) {
            unit.abilityCooldowns.set(abilityId, cooldown - 1);
          }
        }
  
        // Process status effects
        unit.status.buffs = unit.status.buffs
          .map(buff => ({ ...buff, remainingTurns: buff.remainingTurns - 1 }))
          .filter(buff => buff.remainingTurns > 0);
  
        unit.status.debuffs = unit.status.debuffs
          .map(debuff => ({ ...debuff, remainingTurns: debuff.remainingTurns - 1 }))
          .filter(debuff => debuff.remainingTurns > 0);
  
        this.updateUnit(unit);
      }
    }
  
    calculateEffectiveStats(unit: ServerUnit): CombatStats {
      const baseStats = { ...unit.stats };
      
      // Apply buffs
      unit.status.buffs.forEach(buff => {
        Object.keys(baseStats).forEach(stat => {
          baseStats[stat as keyof CombatStats] += buff.magnitude;
        });
      });
  
      // Apply debuffs
      unit.status.debuffs.forEach(debuff => {
        Object.keys(baseStats).forEach(stat => {
          baseStats[stat as keyof CombatStats] -= debuff.magnitude;
        });
      });
  
      // Ensure no stat goes below 1
      Object.keys(baseStats).forEach(stat => {
        baseStats[stat as keyof CombatStats] = 
          Math.max(1, baseStats[stat as keyof CombatStats]);
      });
  
      return baseStats;
    }
  }