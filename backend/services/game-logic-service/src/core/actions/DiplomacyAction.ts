import { GameAction } from '../../types/GameState';
import { BaseGameActionHandler, GameActionContext, GameActionResult } from './GameActionHandler';
import { GameConfig } from '../GameConfig';

export interface DiplomacyParameters {
  actionType: 'PROPOSE_ALLIANCE' | 'ACCEPT_ALLIANCE' | 'BREAK_ALLIANCE';
  targetPlayerId: string;
  terms?: {
    resourceSharing?: boolean;
    mutualDefense?: boolean;
    tradingBonus?: number;
  };
}

export class DiplomacyAction extends BaseGameActionHandler {
  actionType = 'DIPLOMACY';

  async validate(action: GameAction, context: GameActionContext): Promise<boolean> {
    if (!(await super.validate(action, context))) {
      return false;
    }

    const params = action.parameters as DiplomacyParameters;

    // Can't form alliance with self
    if (params.targetPlayerId === context.playerId) {
      return false;
    }

    // Check alliance size limits
    if (params.actionType === 'PROPOSE_ALLIANCE' || params.actionType === 'ACCEPT_ALLIANCE') {
      const currentAlliances = context.playerState.alliances?.length || 0;
      if (currentAlliances >= GameConfig.DIPLOMACY.MAX_ALLIANCE_SIZE) {
        return false;
      }
    }

    return true;
  }

  async execute(action: GameAction, context: GameActionContext): Promise<GameActionResult> {
    const params = action.parameters as DiplomacyParameters;

    try {
      let changes = {
        turnsRemaining: context.playerState.turnsRemaining - this.getCost(action)
      };

      let message = '';

      switch (params.actionType) {
        case 'PROPOSE_ALLIANCE':
          changes = {
            ...changes,
            pendingAlliances: [
              ...(context.playerState.pendingAlliances || []),
              {
                targetPlayerId: params.targetPlayerId,
                terms: params.terms,
                proposedAt: new Date()
              }
            ]
          };
          message = `Alliance proposed to player ${params.targetPlayerId}`;
          break;

        case 'ACCEPT_ALLIANCE':
          // Remove from pending and add to active alliances
          changes = {
            ...changes,
            pendingAlliances: (context.playerState.pendingAlliances || [])
              .filter(a => a.targetPlayerId !== params.targetPlayerId),
            alliances: [
              ...(context.playerState.alliances || []),
              {
                playerId: params.targetPlayerId,
                terms: params.terms,
                formedAt: new Date()
              }
            ]
          };
          message = `Alliance formed with player ${params.targetPlayerId}`;
          break;

        case 'BREAK_ALLIANCE':
          changes = {
            ...changes,
            alliances: (context.playerState.alliances || [])
              .filter(a => a.playerId !== params.targetPlayerId)
          };
          message = `Alliance broken with player ${params.targetPlayerId}`;
          break;
      }

      return this.createSuccessResult(changes, message);
    } catch (error) {
      return this.createErrorResult(error.message);
    }
  }

  getCost(action: GameAction): number {
    return GameConfig.DIPLOMACY.ALLIANCE_FORMATION_COST;
  }

  private calculateDiplomaticEffects(
    params: DiplomacyParameters,
    context: GameActionContext
  ): {
    moraleChange: number;
    resourceEffects: Record<string, number>;
  } {
    // Calculate effects of diplomatic action
    let moraleChange = 0;
    const resourceEffects: Record<string, number> = {};

    switch (params.actionType) {
      case 'PROPOSE_ALLIANCE':
      case 'ACCEPT_ALLIANCE':
        moraleChange = 10;
        if (params.terms?.resourceSharing) {
          resourceEffects.energy = 100;
          resourceEffects.materials = 100;
        }
        break;

      case 'BREAK_ALLIANCE':
        moraleChange = -20;
        break;
    }

    return {
      moraleChange,
      resourceEffects
    };
  }
}
