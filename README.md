# Playwright BDD Bridge

A VS Code extension that bridges Playwright tests to Gherkin syntax with live preview and bidirectional editing capabilities.

## Features

- **Live Preview**: Convert Playwright test files to Gherkin syntax in real-time
- **Bidirectional Editing**: Edit Gherkin content and sync back to Playwright (coming soon)
- **Syntax Highlighting**: Beautiful Gherkin syntax highlighting in the preview
- **Context Menus**: Right-click on TypeScript test files to open preview
- **Command Palette Integration**: Access all features through VS Code commands

## Installation

1. Download the `.vsix` file from the releases
2. Install using VS Code:
   ```bash
   code --install-extension playwright-bdd-bridge-0.1.0.vsix
   ```
   Or using Cursor:
   ```bash
   cursor --install-extension playwright-bdd-bridge-0.1.0.vsix
   ```

## Usage

### Opening a Preview

1. **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type "Playwright: Open BDD Preview"
2. **Context Menu**: Right-click on a TypeScript test file and select "Playwright: Open BDD Preview"
3. **Keyboard Shortcut**: Use the command palette method

### Example Conversion

**Input Playwright Test:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com/login');
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
});
```

**Output Gherkin:**
```gherkin
Feature: User Authentication

  Background:
    Given the user is on the login page

  Scenario: Login with valid credentials
    When the user enters username "testuser"
    And the user enters password "password123"
    And the user clicks the login button
    Then the dashboard should be visible
```

## Commands

- `playwright-bdd-bridge.openPreview` - Open BDD preview for current file
- `playwright-bdd-bridge.refreshPreview` - Refresh the current preview
- `playwright-bdd-bridge.showView` - Show the preview view
- `playwright-bdd-bridge.test` - Test the extension functionality

## Supported Playwright Syntax

The extension recognizes and converts:

- `test.describe()` → Feature
- `test.beforeEach()` → Background
- `test()` → Scenario
- `test.step()` → Gherkin steps (Given/When/Then/And)

## Development

### Prerequisites

- Node.js (v16 or higher)
- VS Code or Cursor
- TypeScript

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Package the extension:
   ```bash
   vsce package
   ```

### Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── playwright-parser.ts  # Parses Playwright test files
├── gherkin-converter.ts  # Converts to Gherkin syntax
├── preview-provider.ts   # Manages webview preview
└── webview/
    ├── preview.html      # Webview HTML template
    ├── preview.css       # Webview styles
    └── preview.js        # Webview JavaScript
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Issues and Feedback

Please report issues and provide feedback through the GitHub repository.

## Roadmap

- [ ] Bidirectional editing (Gherkin → Playwright)
- [ ] Custom Gherkin step definitions
- [ ] Export to .feature files
- [ ] Integration with Cucumber.js
- [ ] Support for more Playwright patterns
- [ ] Customizable conversion rules 