export interface ServiceConfig {
    serviceName: string;
    version: string;
    port?: number;
    logLevel?: string;
    dependencies?: {
        name: string;
        url: string;
        required: boolean;
    }[];
}