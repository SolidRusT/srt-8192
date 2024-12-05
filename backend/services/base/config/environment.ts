import {
  validateEnv,
  createEnvSchema,
  CommonEnvSchema,
  MongoDBSchema,
  RedisSchema,
  HealthCheckSchema,
  SecuritySchema,
  DependencySchema,
} from '@shared/env-validator';
import type { BaseServiceEnv } from '@shared/env-validator/types';

// Combine all required schemas for the base service
const BaseServiceSchema = createEnvSchema(
  CommonEnvSchema,
  MongoDBSchema,
  RedisSchema,
  HealthCheckSchema,
  SecuritySchema,
  DependencySchema
);

// Validate and export the environment configuration
export const env: BaseServiceEnv = validateEnv(BaseServiceSchema);

// Export specific configurations derived from environment variables
export const serviceConfig = {
  name: env.SERVICE_NAME,
  version: env.SERVICE_VERSION,
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
};

export const mongoConfig = {
  uri: env.MONGODB_URI,
  user: env.MONGODB_USER,
  password: env.MONGODB_PASSWORD,
};

export const redisConfig = {
  uri: env.REDIS_URI,
  password: env.REDIS_PASSWORD,
};

export const healthConfig = {
  interval: env.HEALTH_CHECK_INTERVAL,
  timeout: env.HEALTH_CHECK_TIMEOUT,
  retries: env.HEALTH_CHECK_RETRIES,
};

export const securityConfig = {
  jwtSecret: env.JWT_SECRET,
  corsAllowedOrigins: env.CORS_ALLOWED_ORIGINS,
};

export const resourceConfig = {
  memoryLimit: env.MEMORY_LIMIT,
  cpuLimit: env.CPU_LIMIT,
};

export const dependencyConfig = {
  waitForServices: env.WAIT_FOR_SERVICES,
};

export const developmentConfig = {
  debugMode: env.DEBUG_MODE,
  enableHotReload: env.ENABLE_HOT_RELOAD,
};

// Export a complete config object that includes all configurations
export const config = {
  service: serviceConfig,
  mongo: mongoConfig,
  redis: redisConfig,
  health: healthConfig,
  security: securityConfig,
  resources: resourceConfig,
  dependencies: dependencyConfig,
  development: developmentConfig,
} as const;

// Export default for convenience
export default config;