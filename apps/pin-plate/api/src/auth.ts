import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

import { sendPasswordResetEmail, sendVerificationEmail } from './email/resend';
import type { RuntimeEnv } from './env';

interface CreateAuthParams {
  ctx: ExecutionContext;
  env: RuntimeEnv;
}

const databasePools = new Map<string, Pool>();

const getDatabasePool = (connectionString: string): Pool => {
  const existingDatabasePool = databasePools.get(connectionString);

  if (existingDatabasePool) {
    return existingDatabasePool;
  }

  const databasePool = new Pool({
    connectionString,
    max: 5,
  });

  databasePools.set(connectionString, databasePool);

  return databasePool;
};

const scheduleEmail = (
  ctx: ExecutionContext,
  emailDelivery: Promise<void>,
): void => {
  ctx.waitUntil(
    emailDelivery.catch((error: unknown) => {
      console.error('Auth email delivery failed', error);
    }),
  );
};

export const createAuth = ({ ctx, env }: CreateAuthParams) =>
  betterAuth({
    appName: 'Pin Plate',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [env.FRONTEND_ORIGIN],
    database: getDatabasePool(env.DATABASE_CONNECTION_STRING),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        scheduleEmail(
          ctx,
          sendPasswordResetEmail({
            apiKey: env.RESEND_API_KEY,
            from: env.AUTH_EMAIL_FROM,
            to: user.email,
            url,
          }),
        );
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        scheduleEmail(
          ctx,
          sendVerificationEmail({
            apiKey: env.RESEND_API_KEY,
            from: env.AUTH_EMAIL_FROM,
            to: user.email,
            url,
          }),
        );
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectURI: `${env.BETTER_AUTH_URL}/callback/google`,
        scope: ['email', 'profile'],
      },
    },
    advanced: {
      cookiePrefix: 'pin-plate',
      useSecureCookies: env.BETTER_AUTH_URL.startsWith('https://'),
      crossSubDomainCookies: {
        enabled: true,
        domain: 'pinonplate.com',
      },
      defaultCookieAttributes: {
        httpOnly: true,
        secure: env.BETTER_AUTH_URL.startsWith('https://'),
        sameSite: 'lax',
      },
      backgroundTasks: {
        handler: (promise) => {
          ctx.waitUntil(promise);
        },
      },
    },
  });
