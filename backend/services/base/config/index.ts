export * from './environment';
export { default as config } from './environment';

// Re-export common types that might be needed
export type {
  BaseServiceEnv,
  CommonEnv,
  MongoDBEnv,
  RedisEnv,
  HealthCheckEnv,
  SecurityEnv,
  DependencyEnv,
} from '@shared/env-validator/types';