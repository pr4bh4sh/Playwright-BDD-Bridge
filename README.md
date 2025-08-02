# Playwright BDD Bridge

A VS Code extension that bridges Playwright tests to Gherkin syntax with live preview capabilities. Convert your Playwright test files to readable Gherkin syntax instantly and visualize your test scenarios in a clean, BDD format.

## ✨ Features

- **🚀 Live Preview**: Convert Playwright test files to Gherkin syntax in real-time
- **🎨 Syntax Highlighting**: Beautiful Gherkin syntax highlighting with VS Code theming
- **📝 Smart Conversion**: Intelligent parsing of Playwright test structures
- **🔄 Real-time Refresh**: Update preview content with a single click
- **📋 Context Menus**: Right-click on TypeScript test files to open preview
- **⌨️ Command Palette Integration**: Access all features through VS Code commands
- **📊 Comprehensive Logging**: Built-in Winston logging system for debugging and monitoring
- **🎯 Clean UI**: Modern, responsive webview interface
- **🔍 Proper Gherkin Keywords**: Smart detection of Given/When/Then/And keywords based on step context

## 🚀 Installation

### From VSIX Package
1. Download the `.vsix` file from the releases
2. Install using VS Code:
   ```bash
   code --install-extension playwright-bdd-bridge-0.1.0.vsix
   ```
   Or using Cursor:
   ```bash
   cursor --install-extension playwright-bdd-bridge-0.1.0.vsix
   ```

### From Source
1. Clone the repository
2. Install dependencies: `npm install`
3. Compile: `npm run compile`
4. Package: `vsce package`
5. Install the generated `.vsix` file

## 📖 Usage

### Opening a Preview

1. **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type "Playwright: Open BDD Preview"
2. **Context Menu**: Right-click on a TypeScript test file and select "Playwright: Open BDD Preview"
3. **Refresh**: Use the "Refresh" button in the preview to update content

### Example Conversion

**Input Playwright Test:**
```typescript
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

**Output Gherkin:**
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

## 🎮 Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Playwright: Open BDD Preview` | Open BDD preview for current file | Command Palette |
| `Playwright: Refresh BDD Preview` | Refresh the current preview | Refresh Button |
| `Playwright: Show BDD View` | Show the preview view | Command Palette |
| `Playwright: Open Log File` | Open the extension log file | Command Palette |

## 🔧 Supported Playwright Syntax

The extension intelligently converts:

- **`test.describe()`** → **Feature** (with description as feature name)
- **`test.beforeEach()`** → **Background** (requires `test.step()` inside for proper conversion)
- **`test()`** → **Scenario** (with test name as scenario name)
- **`test.step()`** → **Gherkin Steps** (Given/When/Then/And)

### Conversion Logic
- **Smart Keyword Detection**: Automatically determines step keywords based on context and content
- **Background Support**: Captures `test.step()` from `test.beforeEach()` as Background steps
- **Clean Step Conversion**: Converts Playwright actions to readable Gherkin steps
- **Proper Gherkin Format**: Uses correct Given/When/Then/And keywords based on step purpose
- **Verification Steps**: Always uses "Then" for verification keywords (verify, check, should, expect, assert)

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- VS Code or Cursor
- TypeScript

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vscode-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile the extension**
   ```bash
   npm run compile
   ```

4. **Package the extension**
   ```bash
   vsce package
   ```

5. **Install for development**
   ```bash
   cursor --install-extension playwright-bdd-bridge-0.1.0.vsix --force
   ```

### Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── playwright-parser.ts  # Parses Playwright test files
├── gherkin-converter.ts  # Converts to Gherkin syntax
├── preview-provider.ts   # Manages webview preview
├── logger.ts            # Winston-based logging system
└── webview/
    ├── preview.html      # Webview HTML template
    ├── preview.css       # Webview styles
    └── preview.js        # Webview JavaScript
```

### Key Components

- **PlaywrightParser**: Parses TypeScript test files into structured data
- **GherkinConverter**: Converts parsed data to Gherkin syntax
- **PreviewProvider**: Manages the webview interface and communication
- **Logger**: Provides comprehensive logging for debugging

## 🐛 Debugging

The extension includes a robust logging system:

- **Log Files**: Check `extension.log` and `debug.log` in the extension directory
- **Command**: Use "Playwright: Open Log File" to view logs
- **Console**: Check VS Code Developer Console for real-time logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly with different Playwright test patterns
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Add comprehensive logging for new features
- Test with various Playwright test structures
- Update documentation for new features

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Issues and Feedback

Please report issues and provide feedback through the GitHub repository. Include:
- Playwright test file example
- Expected vs actual Gherkin output
- VS Code version and OS information
- Extension logs (if applicable)

## 🗺️ Roadmap

### Current Features ✅
- [x] Live Playwright to Gherkin conversion
- [x] Syntax highlighting
- [x] Real-time preview with refresh functionality
- [x] Context menu integration
- [x] Comprehensive Winston logging system
- [x] Clean, modern UI
- [x] Background support from `test.beforeEach()`
- [x] Smart Gherkin keyword detection (Given/When/Then/And)
- [x] Proper verification step handling

### Planned Features 🚧
- [ ] Bidirectional editing (Gherkin → Playwright)
- [ ] Custom Gherkin step definitions
- [ ] Export to .feature files
- [ ] Integration with Cucumber.js
- [ ] Support for more Playwright patterns
- [ ] Customizable conversion rules
- [ ] Test result visualization
- [ ] Multi-file support

## 📊 Version History

### v0.1.0
- Initial release with core conversion functionality
- Live preview with syntax highlighting and refresh capability
- Context menu integration
- Comprehensive Winston logging system
- Clean, responsive UI
- Background support from `test.beforeEach()` with `test.step()`
- Smart Gherkin keyword detection (Given/When/Then/And)
- Proper verification step handling with "Then" keyword
- Real-time conversion with proper error handling

---

**Made with ❤️ for the Playwright and BDD communities** 