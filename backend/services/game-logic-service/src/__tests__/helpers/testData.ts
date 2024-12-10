import { ObjectId } from 'mongodb';
import { GameActionContext, GameAction } from '../../types/GameState';

export const createTestContext = (
  playerId: string,
  overrides: Partial<GameActionContext> = {}
): GameActionContext => ({
  gameId: new ObjectId(),
  playerId,
  currentCycle: 1,
  playerState: {
    resources: {
      energy: 1000,
      materials: 1000,
      technology: 1,
      intelligence: 0,
      morale: 100
    },
    territories: ['territory1'],
    units: ['unit1', 'unit2'],
    alliances: [],
    pendingAlliances: [],
    turnsRemaining: 50
  },
  gameState: {
    currentPhase: 'ACTION',
    players: [playerId]
  },
  ...overrides
});

export const createTestAction = (
  actionType: string,
  parameters: Record<string, any>,
  overrides: Partial<GameAction> = {}
): GameAction => ({
  _id: new ObjectId(),
  gameId: new ObjectId(),
  playerId: 'testPlayer',
  cycleNumber: 1,
  actionType,
  parameters,
  status: 'pending',
  timestamp: new Date(),
  ...overrides
});
