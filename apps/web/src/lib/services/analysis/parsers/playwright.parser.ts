import type { ParsedFailure, FailureCategory } from '../types';

interface PlaywrightError {
  message: string;
  location?: {
    file: string;
    line: number;
    column: number;
  };
  stack?: string;
}

export class PlaywrightParser {
  private errorPatterns: Map<FailureCategory, RegExp[]> = new Map([
    ['locator_instability', [
      /selector.*does not match any element/i,
      /locator.*not found/i,
      /nth.*out of bounds/i,
      /could not locate element/i,
      /element.*not reachable/i,
    ]],
    ['synchronization', [
      /timeout.*exceeded/i,
      /waited.*for/i,
      /timeout.*waiting for/i,
      /action.*is not ready/i,
      /element.*not visible/i,
      /not.*interactable/i,
    ]],
    ['stale_element', [
      /stale element reference/i,
      /element.*not attached/i,
      /web element.*no longer attached/i,
    ]],
    ['overlay', [
      /overlay.*blocking/i,
      /modal.*intercepting/i,
      /dialog.*visible/i,
      /popup.*blocking/i,
    ]],
    ['iframe', [
      /frame.*not found/i,
      /iframe.*not found/i,
      /switch.*frame/i,
      /content frame.*not found/i,
    ]],
    ['timeout', [
      /timeout.*\d+ms/i,
      /exceeded timeout/i,
      /request.*timed out/i,
    ]],
    ['network', [
      /net::err/i,
      /failed to fetch/i,
      /network.*error/i,
      /connection.*refused/i,
      /dns.*fail/i,
    ]],
    ['api_failure', [
      /status code.*\d{3}/i,
      /response.*error/i,
      /api.*failed/i,
      /http status.*\d{3}/i,
      /request.*failed/i,
    ]],
    ['assertion', [
      /expect.*to (equal|match|contain)/i,
      /assertion.*failed/i,
      /expected.*but.*got/i,
      /received.*does not match/i,
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
      framework: 'playwright',
      testName: this.extractTestName(lines),
      testFile: errorInfo.location?.file,
      lineNumber: errorInfo.location?.line,
      browser: this.extractBrowser(lines),
      os: this.extractOS(lines),
      rawData: {
        raw: content,
        parsed: errorInfo,
      },
    };
  }

  private extractErrorInfo(lines: string[]): { message: string; stack?: string; location?: { file: string; line: number; column: number } } {
    const messageLines: string[] = [];
    const stackLines: string[] = [];
    let inStack = false;
    let location: { file: string; line: number; column: number } | undefined;

    for (const line of lines) {
      if (line.includes('Error:') || line.includes('error:')) {
        inStack = true;
      }

      if (inStack) {
        stackLines.push(line);

        // Extract location from stack
        const locationMatch = line.match(/at .+\((.+):(\d+):(\d+)\)/);
        if (locationMatch && !location) {
          location = {
            file: locationMatch[1],
            line: parseInt(locationMatch[2]),
            column: parseInt(locationMatch[3]),
          };
        }
      } else if (line.trim() && !line.startsWith('=') && !line.startsWith('-')) {
        messageLines.push(line.trim());
      }
    }

    return {
      message: messageLines.join(' ').replace(/^error:\s*/i, ''),
      stack: stackLines.length > 0 ? stackLines.join('\n') : undefined,
      location,
    };
  }

  private extractTestName(lines: string[]): string | undefined {
    // Look for test name patterns
    for (const line of lines) {
      const match = line.match(/test[:\s]+(.+)/i) || line.match(/"([^"]+)" failed/i);
      if (match) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  private extractBrowser(lines: string[]): string | undefined {
    for (const line of lines) {
      const match = line.match(/(chrome|firefox|safari|edge|webkit)/i);
      if (match) {
        return match[1].toLowerCase();
      }
    }
    return undefined;
  }

  private extractOS(lines: string[]): string | undefined {
    for (const line of lines) {
      const match = line.match(/(windows|mac|linux|ubuntu)/i);
      if (match) {
        return match[1].toLowerCase();
      }
    }
    return undefined;
  }

  private classifyError(message: string, stack?: string): FailureCategory {
    const text = `${message} ${stack || ''}`.toLowerCase();

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

      // Handle Playwright JSON reporter format
      const errors = data.errors || data.failures || [];
      if (errors.length > 0) {
        const error = errors[0];
        return {
          title: error.test || error.title || 'Unknown test',
          errorMessage: error.error?.message || error.message || 'Unknown error',
          stackTrace: error.error?.stack || error.stack,
          category: this.classifyError(error.error?.message || '', error.stack),
          framework: 'playwright',
          testName: error.test,
          testFile: error.location?.file,
          lineNumber: error.location?.line,
          browser: data.metadata?.browser,
          os: data.metadata?.platform,
          rawData: data,
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}

export const playwrightParser = new PlaywrightParser();