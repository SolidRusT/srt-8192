import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

interface EnvSchema {
    [key: string]: {
        required: boolean;
        type: 'string' | 'number' | 'boolean';
        default?: any;
        validate?: (value: any) => boolean;
    };
}

const baseSchema: EnvSchema = {
    NODE_ENV: {
        required: true,
        type: 'string',
        validate: (value) => ['development', 'production', 'test'].includes(value)
    },
    PORT: {
        required: true,
        type: 'number',
        validate: (value) => value > 0 && value < 65536
    },
    LOG_LEVEL: {
        required: false,
        type: 'string',
        default: 'info',
        validate: (value) => ['error', 'warn', 'info', 'debug'].includes(value)
    }
};

export async function validateEnvironment(additionalSchema: EnvSchema = {}): Promise<void> {
    // Load environment variables based on NODE_ENV
    const envFile = process.env.NODE_ENV === 'production' 
        ? '.env.production'
        : process.env.NODE_ENV === 'test'
            ? '.env.test'
            : '.env.development';

    try {
        const envPath = path.resolve(process.cwd(), envFile);
        const envConfig = dotenv.parse(await fs.readFile(envPath));
        
        // Merge with process.env
        for (const key in envConfig) {
            if (!(key in process.env)) {
                process.env[key] = envConfig[key];
            }
        }
    } catch (error) {
        throw new Error(`Failed to load ${envFile}: ${error.message}`);
    }

    // Combine base schema with additional schema
    const schema = { ...baseSchema, ...additionalSchema };

    // Validate all environment variables
    const errors: string[] = [];

    for (const [key, config] of Object.entries(schema)) {
        let value = process.env[key];

        // Check if required
        if (config.required && !value) {
            errors.push(`Missing required environment variable: ${key}`);
            continue;
        }

        // Use default if value is not set
        if (!value && 'default' in config) {
            process.env[key] = String(config.default);
            value = String(config.default);
        }

        if (value) {
            // Type validation
            try {
                switch (config.type) {
                    case 'number':
                        const num = Number(value);
                        if (isNaN(num)) throw new Error(`${key} must be a number`);
                        process.env[key] = String(num);
                        break;
                    case 'boolean':
                        const bool = value.toLowerCase();
                        if (!['true', 'false'].includes(bool)) {
                            throw new Error(`${key} must be a boolean`);
                        }
                        process.env[key] = bool;
                        break;
                    case 'string':
                        // Already a string
                        break;
                }

                // Custom validation
                if (config.validate && !config.validate(value)) {
                    errors.push(`Invalid value for ${key}: ${value}`);
                }
            } catch (error) {
                errors.push(error.message);
            }
        }
    }

    if (errors.length > 0) {
        throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }
}