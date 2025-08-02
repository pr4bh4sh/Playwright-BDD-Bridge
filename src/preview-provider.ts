import * as vscode from 'vscode';
import * as path from 'path';
import { PlaywrightParser } from './playwright-parser';
import { GherkinConverter } from './gherkin-converter';
import { Logger } from './logger';

export class PreviewProvider {
    public static readonly viewType = 'playwrightBddBridge';
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this._extensionUri = context.extensionUri;
    }

    public setupWebview(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument): void {
        this.logToFile('🔧 Setting up webview...');
        console.log('🔧 Setting up webview...');
        
        // Set up the webview with proper isolation
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };

        // Set the webview's initial html content
        webviewPanel.webview.html = this._getHtmlForWebview(webviewPanel.webview);
        this.logToFile('🔧 Webview HTML set');
        console.log('🔧 Webview HTML set');

        // Handle messages from the webview
        webviewPanel.webview.onDidReceiveMessage(
            message => {
                this.logToFile(`📨 Extension received message from webview: ${JSON.stringify(message)}`);
                console.log('📨 Extension received message from webview:', message);
                switch (message.command) {
                    case 'refresh':
                        this._refreshPreview(document, webviewPanel);
                        break;
                    case 'saveChanges':
                        this._saveChanges(document, webviewPanel, message.content);
                        break;
                }
            },
            undefined,
            this._disposables
        );

        // Initial content load
        this.logToFile('🔧 Starting initial content load...');
        console.log('🔧 Starting initial content load...');
        this._refreshPreview(document, webviewPanel);
    }

    public resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this.setupWebview(webviewPanel, document);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright to Gherkin Preview</title>
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
            padding: 1rem;
            background-color: var(--vscode-titleBar-activeBackground);
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--vscode-titleBar-activeForeground);
        }

        .controls {
            display: flex;
            gap: 0.5rem;
        }

        .btn {
            padding: 0.5rem 1rem;
            border: 1px solid var(--vscode-button-border);
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.2s ease;
        }

        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
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
            <h1>Playwright to Gherkin Preview</h1>
            <div class="controls">
                <button id="refreshBtn" class="btn">Refresh</button>
                <button id="editBtn" class="btn">Edit Mode</button>
            </div>
        </div>
        
        <div class="content">
            <div class="gherkin-preview">
                <div class="gherkin-content" id="gherkinContent">
                    <div class="loading">Loading...</div>
                </div>
            </div>
            
            <div class="edit-panel" id="editPanel" style="display: none;">
                <textarea id="gherkinEditor" class="gherkin-editor" placeholder="Edit Gherkin content here..."></textarea>
                <div class="edit-controls">
                    <button id="saveBtn" class="btn btn-primary">Save Changes</button>
                    <button id="cancelBtn" class="btn">Cancel</button>
                </div>
            </div>
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
            const editPanel = document.getElementById('editPanel');
            const gherkinEditor = document.getElementById('gherkinEditor');
            const refreshBtn = document.getElementById('refreshBtn');
            const editBtn = document.getElementById('editBtn');
            const saveBtn = document.getElementById('saveBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            const statusText = document.getElementById('statusText');

            let currentGherkinContent = '';
            let isEditMode = false;

            // Event listeners
            refreshBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'refresh' });
                updateStatus('Refreshing...');
            });

            editBtn.addEventListener('click', () => {
                toggleEditMode();
            });

            saveBtn.addEventListener('click', () => {
                saveChanges();
            });

            cancelBtn.addEventListener('click', () => {
                cancelEdit();
            });

            // Handle messages from the extension
            window.addEventListener('message', event => {
                const message = event.data;
                console.log('📨 Webview received message:', message);
                console.log('📨 Message command:', message.command);
                console.log('📨 Message content length:', message.content ? message.content.length : 'no content');

                switch (message.command) {
                    case 'updateContent':
                        console.log('📨 Processing updateContent command...');
                        updateGherkinContent(message.content);
                        break;
                    case 'updateStatus':
                        console.log('📨 Processing updateStatus command...');
                        updateStatus(message.text);
                        break;
                    case 'showError':
                        console.log('📨 Processing showError command...');
                        showError(message.error);
                        break;
                    default:
                        console.log('📨 Unknown command:', message.command);
                }
            });

            function updateGherkinContent(content) {
                console.log('📝 updateGherkinContent called with:', content);
                console.log('📝 Content type:', typeof content);
                console.log('📝 Content length:', content ? content.length : 'null/undefined');
                currentGherkinContent = content;
                
                if (isEditMode) {
                    console.log('📝 Setting content in edit mode');
                    gherkinEditor.value = content;
                } else {
                    console.log('📝 Setting content in view mode');
                    const formattedContent = formatGherkinContent(content);
                    console.log('📝 Formatted content:', formattedContent);
                    gherkinContent.innerHTML = formattedContent;
                }
                
                updateStatus('Content updated');
            }

            function formatGherkinContent(content) {
                console.log('🎨 formatGherkinContent called with:', content);
                if (!content) {
                    console.log('🎨 No content, returning loading message');
                    return '<div class="loading">No content available</div>';
                }

                console.log('🎨 Formatting content...');
                // Simple syntax highlighting
                const formatted = content
                    .replace(/^(Feature:.*)$/gm, '<div class="gherkin-feature">$1</div>')
                    .replace(/^(Background:)$/gm, '<div class="gherkin-background">$1</div>')
                    .replace(/^(Scenario:.*)$/gm, '<div class="gherkin-scenario">$1</div>')
                    .replace(/\\b(Given|When|Then|And)\\b/g, '<span class="gherkin-keyword">$1</span>')
                    .replace(/\\n/g, '<br>');
                
                console.log('🎨 Formatted result:', formatted);
                return formatted;
            }

            function toggleEditMode() {
                isEditMode = !isEditMode;
                
                if (isEditMode) {
                    editPanel.style.display = 'flex';
                    gherkinEditor.value = currentGherkinContent;
                    editBtn.textContent = 'View Mode';
                    updateStatus('Edit mode enabled');
                } else {
                    editPanel.style.display = 'none';
                    gherkinContent.innerHTML = formatGherkinContent(currentGherkinContent);
                    editBtn.textContent = 'Edit Mode';
                    updateStatus('View mode enabled');
                }
            }

            function saveChanges() {
                const newContent = gherkinEditor.value;
                
                vscode.postMessage({ 
                    command: 'saveChanges', 
                    content: newContent 
                });
                
                currentGherkinContent = newContent;
                toggleEditMode();
                updateStatus('Changes saved');
            }

            function cancelEdit() {
                toggleEditMode();
                updateStatus('Edit cancelled');
            }

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
            console.log('🚀 Webview initialized');
            console.log('🚀 DOM elements found:');
            console.log('🚀 - gherkinContent:', gherkinContent);
            console.log('🚀 - editPanel:', editPanel);
            console.log('🚀 - gherkinEditor:', gherkinEditor);
            console.log('🚀 - refreshBtn:', refreshBtn);
            console.log('🚀 - editBtn:', editBtn);
            console.log('🚀 - saveBtn:', saveBtn);
            console.log('🚀 - cancelBtn:', cancelBtn);
            console.log('🚀 - statusText:', statusText);
        })();
    </script>
</body>
</html>`;
    }

    private async _refreshPreview(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel): Promise<void> {
        try {
            this.logToFile('🔄 Starting preview refresh...');
            console.log('🔄 Starting preview refresh...');
            
            const sourceCode = document.getText();
            this.logToFile(`📄 Source code length: ${sourceCode.length}`);
            this.logToFile(`📄 Source code preview: ${sourceCode.substring(0, 200)}...`);
            this.logToFile(`📄 Full source code: ${sourceCode}`);
            console.log('📄 Source code length:', sourceCode.length);
            console.log('📄 Source code preview:', sourceCode.substring(0, 200) + '...');
            console.log('📄 Full source code:', sourceCode);
            
            this.logToFile('🔍 Creating parser...');
            console.log('🔍 Creating parser...');
            const parser = new PlaywrightParser(sourceCode);
            
            this.logToFile('🔍 Parsing test file...');
            console.log('🔍 Parsing test file...');
            const parsedTest = parser.parse();
            this.logToFile(`📊 Parsed test result: ${JSON.stringify(parsedTest, null, 2)}`);
            console.log('📊 Parsed test result:', JSON.stringify(parsedTest, null, 2));
            
            this.logToFile('🔄 Creating converter...');
            console.log('🔄 Creating converter...');
            const converter = new GherkinConverter();
            
            this.logToFile('🔄 Converting to Gherkin document...');
            console.log('🔄 Converting to Gherkin document...');
            const gherkinDocument = converter.convert(parsedTest);
            this.logToFile(`📊 Gherkin document: ${JSON.stringify(gherkinDocument, null, 2)}`);
            console.log('📊 Gherkin document:', JSON.stringify(gherkinDocument, null, 2));
            
            this.logToFile('🔄 Generating Gherkin string...');
            console.log('🔄 Generating Gherkin string...');
            const gherkinString = converter.generateGherkinString(gherkinDocument);
            this.logToFile(`✅ Generated Gherkin string: ${gherkinString}`);
            this.logToFile(`✅ Gherkin string length: ${gherkinString.length}`);
            console.log('✅ Generated Gherkin string:', gherkinString);
            console.log('✅ Gherkin string length:', gherkinString.length);

            this.logToFile('📤 Sending updateContent message to webview...');
            console.log('📤 Sending updateContent message to webview...');
            webviewPanel.webview.postMessage({
                command: 'updateContent',
                content: gherkinString
            });
            this.logToFile('✅ updateContent message sent');
            console.log('✅ updateContent message sent');

            this.logToFile('📤 Sending updateStatus message to webview...');
            console.log('📤 Sending updateStatus message to webview...');
            webviewPanel.webview.postMessage({
                command: 'updateStatus',
                text: 'Preview updated successfully'
            });
            this.logToFile('✅ updateStatus message sent');
            console.log('✅ updateStatus message sent');
            
            this.logToFile('🎉 Preview refresh completed successfully');
            console.log('🎉 Preview refresh completed successfully');
        } catch (error) {
            this.logToFile(`❌ Error refreshing preview: ${error}`);
            this.logToFile(`❌ Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
            console.error('❌ Error refreshing preview:', error);
            console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
            console.error('Error saving changes:', error);
            webviewPanel.webview.postMessage({
                command: 'showError',
                error: error instanceof Error ? error.message : 'Error saving changes'
            });
        }
    }

    private logToFile(message: string): void {
        // Log with Winston
        Logger.info(message);
    }

    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
    }
} 