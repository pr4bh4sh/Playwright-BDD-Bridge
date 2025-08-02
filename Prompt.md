
# VS Code Extension Development Prompt: Playwright BDD Bridge

## Project Overview
Create a VS Code extension that provides a live preview of Playwright test files converted to Gherkin syntax with bidirectional editing capabilities.

## Core Requirements

### 1. Extension Structure
- **Name**: `playwright-gherkin-preview`
- **Display Name**: "Playwright BDD Bridge"
- **Description**: "Live preview of Playwright test files converted to Gherkin syntax with bidirectional editing"
- **Version**: `0.1.0`
- **Publisher**: `playwright-gherkin-preview`
- **Engine**: `vscode: ^1.74.0`

### 2. Activation Events
- Use `onLanguage:typescript` as the activation event (NOT `*` or `onStartupFinished`)
- This ensures the extension activates when TypeScript files are opened

### 3. Commands
Register these commands in `package.json`:
- `playwright-gherkin-preview.openPreview` - "Playwright: Open Gherkin Preview"
- `playwright-gherkin-preview.refreshPreview` - "Refresh Gherkin Preview"
- `playwright-gherkin-preview.showView` - "Show Gherkin Preview View"
- `playwright-gherkin-preview.test` - "Test Extension"

### 4. Context Menus
Add right-click context menus for:
- `explorer/context` - when file is TypeScript test file
- `editor/context` - when file is TypeScript test file

### 5. File Structure
```
project/
├── package.json
├── tsconfig.json
├── .vscodeignore
├── .eslintrc.json
├── LICENSE
├── README.md
├── src/
│   ├── extension.ts
│   ├── playwright-parser.ts
│   ├── gherkin-converter.ts
│   ├── preview-provider.ts
│   ├── editor-sync.ts
│   └── webview/
│       ├── preview.html
│       ├── preview.css
│       └── preview.js
└── out/ (compiled JavaScript)
```

## EXAMPLE TEST FILE (CRITICAL FOR IMPLEMENTATION)

Create this example test file to test the extension:

```typescript
// example-test.spec.ts
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

## EXPECTED GHERKIN OUTPUT

The extension should convert the above Playwright test to this Gherkin format:

```gherkin
Feature: User Authentication

  Background:
    Given the user is on the login page

  Scenario: Login with valid credentials
    When the user enters username "testuser"
    And the user enters password "password123"
    And the user clicks the login button
    Then the dashboard should be visible

  Scenario: Show error with invalid credentials
    When the user enters username "invalid"
    And the user enters password "wrong"
    And the user clicks the login button
    Then the error message should be visible
```

## CONVERSION LOGIC SPECIFICATION

### Playwright Parser (`src/playwright-parser.ts`)
Parse Playwright test files and extract:
- `test.describe()` → Feature name
- `test.beforeEach()` → Background steps
- `test()` → Scenario
- `test.step()` → Gherkin steps

### Gherkin Converter (`src/gherkin-converter.ts`)
Convert parsed Playwright structure to Gherkin:
- Map `test.step()` descriptions to Gherkin keywords (Given/When/Then/And)
- Convert assertions to "Then" steps
- Format output as Gherkin syntax

### Preview Provider (`src/preview-provider.ts`)
Create webview panel showing:
- Live Gherkin preview
- Interactive editing capabilities
- Bidirectional sync with source file

### Editor Sync (`src/editor-sync.ts`)
Handle bidirectional editing:
- Changes in Gherkin preview → update Playwright source
- Changes in Playwright source → update Gherkin preview

## CRITICAL ERROR ANALYSIS - What Went Wrong Before

### ERROR 1: Extension Not Activating
**Problem**: Commands returning "command not found" errors
**Root Cause**: Extension not activating properly due to activation event issues
**Evidence**: 
- `onStartupFinished` activation event failed to trigger
- `*` activation event caused performance warnings and still failed
- Extension installed but commands not registered

**Solution**: Use `onLanguage:typescript` activation event and verify activation with console.log

### ERROR 2: Dependencies Configuration
**Problem**: Extension compiled but failed to load in runtime
**Root Cause**: `typescript` dependency in wrong section
**Evidence**: 
- Extension compiled successfully
- Installed successfully
- But failed to activate when TypeScript files opened

**Solution**: Move `typescript` from `devDependencies` to `dependencies` in package.json

### ERROR 3: JSON Syntax Errors
**Problem**: `npm run compile` failing with JSON parse errors
**Root Cause**: Trailing commas and malformed JSON in package.json
**Evidence**: 
- `EJSONPARSE: Invalid package.json`
- `Expected double-quoted property name in JSON`

**Solution**: Validate JSON syntax, remove trailing commas, ensure proper structure

### ERROR 4: Complex Initialization Failures
**Problem**: Extension activating but commands not working due to runtime errors
**Root Cause**: Complex dependencies failing during initialization
**Evidence**:
- Extension showed activation message
- But commands still "not found"
- Complex imports causing silent failures

**Solution**: Start with minimal extension, add complexity incrementally

### ERROR 5: Packaging Warnings
**Problem**: `vsce package` showing warnings about missing fields
**Root Cause**: Missing `repository` and `license` fields
**Evidence**:
- `WARNING: A 'repository' field is missing`
- `WARNING: LICENSE.md, LICENSE.txt or LICENSE not found`

**Solution**: Add repository and license fields to package.json

## Development Steps with Error Prevention

### Phase 1: Minimal Working Extension (CRITICAL)
1. Create basic `package.json` with:
   - `activationEvents: ["onLanguage:typescript"]`
   - `main: "./out/extension.js"`
   - `repository` and `license` fields
   - `typescript` in `dependencies`

2. Create minimal `src/extension.ts`:
```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension activating...'); // DEBUG LOG
    vscode.window.showInformationMessage('Extension activated!');
    
    const testCommand = vscode.commands.registerCommand('playwright-gherkin-preview.test', () => {
        vscode.window.showInformationMessage('Test command works!');
    });
    
    context.subscriptions.push(testCommand);
}

export function deactivate() {}
```

3. Test compilation: `npm run compile`
4. Test packaging: `vsce package`
5. Test installation: `cursor --install-extension *.vsix --force`
6. Test activation: Open TypeScript file, check for activation message
7. Test command: Command Palette → "Playwright: Test Extension"

**VERIFICATION POINT**: If this minimal extension works, proceed. If not, debug activation issues.

### Phase 2: Add Commands Incrementally
1. Add one command at a time
2. Test each command individually
3. Verify command registration in Command Palette
4. Add context menus only after commands work

### Phase 3: Add Core Functionality
1. Implement Playwright parser (isolated testing)
2. Implement Gherkin converter (isolated testing)
3. Implement webview preview (isolated testing)
4. Integrate components one by one

## Testing Protocol

### Step 1: Verify Extension Loading
```bash
# Compile
npm run compile

# Check compiled file exists
ls -la out/extension.js

# Package
vsce package

# Install
cursor --install-extension playwright-gherkin-preview-0.1.0.vsix --force

# Open Cursor
cursor . --new-window
```

### Step 2: Verify Activation
1. Open any TypeScript file
2. Check for activation message: "Extension activated!"
3. Check Developer Console for any errors

### Step 3: Verify Commands
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Playwright: Test Extension"
3. Execute command
4. Verify success message

### Step 4: Verify Context Menus
1. Right-click on TypeScript test file
2. Verify context menu options appear
3. Test context menu commands

## Error Detection and Debugging

### If Extension Doesn't Activate:
1. Check activation event in package.json
2. Verify main entry point exists
3. Check for compilation errors
4. Check Developer Console for errors

### If Commands Not Found:
1. Verify commands are registered in activate() function
2. Check command IDs match package.json
3. Verify context.subscriptions.push() is called
4. Check for runtime errors in activate() function

### If Packaging Fails:
1. Validate JSON syntax in package.json
2. Check for missing required fields
3. Verify file paths are correct
4. Check .vscodeignore exclusions

## Success Criteria (Must Meet All)
- [ ] Extension activates when TypeScript file opened
- [ ] Activation message appears
- [ ] All commands available in Command Palette
- [ ] No "command not found" errors
- [ ] Context menus work
- [ ] Basic webview opens
- [ ] No packaging warnings
- [ ] No compilation errors
- [ ] Extension converts example Playwright test to Gherkin format
- [ ] Bidirectional editing works

## Common Failure Points
1. **Activation Event**: Wrong activation event prevents extension loading
2. **Dependencies**: Missing runtime dependencies cause silent failures
3. **JSON Syntax**: Malformed JSON prevents packaging
4. **File Paths**: Incorrect paths prevent file loading
5. **Error Handling**: Unhandled errors prevent command registration
6. **Complexity**: Too much complexity too early causes failures

## Agent Instructions
1. **Start Minimal**: Begin with the absolute minimum working extension
2. **Test Each Step**: Verify each step works before proceeding
3. **Add Complexity Gradually**: Only add features after basic functionality works
4. **Use Debug Logs**: Add console.log statements to track execution
5. **Handle Errors**: Use try-catch blocks around all operations
6. **Validate JSON**: Check all JSON files for syntax errors
7. **Test Thoroughly**: Test activation, commands, and context menus separately
8. **Use Example**: Create the example test file and use it to test conversion functionality
9. **Verify Output**: Ensure the extension produces the expected Gherkin output
