import * as vscode from 'vscode';
import * as path from 'path';
import { PreviewProvider } from './preview-provider';
import { PlaywrightParser } from './playwright-parser';
import { GherkinConverter } from './gherkin-converter';
import { Logger } from './logger';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activating...'); // DEBUG LOG
    vscode.window.showInformationMessage('Extension activated!');
    
    // Initialize Winston logger
    const logger = Logger.initialize(context);
    
    // Log extension activation
    Logger.info('🚀 Extension activating...', { 
        extensionPath: context.extensionPath,
        logUri: context.logUri?.toString()
    });
    
    // Log extension activation with Winston only
    Logger.info('🚀 Extension activating...', { 
        extensionPath: context.extensionPath,
        logUri: context.logUri?.toString()
    });
    
    // Register the preview provider
    const previewProvider = new PreviewProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
        PreviewProvider.viewType,
        previewProvider,
        {
            webviewOptions: { retainContextWhenHidden: true },
            supportsMultipleEditorsPerDocument: false
        }
    );
    
    // Register commands
    const testCommand = vscode.commands.registerCommand('playwright-bdd-bridge.test', () => {
        vscode.window.showInformationMessage('Test command works!');
        
        // Log with Winston
        Logger.info('🧪 Test command executed');
    });
    
    const openPreviewCommand = vscode.commands.registerCommand('playwright-bdd-bridge.openPreview', async () => {
        // Log command execution immediately
        try {
            const fs = require('fs');
            const path = require('path');
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] 🎯 Open preview command executed\n`;
            const logFile = path.join(__dirname, '..', '..', 'extension-debug.log');
            fs.appendFileSync(logFile, logMessage);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
        
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
            
            // Test the conversion with the current file
            const sourceCode = document.getText();
            const parser = new PlaywrightParser(sourceCode);
            const parsedTest = parser.parse();
            
            const converter = new GherkinConverter();
            const gherkinDocument = converter.convert(parsedTest);
            const gherkinString = converter.generateGherkinString(gherkinDocument);
            
            // Open the preview in a new webview
                                    const panel = vscode.window.createWebviewPanel(
                            'playwrightBddBridge',
                            'Playwright BDD Bridge',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    retainContextWhenHidden: false
                }
            );
            
            // Set up the webview content directly
            const previewProvider = new PreviewProvider(context);
            previewProvider.setupWebview(panel, document);
            
                                    vscode.window.showInformationMessage('BDD preview opened!');
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
        providerRegistration,
        testCommand,
        openPreviewCommand,
        refreshPreviewCommand,
        showViewCommand,
        openLogFileCommand
    );
}

export function deactivate() {} 