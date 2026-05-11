import { z } from 'zod';

// AI Provider interface
export interface AIProvider {
  chat(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>;
  getModels(): Promise<AIModel[]>;
}

// AI Message types
export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_calls?: AIToolCall[];
  tool_call_id?: string;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: AIToolDefinition[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface AIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  tool_calls?: AIToolCall[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  context_length: number;
}

// AI Tool types
export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// Analysis types
export interface AnalysisInput {
  failureId: string;
  errorMessage: string;
  stackTrace?: string;
  framework: 'playwright' | 'selenium' | 'cypress' | 'puppeteer' | 'other';
  testContext?: {
    testName?: string;
    testFile?: string;
    lineNumber?: number;
    browser?: string;
    os?: string;
  };
  artifacts?: {
    screenshots?: string[];
    logs?: string;
    networkTraces?: string;
  };
}

export interface AnalysisResult {
  id: string;
  failureId: string;
  category: FailureCategory;
  confidence: number;
  rootCause: string;
  explanation: string;
  recommendations: Recommendation[];
  rawResponse: unknown;
}

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

export interface Recommendation {
  type: 'locator_fix' | 'code_fix' | 'retry_strategy' | 'best_practice';
  title: string;
  description: string;
  originalCode?: string;
  suggestedCode?: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

// Tool input/output schemas
export const analyzeFailureInputSchema = z.object({
  failureId: z.string(),
  errorMessage: z.string(),
  stackTrace: z.string().optional(),
  framework: z.enum(['playwright', 'selenium', 'cypress', 'puppeteer', 'other']),
  testContext: z.object({
    testName: z.string().optional(),
    testFile: z.string().optional(),
    lineNumber: z.number().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
  }).optional(),
});

export const classifyErrorInputSchema = z.object({
  errorMessage: z.string(),
  stackTrace: z.string().optional(),
  framework: z.enum(['playwright', 'selenium', 'cypress', 'puppeteer', 'other']),
});

export const generateLocatorFixInputSchema = z.object({
  originalLocator: z.string(),
  failureType: z.enum(['synchronization', 'overlay', 'iframe', 'stale_element', 'locator_instability', 'timeout', 'api_failure', 'network', 'assertion', 'unknown']),
  framework: z.enum(['playwright', 'selenium', 'cypress', 'puppeteer', 'other']),
  pageHTML: z.string().optional(),
});

export const suggestRetryStrategyInputSchema = z.object({
  failureType: z.enum(['synchronization', 'overlay', 'iframe', 'stale_element', 'locator_instability', 'timeout', 'api_failure', 'network', 'assertion', 'unknown']),
  retryCount: z.number(),
  lastError: z.string(),
});

// Tool execution result
export interface ToolExecutionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}