#!/usr/bin/env node

import {
  applyPlan,
  assertPlanIsSafeToApply,
} from './supabase-auth-migration/apply.mjs';
import {
  createClient,
  getDatabaseUrl,
  parseArgs,
  readEnvFile,
} from './supabase-auth-migration/config.mjs';
import {
  createSummary,
  printJsonSummary,
  printSummary,
} from './supabase-auth-migration/output.mjs';
import { buildPlan } from './supabase-auth-migration/plan.mjs';
import { assertTablesExist } from './supabase-auth-migration/queries.mjs';

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const env = { ...readEnvFile(options.envFile), ...process.env };
  const databaseUrl = getDatabaseUrl(options, env);
  const client = await createClient(databaseUrl);

  try {
    await assertTablesExist(client);

    const plan = await buildPlan(client, options);
    const summary = createSummary(plan, options);

    if (options.shouldOutputJson) {
      printJsonSummary(summary);
    } else {
      printSummary(summary, plan);
    }

    if (!options.shouldApply) return;

    assertPlanIsSafeToApply(plan, options);
    await applyPlan(client, plan, options);

    if (!options.shouldOutputJson) {
      console.log('\nMigration applied successfully.');
    }
  } finally {
    await client.end();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
