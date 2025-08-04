# Playwright BDD Bridge

A VS Code extension that bridges Playwright tests to Gherkin syntax with live preview capabilities. Convert your Playwright test files to readable Gherkin syntax instantly and visualize your test scenarios in a clean, BDD format.

## ✨ Features

- **🚀 Live Preview**: Convert Playwright test files to Gherkin syntax in real-time
- **🎨 Syntax Highlighting**: Beautiful Gherkin syntax highlighting with VS Code theming
- **📝 Smart Conversion**: Intelligent parsing of Playwright test structures
- **🔄 Real-time Refresh**: Update preview content with a single click
- **📋 Context Menus**: Right-click on TypeScript test files to open preview
- **🔘 Preview Button**: Click the preview button in editor title bar for instant access
- **📊 Comprehensive Logging**: Built-in logging system with configurable levels for debugging
- **🎯 Clean UI**: Modern, responsive webview interface
- **🔍 Proper Gherkin Keywords**: Smart detection of Given/When/Then/And keywords based on step context

## 🚀 Installation

### From VSIX Package
1. Download the `.vsix` file from the releases
2. Install using VS Code:
   ```bash
   code --install-extension playwright-bdd-bridge-0.1.4.vsix
   ```
   Or using Cursor:
   ```bash
   cursor --install-extension playwright-bdd-bridge-0.1.4.vsix
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
3. **Editor Title Bar**: Click the preview button (📄🔍) in the editor title bar for instant access
4. **Refresh**: Use the "Refresh" button in the preview to update content

### Available Commands

The extension provides several commands accessible through the Command Palette:

- **Playwright: Open BDD Preview**: Opens the BDD preview for the current file
- **Refresh BDD Preview**: Refreshes the current preview content
- **Show BDD Preview View**: Shows the preview view
- **Test Extension**: Tests the extension functionality
- **Open Log File**: Opens the extension log file (when logging is enabled)

### Quick Access Methods

#### Right-Click Context Menu
The easiest way to access the BDD preview is by right-clicking on any TypeScript test file (`.ts` or `.spec.ts`) in the VS Code explorer. The context menu will show "Playwright: Open BDD Preview" option, allowing you to instantly convert and view your Playwright tests in Gherkin format.

#### Preview Button in Editor Title Bar
When you open a TypeScript test file, you'll see a preview button (📄🔍) in the editor title bar. Click this button to instantly open the BDD preview for the current file. This provides quick visual access to convert your Playwright tests to Gherkin syntax.

## ⚙️ Configuration

### Settings

The extension provides configurable settings for logging:

- **Enable Logging**: Toggle logging on/off (default: **disabled**)
- **Log Level**: Set logging level (error, warn, info, debug, trace)

#### How to Configure:

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "Playwright BDD Bridge"
3. Configure the following options:
   - **Playwright BDD Bridge: Enable Logging**: Set to `true` to enable logging
   - **Playwright BDD Bridge: Log Level**: Choose from error, warn, info, debug, or trace

#### Default Settings:
- **Enable Logging**: `false` (logging disabled by default for optimal performance)
- **Log Level**: `trace` (shows all log levels when enabled)

### Logging and Debugging

The extension provides comprehensive logging capabilities through VS Code's Output Window for debugging and monitoring extension activity.

#### How to Access Logs:

1. **Open Output Panel**: 
   - Press `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac)
   - Or go to `View → Output` in the menu
   
2. **Select Log Channel**:
   - In the Output panel dropdown, select "Playwright BDD Bridge"
   - This will show all extension-related log messages

#### Log Levels Explained:

- **trace**: Shows all messages (most verbose)
- **debug**: Shows debug information and above
- **info**: Shows general information and above
- **warn**: Shows warnings and errors only
- **error**: Shows only error messages (least verbose)

#### What You'll See in Logs:

When logging is enabled, you'll see messages like:
```
[2024-01-15T10:30:00.000Z] [INFO] 🚀 Playwright BDD Bridge: Extension activating...
[2024-01-15T10:30:05.000Z] [INFO] 🎯 Playwright BDD Bridge: Open preview command executed
[2024-01-15T10:30:05.500Z] [INFO] ✅ Playwright BDD Bridge: BDD preview opened side by side!
[2024-01-15T10:30:10.000Z] [INFO] 🧪 Playwright BDD Bridge: Test command executed
```

#### When to Enable Logging:

- **Debugging Issues**: When the extension isn't working as expected
- **Development**: When developing or testing the extension
- **Troubleshooting**: When investigating performance or behavior issues
- **Support**: When reporting bugs or issues

#### Performance Note:

- **Disabled by Default**: Logging is disabled by default for optimal performance
- **Minimal Overhead**: When enabled, logging has minimal impact on extension performance
- **Easy Toggle**: Can be quickly enabled/disabled through settings

## 📝 Example Conversion

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
| `Refresh BDD Preview` | Refresh current preview content | Command Palette |
| `Open Log File` | Open extension log file | Command Palette |

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
   git clone git@github.com:pr4bh4sh/Playwright-BDD-Bridge.git
   cd Playwright-BDD-Bridge
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
   cursor --install-extension playwright-bdd-bridge-0.1.4.vsix --force
   ```

### Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── playwright-parser.ts  # Parses Playwright test files
├── gherkin-converter.ts  # Converts to Gherkin syntax
├── preview-provider.ts   # Manages webview preview
├── logger.ts            # Logging system
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

- **Output Panel**: Check "Playwright BDD Bridge" in VS Code Output panel for detailed logs
- **Console**: Check VS Code Developer Console for real-time logs
- **Settings**: Enable logging through extension settings for troubleshooting

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
- [x] Comprehensive logging system with configurable levels
- [x] Clean, modern UI
- [x] Background support from `test.beforeEach()`
- [x] Smart Gherkin keyword detection (Given/When/Then/And)
- [x] Proper verification step handling
- [x] Preview button in editor title bar
- [x] VS Code Output Window integration

### Planned Features 🚧
- [ ] Bidirectional editing (Gherkin → Playwright)
- [ ] Custom Gherkin step definitions
- [ ] Export to .feature files
- [ ] Integration with Cucumber.js
- [ ] Support for more Playwright patterns
- [ ] Customizable conversion rules
- [ ] Test result visualization
- [ ] Multi-file support

---

**Made with ❤️ for the Playwright and BDD communities** 