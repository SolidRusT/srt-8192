import { GameAction } from '../../types/GameState';
import { BaseGameActionHandler, GameActionContext, GameActionResult } from './GameActionHandler';
import { GameConfig } from '../GameConfig';

export interface ResearchParameters {
  technologyType: 'MILITARY' | 'ECONOMIC' | 'INTELLIGENCE';
  investmentAmount: number;
}

export class ResearchAction extends BaseGameActionHandler {
  actionType = 'RESEARCH';

  async validate(action: GameAction, context: GameActionContext): Promise<boolean> {
    if (!(await super.validate(action, context))) {
      return false;
    }

    const params = action.parameters as ResearchParameters;

    // Check if player has enough resources for research
    if (context.playerState.resources.energy < params.investmentAmount) {
      return false;
    }

    // Check if technology level is below maximum
    if (context.playerState.resources.technology >= GameConfig.TECHNOLOGY.MAX_TECH_LEVEL) {
      return false;
    }

    return true;
  }

  async execute(action: GameAction, context: GameActionContext): Promise<GameActionResult> {
    const params = action.parameters as ResearchParameters;

    try {
      // Calculate research outcome
      const researchResult = this.calculateResearchOutcome(params, context);

      // Create changes object based on research outcome
      const changes = {
        resources: {
          ...context.playerState.resources,
          energy: context.playerState.resources.energy - params.investmentAmount,
          technology: Math.min(
            context.playerState.resources.technology + researchResult.techGain,
            GameConfig.TECHNOLOGY.MAX_TECH_LEVEL
          )
        },
        turnsRemaining: context.playerState.turnsRemaining - this.getCost(action)
      };

      return this.createSuccessResult(
        changes,
        `Research successful: Technology level increased by ${researchResult.techGain.toFixed(2)}`
      );
    } catch (error) {
      return this.createErrorResult(error.message);
    }
  }

  getCost(action: GameAction): number {
    return GameConfig.TECHNOLOGY.RESEARCH_COST;
  }

  private calculateResearchOutcome(
    params: ResearchParameters,
    context: GameActionContext
  ): {
    techGain: number;
  } {
    // Base research efficiency
    const baseEfficiency = 0.1; // 10% conversion rate of energy to tech

    // Calculate diminishing returns based on current tech level
    const diminishingReturns = 1 - (context.playerState.resources.technology / GameConfig.TECHNOLOGY.MAX_TECH_LEVEL);

    // Calculate bonuses based on research type
    let typeBonus = 1.0;
    switch (params.technologyType) {
      case 'MILITARY':
        // Military research is more efficient if player has more territories
        typeBonus += context.playerState.territories.length * 0.05;
        break;
      case 'ECONOMIC':
        // Economic research is more efficient with higher resource levels
        typeBonus += (context.playerState.resources.energy / 10000) * 0.1;
        break;
      case 'INTELLIGENCE':
        // Intelligence research has a flat bonus
        typeBonus += 0.2;
        break;
    }

    // Calculate final tech gain
    const techGain = params.investmentAmount * baseEfficiency * diminishingReturns * typeBonus;

    return {
      techGain
    };
  }
}
