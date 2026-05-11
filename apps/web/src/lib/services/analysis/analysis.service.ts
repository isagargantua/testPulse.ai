import { getAIProvider } from '../ai/ai-client';
import { parseContent } from './parsers';
import type { ParsedFailure, AnalysisResult, Recommendation, FailureCategory, Framework } from './types';

interface AnalyzeFailureInput {
  errorMessage: string;
  stackTrace?: string;
  framework: Framework;
  testName?: string;
  testFile?: string;
  lineNumber?: number;
}

interface AIAnalysisResponse {
  category: FailureCategory;
  confidence: number;
  rootCause: string;
  explanation: string;
  recommendations: Recommendation[];
}

export class AnalysisService {
  async analyze(input: AnalyzeFailureInput): Promise<AnalysisResult> {
    const startTime = Date.now();

    // Parse the failure content
    const parsedFailure = parseContent(
      `${input.errorMessage}\n${input.stackTrace || ''}`,
      input.framework
    );

    // Run AI analysis
    const aiResult = await this.runAIAnalysis(parsedFailure);

    const processingTime = Date.now() - startTime;

    return {
      id: crypto.randomUUID(),
      failureId: parsedFailure.title,
      category: aiResult.category,
      confidence: aiResult.confidence,
      rootCause: aiResult.rootCause,
      explanation: aiResult.explanation,
      recommendations: aiResult.recommendations,
      processingTimeMs: processingTime,
      tokenUsage: 0, // Would be tracked by AI provider
    };
  }

  private async runAIAnalysis(failure: ParsedFailure): Promise<AIAnalysisResponse> {
    const provider = getAIProvider();

    const systemPrompt = `You are an expert QA automation engineer specializing in debugging test failures.

Analyze the test failure and provide a structured response with:
1. category: One of [synchronization, overlay, iframe, stale_element, locator_instability, timeout, api_failure, network, assertion, unknown]
2. confidence: A score from 0-1
3. rootCause: Brief statement of root cause
4. explanation: Detailed explanation of why this failure occurred
5. recommendations: Array of fix recommendations with type, title, description, suggestedCode (if applicable), and priority (high/medium/low)

Focus on actionable fixes. Provide code examples when relevant.`;

    const userPrompt = `Analyze this ${failure.framework} test failure:

Test: ${failure.testName || 'Unknown'}
File: ${failure.testFile || 'Unknown'}
${failure.lineNumber ? `Line: ${failure.lineNumber}` : ''}

Error Message:
${failure.errorMessage}

${failure.stackTrace ? `Stack Trace:\n${failure.stackTrace}` : ''}

${failure.browser ? `Browser: ${failure.browser}` : ''}
${failure.os ? `OS: ${failure.os}` : ''}

Provide your analysis in valid JSON format.`;

    const response = await provider.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.3,
      max_tokens: 2500,
    });

    // Parse AI response
    return this.parseAIResponse(response.content);
  }

  private parseAIResponse(content: string): AIAnalysisResponse {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          category: this.validateCategory(parsed.category),
          confidence: Math.min(1, Math.max(0, parseFloat(parsed.confidence) || 0.5)),
          rootCause: parsed.rootCause || 'Unable to determine root cause',
          explanation: parsed.explanation || parsed.rootCause || '',
          recommendations: this.parseRecommendations(parsed.recommendations || []),
        };
      }

      // Fallback if no JSON found
      return this.generateFallbackResponse(content);
    } catch {
      return this.generateFallbackResponse(content);
    }
  }

  private validateCategory(category: string): FailureCategory {
    const validCategories: FailureCategory[] = [
      'synchronization', 'overlay', 'iframe', 'stale_element',
      'locator_instability', 'timeout', 'api_failure', 'network',
      'assertion', 'unknown'
    ];

    const normalized = category.toLowerCase().replace(/\s+/g, '_');
    return validCategories.includes(normalized as FailureCategory)
      ? normalized as FailureCategory
      : 'unknown';
  }

  private parseRecommendations(recs: unknown[]): Recommendation[] {
    if (!Array.isArray(recs)) return [];

    return recs.map((rec: unknown) => {
      const r = rec as Record<string, unknown>;
      return {
        type: this.validateRecommendationType(r.type as string),
        title: String(r.title || 'Recommendation'),
        description: String(r.description || ''),
        suggestedCode: r.suggestedCode ? String(r.suggestedCode) : undefined,
        priority: this.validatePriority(r.priority as string),
      };
    });
  }

  private validateRecommendationType(type: string): Recommendation['type'] {
    const validTypes: Recommendation['type'][] = [
      'locator_fix', 'code_fix', 'retry_strategy', 'best_practice'
    ];
    const normalized = type.toLowerCase().replace(/\s+/g, '_');
    return validTypes.includes(normalized as Recommendation['type'])
      ? normalized as Recommendation['type']
      : 'best_practice';
  }

  private validatePriority(priority: string): Recommendation['priority'] {
    const normalized = priority.toLowerCase();
    if (['high', 'medium', 'low'].includes(normalized)) {
      return normalized as Recommendation['priority'];
    }
    return 'medium';
  }

  private generateFallbackResponse(content: string): AIAnalysisResponse {
    // Simple fallback when JSON parsing fails
    return {
      category: 'unknown',
      confidence: 0.4,
      rootCause: 'Analysis could not be completed',
      explanation: content.slice(0, 500),
      recommendations: [
        {
          type: 'best_practice',
          title: 'Review error details',
          description: 'Manually review the error message and stack trace above.',
          priority: 'medium',
        },
      ],
    };
  }

  async classifyFailure(
    errorMessage: string,
    stackTrace?: string,
    framework?: Framework
  ): Promise<{ category: FailureCategory; confidence: number }> {
    const provider = getAIProvider();

    const response = await provider.chat([
      {
        role: 'system',
        content: 'Classify this test error. Return JSON with category and confidence (0-1). Categories: synchronization, overlay, iframe, stale_element, locator_instability, timeout, api_failure, network, assertion, unknown.'
      },
      {
        role: 'user',
        content: `Error: ${errorMessage}\n\nStack: ${stackTrace || 'N/A'}`
      },
    ], {
      temperature: 0.1,
      max_tokens: 200,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          category: this.validateCategory(parsed.category),
          confidence: Math.min(1, Math.max(0, parseFloat(parsed.confidence) || 0.5)),
        };
      }
    } catch {
      // Fall through
    }

    return { category: 'unknown', confidence: 0.3 };
  }

  async suggestLocatorFix(
    originalLocator: string,
    failureType: FailureCategory,
    framework: Framework
  ): Promise<{ suggestedLocator: string; explanation: string }> {
    const provider = getAIProvider();

    const response = await provider.chat([
      {
        role: 'system',
        content: 'You are an expert at writing robust test locators. Generate improved locators for test automation. Return JSON with suggestedLocator and explanation.'
      },
      {
        role: 'user',
        content: `Original: ${originalLocator}\nFailure Type: ${failureType}\nFramework: ${framework}\n\nProvide an improved, more stable locator.`
      },
    ], {
      temperature: 0.3,
      max_tokens: 500,
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          suggestedLocator: parsed.suggestedLocator || originalLocator,
          explanation: parsed.explanation || '',
        };
      }
    } catch {
      // Fall through
    }

    return {
      suggestedLocator: originalLocator,
      explanation: 'Could not generate improved locator',
    };
  }
}

export const analysisService = new AnalysisService();