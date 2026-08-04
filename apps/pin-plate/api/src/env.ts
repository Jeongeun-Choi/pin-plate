import { z } from 'zod';

const hyperdriveSchema = z.object({
  connectionString: z.string().min(1),
});

const workerEnvSchema = z
  .object({
    AUTH_EMAIL_FROM: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    DATABASE_URL: z.string().url().optional(),
    FRONTEND_ORIGIN: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    HYPERDRIVE: hyperdriveSchema.optional(),
    RESEND_API_KEY: z.string().min(1),
  })
  .superRefine((env, ctx) => {
    if (!env.DATABASE_URL && !env.HYPERDRIVE?.connectionString) {
      ctx.addIssue({
        code: 'custom',
        message: 'DATABASE_URL or HYPERDRIVE.connectionString is required',
        path: ['DATABASE_URL'],
      });
    }
  });

export interface RuntimeEnv extends z.infer<typeof workerEnvSchema> {
  DATABASE_CONNECTION_STRING: string;
}

export const parseRuntimeEnv = (env: Env): RuntimeEnv => {
  const parsedEnv = workerEnvSchema.parse(env);

  return {
    ...parsedEnv,
    DATABASE_CONNECTION_STRING:
      parsedEnv.HYPERDRIVE?.connectionString ?? parsedEnv.DATABASE_URL!,
  };
};
