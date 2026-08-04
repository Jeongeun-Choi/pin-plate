# Pin Plate API

Cloudflare Worker backend for Pin Plate. The first responsibility is owning authentication outside Supabase Auth.

## Routes

```txt
GET /health
/auth/*
```

Production domain target:

```txt
https://api.pinonplate.com
```

Google OAuth redirect URI:

```txt
https://api.pinonplate.com/auth/callback/google
```

## Stack

- Cloudflare Workers
- TypeScript
- Better Auth
- Supabase Postgres through `pg`
- Cloudflare Hyperdrive for production database connectivity
- Resend-compatible email delivery

## Local Development

```bash
pnpm install
pnpm --filter api dev
```

Set local secrets with Wrangler or a local `.dev.vars` file:

```txt
BETTER_AUTH_SECRET=replace-with-at-least-32-characters
GOOGLE_CLIENT_ID=replace-me
GOOGLE_CLIENT_SECRET=replace-me
RESEND_API_KEY=replace-me
DATABASE_URL=postgres://user:password@host:5432/database
```

`wrangler.jsonc` already defines local non-secret vars:

```txt
BETTER_AUTH_URL=http://localhost:8787/auth
FRONTEND_ORIGIN=http://localhost:3000
AUTH_EMAIL_FROM=Pin Plate <auth@pinonplate.com>
```

## Production Setup

1. Connect `api.pinonplate.com` to this Worker in Cloudflare.
2. Set production vars:

```txt
BETTER_AUTH_URL=https://api.pinonplate.com/auth
FRONTEND_ORIGIN=https://pinonplate.com
AUTH_EMAIL_FROM=Pin Plate <auth@pinonplate.com>
```

3. Add Worker secrets:

```bash
pnpm --filter api wrangler secret put BETTER_AUTH_SECRET
pnpm --filter api wrangler secret put GOOGLE_CLIENT_ID
pnpm --filter api wrangler secret put GOOGLE_CLIENT_SECRET
pnpm --filter api wrangler secret put RESEND_API_KEY
pnpm --filter api wrangler secret put DATABASE_URL
```

4. Prefer Hyperdrive for production Supabase Postgres access, then bind it as `HYPERDRIVE`.

5. Generate and apply Better Auth database tables after the production database
   connection strategy is finalized. The current Worker config is request-env
   based, so keep schema generation as a follow-up migration task rather than a
   default scaffold script.

## Notes

The existing Next.js app still uses Supabase Auth until the migration is intentionally wired through this Worker. Do not remove Supabase Auth from the frontend until email, Google OAuth, session lookup, password reset, and user migration are verified.
