import { z } from 'zod';

export const analysisResponseSchema = z.object({
  category: z.string(),
  confidence: z.number(),
  rootCause: z.string(),
  explanation: z.string(),
  recommendations: z.array(z.object({
    type: z.string(),
    title: z.string(),
    description: z.string(),
    suggestedCode: z.string().optional(),
    priority: z.string(),
  })),
});

export function parseStructuredResponse(content: string): z.infer<typeof analysisResponseSchema> | null {
  try {
    // Try to find JSON in the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return analysisResponseSchema.parse(parsed);
    }

    // Try parsing the whole content
    return analysisResponseSchema.parse(JSON.parse(content));
  } catch {
    return null;
  }
}

export function extractJsonFromResponse(content: string): string | null {
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
  if (jsonMatch) {
    return jsonMatch[1] || jsonMatch[2];
  }
  return null;
}

export function validateResponseStructure(data: unknown): boolean {
  try {
    analysisResponseSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}