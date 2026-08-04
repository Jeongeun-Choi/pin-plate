interface Hyperdrive {
  connectionString: string;
}

interface Env {
  AUTH_EMAIL_FROM: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DATABASE_URL?: string;
  FRONTEND_ORIGIN: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  HYPERDRIVE?: Hyperdrive;
  RESEND_API_KEY: string;
}
