export interface AgentInput {
  runId: string;
  ticketId: string;
  ticketTitle: string;
  ticketDescription: string;
  baseBranch: string;
  branchPrefix?: string;
  targetWorkspace?: string;
  logger: AgentLogger;
}

export interface AgentLogger {
  info(message: string, metadata?: unknown): Promise<void>;
  toolCall(toolName: string, args: unknown): Promise<void>;
  toolResult(toolName: string, result: unknown): Promise<void>;
  error(message: string, metadata?: unknown): Promise<void>;
  success(message: string): Promise<void>;
}
