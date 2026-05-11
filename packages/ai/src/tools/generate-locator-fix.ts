import { z } from 'zod';
import type { ToolDefinition, ToolContext } from './tool-registry';

// Input schema
const generateLocatorFixInput = z.object({
  originalLocator: z.string(),
  failureType: z.enum(['synchronization', 'overlay', 'iframe', 'stale_element', 'locator_instability', 'timeout', 'api_failure', 'network', 'assertion', 'unknown']),
  framework: z.enum(['playwright', 'selenium', 'cypress', 'puppeteer', 'other']),
  pageContext: z.string().optional(),
});

// Output schema
const generateLocatorFixOutput = z.object({
  suggestedLocator: z.string(),
  locatorStrategy: z.enum(['css', 'xpath', 'id', 'name', 'text', 'role', 'testid']),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  alternatives: z.array(z.object({
    locator: z.string(),
    strategy: z.string(),
    pros: z.string(),
    cons: z.string(),
  })),
});

export const generateLocatorFixTool: ToolDefinition<
  z.infer<typeof generateLocatorFixInput>,
  z.infer<typeof generateLocatorFixOutput>
> = {
  name: 'generate-locator-fix',
  description: 'Generates improved locators for test automation based on failure context.',
  inputSchema: {
    type: 'object',
    properties: {
      originalLocator: { type: 'string', description: 'The original failing locator' },
      failureType: { type: 'string', enum: ['synchronization', 'overlay', 'iframe', 'stale_element', 'locator_instability', 'timeout', 'api_failure', 'network', 'assertion', 'unknown'] },
      framework: { type: 'string', enum: ['playwright', 'selenium', 'cypress', 'puppeteer', 'other'] },
      pageContext: { type: 'string', description: 'Optional HTML or context about the page' },
    },
    required: ['originalLocator', 'failureType', 'framework'],
  },
  execute: async (input, context) => {
    const { provider } = context;
    const validatedInput = generateLocatorFixInput.parse(input);

    const systemPrompt = `You are an expert at writing robust locators for test automation (${validatedInput.framework}). Generate improved locators that are stable and less likely to break.

Best practices for ${validatedInput.framework}:
${
  validatedInput.framework === 'playwright'
    ? '- Use getByRole(), getByText(), getByLabel() over CSS/XPath when possible\n- Use data-testid attribute for stable locators\n- Avoid partial matches and fragile selectors'
    : validatedInput.framework === 'selenium'
    ? '- Use By.id(), By.name(), By.cssSelector() over By.xpath() when possible\n- Avoid indexes in XPath\n- Use partial matches carefully'
    : '- Prioritize data-cy, data-testid attributes\n- Use specific selectors over partial matches'
}

Return JSON with suggested locator, strategy, confidence, explanation, and alternatives.`;

    const userPrompt = `Generate an improved locator:

Original Locator: ${validatedInput.originalLocator}
Failure Type: ${validatedInput.failureType}
${validatedInput.pageContext ? `\nPage Context:\n${validatedInput.pageContext}` : ''}`;

    const response = await provider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.3,
      max_tokens: 1000,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return generateLocatorFixOutput.parse(JSON.parse(jsonMatch[0]));
      }
      return generateLocatorFixOutput.parse(JSON.parse(response.content));
    } catch {
      return {
        suggestedLocator: validatedInput.originalLocator,
        locatorStrategy: 'css' as const,
        confidence: 0.5,
        explanation: response.content,
        alternatives: [],
      };
    }
  },
};