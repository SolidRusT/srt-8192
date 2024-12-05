# Environment Variable Validator

This module provides a standardized way to validate and manage environment variables across all services in the SRT-8192 backend.

## Features

- Type-safe environment variable validation using Zod schemas
- Predefined schemas for common configuration patterns
- Utility functions for schema composition and validation
- Automatic .env.example generation
- TypeScript type definitions for all schemas

## Usage

### Basic Usage

```typescript
import { validateEnv, CommonEnvSchema } from '@shared/env-validator';

// Validate environment variables
const env = validateEnv(CommonEnvSchema);

// Use validated environment variables
console.log(env.SERVICE_NAME); // Typed as string
console.log(env.PORT); // Typed as number
```

### Combining Schemas

```typescript
import {
  createEnvSchema,
  CommonEnvSchema,
  MongoDBSchema,
  RedisSchema,
} from '@shared/env-validator';

// Create a composite schema for your service
const serviceSchema = createEnvSchema(
  CommonEnvSchema,
  MongoDBSchema,
  RedisSchema
);

// Validate against the composite schema
const env = validateEnv(serviceSchema);
```

### Generating .env.example

```typescript
import { generateEnvExample } from '@shared/env-validator';

// Generate example content for your schema
const exampleContent = generateEnvExample(serviceSchema);

// Write to file or use as needed
fs.writeFileSync('.env.example', exampleContent);
```

## Available Schemas

### CommonEnvSchema
Basic service configuration:
- NODE_ENV
- SERVICE_NAME
- SERVICE_VERSION
- PORT
- LOG_LEVEL
- MEMORY_LIMIT
- CPU_LIMIT
- DEBUG_MODE
- ENABLE_HOT_RELOAD

### MongoDBSchema
MongoDB connection settings:
- MONGODB_URI
- MONGODB_USER
- MONGODB_PASSWORD

### RedisSchema
Redis connection settings:
- REDIS_URI
- REDIS_PASSWORD

### HealthCheckSchema
Health check configuration:
- HEALTH_CHECK_INTERVAL
- HEALTH_CHECK_TIMEOUT
- HEALTH_CHECK_RETRIES

### SecuritySchema
Security settings:
- JWT_SECRET
- CORS_ALLOWED_ORIGINS

### DependencySchema
Service dependencies:
- WAIT_FOR_SERVICES

## Creating Custom Schemas

You can create custom schemas for service-specific environment variables:

```typescript
import { z } from 'zod';
import { createEnvSchema, CommonEnvSchema } from '@shared/env-validator';

const GameServiceSchema = z.object({
  GAME_SPECIFIC_VAR: z.string(),
  ANOTHER_VAR: z.number(),
});

const fullSchema = createEnvSchema(CommonEnvSchema, GameServiceSchema);
```

## Type Safety

The module provides TypeScript types for all schemas and their combinations. Import types from `@shared/env-validator/types`:

```typescript
import type { BaseServiceEnv } from '@shared/env-validator/types';

// Use the type for your service's environment
const env: BaseServiceEnv = validateEnv(serviceSchema);
```

## Best Practices

1. Always validate environment variables at service startup
2. Use the provided schema composition utilities
3. Keep service-specific variables in separate schemas
4. Generate and maintain up-to-date .env.example files
5. Document any custom environment variables
6. Use type definitions for better development experience

## Error Handling

The validator will:
1. Log detailed validation errors
2. Exit the process on validation failure
3. Provide type-safe access to validated variables