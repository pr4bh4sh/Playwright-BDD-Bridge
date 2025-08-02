
# VS Code Extension Development Prompt: Playwright BDD Bridge

## Project Overview
A VS Code extension that provides a live preview of Playwright test files converted to Gherkin syntax with bidirectional editing capabilities.

## Current Status
✅ **Extension Complete and Working**
- Version: 0.1.1
- Name: Playwright BDD Bridge
- Status: Fully functional, installed on VS Code and Cursor AI IDE

## Core Features Implemented

### 1. Extension Structure
- **Name**: `playwright-bdd-bridge`
- **Display Name**: "Playwright BDD Bridge"
- **Description**: "A VS Code extension that bridges Playwright tests to Gherkin syntax with live preview and bidirectional editing capabilities"
- **Version**: `0.1.1`
- **Publisher**: `playwright-bdd-bridge`
- **Engine**: `vscode: ^1.74.0`

### 2. Commands
- `playwright-bdd-bridge.openPreview` - "Playwright: Open BDD Preview"
- `playwright-bdd-bridge.refreshPreview` - "Refresh BDD Preview"
- `playwright-bdd-bridge.showView` - "Show BDD Preview View"
- `playwright-bdd-bridge.test` - "Test Extension"
- `playwright-bdd-bridge.openLogFile` - "Open Log File"

### 3. Context Menus
- Right-click context menus for TypeScript files in explorer and editor

## Example Test File

```typescript
// example-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('the user is on the login page', async () => {
      await page.goto('https://example.com/login');
    });
  });

  test('should login with valid credentials', async ({ page }) => {
    await test.step('enter username', async () => {
      await page.fill('#username', 'testuser');
    });

    await test.step('enter password', async () => {
      await page.fill('#password', 'password123');
    });

    await test.step('click login button', async () => {
      await page.click('#login-button');
    });

    await test.step('verify successful login', async () => {
      await expect(page.locator('.dashboard')).toBeVisible();
    });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await test.step('enter invalid username', async () => {
      await page.fill('#username', 'invalid');
    });

    await test.step('enter invalid password', async () => {
      await page.fill('#password', 'wrong');
    });

    await test.step('click login button', async () => {
      await page.click('#login-button');
    });

    await test.step('verify error message', async () => {
      await expect(page.locator('.error-message')).toBeVisible();
    });
  });
});
```

## Expected Gherkin Output

```gherkin
Feature: User Authentication

  Background:
    Given the user is on the login page

  Scenario: should login with valid credentials
    Given enters username
    When enters password
    And clicks the login button
    Then verify successful login

  Scenario: should show error with invalid credentials
    Given enters invalid username
    When enters invalid password
    And clicks the login button
    Then verify error message
```

## Key Components

### 1. Playwright Parser (`src/playwright-parser.ts`)
- Parses Playwright test files
- Extracts `test.describe()`, `test.beforeEach()`, `test()`, `test.step()`
- Handles brace counting and function boundaries

### 2. Gherkin Converter (`src/gherkin-converter.ts`)
- Converts parsed structure to Gherkin syntax
- Maps steps to Given/When/Then/And keywords
- Generates clean, readable Gherkin output

### 3. Preview Provider (`src/preview-provider.ts`)
- Creates webview panel with live preview
- Handles content refresh and focus events
- Provides beautiful UI with colorful syntax highlighting

### 4. Logger (`src/logger.ts`)
- Comprehensive logging with VS Code OutputChannel
- Timestamps and log levels
- Programmatic access to logs

## Installation & Usage

### Install Extension
```bash
# Package extension
vsce package

# Install in VS Code
code --install-extension playwright-bdd-bridge-0.1.1.vsix --force

# Install in Cursor AI IDE
cursor --install-extension playwright-bdd-bridge-0.1.1.vsix --force
```

### Use Extension
1. Open TypeScript test file
2. Right-click → "Playwright: Open BDD Preview"
3. Or use Command Palette → "Playwright: Open BDD Preview"
4. View beautiful Gherkin preview with syntax highlighting

## Development Commands

```bash
# Compile
npm run compile

# Package
vsce package

# Install
code --install-extension playwright-bdd-bridge-0.1.1.vsix --force
```

## Project Structure
```
src/
├── extension.ts          # Main entry point
├── playwright-parser.ts  # Parse Playwright tests
├── gherkin-converter.ts  # Convert to Gherkin
├── preview-provider.ts   # Webview management
├── logger.ts            # Logging utility
└── webview/
    ├── preview.html     # Webview template
    ├── preview.css      # Styling
    └── preview.js       # Webview logic
```

## Features
- ✅ Live Gherkin preview
- ✅ Beautiful UI with syntax highlighting
- ✅ Comprehensive logging
- ✅ Context menu integration
- ✅ Command palette integration
- ✅ Auto-refresh on focus
- ✅ VS Code and Cursor AI IDE compatible
- ✅ Professional commit history
- ✅ Proper error handling
