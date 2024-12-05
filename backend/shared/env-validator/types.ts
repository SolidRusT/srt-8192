import { z } from 'zod';
import {
  CommonEnvSchema,
  MongoDBSchema,
  RedisSchema,
  HealthCheckSchema,
  SecuritySchema,
  DependencySchema,
} from './index';

// Export individual schema types
export type CommonEnv = z.infer<typeof CommonEnvSchema>;
export type MongoDBEnv = z.infer<typeof MongoDBSchema>;
export type RedisEnv = z.infer<typeof RedisSchema>;
export type HealthCheckEnv = z.infer<typeof HealthCheckSchema>;
export type SecurityEnv = z.infer<typeof SecuritySchema>;
export type DependencyEnv = z.infer<typeof DependencySchema>;

// Base service environment type combining all common schemas
export type BaseServiceEnv = CommonEnv &
  MongoDBEnv &
  RedisEnv &
  HealthCheckEnv &
  SecurityEnv &
  DependencyEnv;

// Add service-specific environment types here as needed
// Example:
// export type GameServiceEnv = BaseServiceEnv & {
//   GAME_SPECIFIC_VAR: string;
// };
