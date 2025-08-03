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

        // Check for action keywords (When)
        if (description.includes('click') || 
            description.includes('enter') || 
            description.includes('fill') ||
            description.includes('type') ||
            description.includes('submit') ||
            description.includes('navigate') ||
            description.includes('go to')) {
            return index === 1 ? 'When' : 'And';
        }

        // Check for verification keywords (Then)
        if (description.includes('verify') || 
            description.includes('check') || 
            description.includes('should') ||
            description.includes('expect') ||
            description.includes('assert')) {
            return 'Then';
        }

        // Default: alternate between When and Then based on position
        return index === 1 ? 'When' : 'And';
    }

    private convertStepToGherkinText(step: TestStep): string {
        // Clean up the text by removing quotes and formatting artifacts
        return step.description.replace(/['"`]/g, '');
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