export type AgentRole = "UX_DESIGNER" | "FRONTEND_DEVELOPER" | "UI_DESIGNER" | "QA_ENGINEER";

export interface AgentConfig {
  role: AgentRole;
  name: string;
  systemPrompt: string;
  model: string; // e.g., 'gpt-4', 'claude-3-5-sonnet'
}
