import type { AIProvider, AIMessage } from './types';

export class AIToolExecutor {
  private provider: AIProvider;
  private tools: Map<string, ToolHandler>;
  private maxRetries = 3;

  constructor(provider: AIProvider) {
    this.provider = provider;
    this.tools = new Map();
  }

  registerTool(name: string, handler: ToolHandler): void {
    this.tools.set(name, handler);
  }

  async executeTool(
    toolName: string,
    input: unknown,
    context?: { userId?: string; conversationHistory?: AIMessage[] }
  ): Promise<ToolResult> {
    const handler = this.tools.get(toolName);

    if (!handler) {
      return {
        success: false,
        error: `Tool "${toolName}" not found`,
      };
    }

    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.maxRetries) {
      try {
        const result = await handler(input, {
          provider: this.provider,
          userId: context?.userId || 'anonymous',
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        lastError = error as Error;
        attempts++;

        if (attempts < this.maxRetries) {
          // Exponential backoff
          await this.sleep(Math.pow(2, attempts) * 100);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error after retries',
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async executeWithTools(
    messages: AIMessage[],
    toolNames: string[],
    options?: {
      model?: string;
      temperature?: number;
    }
  ): Promise<{ response: string; toolCalls?: ToolCall[]; usage?: TokenUsage }> {
    const toolDefinitions = toolNames
      .map((name) => {
        const handler = this.tools.get(name);
        if (!handler) return null;
        return {
          name,
          description: (handler as ToolHandler & { description?: string }).description || '',
          parameters: {},
        };
      })
      .filter(Boolean);

    const response = await this.provider.chat(messages, {
      model: options?.model,
      temperature: options?.temperature,
      tools: toolDefinitions as { type: 'function'; function: { name: string; description: string; parameters: Record<string, unknown> } }[],
      tool_choice: 'auto',
    });

    return {
      response: response.content,
      toolCalls: response.tool_calls?.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      })),
      usage: response.usage,
    };
  }
}

export interface ToolHandler {
  (input: unknown, context: { provider: AIProvider; userId: string }): Promise<unknown>;
  description?: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export const aiToolExecutor = new AIToolExecutor({} as AIProvider);