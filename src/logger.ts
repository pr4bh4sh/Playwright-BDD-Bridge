import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel;

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

    public static info(message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [INFO] ${message}${metaString}`);
    }

    public static debug(message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [DEBUG] ${message}${metaString}`);
    }

    public static warn(message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [WARN] ${message}${metaString}`);
    }

    public static error(message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [ERROR] ${message}${metaString}`);
    }

    public static trace(message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
        Logger.getOutputChannel().appendLine(`[${timestamp}] [TRACE] ${message}${metaString}`);
    }

    public static show(): void {
        Logger.getOutputChannel().show();
    }
} 