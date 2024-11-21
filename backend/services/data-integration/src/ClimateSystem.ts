import { EventEmitter } from 'events';
import {
  RegionId,
  ServerRegion,
  ResourceCost,
  WeatherCondition,
  WorldState,
  GameEvent,
  GameEventType,
  EventVisibility,
  ResourceType
} from '../../game-logic-service/types';

export interface ClimateEffect {
  type: 'temperature' | 'weather' | 'disaster';
  severity: number;
  regions: RegionId[];
  resourceImpact: Partial<ResourceCost>;
  duration: number; // in seconds
}

interface ClimateConfig {
  baseTemperature: number;
  temperatureVariance: number;
  disasterProbability: number;
  weatherChangeProbability: number;
  updateInterval: number; // in milliseconds
}

export class ClimateSystem extends EventEmitter {
  private currentEffects: Map<string, ClimateEffect>;
  private readonly config: ClimateConfig;
  private updateInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<ClimateConfig>) {
    super();
    this.currentEffects = new Map();
    this.config = {
      baseTemperature: 20,
      temperatureVariance: 10,
      disasterProbability: 0.01,
      weatherChangeProbability: 0.1,
      updateInterval: 60000, // 1 minute
      ...config
    };
    this.updateInterval = null;
  }

  /**
   * Start climate system updates
   */
  public start(): void {
    if (!this.updateInterval) {
      this.updateInterval = setInterval(
        () => this.updateClimate(),
        this.config.updateInterval
      );
    }
  }

  /**
   * Stop climate system updates
   */
  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update climate conditions
   */
  private updateClimate(): void {
    // Update temperature
    const newTemperature = this.calculateNewTemperature();

    // Check for new weather events
    if (Math.random() < this.config.weatherChangeProbability) {
      this.generateWeatherEvent(newTemperature);
    }

    // Check for natural disasters
    if (Math.random() < this.config.disasterProbability) {
      this.generateDisaster(newTemperature);
    }

    // Remove expired effects
    this.removeExpiredEffects();

    // Emit climate update event
    this.emit('climateUpdated', this.getClimateState());
  }

  /**
   * Calculate new temperature based on various factors
   */
  private calculateNewTemperature(): number {
    const seasonalVariation = Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 365) * Math.PI * 2);
    const randomVariation = (Math.random() - 0.5) * 2;
    
    return this.config.baseTemperature + 
      (seasonalVariation * this.config.temperatureVariance * 0.5) +
      (randomVariation * this.config.temperatureVariance * 0.2);
  }

  /**
   * Generate a new weather event
   */
  private generateWeatherEvent(currentTemperature: number): void {
    const weatherTypes = this.determineWeatherTypes(currentTemperature);
    const selectedType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    const effect: ClimateEffect = {
      type: 'weather',
      severity: 0.3 + Math.random() * 0.7, // 0.3 to 1.0
      regions: this.selectAffectedRegions(),
      resourceImpact: this.calculateWeatherImpact(selectedType),
      duration: 1800 + Math.random() * 3600 // 30-90 minutes
    };

    const effectId = `weather_${Date.now()}`;
    this.currentEffects.set(effectId, effect);
    this.emitClimateEvent(effect);
  }

  /**
   * Generate a natural disaster
   */
  private generateDisaster(currentTemperature: number): void {
    const disasterTypes = this.determineDisasterTypes(currentTemperature);
    const selectedType = disasterTypes[Math.floor(Math.random() * disasterTypes.length)];
    
    const effect: ClimateEffect = {
      type: 'disaster',
      severity: 0.7 + Math.random() * 0.3, // 0.7 to 1.0
      regions: this.selectAffectedRegions(),
      resourceImpact: this.calculateDisasterImpact(selectedType),
      duration: 3600 + Math.random() * 7200 // 1-3 hours
    };

    const effectId = `disaster_${Date.now()}`;
    this.currentEffects.set(effectId, effect);
    this.emitClimateEvent(effect);
  }

  /**
   * Determine possible weather types based on temperature
   */
  private determineWeatherTypes(temperature: number): WeatherCondition[] {
    if (temperature > 30) {
      return ['EXTREME_HEAT', 'ELECTROMAGNETIC_STORM'];
    } else if (temperature < 10) {
      return ['EXTREME_COLD', 'STORMY'];
    }
    return ['CLEAR', 'STORMY'];
  }

  /**
   * Determine possible disaster types based on temperature
   */
  private determineDisasterTypes(temperature: number): string[] {
    if (temperature > 30) {
      return ['drought', 'wildfire'];
    } else if (temperature < 10) {
      return ['blizzard', 'ice_storm'];
    }
    return ['earthquake', 'flood'];
  }

  /**
   * Calculate resource impact from weather
   */
  private calculateWeatherImpact(weatherType: string): Partial<ResourceCost> {
    const impact: Partial<ResourceCost> = {};

    switch (weatherType) {
      case 'EXTREME_HEAT':
        impact[ResourceType.ENERGY] = -0.3;
        impact[ResourceType.MATERIALS] = -0.2;
        break;
      case 'EXTREME_COLD':
        impact[ResourceType.ENERGY] = -0.4;
        impact[ResourceType.MORALE] = -0.2;
        break;
      case 'ELECTROMAGNETIC_STORM':
        impact[ResourceType.TECHNOLOGY] = -0.5;
        impact[ResourceType.INTELLIGENCE] = -0.3;
        break;
      case 'STORMY':
        impact[ResourceType.MATERIALS] = -0.2;
        impact[ResourceType.ENERGY] = -0.1;
        break;
    }

    return impact;
  }

  /**
   * Calculate resource impact from disasters
   */
  private calculateDisasterImpact(disasterType: string): Partial<ResourceCost> {
    const impact: Partial<ResourceCost> = {};

    switch (disasterType) {
      case 'drought':
        impact[ResourceType.MATERIALS] = -0.5;
        impact[ResourceType.MORALE] = -0.3;
        break;
      case 'wildfire':
        impact[ResourceType.MATERIALS] = -0.6;
        impact[ResourceType.ENERGY] = -0.4;
        break;
      case 'earthquake':
        impact[ResourceType.MATERIALS] = -0.7;
        impact[ResourceType.TECHNOLOGY] = -0.4;
        break;
      case 'flood':
        impact[ResourceType.MATERIALS] = -0.5;
        impact[ResourceType.ENERGY] = -0.3;
        impact[ResourceType.MORALE] = -0.2;
        break;
    }

    return impact;
  }

  /**
   * Select regions to be affected by climate event
   */
  private selectAffectedRegions(): RegionId[] {
    // This would be implemented to select adjacent or related regions
    // based on the game's geography system
    return ['region-1', 'region-2'] as RegionId[];
  }

  /**
   * Remove expired climate effects
   */
  private removeExpiredEffects(): void {
    const now = Date.now();
    for (const [id, effect] of this.currentEffects.entries()) {
      if (now > effect.duration * 1000) {
        this.currentEffects.delete(id);
        this.emit('effectExpired', effect);
      }
    }
  }

  /**
   * Apply climate effects to regions
   */
  public applyClimateEffects(regions: Map<RegionId, ServerRegion>): void {
    for (const effect of this.currentEffects.values()) {
      effect.regions.forEach(regionId => {
        const region = regions.get(regionId);
        if (region) {
          this.applyEffectToRegion(effect, region);
        }
      });
    }
  }

  /**
   * Apply climate effect to a specific region
   */
  private applyEffectToRegion(effect: ClimateEffect, region: ServerRegion): void {
    // Apply resource impacts
    Object.entries(effect.resourceImpact).forEach(([resource, impact]) => {
      const currentProduction = region.resources[resource];
      region.resources[resource] = currentProduction * (1 + impact);
    });

    // Apply other effects based on type
    if (effect.type === 'disaster') {
      region.population *= (1 - effect.severity * 0.1); // Population impact
      region.productionCapacity *= (1 - effect.severity * 0.2); // Production impact
    }
  }

  /**
   * Get current climate state
   */
  public getClimateState(): {
    temperature: number;
    activeEffects: ClimateEffect[];
  } {
    return {
      temperature: this.calculateNewTemperature(),
      activeEffects: Array.from(this.currentEffects.values())
    };
  }

  /**
   * Emit climate event
   */
  private emitClimateEvent(effect: ClimateEffect): void {
    const event: GameEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: GameEventType.WORLD_EVENT,
      data: { effect },
      visibility: EventVisibility.PUBLIC
    };

    this.emit('climateEvent', event);
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stop();
    this.currentEffects.clear();
  }
}