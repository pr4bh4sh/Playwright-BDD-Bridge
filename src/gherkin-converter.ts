import { ParsedPlaywrightTest, TestSuite, TestCase, TestStep } from './playwright-parser';

export interface GherkinStep {
    keyword: 'Given' | 'When' | 'Then' | 'And';
    text: string;
    originalStep: TestStep;
}

export interface GherkinScenario {
    name: string;
    steps: GherkinStep[];
    originalTestCase: TestCase;
}

export interface GherkinFeature {
    name: string;
    background?: GherkinStep[];
    scenarios: GherkinScenario[];
    originalSuite: TestSuite;
}

export interface GherkinDocument {
    features: GherkinFeature[];
}

export class GherkinConverter {
    convert(parsedTest: ParsedPlaywrightTest): GherkinDocument {
        const features: GherkinFeature[] = parsedTest.suites.map(suite => 
            this.convertSuiteToFeature(suite)
        );

        return { features };
    }

    private convertSuiteToFeature(suite: TestSuite): GherkinFeature {
        const scenarios: GherkinScenario[] = suite.testCases.map(testCase =>
            this.convertTestCaseToScenario(testCase)
        );

        const background = suite.background 
            ? this.convertStepsToGherkin(suite.background, true)
            : undefined;

        return {
            name: suite.name,
            background,
            scenarios,
            originalSuite: suite
        };
    }

    private convertTestCaseToScenario(testCase: TestCase): GherkinScenario {
        const steps = this.convertStepsToGherkin(testCase.steps, false);

        return {
            name: testCase.name,
            steps,
            originalTestCase: testCase
        };
    }

    private convertStepsToGherkin(steps: TestStep[], isBackground: boolean): GherkinStep[] {
        return steps.map((step, index) => {
            const keyword = this.determineKeyword(step, index, isBackground);
            const text = this.convertStepToGherkinText(step);
            
            return {
                keyword,
                text,
                originalStep: step
            };
        });
    }

    private determineKeyword(step: TestStep, index: number, isBackground: boolean): 'Given' | 'When' | 'Then' | 'And' {
        if (isBackground) {
            return index === 0 ? 'Given' : 'And';
        }

        const description = step.description.toLowerCase();
        
        // First step is usually Given
        if (index === 0) {
            return 'Given';
        }

        // Define keyword patterns for better maintainability
        const actionKeywords = ['click', 'enter', 'fill', 'type', 'submit', 'navigate', 'go to'];
        const verificationKeywords = ['verify', 'check', 'should', 'expect', 'assert'];

        // Check for action keywords (When)
        const hasActionKeyword = actionKeywords.some(keyword => description.includes(keyword));
        if (hasActionKeyword) {
            return index === 1 ? 'When' : 'And';
        }

        // Check for verification keywords (Then)
        const hasVerificationKeyword = verificationKeywords.some(keyword => description.includes(keyword));
        if (hasVerificationKeyword) {
            return 'Then';
        }

        // Default: alternate between When and Then based on position
        return index === 1 ? 'When' : 'And';
    }

    private convertStepToGherkinText(step: TestStep): string {
        // Start with the step description
        let text = step.description;

        // Clean up the text to make it more readable
        // Remove any extra quotes or formatting
        text = text.replace(/['"`]/g, '');

        // Convert common patterns to better Gherkin syntax using a mapping
        const patterns = new Map([
            ['enter username', 'enters username'],
            ['enter password', 'enters password'],
            ['click login button', 'clicks the login button'],
            ['verify successful login', 'verify successful login'],
            ['enter invalid username', 'enters invalid username'],
            ['enter invalid password', 'enters invalid password'],
            ['verify error message', 'verify error message'],
            // Add more patterns as needed
        ]);

        // Apply pattern replacements
        for (const [pattern, replacement] of patterns) {
            if (text.includes(pattern)) {
                text = replacement;
                break; // Use first match to avoid conflicts
            }
        }

        return text;
    }

    generateGherkinString(document: GherkinDocument): string {
        let gherkin = '';

        document.features.forEach(feature => {
            gherkin += `Feature: ${feature.name}\n\n`;

            if (feature.background) {
                gherkin += '  Background:\n';
                feature.background.forEach(step => {
                    gherkin += `    ${step.keyword} ${step.text}\n`;
                });
                gherkin += '\n';
            }

            feature.scenarios.forEach(scenario => {
                gherkin += `  Scenario: ${scenario.name}\n`;
                scenario.steps.forEach(step => {
                    gherkin += `    ${step.keyword} ${step.text}\n`;
                });
                gherkin += '\n';
            });
        });

        return gherkin.trim();
    }
} 