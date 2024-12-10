import { GameAction } from '../../types/GameState';
import { BaseGameActionHandler, GameActionContext, GameActionResult } from './GameActionHandler';
import { GameConfig } from '../GameConfig';

export interface CombatParameters {
  targetTerritoryId: string;
  attackingUnits: string[];
  combatType: 'ATTACK' | 'DEFEND';
}

export class CombatAction extends BaseGameActionHandler {
  actionType = 'COMBAT';

  async validate(action: GameAction, context: GameActionContext): Promise<boolean> {
    if (!(await super.validate(action, context))) {
      return false;
    }

    const params = action.parameters as CombatParameters;

    // Validate that all attacking units belong to the player
    const allUnitsOwned = params.attackingUnits.every(unitId =>
      context.playerState.units.includes(unitId)
    );

    if (!allUnitsOwned) {
      return false;
    }

    // Add additional combat-specific validation
    // For example, check if units are in range of target territory
    return true;
  }

  async execute(action: GameAction, context: GameActionContext): Promise<GameActionResult> {
    const params = action.parameters as CombatParameters;

    try {
      // Calculate combat outcome
      const outcome = await this.resolveCombat(params, context);

      // Create changes object based on combat outcome
      const changes = {
        // Update units based on combat results
        units: context.playerState.units.filter(id => !outcome.destroyedUnits.includes(id)),
        
        // Update territories if combat was successful
        territories: outcome.success 
          ? [...context.playerState.territories, params.targetTerritoryId]
          : context.playerState.territories,
        
        // Update resources (combat costs)
        resources: {
          ...context.playerState.resources,
          energy: context.playerState.resources.energy - outcome.energyCost,
          materials: context.playerState.resources.materials - outcome.materialsCost
        },

        // Deduct turns
        turnsRemaining: context.playerState.turnsRemaining - this.getCost(action)
      };

      return this.createSuccessResult(
        changes,
        outcome.success
          ? `Successfully captured territory ${params.targetTerritoryId}`
          : `Combat failed to capture territory ${params.targetTerritoryId}`
      );
    } catch (error) {
      return this.createErrorResult(error.message);
    }
  }

  getCost(action: GameAction): number {
    const params = action.parameters as CombatParameters;
    return params.combatType === 'ATTACK' 
      ? GameConfig.COMBAT.BASE_ATTACK_COST
      : GameConfig.COMBAT.BASE_DEFEND_COST;
  }

  private async resolveCombat(
    params: CombatParameters,
    context: GameActionContext
  ): Promise<{
    success: boolean;
    destroyedUnits: string[];
    energyCost: number;
    materialsCost: number;
  }> {
    // This is a simplified combat resolution
    // In a real implementation, this would:
    // 1. Calculate attack strength based on unit types, technology levels
    // 2. Calculate defense strength of the target territory
    // 3. Apply terrain modifiers
    // 4. Apply technology and alliance bonuses
    // 5. Include some randomness factor
    // 6. Determine casualties and resource costs

    const baseStrength = params.attackingUnits.length * 10;
    const strengthModifier = 1 + (context.playerState.resources.technology * 0.05);
    const totalStrength = baseStrength * strengthModifier;

    // Simulate combat outcome
    const success = totalStrength >= GameConfig.COMBAT.MIN_ATTACK_STRENGTH;
    
    // Calculate losses based on combat intensity
    const destroyedUnits = success 
      ? params.attackingUnits.slice(0, Math.floor(params.attackingUnits.length * 0.2)) // 20% losses on success
      : params.attackingUnits.slice(0, Math.floor(params.attackingUnits.length * 0.4)); // 40% losses on failure

    // Calculate resource costs
    const energyCost = params.attackingUnits.length * 10;
    const materialsCost = destroyedUnits.length * 20;

    return {
      success,
      destroyedUnits,
      energyCost,
      materialsCost
    };
  }
}
