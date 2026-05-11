import type { ParsedFailure, FailureCategory } from '../types';

export class SeleniumParser {
  private errorPatterns: Map<FailureCategory, RegExp[]> = new Map([
    ['locator_instability', [
      /no such element/i,
      /element.*not found/i,
      /unable to locate element/i,
      /invalid selector/i,
      /css selector.*not found/i,
    ]],
    ['stale_element', [
      /stale element reference/i,
      /element is no longer attached/i,
      /staleelementreference/i,
    ]],
    ['timeout', [
      /timeout.*exceeded/i,
      /timed out after/i,
      /timeout waiting for/i,
      /page load timeout/i,
    ]],
    ['synchronization', [
      /element.*not clickable/i,
      /element.*not interactable/i,
      /move target out of bounds/i,
      /other element would receive the click/i,
    ]],
    ['overlay', [
      /element.*blocked by/i,
      /overlay.*intercept/i,
      /modal.*blocking/i,
    ]],
    ['iframe', [
      /no such frame/i,
      /iframe.*not found/i,
      /switch to frame/i,
    ]],
    ['network', [
      /connection refused/i,
      /unknown host/i,
      /no such domain/i,
      /proxy.*error/i,
    ]],
    ['api_failure', [
      /http.*error/i,
      /status.*\d{3}/i,
      /response.*error/i,
    ]],
    ['assertion', [
      /assertion.*failed/i,
      /expected.*actual/i,
      /comparison.*failed/i,
    ]],
  ]);

  parse(content: string): ParsedFailure {
    const lines = content.split('\n');
    const errorInfo = this.extractErrorInfo(lines);
    const category = this.classifyError(errorInfo.message, errorInfo.stack);

    return {
      title: this.extractTestName(lines) || errorInfo.message.slice(0, 100),
      errorMessage: errorInfo.message,
      stackTrace: errorInfo.stack,
      category,
      framework: 'selenium',
      testName: this.extractTestName(lines),
      testFile: this.extractTestFile(errorInfo.stack),
      lineNumber: this.extractLineNumber(errorInfo.stack),
      browser: this.extractBrowser(lines),
      os: this.extractOS(lines),
      rawData: {
        raw: content,
        parsed: errorInfo,
      },
    };
  }

  private extractErrorInfo(lines: string[]): { message: string; stack?: string } {
    const messageLines: string[] = [];
    const stackLines: string[] = [];
    let inStack = false;

    for (const line of lines) {
      // Selenium stack traces often start with these patterns
      if (line.includes('org.openqa.selenium') ||
          line.includes('selenium') ||
          line.match(/^\s+at\s+\w+\.\w+\(/)) {
        inStack = true;
      }

      if (inStack) {
        stackLines.push(line);
      } else if (line.trim() && !line.startsWith('=') && !line.startsWith('-')) {
        messageLines.push(line.trim());
      }
    }

    const message = messageLines.join(' ').trim();
    return {
      message: message || 'Unknown error',
      stack: stackLines.length > 0 ? stackLines.join('\n') : undefined,
    };
  }

  private extractTestName(lines: string[]): string | undefined {
    for (const line of lines) {
      // Look for test method patterns
      const match = line.match(/test\s*[:\-]?\s*(.+)/i) ||
                   line.match(/(test\w+)\s*\(/i) ||
                   line.match(/method\s*[:\-]?\s*(.+)/i);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  private extractTestFile(stack?: string): string | undefined {
    if (!stack) return undefined;

    const match = stack.match(/at\s+[\w.]+\.([\w.]+)\.([\w]+)\(/);
    if (match) {
      return match[1] + '.java';
    }

    const fileMatch = stack.match(/File:\s*(.+)/i);
    return fileMatch?.[1];
  }

  private extractLineNumber(stack?: string): number | undefined {
    if (!stack) return undefined;

    const match = stack.match(/:\d+\)/);
    if (match) {
      const lineMatch = match[0].match(/:(\d+)\)/);
      return lineMatch ? parseInt(lineMatch[1]) : undefined;
    }
    return undefined;
  }

  private extractBrowser(lines: string[]): string | undefined {
    for (const line of lines) {
      const match = line.match(/(chrome|firefox|safari|edge|ie|edge)/i);
      if (match) {
        return match[1].toLowerCase();
      }
    }
    return undefined;
  }

  private extractOS(lines: string[]): string | undefined {
    for (const line of lines) {
      const match = line.match(/(windows|mac|linux|android|ios)/i);
      if (match) {
        return match[1].toLowerCase();
      }
    }
    return undefined;
  }

  private classifyError(message: string, stack?: string): FailureCategory {
    const text = `${message} ${stack || ''}`;

    for (const [category, patterns] of this.errorPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return category;
        }
      }
    }

    return 'unknown';
  }

  parseJSON(jsonContent: string): ParsedFailure | null {
    try {
      const data = JSON.parse(jsonContent);

      const errors = data.failures || data.errors || data.exceptions || [];
      if (errors.length > 0) {
        const error = errors[0];
        return {
          title: error.name || error.test || 'Unknown test',
          errorMessage: error.message || 'Unknown error',
          stackTrace: error.stackTrace || error.stack,
          category: this.classifyError(error.message || ''),
          framework: 'selenium',
          testName: error.test || error.name,
          rawData: data,
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}

export const seleniumParser = new SeleniumParser();