import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ENV_FILE = path.resolve(__dirname, '../../.dev.vars');

const parseBooleanEnv = (value) => value === 'true' || value === '1';

export const parseArgs = (argv) =>
  argv.reduce(
    (options, arg) => {
      if (arg === '--') return options;
      if (arg === '--apply') return { ...options, shouldApply: true };
      if (arg === '--dry-run') return { ...options, shouldApply: false };
      if (arg === '--include-deleted') {
        return { ...options, shouldIncludeDeletedUsers: true };
      }
      if (arg === '--skip-google') {
        return { ...options, shouldSkipGoogleAccounts: true };
      }
      if (arg === '--merge-conflicting-better-auth-users') {
        return {
          ...options,
          shouldMergeConflictingBetterAuthUsers: true,
        };
      }
      if (arg === '--json') return { ...options, shouldOutputJson: true };

      if (arg.startsWith('--database-url=')) {
        return { ...options, databaseUrl: arg.slice('--database-url='.length) };
      }

      if (arg.startsWith('--env-file=')) {
        return { ...options, envFile: arg.slice('--env-file='.length) };
      }

      if (arg.startsWith('--limit=')) {
        const parsedLimit = Number.parseInt(arg.slice('--limit='.length), 10);

        if (!Number.isFinite(parsedLimit) || parsedLimit < 1) {
          throw new Error('--limit must be a positive integer.');
        }

        return { ...options, limit: parsedLimit };
      }

      throw new Error(`Unknown argument: ${arg}`);
    },
    {
      databaseUrl: process.env.DATABASE_URL,
      envFile: process.env.AUTH_MIGRATION_ENV_FILE ?? DEFAULT_ENV_FILE,
      limit: null,
      shouldApply: parseBooleanEnv(process.env.AUTH_MIGRATION_APPLY),
      shouldIncludeDeletedUsers: parseBooleanEnv(
        process.env.AUTH_MIGRATION_INCLUDE_DELETED,
      ),
      shouldMergeConflictingBetterAuthUsers: parseBooleanEnv(
        process.env.AUTH_MIGRATION_MERGE_CONFLICTING_BETTER_AUTH_USERS,
      ),
      shouldOutputJson: parseBooleanEnv(process.env.AUTH_MIGRATION_JSON),
      shouldSkipGoogleAccounts: parseBooleanEnv(
        process.env.AUTH_MIGRATION_SKIP_GOOGLE,
      ),
    },
  );

export const readEnvFile = (envFilePath) => {
  if (!envFilePath || !fs.existsSync(envFilePath)) return {};

  return fs
    .readFileSync(envFilePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) return env;

      const delimiterIndex = trimmedLine.indexOf('=');

      if (delimiterIndex === -1) return env;

      const key = trimmedLine.slice(0, delimiterIndex).trim();
      let value = trimmedLine.slice(delimiterIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      return { ...env, [key]: value };
    }, {});
};

export const getDatabaseUrl = (options, env) => {
  const databaseUrl = options.databaseUrl ?? env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Set it in the environment, .dev.vars, or --database-url=...',
    );
  }

  return databaseUrl;
};

export const createClient = async (databaseUrl) => {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  return client;
};
