#!/usr/bin/env node
import { runAgent } from './agent/index.js';
import { SupabaseLogger } from './logger/supabase-sink.js';

async function main() {
  const runId = process.env.GHOSTDEV_RUN_ID;
  const ticketId = process.env.GHOSTDEV_TICKET_ID;
  const ticketTitle = process.env.GHOSTDEV_TICKET_TITLE;
  const ticketDescription = process.env.GHOSTDEV_TICKET_DESCRIPTION ?? '';
  const baseBranch = process.env.GHOSTDEV_BASE_BRANCH ?? 'main';
  const targetWorkspace = process.env.GHOSTDEV_TARGET_WORKSPACE || undefined;
  const supabaseUrl = process.env.GHOSTDEV_SUPABASE_URL;
  const supabaseServiceKey = process.env.GHOSTDEV_SUPABASE_SERVICE_KEY;

  // 필수 환경변수 검증
  const missing = [
    !runId && 'GHOSTDEV_RUN_ID',
    !ticketId && 'GHOSTDEV_TICKET_ID',
    !ticketTitle && 'GHOSTDEV_TICKET_TITLE',
    !supabaseUrl && 'GHOSTDEV_SUPABASE_URL',
    !supabaseServiceKey && 'GHOSTDEV_SUPABASE_SERVICE_KEY',
    !process.env.ANTHROPIC_API_KEY && 'ANTHROPIC_API_KEY',
    !process.env.GITHUB_TOKEN && 'GITHUB_TOKEN',
    !process.env.GITHUB_REPOSITORY && 'GITHUB_REPOSITORY',
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error('필수 환경변수가 누락되었습니다:', missing.join(', '));
    process.exit(1);
  }

  const logger = new SupabaseLogger(runId!, supabaseUrl!, supabaseServiceKey!);

  await runAgent({
    runId: runId!,
    ticketId: ticketId!,
    ticketTitle: ticketTitle!,
    ticketDescription,
    baseBranch,
    targetWorkspace,
    logger,
  });
}

main().catch((error) => {
  console.error('Agent 실행 중 오류 발생:', error);
  process.exit(1);
});
