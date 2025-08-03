import * as vscode from 'vscode';
import * as path from 'path';
import { PlaywrightParser } from './playwright-parser';
import { GherkinConverter } from './gherkin-converter';
import { Logger } from './logger';

export class PreviewProvider {
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this._extensionUri = context.extensionUri;
    }

    public setupWebview(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument): void {
        Logger.info('🔧 Setting up webview...');
        
        // Set up the webview with proper isolation
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };

        // Set custom icon for the webview panel
        const iconPath = {
            light: vscode.Uri.joinPath(this._extensionUri, 'media', 'preview-light.svg'),
            dark: vscode.Uri.joinPath(this._extensionUri, 'media', 'preview-dark.svg')
        };
        webviewPanel.iconPath = iconPath;

        // Set the webview's initial html content
        webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview);
        Logger.info('🔧 Webview HTML set');

        // Handle messages from the webview
        webviewPanel.webview.onDidReceiveMessage(
            message => {
                Logger.info(`📨 Extension received message from webview: ${JSON.stringify(message)}`);
                switch (message.command) {
                    case 'refresh':
                        this._refreshPreview(document, webviewPanel);
                        break;
                    case 'saveChanges':
                        this._saveChanges(document, webviewPanel, message.content);
                        break;
                    case 'webviewReady':
                        // Webview is ready, send initial content
                        this._refreshPreview(document, webviewPanel);
                        break;
                }
            },
            undefined,
            this._disposables
        );

        // Handle webview panel focus events
        webviewPanel.onDidChangeViewState(
            event => {
                if (event.webviewPanel.visible && event.webviewPanel.active) {
                    Logger.info('🔄 Webview regained focus, refreshing content...');
                    this._refreshPreview(document, webviewPanel);
                }
            },
            undefined,
            this._disposables
        );

        // Initial content load
        Logger.info('🔧 Starting initial content load...');
        this._refreshPreview(document, webviewPanel);
    }



    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright BDD Bridge</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            line-height: 1.6;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            max-width: 100%;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%);
            border-bottom: 2px solid #404040;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .header h1 {
            font-size: 1.6rem;
            font-weight: 700;
            color: #00b894;
            text-shadow: 0 0 10px rgba(0, 184, 148, 0.3);
            letter-spacing: 0.5px;
        }

        .controls {
            display: flex;
            gap: 0.5rem;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border: 2px solid #404040;
            background: linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%);
            color: #e8e8e8;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .btn:hover {
            background: linear-gradient(135deg, #404040 0%, #2d2d2d 100%);
            border-color: #00b894;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .btn-primary {
            background-color: var(--vscode-button-prominentBackground);
            color: var(--vscode-button-prominentForeground);
        }

        .btn-primary:hover {
            background-color: var(--vscode-button-prominentHoverBackground);
        }

        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .gherkin-preview {
            flex: 1;
            overflow: auto;
            padding: 1rem;
        }

        .gherkin-content {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 1rem;
            min-height: 200px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        .loading {
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }

        /* Beautiful Gherkin styling */
        .gherkin-content {
            background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
            border: 2px solid #404040;
            border-radius: 8px;
            padding: 1.5rem;
            min-height: 200px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            white-space: pre-wrap;
            color: #e8e8e8;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Gherkin element styling */
        .gherkin-feature {
            color: #00b894;
            font-weight: bold;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            padding: 0.5rem 0;
            border-bottom: 2px solid #00b894;
        }

        .gherkin-background {
            color: #fdcb6e;
            font-weight: bold;
            font-size: 1rem;
            margin: 1rem 0 0.5rem 0;
            padding: 0.5rem;
            background: rgba(253, 203, 110, 0.1);
            border-left: 4px solid #fdcb6e;
            border-radius: 4px;
        }

        .gherkin-scenario {
            color: #e17055;
            font-weight: bold;
            font-size: 1rem;
            margin: 1rem 0 0.5rem 0;
            padding: 0.5rem;
            background: rgba(225, 112, 85, 0.1);
            border-left: 4px solid #e17055;
            border-radius: 4px;
        }

        .gherkin-keyword {
            color: #6c5ce7;
            font-weight: bold;
            text-shadow: 0 0 8px rgba(108, 92, 231, 0.3);
        }
        }

        .edit-panel {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 1rem;
        }

        .gherkin-editor {
            flex: 1;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 1rem;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
            resize: none;
            outline: none;
        }

        .gherkin-editor:focus {
            border-color: var(--vscode-focusBorder);
        }

        .edit-controls {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            justify-content: flex-end;
        }

        .status-bar {
            padding: 0.5rem 1rem;
            background-color: var(--vscode-statusBar-background);
            color: var(--vscode-statusBar-foreground);
            border-top: 1px solid var(--vscode-panel-border);
            font-size: 0.75rem;
        }

        .gherkin-keyword {
            color: var(--vscode-editor-foreground);
            font-weight: bold;
        }

        .gherkin-feature {
            color: var(--vscode-textPreformat-foreground);
            font-weight: bold;
            font-size: 1.1em;
        }

        .gherkin-scenario {
            color: var(--vscode-textPreformat-foreground);
            font-weight: bold;
        }

        .gherkin-background {
            color: var(--vscode-textPreformat-foreground);
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Playwright BDD Bridge</h1>
            <div class="controls">
                <button id="refreshBtn" class="btn">Refresh</button>
                <!-- Edit Mode button disabled for now -->
                <!-- <button id="editBtn" class="btn">Edit Mode</button> -->
            </div>
        </div>
        
        <div class="content">
            <div class="gherkin-preview">
                <div class="gherkin-content" id="gherkinContent">
                    <div class="loading">Loading...</div>
                </div>
            </div>
            
            <!-- Edit panel disabled for now -->
            <!-- <div class="edit-panel" id="editPanel" style="display: none;">
                <textarea id="gherkinEditor" class="gherkin-editor" placeholder="Edit Gherkin content here..."></textarea>
                <div class="edit-controls">
                    <button id="saveBtn" class="btn btn-primary">Save Changes</button>
                    <button id="cancelBtn" class="btn">Cancel</button>
                </div>
            </div> -->
        </div>
        
        <div class="status-bar">
            <span id="statusText">Ready</span>
        </div>
    </div>
    
    <script>
        (function() {
            'use strict';

            const vscode = acquireVsCodeApi();

                    // DOM elements
        const gherkinContent = document.getElementById('gherkinContent');
        const refreshBtn = document.getElementById('refreshBtn');
        const statusText = document.getElementById('statusText');

        let currentGherkinContent = '';

        // Event listeners
        refreshBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'refresh' });
            updateStatus('Refreshing...');
        });

            // Handle messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;

                switch (message.command) {
                    case 'updateContent':
                        updateGherkinContent(message.content);
                        break;
                    case 'updateStatus':
                        updateStatus(message.text);
                        break;
                    case 'showError':
                        showError(message.error);
                        break;
                }
            });

            function updateGherkinContent(content) {
                currentGherkinContent = content;
                const formattedContent = formatGherkinContent(content);
                gherkinContent.innerHTML = formattedContent;
                updateStatus('Content updated');
            }

            function formatGherkinContent(content) {
                if (!content) {
                    return '<div class="loading">No content available</div>';
                }

                // Simple syntax highlighting
                const formatted = content
                    .replace(/^(Feature:.*)$/gm, '<div class="gherkin-feature">$1</div>')
                    .replace(/^(Background:)$/gm, '<div class="gherkin-background">$1</div>')
                    .replace(/^(Scenario:.*)$/gm, '<div class="gherkin-scenario">$1</div>')
                    .replace(/\\b(Given|When|Then|And)\\b/g, '<span class="gherkin-keyword">$1</span>')
                    .replace(/\\n/g, '<br>');
                
                return formatted;
            }

            // Edit mode functions disabled for now
            // function toggleEditMode() {
            //     isEditMode = !isEditMode;
            //     
            //     if (isEditMode) {
            //         editPanel.style.display = 'flex';
            //         gherkinEditor.value = currentGherkinContent;
            //         editBtn.textContent = 'View Mode';
            //         updateStatus('Edit mode enabled');
            //     } else {
            //         editPanel.style.display = 'none';
            //         gherkinContent.innerHTML = formatGherkinContent(currentGherkinContent);
            //         editBtn.textContent = 'Edit Mode';
            //         updateStatus('View mode enabled');
            //     }
            // }

            // function saveChanges() {
            //     const newContent = gherkinEditor.value;
            //     
            //     vscode.postMessage({ 
            //         command: 'saveChanges', 
            //         content: newContent 
            //     });
            //     
            //     currentGherkinContent = newContent;
            //     toggleEditMode();
            //     updateStatus('Changes saved');
            // }

            // function cancelEdit() {
            //     toggleEditMode();
            //     updateStatus('Edit cancelled');
            // }

            function updateStatus(text) {
                statusText.textContent = text;
                console.log('Status updated:', text);
            }

            function showError(error) {
                updateStatus(\`Error: \${error}\`);
                console.error('Webview error:', error);
            }

            // Initialize
            updateStatus('Ready');
            
            // Notify extension that webview is ready
            vscode.postMessage({ command: 'webviewReady' });
            
            // Handle window focus events
            window.addEventListener('focus', () => {
                vscode.postMessage({ command: 'refresh' });
            });
        })();
    </script>
</body>
</html>`;
    }

    private async _refreshPreview(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel): Promise<void> {
        try {
            Logger.info('🔄 Starting preview refresh...');
            
            const sourceCode = document.getText();
            Logger.info(`📄 Source code length: ${sourceCode.length}`);
            
            Logger.info('🔍 Creating parser...');
            const parser = new PlaywrightParser(sourceCode);
            
            Logger.info('🔍 Parsing test file...');
            const parsedTest = parser.parse();
            Logger.info(`📊 Parsed test result: ${JSON.stringify(parsedTest, null, 2)}`);
            
            Logger.info('🔄 Creating converter...');
            const converter = new GherkinConverter();
            
            Logger.info('🔄 Converting to Gherkin document...');
            const gherkinDocument = converter.convert(parsedTest);
            Logger.info(`📊 Gherkin document: ${JSON.stringify(gherkinDocument, null, 2)}`);
            
            Logger.info('🔄 Generating Gherkin string...');
            const gherkinString = converter.generateGherkinString(gherkinDocument);
            Logger.info(`✅ Generated Gherkin string: ${gherkinString}`);
            Logger.info(`✅ Gherkin string length: ${gherkinString.length}`);

            Logger.info('📤 Sending updateContent message to webview...');
            webviewPanel.webview.postMessage({
                command: 'updateContent',
                content: gherkinString
            });
            Logger.info('✅ updateContent message sent');

            Logger.info('📤 Sending updateStatus message to webview...');
            webviewPanel.webview.postMessage({
                command: 'updateStatus',
                text: 'Preview updated successfully'
            });
            Logger.info('✅ updateStatus message sent');
            
            Logger.info('🎉 Preview refresh completed successfully');
        } catch (error) {
            Logger.info(`❌ Error refreshing preview: ${error}`);
            Logger.info(`❌ Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
            webviewPanel.webview.postMessage({
                command: 'showError',
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }

    private async _saveChanges(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel, gherkinContent: string): Promise<void> {
        try {
            // For now, we'll just show a message that saving is not implemented
            // In a full implementation, this would convert Gherkin back to Playwright
            webviewPanel.webview.postMessage({
                command: 'updateStatus',
                text: 'Save functionality not yet implemented'
            });
        } catch (error) {
            Logger.error('Error saving changes:', error);
            webviewPanel.webview.postMessage({
                command: 'showError',
                error: error instanceof Error ? error.message : 'Error saving changes'
            });
        }
    }

    // Removed logToFile method - using Logger directly

    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
    }
} 