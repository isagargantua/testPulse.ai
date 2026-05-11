const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'anthropic/claude-3-haiku-20240307';

interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

interface AIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: unknown[];
}

interface AIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  finish_reason: string;
  tool_calls?: unknown[];
}

interface AIProvider {
  chat(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>;
}

interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
}

export class AIStreamProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || OPENROUTER_API_URL;
    this.defaultModel = DEFAULT_MODEL;
  }

  async chat(
    messages: AIMessage[],
    options?: AIOptions
  ): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;

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

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
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

  async *chatStream(
    messages: AIMessage[],
    options?: AIOptions
  ): AsyncGenerator<string, void, unknown> {
    const model = options?.model || this.defaultModel;

    const requestBody: Record<string, unknown> = {
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    };

    if (options?.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }

    if (options?.max_tokens !== undefined) {
      requestBody.max_tokens = options.max_tokens;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async getModels(): Promise<{ id: string; name: string; provider: string; context_length: number }[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch models');

    const data = await response.json();
    return data.data.map((model: { id: string; name?: string; context_length?: number }) => ({
      id: model.id,
      name: model.name || model.id,
      provider: 'openrouter',
      context_length: model.context_length || 4096,
    }));
  }
}

let provider: AIStreamProvider | null = null;

export function getAIProvider(): AIStreamProvider {
  if (!provider) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

    provider = new AIStreamProvider({ apiKey });
  }
  return provider;
}

export function createAIProvider(apiKey: string): AIStreamProvider {
  provider = new AIStreamProvider({ apiKey });
  return provider;
}