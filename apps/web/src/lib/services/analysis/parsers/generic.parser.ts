import type { ParsedFailure, FailureCategory } from '../types';

export class GenericParser {
  private errorPatterns: Map<FailureCategory, RegExp[]> = new Map([
    ['timeout', [/timeout/i, /timed out/i, /exceeded/i]],
    ['network', [/network/i, /connection/i, /dns/i, /refused/i]],
    ['api_failure', [/api/i, /http.*error/i, /status.*\d{3}/i]],
    ['locator_instability', [/element.*not.*found/i, /not found/i, /locator/i]],
    ['synchronization', [/not.*ready/i, /not.*visible/i, /not.*interactable/i]],
    ['assertion', [/assert/i, /expected/i, /actual/i]],
  ]);

  parse(content: string): ParsedFailure {
    const lines = content.split('\n').filter(l => l.trim());
    const errorMessage = this.extractErrorMessage(lines);
    const category = this.classifyError(errorMessage);

    return {
      title: this.extractTitle(lines) || errorMessage.slice(0, 100),
      errorMessage,
      stackTrace: this.extractStackTrace(lines),
      category,
      framework: 'other',
      testName: this.extractTestName(lines),
      rawData: { raw: content },
    };
  }

  private extractErrorMessage(lines: string[]): string {
    // Try to find the most relevant error line
    for (const line of lines) {
      if (line.includes('error') ||
          line.includes('failed') ||
          line.includes('exception')) {
        return line.trim();
      }
    }
    return lines[0] || 'Unknown error';
  }

  private extractStackTrace(lines: string[]): string | undefined {
    const stackLines: string[] = [];

    for (const line of lines) {
      if (line.match(/^\s+at\s+/) ||
          line.includes('.java:') ||
          line.includes('.ts:') ||
          line.includes('.js:')) {
        stackLines.push(line);
      }
    }

    return stackLines.length > 0 ? stackLines.join('\n') : undefined;
  }

  private extractTitle(lines: string[]): string | undefined {
    for (const line of lines) {
      if (line.match(/test[:\s]/i)) {
        return line.trim();
      }
    }
    return undefined;
  }

  private extractTestName(lines: string[]): string | undefined {
    for (const line of lines) {
      const match = line.match(/test\s*[:\-]?\s*(.+)/i);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private classifyError(message: string): FailureCategory {
    for (const [category, patterns] of this.errorPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          return category;
        }
      }
    }
    return 'unknown';
  }
}

export const genericParser = new GenericParser();