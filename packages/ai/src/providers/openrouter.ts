import type { AIProvider, AIResponse, AIMessage, AIOptions } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'anthropic/claude-3.5-haiku';

interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
}

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || OPENROUTER_API_URL;
    this.defaultHeaders = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async chat(
    messages: AIMessage[],
    options?: AIOptions
  ): Promise<AIResponse> {
    const model = options?.model || DEFAULT_MODEL;

    const requestBody: Record<string, unknown> = {
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.name && { name: m.name }),
      })),
    };

    if (options?.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }

    if (options?.max_tokens !== undefined) {
      requestBody.max_tokens = options.max_tokens;
    }

    if (options?.tools && options.tools.length > 0) {
      requestBody.tools = options.tools;
    }

    if (options?.tool_choice) {
      requestBody.tool_choice = options.tool_choice;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
      model: data.model,
      finish_reason: data.choices[0]?.finish_reason || 'stop',
      tool_calls: data.choices[0]?.message?.tool_calls?.map((tc: { id: string; type: string; function: { name: string; arguments: string } }) => ({
        id: tc.id,
        type: tc.type,
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments,
        },
      })),
    };
  }

  async getModels(): Promise<{ id: string; name: string; provider: string; context_length: number }[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: this.defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map((model: { id: string; name?: string; context_length?: number }) => ({
      id: model.id,
      name: model.name || model.id,
      provider: 'openrouter',
      context_length: model.context_length || 4096,
    }));
  }
}

export function createOpenRouterProvider(apiKey: string): OpenRouterProvider {
  return new OpenRouterProvider({ apiKey });
}