import express, { Express, Request, Response, NextFunction } from 'express';
import { Logger } from './utils/logger';
import { HealthStatus, ServiceHealth, DependencyHealth } from './types/health';
import { validateEnvironment } from './utils/environment';
import { ServiceConfig } from './types/config';

export abstract class BaseService {
    protected app: Express;
    protected logger: Logger;
    protected serviceName: string;
    protected version: string;
    protected dependencies: Map<string, DependencyHealth>;
    protected status: ServiceHealth;
    
    constructor(config: ServiceConfig) {
        this.serviceName = config.serviceName;
        this.version = config.version;
        this.logger = new Logger(this.serviceName);
        this.dependencies = new Map();
        this.status = {
            status: HealthStatus.Starting,
            uptime: 0,
            startTime: Date.now(),
            lastChecked: Date.now(),
            message: 'Service is starting',
            dependencies: {}
        };

        // Initialize Express application
        this.app = express();
        this.setupMiddleware();
        this.setupHealthCheck();
    }

    /**
     * Sets up basic middleware for all services
     */
    private setupMiddleware(): void {
        // Basic security headers
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });

        // Request logging
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            this.logger.info(`${req.method} ${req.path}`);
            next();
        });

        // JSON parsing
        this.app.use(express.json());
    }

    /**
     * Sets up the health check endpoint
     */
    private setupHealthCheck(): void {
        this.app.get('/health', async (req: Request, res: Response) => {
            const health = await this.getHealthStatus();
            const statusCode = health.status === HealthStatus.Healthy ? 200 : 
                             health.status === HealthStatus.Degraded ? 200 : 503;
            
            res.status(statusCode).json(health);
        });

        // Detailed health check for internal monitoring
        this.app.get('/health/details', async (req: Request, res: Response) => {
            const health = await this.getDetailedHealthStatus();
            res.json(health);
        });
    }

    /**
     * Registers a dependency for health monitoring
     */
    protected registerDependency(name: string, checkFn: () => Promise<boolean>): void {
        this.dependencies.set(name, {
            name,
            status: HealthStatus.Unknown,
            lastChecked: Date.now(),
            checkHealth: checkFn
        });
    }

    /**
     * Updates the service status
     */
    protected updateStatus(status: HealthStatus, message?: string): void {
        this.status = {
            ...this.status,
            status,
            lastChecked: Date.now(),
            message: message || this.status.message
        };
    }

    /**
     * Gets the current health status
     */
    protected async getHealthStatus(): Promise<ServiceHealth> {
        const now = Date.now();
        this.status.uptime = Math.floor((now - this.status.startTime) / 1000);
        this.status.lastChecked = now;

        // Check dependencies
        let degraded = false;
        for (const [name, dep] of this.dependencies) {
            try {
                const isHealthy = await dep.checkHealth();
                dep.status = isHealthy ? HealthStatus.Healthy : HealthStatus.Unhealthy;
                dep.lastChecked = now;
                
                if (!isHealthy) {
                    degraded = true;
                }
            } catch (error) {
                dep.status = HealthStatus.Unhealthy;
                dep.lastChecked = now;
                degraded = true;
            }

            this.status.dependencies[name] = dep.status;
        }

        // Update overall status based on dependencies
        if (degraded && this.status.status === HealthStatus.Healthy) {
            this.updateStatus(HealthStatus.Degraded, 'One or more dependencies are unhealthy');
        } else if (!degraded && this.status.status === HealthStatus.Degraded) {
            this.updateStatus(HealthStatus.Healthy, 'Service is healthy');
        }

        return this.status;
    }

    /**
     * Gets detailed health status including dependency details
     */
    protected async getDetailedHealthStatus(): Promise<ServiceHealth & { details: any }> {
        const health = await this.getHealthStatus();
        return {
            ...health,
            details: {
                environment: process.env.NODE_ENV,
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                dependencies: Array.from(this.dependencies.values()).map(dep => ({
                    name: dep.name,
                    status: dep.status,
                    lastChecked: dep.lastChecked
                }))
            }
        };
    }

    /**
     * Initializes the service
     */
    public async init(): Promise<void> {
        try {
            // Validate environment variables
            await validateEnvironment();

            // Initialize custom service logic
            await this.initialize();

            // Update status to healthy if initialization succeeds
            this.updateStatus(HealthStatus.Healthy, 'Service initialized successfully');
        } catch (error) {
            this.updateStatus(HealthStatus.Unhealthy, `Initialization failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Custom initialization logic to be implemented by each service
     */
    protected abstract initialize(): Promise<void>;

    /**
     * Starts the service
     */
    public async start(): Promise<void> {
        const port = process.env.PORT || 3000;
        
        try {
            await this.init();
            this.app.listen(port, () => {
                this.logger.info(`${this.serviceName} listening on port ${port}`);
            });
        } catch (error) {
            this.logger.error(`Failed to start ${this.serviceName}: ${error.message}`);
            process.exit(1);
        }
    }
}