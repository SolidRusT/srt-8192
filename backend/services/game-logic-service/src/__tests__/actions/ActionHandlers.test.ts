import { ResourceCollectionAction } from '../../core/actions/ResourceCollectionAction';
import { CombatAction } from '../../core/actions/CombatAction';
import { ResearchAction } from '../../core/actions/ResearchAction';
import { DiplomacyAction } from '../../core/actions/DiplomacyAction';
import { createTestContext, createTestAction } from '../helpers/testData';

describe('Action Handlers', () => {
  describe('ResourceCollectionAction', () => {
    let handler: ResourceCollectionAction;

    beforeEach(() => {
      handler = new ResourceCollectionAction();
    });

    it('should validate resource collection parameters', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('COLLECT_RESOURCE', {
        resourceType: 'energy',
        territoryId: 'territory1',
        amount: 100
      });

      const isValid = await handler.validate(action, context);
      expect(isValid).toBe(true);
    });

    it('should fail validation if territory is not owned', async () => {
      const context = createTestContext('player1', {
        playerState: {
          ...createTestContext('player1').playerState,
          territories: []
        }
      });

      const action = createTestAction('COLLECT_RESOURCE', {
        resourceType: 'energy',
        territoryId: 'territory1',
        amount: 100
      });

      const isValid = await handler.validate(action, context);
      expect(isValid).toBe(false);
    });

    it('should execute resource collection successfully', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('COLLECT_RESOURCE', {
        resourceType: 'energy',
        territoryId: 'territory1',
        amount: 100
      });

      const result = await handler.execute(action, context);
      expect(result.success).toBe(true);
      expect(result.changes.resources.energy).toBeGreaterThan(context.playerState.resources.energy);
      expect(result.changes.turnsRemaining).toBe(context.playerState.turnsRemaining - handler.getCost(action));
    });
  });

  describe('CombatAction', () => {
    let handler: CombatAction;

    beforeEach(() => {
      handler = new CombatAction();
    });

    it('should validate combat parameters', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('COMBAT', {
        targetTerritoryId: 'territory2',
        attackingUnits: ['unit1', 'unit2'],
        combatType: 'ATTACK'
      });

      const isValid = await handler.validate(action, context);
      expect(isValid).toBe(true);
    });

    it('should fail validation if attacking units are not owned', async () => {
      const context = createTestContext('player1', {
        playerState: {
          ...createTestContext('player1').playerState,
          units: []
        }
      });

      const action = createTestAction('COMBAT', {
        targetTerritoryId: 'territory2',
        attackingUnits: ['unit1', 'unit2'],
        combatType: 'ATTACK'
      });

      const isValid = await handler.validate(action, context);
      expect(isValid).toBe(false);
    });

    it('should execute combat with appropriate resource costs', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('COMBAT', {
        targetTerritoryId: 'territory2',
        attackingUnits: ['unit1', 'unit2'],
        combatType: 'ATTACK'
      });

      const result = await handler.execute(action, context);
      expect(result.success).toBe(true);
      expect(result.changes.resources.energy).toBeLessThan(context.playerState.resources.energy);
      expect(result.changes.turnsRemaining).toBe(context.playerState.turnsRemaining - handler.getCost(action));
    });
  });

  describe('ResearchAction', () => {
    let handler: ResearchAction;

    beforeEach(() => {
      handler = new ResearchAction();
    });

    it('should validate research parameters', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('RESEARCH', {
        technologyType: 'MILITARY',
        investmentAmount: 100
      });

      const isValid = await handler.validate(action, context);
      expect(isValid).toBe(true);
    });

    it('should fail validation if investment amount exceeds available energy', async () => {
      const context = createTestContext('player1', {
        playerState: {
          ...createTestContext('player1').playerState,
          resources: { ...createTestContext('player1').playerState.resources, energy: 50 }
        }
      });

      const action = createTestAction('RESEARCH', {
        technologyType: 'MILITARY',
        investmentAmount: 100
      });

      const isValid = await handler.validate(action, context);
      expect(isValid).toBe(false);
    });

    it('should execute research with appropriate technology gain', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('RESEARCH', {
        technologyType: 'MILITARY',
        investmentAmount: 100
      });

      const result = await handler.execute(action, context);
      expect(result.success).toBe(true);
      expect(result.changes.resources.technology).toBeGreaterThan(context.playerState.resources.technology);
      expect(result.changes.resources.energy).toBeLessThan(context.playerState.resources.energy);
      expect(result.changes.turnsRemaining).toBe(context.playerState.turnsRemaining - handler.getCost(action));
    });
  });

  describe('DiplomacyAction', () => {
    let handler: DiplomacyAction;

    beforeEach(() => {
      handler = new DiplomacyAction();
    });

    it('should validate alliance proposal', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('DIPLOMACY', {
        actionType: 'PROPOSE_ALLIANCE',
        targetPlayerId: 'player2',
        terms: {
          resourceSharing: true,
          mutualDefense: true
        }
      });

      const isValid = await handler.validate(action, context);
      expect(isValid).toBe(true);
    });

    it('should fail validation for self-alliance', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('DIPLOMACY', {
        actionType: 'PROPOSE_ALLIANCE',
        targetPlayerId: 'player1',
        terms: {
          resourceSharing: true,
          mutualDefense: true
        }
      });

      const isValid = await handler.validate(action, context);
      expect(isValid).toBe(false);
    });

    it('should execute alliance formation successfully', async () => {
      const context = createTestContext('player1');
      const action = createTestAction('DIPLOMACY', {
        actionType: 'ACCEPT_ALLIANCE',
        targetPlayerId: 'player2',
        terms: {
          resourceSharing: true,
          mutualDefense: true
        }
      });

      const result = await handler.execute(action, context);
      expect(result.success).toBe(true);
      expect(result.changes.alliances).toHaveLength(1);
      expect(result.changes.alliances[0].playerId).toBe('player2');
      expect(result.changes.turnsRemaining).toBe(context.playerState.turnsRemaining - handler.getCost(action));
    });
  });
});
