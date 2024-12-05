import { writeFileSync } from 'fs';
import { join } from 'path';
import {
  CommonEnvSchema,
  MongoDBSchema,
  RedisSchema,
  HealthCheckSchema,
  SecuritySchema,
  DependencySchema,
  createEnvSchema,
  generateEnvExample,
} from '../shared/env-validator';

// Define the services and their schemas
const services = {
  base: createEnvSchema(
    CommonEnvSchema,
    MongoDBSchema,
    RedisSchema,
    HealthCheckSchema,
    SecuritySchema,
    DependencySchema
  ),
  // Add other services here as they're created
};

// Generate .env.example files for each service
Object.entries(services).forEach(([serviceName, schema]) => {
  const exampleContent = generateEnvExample(schema);
  const outputPath = join(__dirname, '..', 'services', serviceName, '.env.example');
  
  try {
    writeFileSync(outputPath, exampleContent);
    console.log(`Generated .env.example for ${serviceName} service at ${outputPath}`);
  } catch (error) {
    console.error(`Error generating .env.example for ${serviceName}:`, error);
  }
});

// Also generate a master .env.example in the backend root
const masterExample = `# SRT-8192 Backend Environment Configuration
# This is a master example file showing all possible environment variables.
# Each service uses a subset of these variables as defined in their individual .env.example files.

${generateEnvExample(createEnvSchema(...Object.values(services)))}`;

try {
  writeFileSync(join(__dirname, '..', '.env.example'), masterExample);
  console.log('Generated master .env.example in backend root');
} catch (error) {
  console.error('Error generating master .env.example:', error);
}