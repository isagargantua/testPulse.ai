import { z } from 'zod';
import type { ToolDefinition, ToolContext } from './tool-registry';

// Input schema
const classifyErrorInput = z.object({
  errorMessage: z.string(),
  stackTrace: z.string().optional(),
  framework: z.enum(['playwright', 'selenium', 'cypress', 'puppeteer', 'other']),
});

// Output schema
const classifyErrorOutput = z.object({
  category: z.enum(['synchronization', 'overlay', 'iframe', 'stale_element', 'locator_instability', 'timeout', 'api_failure', 'network', 'assertion', 'unknown']),
  confidence: z.number().min(0).max(1),
  keywords: z.array(z.string()),
  reasoning: z.string(),
});

export const classifyErrorTool: ToolDefinition<
  z.infer<typeof classifyErrorInput>,
  z.infer<typeof classifyErrorOutput>
> = {
  name: 'classify-error',
  description: 'Classifies a test error into a specific failure category with confidence score.',
  inputSchema: {
    type: 'object',
    properties: {
      errorMessage: { type: 'string', description: 'The error message to classify' },
      stackTrace: { type: 'string', description: 'Optional stack trace' },
      framework: { type: 'string', enum: ['playwright', 'selenium', 'cypress', 'puppeteer', 'other'] },
    },
    required: ['errorMessage', 'framework'],
  },
  execute: async (input, context) => {
    const { provider } = context;
    const validatedInput = classifyErrorInput.parse(input);

    const systemPrompt = `You are an expert at classifying test automation failures. Analyze the error message and determine the failure category.

Categories:
- synchronization: Wait conditions, timing issues, element not ready
- overlay: Modal, toast, or overlay blocking element access
- iframe: Element inside iframe requires frame switching
- stale_element: Element removed/replaced in DOM
- locator_instability: Selector too generic or dynamic
- timeout: Operation exceeded wait time
- api_failure: Backend/API returned error
- network: Network connectivity or DNS issues
- assertion: Test assertion failed (expected behavior)
- unknown: Cannot determine from provided info

Return a JSON object with category, confidence (0-1), keywords found, and reasoning.`;

    const userPrompt = `Classify this ${validatedInput.framework} test error:

Error: ${validatedInput.errorMessage}
${validatedInput.stackTrace ? `\nStack Trace:\n${validatedInput.stackTrace}` : ''}`;

    const response = await provider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.2,
      max_tokens: 500,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return classifyErrorOutput.parse(JSON.parse(jsonMatch[0]));
      }
      return classifyErrorOutput.parse(JSON.parse(response.content));
    } catch {
      return {
        category: 'unknown',
        confidence: 0.3,
        keywords: [],
        reasoning: response.content,
      };
    }
  },
};