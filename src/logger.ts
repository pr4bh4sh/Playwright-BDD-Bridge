import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

export class Logger {
    private static instance: winston.Logger;
    private static logDir: string;

    public static initialize(context: any): winston.Logger {
        if (!Logger.instance) {
            // Create log directory in the extension's log path
            Logger.logDir = path.join(context.logUri.fsPath, 'playwright-gherkin-preview');
            
            // Ensure log directory exists
            if (!fs.existsSync(Logger.logDir)) {
                fs.mkdirSync(Logger.logDir, { recursive: true });
            }

            // Create Winston logger
            Logger.instance = winston.createLogger({
                level: 'debug',
                format: winston.format.combine(
                    winston.format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss'
                    }),
                    winston.format.errors({ stack: true }),
                    winston.format.json()
                ),
                defaultMeta: { service: 'playwright-gherkin-preview' },
                transports: [
                    // File transport for all logs
                    new winston.transports.File({
                        filename: path.join(Logger.logDir, 'extension.log'),
                        level: 'info',
                        format: winston.format.combine(
                            winston.format.timestamp(),
                            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                                return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                            })
                        )
                    }),
                    // Debug file transport
                    new winston.transports.File({
                        filename: path.join(Logger.logDir, 'debug.log'),
                        level: 'debug',
                        format: winston.format.combine(
                            winston.format.timestamp(),
                            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                                return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                            })
                        )
                    }),
                    // Console transport with custom format
                    new winston.transports.Console({
                        level: 'debug',
                        format: winston.format.combine(
                            winston.format.colorize(),
                            winston.format.timestamp(),
                            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                                return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                            })
                        )
                    })
                ]
            });

            // Log initialization
            Logger.instance.info('🚀 Winston logger initialized', { logDir: Logger.logDir });
        }

        return Logger.instance;
    }

    public static getLogger(): winston.Logger {
        if (!Logger.instance) {
            throw new Error('Logger not initialized. Call Logger.initialize() first.');
        }
        return Logger.instance;
    }

    public static info(message: string, meta?: any): void {
        Logger.getLogger().info(message, meta);
    }

    public static debug(message: string, meta?: any): void {
        Logger.getLogger().debug(message, meta);
    }

    public static warn(message: string, meta?: any): void {
        Logger.getLogger().warn(message, meta);
    }

    public static error(message: string, meta?: any): void {
        Logger.getLogger().error(message, meta);
    }
} 