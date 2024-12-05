import { BaseService, ServiceConfig } from '@srt-8192/service-base';
import { Request, Response } from 'express';
import axios from 'axios';

export class ExampleService extends BaseService {
    constructor() {
        const config: ServiceConfig = {
            serviceName: 'example-service',
            version: '1.0.0',
            dependencies: [
                {
                    name: 'user-service',
                    url: process.env.USER_SERVICE_URL || 'http://user:5012',
                    required: true
                },
                {
                    name: 'notification-service',
                    url: process.env.NOTIFICATION_SERVICE_URL || 'http://notifications:5007',
                    required: false
                }
            ]
        };
        super(config);
    }

    protected async initialize(): Promise<void> {
        // Register health checks for dependencies
        this.registerDependency('user-service', async () => {
            try {
                const response = await axios.get(`${process.env.USER_SERVICE_URL}/health`);
                return response.status === 200;
            } catch (error) {
                return false;
            }
        });

        this.registerDependency('notification-service', async () => {
            try {
                const response = await axios.get(`${process.env.NOTIFICATION_SERVICE_URL}/health`);
                return response.status === 200;
            } catch (error) {
                // Non-critical dependency can be unhealthy
                return false;
            }
        });

        // Set up routes
        this.setupRoutes();

        this.logger.info('Example service initialized');
    }

    private setupRoutes(): void {
        // Basic example endpoint
        this.app.get('/api/example', (req: Request, res: Response) => {
            res.json({ 
                message: 'Example service is running',
                timestamp: new Date().toISOString()
            });
        });

        // Example error handling
        this.app.get('/api/example/error', (req: Request, res: Response) => {
            throw new Error('Example error');
        });

        // Example async endpoint
        this.app.get('/api/example/async', async (req: Request, res: Response) => {
            try {
                // Simulate some async work
                await new Promise(resolve => setTimeout(resolve, 100));
                res.json({ 
                    message: 'Async operation completed',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.logger.error('Async operation failed', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}