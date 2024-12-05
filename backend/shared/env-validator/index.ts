import { z } from 'zod';

// Basic environment variable types
const StringVar = z.string();
const NumberVar = z.string().transform((val) => parseInt(val, 10));
const BooleanVar = z.string().transform((val) => val.toLowerCase() === 'true');
const ArrayVar = z.string().transform((val) => val.split(',').map((v) => v.trim()));

// Common validation schemas
export const CommonEnvSchema = z.object({
  // Service Identity
  NODE_ENV: z.enum(['development', 'test', 'production']),
  SERVICE_NAME: StringVar,
  SERVICE_VERSION: StringVar,
  PORT: NumberVar,
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']),

  // Resource Limits
  MEMORY_LIMIT: StringVar,
  CPU_LIMIT: StringVar.transform((val) => parseFloat(val)),

  // Development Settings
  DEBUG_MODE: BooleanVar.optional().default('false'),
  ENABLE_HOT_RELOAD: BooleanVar.optional().default('false'),
});

// Database connection schemas
export const MongoDBSchema = z.object({
  MONGODB_URI: StringVar,
  MONGODB_USER: StringVar,
  MONGODB_PASSWORD: StringVar,
});

export const RedisSchema = z.object({
  REDIS_URI: StringVar,
  REDIS_PASSWORD: StringVar.optional(),
});

// Health check schema
export const HealthCheckSchema = z.object({
  HEALTH_CHECK_INTERVAL: StringVar,
  HEALTH_CHECK_TIMEOUT: StringVar,
  HEALTH_CHECK_RETRIES: NumberVar,
});

// Security schema
export const SecuritySchema = z.object({
  JWT_SECRET: StringVar,
  CORS_ALLOWED_ORIGINS: ArrayVar,
});

// Service dependency schema
export const DependencySchema = z.object({
  WAIT_FOR_SERVICES: ArrayVar,
});

/**
 * Validates environment variables against a schema
 * @param schema Zod schema to validate against
 * @param env Environment object to validate
 * @returns Validated and transformed environment object
 */
export function validateEnv<T extends z.ZodTypeAny>(
  schema: T,
  env: NodeJS.ProcessEnv = process.env
): z.infer<T> {
  try {
    return schema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('Unexpected error during environment validation:', error);
    }
    process.exit(1);
  }
}

/**
 * Creates a composite schema from multiple partial schemas
 * @param schemas Array of Zod schemas to combine
 * @returns Combined schema
 */
export function createEnvSchema(...schemas: z.ZodTypeAny[]): z.ZodTypeAny {
  return schemas.reduce((acc, schema) => acc.merge(schema), z.object({}));
}

/**
 * Utility to generate .env.example content from a schema
 * @param schema Zod schema to generate example from
 * @returns Formatted .env.example content
 */
export function generateEnvExample(schema: z.ZodTypeAny): string {
  const shape = schema._def.shape();
  let example = '# Environment Configuration\n\n';

  let currentSection = '';
  for (const [key, value] of Object.entries(shape)) {
    // Detect section from key prefix
    const newSection = key.split('_')[0];
    if (newSection !== currentSection) {
      currentSection = newSection;
      example += `\n# ${currentSection} Configuration\n`;
    }

    // Add description based on field type
    const type = value._def.typeName;
    const optional = value.isOptional();
    example += `# Type: ${type}${optional ? ' (optional)' : ''}\n`;

    // Generate example value based on type
    let exampleValue = '';
    switch (type) {
      case 'ZodString':
        exampleValue = 'example-value';
        break;
      case 'ZodNumber':
        exampleValue = '8080';
        break;
      case 'ZodBoolean':
        exampleValue = 'false';
        break;
      case 'ZodArray':
        exampleValue = 'value1,value2,value3';
        break;
      case 'ZodEnum':
        exampleValue = value._def.values.join('|');
        break;
      default:
        exampleValue = 'value';
    }

    example += `${key}=${exampleValue}\n`;
  }

  return example;
}
