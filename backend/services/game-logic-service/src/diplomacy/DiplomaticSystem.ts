import { EventEmitter } from 'events';
import {
  PlayerId,
  GameState,
  ResourceCost,
  GameEvent,
  GameEventType,
  EventVisibility
} from '../types';

interface DiplomaticRelation {
  trust: number;          // -100 to 100
  tradeCount: number;     // Number of successful trades
  conflictCount: number;  // Number of hostile actions
  allianceDuration: number; // Time in alliance (if any)
  lastInteraction: Date;
}

interface DiplomaticAgreement {
  id: string;
  type: 'alliance' | 'trade' | 'non-aggression' | 'research';
  parties: PlayerId[];
  terms: {
    resourceSharing?: Partial<ResourceCost>;
    militarySupport?: boolean;
    technologySharing?: boolean;
    duration?: number;
  };
  startTime: Date;
  endTime?: Date;
  status: 'proposed' | 'active' | 'expired' | 'broken';
}

interface DiplomaticAction {
  type: 'propose' | 'accept' | 'reject' | 'break';
  sourceId: PlayerId;
  targetId: PlayerId;
  agreement?: DiplomaticAgreement;
  timestamp: Date;
}

export class DiplomaticSystem extends EventEmitter {
  private relations: Map<string, DiplomaticRelation>;
  private agreements: Map<string, DiplomaticAgreement>;
  private actionHistory: DiplomaticAction[];
  private readonly maxAlliances: number = 3;
  private readonly trustThresholds = {
    alliance: 50,
    trade: 0,
    nonAggression: 25
  };

  constructor() {
    super();
    this.relations = new Map();
    this.agreements = new Map();
    this.actionHistory = [];
  }

  /**
   * Get or create diplomatic relation between two players
   */
  private getRelation(player1: PlayerId, player2: PlayerId): DiplomaticRelation {
    const key = this.getRelationKey(player1, player2);
    if (!this.relations.has(key)) {
      this.relations.set(key, {
        trust: 0,
        tradeCount: 0,
        conflictCount: 0,
        allianceDuration: 0,
        lastInteraction: new Date()
      });
    }
    return this.relations.get(key)!;
  }

  /**
   * Generate consistent relation key for two players
   */
  private getRelationKey(player1: PlayerId, player2: PlayerId): string {
    return [player1, player2].sort().join(':');
  }

  /**
   * Propose a diplomatic agreement
   */
  public proposeAgreement(
    sourceId: PlayerId,
    targetId: PlayerId,
    type: DiplomaticAgreement['type'],
    terms: DiplomaticAgreement['terms']
  ): DiplomaticAgreement | null {
    // Check if players can form new agreements
    if (!this.canFormAgreement(sourceId, targetId, type)) {
      return null;
    }

    const agreement: DiplomaticAgreement = {
      id: crypto.randomUUID(),
      type,
      parties: [sourceId, targetId],
      terms,
      startTime: new Date(),
      status: 'proposed'
    };

    this.agreements.set(agreement.id, agreement);
    this.logAction({
      type: 'propose',
      sourceId,
      targetId,
      agreement,
      timestamp: new Date()
    });

    this.emit('agreementProposed', { agreement, sourceId, targetId });
    return agreement;
  }

  /**
   * Accept a proposed agreement
   */
  public acceptAgreement(
    agreementId: string,
    acceptingPlayer: PlayerId
  ): boolean {
    const agreement = this.agreements.get(agreementId);
    if (!agreement || agreement.status !== 'proposed' || 
        !agreement.parties.includes(acceptingPlayer)) {
      return false;
    }

    agreement.status = 'active';
    agreement.startTime = new Date();
    if (agreement.terms.duration) {
      agreement.endTime = new Date(
        Date.now() + agreement.terms.duration * 1000
      );
    }

    this.logAction({
      type: 'accept',
      sourceId: acceptingPlayer,
      targetId: agreement.parties.find(id => id !== acceptingPlayer)!,
      agreement,
      timestamp: new Date()
    });

    // Update relations
    this.modifyTrust(agreement.parties[0], agreement.parties[1], 10);
    this.emit('agreementAccepted', { agreement, acceptingPlayer });
    return true;
  }

  /**
   * Break an existing agreement
   */
  public breakAgreement(
    agreementId: string,
    breakingPlayer: PlayerId
  ): boolean {
    const agreement = this.agreements.get(agreementId);
    if (!agreement || agreement.status !== 'active' || 
        !agreement.parties.includes(breakingPlayer)) {
      return false;
    }

    agreement.status = 'broken';
    agreement.endTime = new Date();

    const otherParty = agreement.parties.find(id => id !== breakingPlayer)!;
    this.logAction({
      type: 'break',
      sourceId: breakingPlayer,
      targetId: otherParty,
      agreement,
      timestamp: new Date()
    });

    // Significant trust penalty for breaking agreements
    this.modifyTrust(breakingPlayer, otherParty, -30);
    this.emit('agreementBroken', { agreement, breakingPlayer });
    return true;
  }

  /**
   * Modify trust between two players
   */
  public modifyTrust(
    player1: PlayerId,
    player2: PlayerId,
    amount: number
  ): void {
    const relation = this.getRelation(player1, player2);
    relation.trust = Math.max(-100, Math.min(100, relation.trust + amount));
    relation.lastInteraction = new Date();

    this.emit('trustChanged', {
      players: [player1, player2],
      newTrust: relation.trust
    });
  }

  /**
   * Check if players can form a new agreement
   */
  private canFormAgreement(
    player1: PlayerId,
    player2: PlayerId,
    type: DiplomaticAgreement['type']
  ): boolean {
    const relation = this.getRelation(player1, player2);

    // Check trust requirements
    if (relation.trust < this.trustThresholds[type]) {
      return false;
    }

    // Check alliance limits
    if (type === 'alliance') {
      const player1Alliances = this.getActiveAgreements(player1)
        .filter(a => a.type === 'alliance').length;
      const player2Alliances = this.getActiveAgreements(player2)
        .filter(a => a.type === 'alliance').length;

      if (player1Alliances >= this.maxAlliances || 
          player2Alliances >= this.maxAlliances) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all active agreements for a player
   */
  public getActiveAgreements(playerId: PlayerId): DiplomaticAgreement[] {
    return Array.from(this.agreements.values())
      .filter(agreement => 
        agreement.status === 'active' &&
        agreement.parties.includes(playerId)
      );
  }

  /**
   * Check if two players are allies
   */
  public areAllies(player1: PlayerId, player2: PlayerId): boolean {
    return Array.from(this.agreements.values()).some(agreement =>
      agreement.type === 'alliance' &&
      agreement.status === 'active' &&
      agreement.parties.includes(player1) &&
      agreement.parties.includes(player2)
    );
  }

  /**
   * Calculate diplomatic strength of an alliance
   */
  public calculateAllianceStrength(players: PlayerId[]): number {
    let strength = 0;

    // Base strength from number of allies
    strength += players.length * 100;

    // Add trust bonuses
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const relation = this.getRelation(players[i], players[j]);
        strength += Math.max(0, relation.trust);
      }
    }

    // Add bonuses for long-term alliances
    const allianceAgreements = Array.from(this.agreements.values())
      .filter(a => 
        a.type === 'alliance' &&
        a.status === 'active' &&
        players.every(p => a.parties.includes(p))
      );

    allianceAgreements.forEach(alliance => {
      const duration = (Date.now() - alliance.startTime.getTime()) / (1000 * 60 * 60 * 24); // days
      strength += Math.min(500, duration * 10); // Max 500 points from duration
    });

    return strength;
  }

  /**
   * Log a diplomatic action
   */
  private logAction(action: DiplomaticAction): void {
    this.actionHistory.push(action);
    
    // Emit game event
    const event: GameEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: GameEventType.DIPLOMATIC_ACTION,
      data: { action },
      visibility: EventVisibility.PUBLIC
    };

    this.emit('diplomaticAction', event);
  }

  /**
   * Get diplomatic relation status
   */
  public getRelationStatus(
    player1: PlayerId,
    player2: PlayerId
  ): {
    trust: number;
    agreements: DiplomaticAgreement[];
    recentActions: DiplomaticAction[];
  } {
    const relation = this.getRelation(player1, player2);
    const agreements = this.getActiveAgreements(player1)
      .filter(a => a.parties.includes(player2));
    const recentActions = this.actionHistory
      .filter(a => 
        (a.sourceId === player1 && a.targetId === player2) ||
        (a.sourceId === player2 && a.targetId === player1)
      )
      .slice(-10); // Last 10 actions

    return {
      trust: relation.trust,
      agreements,
      recentActions
    };
  }

  /**
   * Update diplomatic state
   */
  public update(gameState: GameState): void {
    // Process expired agreements
    for (const agreement of this.agreements.values()) {
      if (agreement.status === 'active' && 
          agreement.endTime && 
          agreement.endTime <= new Date()) {
        agreement.status = 'expired';
        this.emit('agreementExpired', agreement);
      }
    }

    // Decay trust over time
    for (const [key, relation] of this.relations) {
      const daysSinceInteraction = 
        (Date.now() - relation.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceInteraction > 7) { // Start decay after a week
        const decay = Math.floor(daysSinceInteraction / 7) * -1;
        this.modifyTrust(
          key.split(':')[0] as PlayerId,
          key.split(':')[1] as PlayerId,
          decay
        );
      }
    }
  }

  /**
   * Get diplomatic metrics
   */
  public getDiplomaticMetrics(): {
    totalAgreements: number;
    activeAlliances: number;
    averageTrust: number;
    mostTrusted: { players: [PlayerId, PlayerId]; trust: number; };
  } {
    const activeAgreements = Array.from(this.agreements.values())
      .filter(a => a.status === 'active');

    const allTrust = Array.from(this.relations.values())
      .map(r => r.trust);

    const mostTrustedRelation = Array.from(this.relations.entries())
      .reduce((max, [key, relation]) => 
        relation.trust > (max ? max.relation.trust : -Infinity)
          ? { key, relation }
          : max
      , null as { key: string; relation: DiplomaticRelation; } | null);

    return {
      totalAgreements: activeAgreements.length,
      activeAlliances: activeAgreements.filter(a => a.type === 'alliance').length,
      averageTrust: allTrust.reduce((sum, trust) => sum + trust, 0) / allTrust.length,
      mostTrusted: mostTrustedRelation ? {
        players: mostTrustedRelation.key.split(':') as [PlayerId, PlayerId],
        trust: mostTrustedRelation.relation.trust
      } : { players: ['', ''] as [PlayerId, PlayerId], trust: 0 }
    };
  }
}