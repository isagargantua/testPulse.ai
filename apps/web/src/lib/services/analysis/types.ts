export type FailureCategory =
  | 'synchronization'
  | 'overlay'
  | 'iframe'
  | 'stale_element'
  | 'locator_instability'
  | 'timeout'
  | 'api_failure'
  | 'network'
  | 'assertion'
  | 'unknown';

export type Framework = 'playwright' | 'selenium' | 'cypress' | 'puppeteer' | 'other';

export interface ParsedFailure {
  title: string;
  errorMessage: string;
  stackTrace?: string;
  category: FailureCategory;
  framework: Framework;
  testName?: string;
  testFile?: string;
  lineNumber?: number;
  browser?: string;
  os?: string;
  rawData: Record<string, unknown>;
}

export interface AnalysisResult {
  id: string;
  failureId: string;
  category: FailureCategory;
  confidence: number;
  rootCause: string;
  explanation: string;
  recommendations: Recommendation[];
  processingTimeMs: number;
  tokenUsage: number;
}

export interface Recommendation {
  type: 'locator_fix' | 'code_fix' | 'retry_strategy' | 'best_practice';
  title: string;
  description: string;
  suggestedCode?: string;
  priority: 'high' | 'medium' | 'low';
}