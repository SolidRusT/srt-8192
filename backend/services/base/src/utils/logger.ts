import winston from 'winston';

export class Logger {
    private logger: winston.Logger;

    constructor(serviceName: string) {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.errors({ stack: true }),
                winston.format.metadata()
            ),
            defaultMeta: { service: serviceName },
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        });

        // Add file transport in production
        if (process.env.NODE_ENV === 'production') {
            this.logger.add(
                new winston.transports.File({
                    filename: `/var/log/${serviceName}/error.log`,
                    level: 'error'
                })
            );
            this.logger.add(
                new winston.transports.File({
                    filename: `/var/log/${serviceName}/combined.log`
                })
            );
        }
    }

    info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    error(message: string, error?: Error | any): void {
        this.logger.error(message, { error });
    }

    warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }

    // Add request logging for HTTP requests
    logRequest(req: any, res: any, next: any): void {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            this.info(`${req.method} ${req.originalUrl}`, {
                duration,
                status: res.statusCode,
                userAgent: req.get('user-agent')
            });
        });
        next();
    }
}