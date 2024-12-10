import { GameAction } from '../../types/GameState';
import { GameActionHandler, GameActionContext, GameActionResult } from './GameActionHandler';
import { ResourceCollectionAction } from './ResourceCollectionAction';
import { CombatAction } from './CombatAction';
import { ResearchAction } from './ResearchAction';
import { DiplomacyAction } from './DiplomacyAction';

export class GameActionRegistry {
  private handlers: Map<string, GameActionHandler>;

  constructor() {
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    // Register all action handlers
    this.registerHandler(new ResourceCollectionAction());
    this.registerHandler(new CombatAction());
    this.registerHandler(new ResearchAction());
    this.registerHandler(new DiplomacyAction());
  }

  registerHandler(handler: GameActionHandler): void {
    if (this.handlers.has(handler.actionType)) {
      throw new Error(`Action handler for type ${handler.actionType} is already registered`);
    }
    this.handlers.set(handler.actionType, handler);
  }

  async validateAction(action: GameAction, context: GameActionContext): Promise<boolean> {
    const handler = this.getHandler(action.actionType);
    return handler.validate(action, context);
  }

  async executeAction(action: GameAction, context: GameActionContext): Promise<GameActionResult> {
    const handler = this.getHandler(action.actionType);
    try {
      if (!(await handler.validate(action, context))) {
        return {
          success: false,
          changes: {},
          error: 'Action validation failed'
        };
      }

      const result = await handler.execute(action, context);
      
      // Log action execution for analytics
      console.log(`Action executed: ${action.actionType}`, {
        gameId: context.gameId,
        playerId: context.playerId,
        success: result.success,
        cycle: context.currentCycle
      });

      return result;
    } catch (error) {
      console.error(`Action execution failed: ${action.actionType}`, {
        gameId: context.gameId,
        playerId: context.playerId,
        error: error.message
      });

      return {
        success: false,
        changes: {},
        error: `Action execution failed: ${error.message}`
      };
    }
  }

  getActionCost(action: GameAction): number {
    const handler = this.getHandler(action.actionType);
    return handler.getCost(action);
  }

  private getHandler(actionType: string): GameActionHandler {
    const handler = this.handlers.get(actionType);
    if (!handler) {
      throw new Error(`No handler registered for action type: ${actionType}`);
    }
    return handler;
  }

  getRegisteredActionTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  validateActionParameters(action: GameAction): boolean {
    // Basic parameter validation based on action type
    switch (action.actionType) {
      case 'COLLECT_RESOURCE':
        return this.validateResourceCollection(action);
      case 'COMBAT':
        return this.validateCombat(action);
      case 'RESEARCH':
        return this.validateResearch(action);
      case 'DIPLOMACY':
        return this.validateDiplomacy(action);
      default:
        return false;
    }
  }

  private validateResourceCollection(action: GameAction): boolean {
    const required = ['resourceType', 'territoryId', 'amount'];
    return required.every(param => param in action.parameters);
  }

  private validateCombat(action: GameAction): boolean {
    const required = ['targetTerritoryId', 'attackingUnits', 'combatType'];
    return required.every(param => param in action.parameters);
  }

  private validateResearch(action: GameAction): boolean {
    const required = ['technologyType', 'investmentAmount'];
    return required.every(param => param in action.parameters);
  }

  private validateDiplomacy(action: GameAction): boolean {
    const required = ['actionType', 'targetPlayerId'];
    return required.every(param => param in action.parameters);
  }
}
