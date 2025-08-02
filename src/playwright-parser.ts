export interface TestStep {
    description: string;
    code: string;
    line: number;
}

export interface TestCase {
    name: string;
    steps: TestStep[];
    line: number;
}

export interface TestSuite {
    name: string;
    background?: TestStep[];
    testCases: TestCase[];
    line: number;
}

export interface ParsedPlaywrightTest {
    suites: TestSuite[];
}

export class PlaywrightParser {
    private sourceCode: string;
    private lines: string[];

    constructor(sourceCode: string) {
        this.sourceCode = sourceCode;
        this.lines = sourceCode.split('\n');
    }

    parse(): ParsedPlaywrightTest {
        const suites: TestSuite[] = [];
        let currentSuite: TestSuite | null = null;
        let currentTestCase: TestCase | null = null;
        let currentSteps: TestStep[] = [];
        let inBackground = false;
        let braceCount = 0;
        let inTestFunction = false;

        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            const trimmedLine = line.trim();
            
            // Count braces to track function boundaries
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }
            
            // Parse test.describe
            if (trimmedLine.startsWith('test.describe(')) {
                if (currentSuite) {
                    suites.push(currentSuite);
                }
                const name = this.extractStringLiteral(trimmedLine);
                currentSuite = {
                    name: name || 'Unnamed Test Suite',
                    testCases: [],
                    line: i + 1
                };
                currentTestCase = null;
                currentSteps = [];
                inBackground = false;
                inTestFunction = false;
            }
            
            // Parse test.beforeEach
            else if (trimmedLine.startsWith('test.beforeEach(')) {
                inBackground = true;
                inTestFunction = false;
                currentSteps = [];
            }
            
            // Parse test()
            else if (trimmedLine.startsWith('test(')) {
                if (currentTestCase && currentSteps.length > 0) {
                    currentTestCase.steps = [...currentSteps];
                    if (currentSuite) {
                        currentSuite.testCases.push(currentTestCase);
                    }
                }
                
                // Save background if we have any
                if (currentSuite && inBackground && currentSteps.length > 0) {
                    currentSuite.background = [...currentSteps];
                }
                
                const name = this.extractStringLiteral(trimmedLine);
                currentTestCase = {
                    name: name || 'Unnamed Test',
                    steps: [],
                    line: i + 1
                };
                currentSteps = [];
                inBackground = false;
                inTestFunction = true;
            }
            
            // Parse test.step()
            else if (trimmedLine.includes('test.step(')) {
                const description = this.extractStringLiteral(trimmedLine);
                if (description) {
                    const step: TestStep = {
                        description,
                        code: this.extractStepCode(i),
                        line: i + 1
                    };
                    currentSteps.push(step);
                }
            }
            
            // End of test function (when we're back to brace count 0 and we were in a test function)
            else if (trimmedLine === '});' && inTestFunction && braceCount === 0) {
                if (currentSteps.length > 0) {
                    currentTestCase!.steps = [...currentSteps];
                }
                if (currentSuite && currentTestCase) {
                    currentSuite.testCases.push(currentTestCase);
                }
                currentTestCase = null;
                currentSteps = [];
                inTestFunction = false;
            }
            
            // End of beforeEach
            else if (trimmedLine === '});' && inBackground && braceCount === 0) {
                if (currentSuite && currentSteps.length > 0) {
                    currentSuite.background = [...currentSteps];
                }
                inBackground = false;
                currentSteps = [];
            }
        }

        // Add the last suite
        if (currentSuite) {
            suites.push(currentSuite);
        }

        return { suites };
    }

    private extractStringLiteral(line: string): string | null {
        const match = line.match(/['"`]([^'"`]*)['"`]/);
        return match ? match[1] : null;
    }

    private extractStepCode(startLine: number): string {
        let code = '';
        let braceCount = 0;
        let started = false;
        
        for (let i = startLine; i < this.lines.length; i++) {
            const line = this.lines[i];
            
            if (line.includes('{')) {
                braceCount++;
                started = true;
            }
            
            if (started) {
                code += line + '\n';
            }
            
            if (line.includes('}')) {
                braceCount--;
                if (braceCount === 0) {
                    break;
                }
            }
        }
        
        return code.trim();
    }
} 