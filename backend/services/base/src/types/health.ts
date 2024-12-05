export enum HealthStatus {
    Healthy = 'healthy',
    Degraded = 'degraded',
    Unhealthy = 'unhealthy',
    Starting = 'starting',
    Unknown = 'unknown'
}

export interface DependencyHealth {
    name: string;
    status: HealthStatus;
    lastChecked: number;
    checkHealth: () => Promise<boolean>;
}

export interface ServiceHealth {
    status: HealthStatus;
    uptime: number;
    startTime: number;
    lastChecked: number;
    message: string;
    dependencies: Record<string, HealthStatus>;
}