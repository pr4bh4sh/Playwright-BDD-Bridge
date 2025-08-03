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
        gherkinContent.innerHTML = formatGherkinContent(content);
        updateStatus('Content updated');
    }

    function formatGherkinContent(content) {
        if (!content) {
            return '<div class="loading">No content available</div>';
        }

        // Simple syntax highlighting
        return content
            .replace(/^(Feature:.*)$/gm, '<div class="gherkin-feature">$1</div>')
            .replace(/^(Background:)$/gm, '<div class="gherkin-background">$1</div>')
            .replace(/^(Scenario:.*)$/gm, '<div class="gherkin-scenario">$1</div>')
            .replace(/\b(Given|When|Then|And)\b/g, '<span class="gherkin-keyword">$1</span>')
            .replace(/\n/g, '<br>');
    }



    function updateStatus(text) {
        statusText.textContent = text;
    }

    function showError(error) {
        updateStatus(`Error: ${error}`);
        console.error('Webview error:', error);
    }

    // Initialize
    updateStatus('Ready');
})(); 