import * as vscode from 'vscode';
import * as path from 'path';
import { PreviewProvider } from './preview-provider';
import { PlaywrightParser } from './playwright-parser';
import { GherkinConverter } from './gherkin-converter';
import { Logger } from './logger';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activating...'); // DEBUG LOG
    vscode.window.showInformationMessage('Extension activated!');
    
    // Initialize VS Code OutputChannel logger
    const outputChannel = Logger.initialize(context);
    
    // Log extension activation
    Logger.info('🚀 Extension activating...', { 
        extensionPath: context.extensionPath
    });
    

    

    
    // Register commands
    const testCommand = vscode.commands.registerCommand('playwright-bdd-bridge.test', () => {
        vscode.window.showInformationMessage('Test command works!');
        
        // Log with Winston
        Logger.info('🧪 Test command executed');
    });
    
    const openPreviewCommand = vscode.commands.registerCommand('playwright-bdd-bridge.openPreview', async () => {
        
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        
        const document = activeEditor.document;
        if (document.languageId !== 'typescript') {
            vscode.window.showErrorMessage('Please open a TypeScript file');
            return;
        }
        
        try {
            // Log command execution
            Logger.info('🎯 Open preview command executed');
            
            // Ensure the current editor stays visible
            await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.One });
            
            // Open the preview in a new webview panel beside the current editor
            const panel = vscode.window.createWebviewPanel(
                'playwrightBddBridge',
                'Playwright BDD Bridge',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
            
            // Set up the webview content directly
            const previewProvider = new PreviewProvider(context);
            previewProvider.setupWebview(panel, document);
            
            vscode.window.showInformationMessage('BDD preview opened side by side!');
        } catch (error) {
            console.error('Error opening preview:', error);
            vscode.window.showErrorMessage(`Error opening BDD preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
    
    const refreshPreviewCommand = vscode.commands.registerCommand('playwright-bdd-bridge.refreshPreview', () => {
        vscode.window.showInformationMessage('Refresh preview command executed');
    });
    
    const showViewCommand = vscode.commands.registerCommand('playwright-bdd-bridge.showView', () => {
        vscode.window.showInformationMessage('Show view command executed');
    });
    
    const openLogFileCommand = vscode.commands.registerCommand('playwright-bdd-bridge.openLogFile', async () => {
        const logFilePath = vscode.Uri.joinPath(context.logUri, 'Playwright BDD Bridge.log');
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Opening log file...",
            cancellable: false
        }, async (progressIndicator, token) => {
            await new Promise<void>(async (resolve) => {
                try {
                    const doc = await vscode.workspace.openTextDocument(logFilePath);
                    await vscode.window.showTextDocument(doc);
                } catch {
                    vscode.window.showErrorMessage("Could not open Playwright BDD Bridge log file");
                } finally {
                    resolve();
                }
            });
        });
    });
    
    // Register all subscriptions
    context.subscriptions.push(
        testCommand,
        openPreviewCommand,
        refreshPreviewCommand,
        showViewCommand,
        openLogFileCommand
    );
}

export function deactivate() {} 