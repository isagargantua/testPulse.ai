import type { AIMessage, AIProvider } from './types';

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute(input: TInput, context: ToolContext): Promise<TOutput>;
}

export interface ToolContext {
  provider: AIProvider;
  userId: string;
  conversationHistory: AIMessage[];
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void {
    this.tools.set(tool.name, tool as ToolDefinition);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getDefinitions(): { name: string; description: string; parameters: Record<string, unknown> }[] {
    return this.getAll().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

export const toolRegistry = new ToolRegistry();