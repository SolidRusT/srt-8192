// src/world/EventManager.ts
import { PlayerId, RegionId, ResourceCost } from '../types';

export enum EventType {
  NATURAL_DISASTER = 'natural_disaster',
  ECONOMIC_CRISIS = 'economic_crisis',
  POLITICAL_UPRISING = 'political_uprising',
  TECHNOLOGICAL_BREAKTHROUGH = 'technological_breakthrough',
  DIPLOMATIC_INCIDENT = 'diplomatic_incident',
}

export interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  duration: number; // turns
  affectedRegions: RegionId[];
  affectedPlayers: PlayerId[];
  resourceImpact: Partial<ResourceCost>;
  probability: number; // 0-1
  severity: number; // 1-5
}

export class EventManager {
  private activeEvents: Map<string, GameEvent> = new Map();
  private eventHistory: GameEvent[] = [];
  private turnCounter: number = 0;

  constructor(
    private readonly worldStateManager: any, // Replace 'any' with actual WorldStateManager type
    private readonly resourceManager: any,   // Replace 'any' with actual ResourceManager type
  ) {}

  public update(turn: number): void {
    this.turnCounter = turn;
    this.processActiveEvents();
    this.generateNewEvents();
  }

  private processActiveEvents(): void {
    for (const [eventId, event] of this.activeEvents) {
      if (this.isEventExpired(event)) {
        this.resolveEvent(event);
        this.activeEvents.delete(eventId);
        this.eventHistory.push(event);
      }
    }
  }

  private generateNewEvents(): void {
    // Calculate base probability modified by world state
    const baseProbability = this.calculateEventProbability();
    
    Object.values(EventType).forEach(eventType => {
      if (Math.random() < baseProbability) {
        const newEvent = this.createEvent(eventType);
        this.triggerEvent(newEvent);
      }
    });
  }

  private calculateEventProbability(): number {
    // Base probability increases with turn count and current world tension
    const baseProbability = 0.05;
    const turnModifier = Math.min(this.turnCounter / 100, 0.2);
    // Add additional modifiers based on game state
    return baseProbability + turnModifier;
  }

  private createEvent(type: EventType): GameEvent {
    // Template events based on type
    const templates: Record<EventType, Partial<GameEvent>> = {
      [EventType.NATURAL_DISASTER]: {
        name: 'Natural Disaster',
        description: 'A devastating natural event affects the region',
        duration: 3,
        resourceImpact: { materials: -20, morale: -10 },
        severity: 4,
      },
      // Add other event templates...
    };

    const template = templates[type];
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      affectedRegions: this.determineAffectedRegions(type),
      affectedPlayers: this.determineAffectedPlayers(type),
      probability: this.calculateEventProbability(),
      ...template,
    } as GameEvent;
  }

  private determineAffectedRegions(type: EventType): RegionId[] {
    // Logic to determine which regions are affected based on event type
    // This should interact with WorldStateManager
    return [];
  }

  private determineAffectedPlayers(type: EventType): PlayerId[] {
    // Logic to determine which players are affected based on event type
    // This should interact with WorldStateManager
    return [];
  }

  private triggerEvent(event: GameEvent): void {
    this.activeEvents.set(event.id, event);
    this.applyEventEffects(event);
  }

  private applyEventEffects(event: GameEvent): void {
    // Apply immediate effects of the event
    if (event.resourceImpact) {
      event.affectedPlayers.forEach(playerId => {
        // Apply resource impacts through ResourceManager
      });
    }
  }

  private resolveEvent(event: GameEvent): void {
    // Clean up any lingering effects when event expires
  }

  private isEventExpired(event: GameEvent): boolean {
    return this.turnCounter >= event.duration;
  }

  // Public methods for other systems to interact with events
  public getActiveEvents(): GameEvent[] {
    return Array.from(this.activeEvents.values());
  }

  public getEventHistory(): GameEvent[] {
    return this.eventHistory;
  }

  public getActiveEventsForRegion(regionId: RegionId): GameEvent[] {
    return this.getActiveEvents().filter(event => 
      event.affectedRegions.includes(regionId)
    );
  }

  public getActiveEventsForPlayer(playerId: PlayerId): GameEvent[] {
    return this.getActiveEvents().filter(event => 
      event.affectedPlayers.includes(playerId)
    );
  }
}