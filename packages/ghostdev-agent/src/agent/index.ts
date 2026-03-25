import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createTools } from './tools/index.js';
import { buildSystemPrompt } from './prompts/system.js';
import { buildTicketPrompt } from './prompts/ticket.js';
import type { AgentInput } from '../types.js';

export async function runAgent({
  ticketTitle,
  ticketDescription,
  baseBranch,
  targetWorkspace,
  logger,
}: AgentInput) {
  await logger.info(`티켓 구현 시작: ${ticketTitle}`);

  const tools = createTools(logger);

  const result = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: buildSystemPrompt({ repoPath: process.cwd(), targetWorkspace }),
    prompt: buildTicketPrompt({
      title: ticketTitle,
      description: ticketDescription,
      baseBranch,
    }),
    tools,
    maxSteps: 50,
    onStepStart: async (step) => {
      if (step.stepType === 'tool-result') return;
      await logger.info(`Step: ${step.stepType}`);
    },
    onStepFinish: async (step) => {
      for (const toolCall of step.toolCalls ?? []) {
        await logger.toolCall(toolCall.toolName, toolCall.args);
      }
    },
  });

  await logger.success(
    `완료. 총 ${result.usage.totalTokens} 토큰 사용.`,
  );

  return result;
}
