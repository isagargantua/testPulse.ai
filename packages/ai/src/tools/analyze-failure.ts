import { z } from 'zod';
import type { ToolDefinition, ToolContext } from './tool-registry';
import type { FailureCategory, Recommendation } from '../types';

// Input schema for analyze failure tool
const analyzeFailureInput = z.object({
  errorMessage: z.string(),
  stackTrace: z.string().optional(),
  framework: z.enum(['playwright', 'selenium', 'cypress', 'puppeteer', 'other']),
  testContext: z.object({
    testName: z.string().optional(),
    testFile: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
  }).optional(),
  previousFailures: z.array(z.object({
    errorMessage: z.string(),
    category: z.string(),
  })).optional(),
});

// Output schema for analyze failure tool
const analyzeFailureOutput = z.object({
  category: z.enum(['synchronization', 'overlay', 'iframe', 'stale_element', 'locator_instability', 'timeout', 'api_failure', 'network', 'assertion', 'unknown']),
  confidence: z.number().min(0).max(1),
  rootCause: z.string(),
  explanation: z.string(),
  recommendations: z.array(z.object({
    type: z.enum(['locator_fix', 'code_fix', 'retry_strategy', 'best_practice']),
    title: z.string(),
    description: z.string(),
    suggestedCode: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low']),
  })),
});

export const analyzeFailureTool: ToolDefinition<
  z.infer<typeof analyzeFailureInput>,
  z.infer<typeof analyzeFailureOutput>
> = {
  name: 'analyze-failure',
  description: 'Analyzes test failure artifacts to identify root cause, classify failure type, and generate recommendations.',
  inputSchema: {
    type: 'object',
    properties: {
      errorMessage: { type: 'string', description: 'The error message from the test failure' },
      stackTrace: { type: 'string', description: 'Optional stack trace from the failure' },
      framework: { type: 'string', enum: ['playwright', 'selenium', 'cypress', 'puppeteer', 'other'] },
      testContext: {
        type: 'object',
        properties: {
          testName: { type: 'string' },
          testFile: { type: 'string' },
          browser: { type: 'string' },
          os: { type: 'string' },
        },
      },
    },
    required: ['errorMessage', 'framework'],
  },
  execute: async (input, context) => {
    const { provider } = context;
    const validatedInput = analyzeFailureInput.parse(input);

    const systemPrompt = `You are an expert QA automation engineer specializing in debugging test failures. Your job is to analyze test failure artifacts and provide:
1. A clear classification of the failure type
2. The most likely root cause
3. Actionable recommendations to fix the issue

Failure categories:
- synchronization: Element not ready or timing issues
- overlay: Modal, popup, or overlay blocking interaction
- iframe: Element inside iframe not accessible
- stale_element: Element was detached from DOM
- locator_instability: Locator is fragile or not specific enough
- timeout: Operation took too long
- api_failure: Backend API returned error
- network: Network request failed
- assertion: Assertion failed (not a technical issue)
- unknown: Cannot determine cause

Be specific and actionable. Provide code examples when relevant.`;

    const userPrompt = `Analyze this test failure:

Framework: ${validatedInput.framework}
Error Message: ${validatedInput.errorMessage}
${validatedInput.stackTrace ? `\nStack Trace:\n${validatedInput.stackTrace}` : ''}
${validatedInput.testContext ? `\nTest Context: ${JSON.stringify(validatedInput.testContext, null, 2)}` : ''}

Provide your analysis in JSON format with:
- category: The failure type
- confidence: A score from 0-1
- rootCause: Brief statement of root cause
- explanation: Detailed explanation
- recommendations: Array of fix recommendations`;

    const response = await provider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.3,
      max_tokens: 2000,
    });

    try {
      // Try to parse as JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return analyzeFailureOutput.parse(parsed);
      }

      // Fallback: try to parse the whole response
      return analyzeFailureOutput.parse(JSON.parse(response.content));
    } catch {
      // If parsing fails, return a structured fallback
      return {
        category: 'unknown' as FailureCategory,
        confidence: 0.3,
        rootCause: 'Unable to determine root cause',
        explanation: response.content,
        recommendations: [],
      };
    }
  },
};