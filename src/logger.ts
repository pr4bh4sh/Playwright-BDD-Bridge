import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel;
    private static logLevels = {
        'error': 0,
        'warn': 1,
        'info': 2,
        'debug': 3,
        'trace': 4
    };

    public static initialize(context: vscode.ExtensionContext): vscode.OutputChannel {
        if (!Logger.outputChannel) {
            // Create VSCode output channel
            Logger.outputChannel = vscode.window.createOutputChannel('Playwright BDD Bridge');
            context.subscriptions.push(Logger.outputChannel);

            // Log initialization
            Logger.info('🚀 Logger initialized with VS Code OutputChannel');
        }

        return Logger.outputChannel;
    }

    public static getOutputChannel(): vscode.OutputChannel {
        if (!Logger.outputChannel) {
            throw new Error('Logger not initialized. Call Logger.initialize() first.');
        }
        return Logger.outputChannel;
    }

    private static shouldLog(level: string): boolean {
        const config = vscode.workspace.getConfiguration('playwrightBddBridge');
        const enableLogging = config.get<boolean>('enableLogging', false);
        const logLevel = config.get<string>('logLevel', 'info');
        
        if (!enableLogging) {
            return false;
        }
        
        const currentLevel = Logger.logLevels[level as keyof typeof Logger.logLevels] || 0;
        const configuredLevel = Logger.logLevels[logLevel as keyof typeof Logger.logLevels] || 2;
        
        return currentLevel <= configuredLevel;
    }

    public static info(message: string, meta?: any): void {
        if (!Logger.shouldLog('info')) {
            return;
        }
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [INFO] ${message}${metaString}`);
    }

    public static debug(message: string, meta?: any): void {
        if (!Logger.shouldLog('debug')) {
            return;
        }
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [DEBUG] ${message}${metaString}`);
    }

    public static warn(message: string, meta?: any): void {
        if (!Logger.shouldLog('warn')) {
            return;
        }
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [WARN] ${message}${metaString}`);
    }

    public static error(message: string, meta?: any): void {
        if (!Logger.shouldLog('error')) {
            return;
        }
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [ERROR] ${message}${metaString}`);
    }

    public static trace(message: string, meta?: any): void {
        if (!Logger.shouldLog('trace')) {
            return;
        }
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [TRACE] ${message}${metaString}`);
    }

    public static show(): void {
        Logger.getOutputChannel().show();
    }
} 