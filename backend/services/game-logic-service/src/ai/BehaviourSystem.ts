// backend/services/game-logic-service/src/ai/BehaviorSystem.ts
import { EventEmitter } from 'events';
import {
  PlayerId,
  GameState,
  ActionType,
  RegionId,
  ResourceCost,
  AIActivityMetrics,
  WorldEventType,
  GameEvent,
  GameEventType,
  EventVisibility
} from '../types';

interface PersonalityTraits {
  aggression: number;     // Tendency to engage in combat
  expansion: number;      // Desire to capture new territories
  technology: number;     // Focus on research and development
  diplomacy: number;      // Tendency to form alliances
  economics: number;      // Focus on resource management
  adaptation: number;     // Speed of strategy adjustment
}

interface BehaviorPattern {
  primaryStrategy: ActionType;
  secondaryStrategy: ActionType;
  resourcePriority: ResourceType[];
  territoryPreference: 'aggressive' | 'defensive' | 'opportunistic';
  allianceThreshold: number; // Minimum trust level for alliance formation
}

export class BehaviorSystem extends EventEmitter {
  private personality: PersonalityTraits;
  private currentPattern: BehaviorPattern;
  private trustLevels: Map<PlayerId, number>;
  private readonly learningRate: number = 0.1;
  private readonly maxTrust: number = 100;

  constructor() {
    super();
    this.personality = this.initializePersonality();
    this.currentPattern = this.generateBehaviorPattern();
    this.trustLevels = new Map();
  }

  /**
   * Initialize AI personality traits
   */
  private initializePersonality(): PersonalityTraits {
    return {
      aggression: 0.5 + Math.random() * 0.3, // 0.5-0.8 base aggression
      expansion: 0.4 + Math.random() * 0.4,  // 0.4-0.8 base expansion
      technology: 0.3 + Math.random() * 0.4, // 0.3-0.7 base tech focus
      diplomacy: 0.4 + Math.random() * 0.4,  // 0.4-0.8 base diplomacy
      economics: 0.4 + Math.random() * 0.3,  // 0.4-0.7 base economics
      adaptation: 0.3 + Math.random() * 0.4  // 0.3-0.7 base adaptation
    };
  }

  /**
   * Generate behavior pattern based on personality
   */
  private generateBehaviorPattern(): BehaviorPattern {
    const strategies = this.determineStrategies();
    return {
      primaryStrategy: strategies.primary,
      secondaryStrategy: strategies.secondary,
      resourcePriority: this.determineResourcePriority(),
      territoryPreference: this.determineTerritoryPreference(),
      allianceThreshold: 50 + (this.personality.diplomacy * 30) // 50-80 base threshold
    };
  }

  /**
   * Determine primary and secondary strategies based on personality
   */
  private determineStrategies(): { primary: ActionType; secondary: ActionType } {
    const traits = Object.entries(this.personality)
      .sort(([, a], [, b]) => b - a);

    const primaryTrait = traits[0][0];
    const secondaryTrait = traits[1][0];

    const strategyMap: Record<string, ActionType> = {
      aggression: ActionType.ATTACK,
      expansion: ActionType.MOVE,
      technology: ActionType.RESEARCH,
      diplomacy: ActionType.DIPLOMATIC,
      economics: ActionType.ECONOMIC
    };

    return {
      primary: strategyMap[primaryTrait],
      secondary: strategyMap[secondaryTrait]
    };
  }

  /**
   * Determine resource priority based on personality
   */
  private determineResourcePriority(): ResourceType[] {
    const priorities = [
      { type: ResourceType.ENERGY, weight: this.personality.economics * 1.2 },
      { type: ResourceType.MATERIALS, weight: this.personality.expansion },
      { type: ResourceType.TECHNOLOGY, weight: this.personality.technology * 1.5 },
      { type: ResourceType.INTELLIGENCE, weight: this.personality.diplomacy },
      { type: ResourceType.MORALE, weight: this.personality.aggression }
    ];

    return priorities
      .sort((a, b) => b.weight - a.weight)
      .map(p => p.type);
  }

  /**
   * Determine territory preference based on personality
   */
  private determineTerritoryPreference(): 'aggressive' | 'defensive' | 'opportunistic' {
    if (this.personality.aggression > 0.7) return 'aggressive';
    if (this.personality.diplomacy > 0.7) return 'defensive';
    return 'opportunistic';
  }

  /**
   * Update behavior based on game events
   */
  public handleGameEvent(event: GameEvent): void {
    switch (event.type) {
      case GameEventType.COMBAT_RESULT:
        this.updateFromCombat(event.data as CombatResult);
        break;
      case GameEventType.WORLD_EVENT:
        this.updateFromWorldEvent(event.data.type as WorldEventType);
        break;
      // Add other event handlers as needed
    }

    // Recalculate behavior pattern if adaptation threshold reached
    if (Math.random() < this.personality.adaptation) {
      this.currentPattern = this.generateBehaviorPattern();
      this.emit('behaviorUpdated', this.currentPattern);
    }
  }

  /**
   * Update personality traits based on combat results
   */
  private updateFromCombat(result: CombatResult): void {
    const success = result.territoryChanged;
    const adjustment = this.learningRate * (success ? 1 : -1);

    if (success) {
      this.personality.aggression += adjustment;
      this.personality.expansion += adjustment * 0.5;
    } else {
      this.personality.diplomacy += adjustment;
      this.personality.defense += adjustment * 0.5;
    }

    this.normalizePersonality();
  }

  /**
   * Update personality based on world events
   */
  private updateFromWorldEvent(eventType: WorldEventType): void {
    switch (eventType) {
      case WorldEventType.NATURAL_DISASTER:
        this.personality.economics += this.learningRate;
        this.personality.expansion -= this.learningRate;
        break;
      case WorldEventType.ECONOMIC_CRISIS:
        this.personality.economics += this.learningRate * 2;
        this.personality.aggression -= this.learningRate;
        break;
      // Add other event type handlers
    }

    this.normalizePersonality();
  }

  /**
   * Normalize personality traits to valid ranges
   */
  private normalizePersonality(): void {
    Object.keys(this.personality).forEach(trait => {
      this.personality[trait] = Math.max(0.1, Math.min(0.9, this.personality[trait]));
    });
  }

  /**
   * Update trust level with another player
   */
  public updateTrust(playerId: PlayerId, action: 'positive' | 'negative', magnitude: number): void {
    const currentTrust = this.trustLevels.get(playerId) || 50;
    const adjustment = magnitude * (action === 'positive' ? 1 : -1);
    
    this.trustLevels.set(
      playerId,
      Math.max(0, Math.min(this.maxTrust, currentTrust + adjustment))
    );
  }

  /**
   * Get current behavior metrics
   */
  public getMetrics(): AIActivityMetrics {
    return {
      aggressionLevel: this.personality.aggression,
      expansionRate: this.personality.expansion,
      techProgress: this.personality.technology,
      targetedRegions: [], // Implement based on current strategy
      predictedNextActions: [] // Implement based on behavior pattern
    };
  }

  /**
   * Get current personality traits
   */
  public getPersonality(): PersonalityTraits {
    return { ...this.personality };
  }

  /**
   * Get current behavior pattern
   */
  public getCurrentPattern(): BehaviorPattern {
    return { ...this.currentPattern };
  }
}