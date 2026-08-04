import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

import { sendPasswordResetEmail, sendVerificationEmail } from './email/resend';
import type { RuntimeEnv } from './env';

interface CreateAuthParams {
  ctx: ExecutionContext;
  env: RuntimeEnv;
}

interface AuthRuntime {
  auth: {
    handler: (request: Request) => Promise<Response>;
  };
  closeDatabasePool: () => Promise<void>;
}

const createDatabasePool = (connectionString: string): Pool =>
  new Pool({
    allowExitOnIdle: true,
    connectionString,
    idleTimeoutMillis: 1_000,
    max: 1,
  });

const isSecureAuthUrl = (authUrl: string): boolean =>
  authUrl.startsWith('https://');

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

export const createAuthRuntime = ({
  ctx,
  env,
}: CreateAuthParams): AuthRuntime => {
  const databasePool = createDatabasePool(env.DATABASE_CONNECTION_STRING);
  const shouldUseSecureCookies = isSecureAuthUrl(env.BETTER_AUTH_URL);

  return {
    auth: betterAuth({
      appName: 'Pin Plate',
      baseURL: env.BETTER_AUTH_URL,
      secret: env.BETTER_AUTH_SECRET,
      trustedOrigins: [env.FRONTEND_ORIGIN],
      database: databasePool,
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
          accessType: 'offline',
          prompt: 'select_account consent',
          redirectURI: `${env.BETTER_AUTH_URL}/callback/google`,
          scope: ['email', 'profile'],
        },
      },
      advanced: {
        cookiePrefix: 'pin-plate',
        useSecureCookies: shouldUseSecureCookies,
        crossSubDomainCookies: {
          enabled: shouldUseSecureCookies,
          domain: 'pinonplate.com',
        },
        defaultCookieAttributes: {
          httpOnly: true,
          secure: shouldUseSecureCookies,
          sameSite: 'lax',
        },
        backgroundTasks: {
          handler: (promise) => {
            ctx.waitUntil(promise);
          },
        },
      },
    }),
    closeDatabasePool: () => databasePool.end(),
  };
};
