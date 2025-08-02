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
        
        if (isEditMode) {
            gherkinEditor.value = content;
        } else {
            gherkinContent.innerHTML = formatGherkinContent(content);
        }
        
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
    }

    function showError(error) {
        updateStatus(`Error: ${error}`);
        console.error('Webview error:', error);
    }

    // Initialize
    updateStatus('Ready');
})(); 