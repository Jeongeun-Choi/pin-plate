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

## Auth Smoke Test

Start the Worker first:

```bash
pnpm --filter api dev
```

Then run the auth smoke script in another terminal:

```bash
pnpm --filter api smoke:auth
```

By default, the script creates a unique `example.com` smoke email and verifies:

- `GET /health`
- `GET /auth/ok`
- `POST /auth/sign-up/email`

Because local auth currently requires email verification, the default smoke run
stops after sign-up. That proves the Worker, Better Auth handler, database, and
sign-up route are connected without needing an inbox.

To test an existing verified account through sign-in, session lookup, and
sign-out:

```bash
AUTH_SMOKE_EMAIL="you@example.com" AUTH_SMOKE_PASSWORD="password" pnpm --filter api smoke:auth -- --sign-in
```

Or pass arguments:

```bash
pnpm --filter api smoke:auth -- --base-url=http://127.0.0.1:8787 --email=you@example.com --password=password --sign-in
```

To also verify that Google OAuth starts and returns a Google authorization URL:

```bash
pnpm --filter api smoke:auth -- --google
```

This checks that `/auth/sign-in/social` returns an OAuth URL with:

- `accounts.google.com`
- `redirect_uri=http://localhost:8787/auth/callback/google`
- `state`
- PKCE `code_challenge`

## Edge Security Controls

The Worker applies basic edge protections before handing `/auth/*` requests to
Better Auth:

- `GET /auth/get-session`: 240 requests per IP per minute.
- Sensitive auth starts such as sign-in, sign-up, password reset, and social
  sign-in: 20 requests per IP per 10 minutes.
- Email-bearing sensitive requests: 5 requests per normalized email per 10
  minutes.
- Other `/auth/*` requests: 60 requests per IP per minute.

Rate-limited responses return `429` with `Retry-After`, `X-RateLimit-Limit`,
`X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `X-RateLimit-Scope` headers.

All Worker responses include API-oriented security headers such as
`Content-Security-Policy`, `Permissions-Policy`, `Referrer-Policy`,
`X-Content-Type-Options`, `X-Frame-Options`, and
`X-Permitted-Cross-Domain-Policies`. HTTPS requests also receive HSTS.

CORS is credential-aware and only echoes the configured `FRONTEND_ORIGIN`. Local
origins are accepted only when `FRONTEND_ORIGIN` is itself local.

## Supabase Auth Migration

The migration keeps existing Pin Plate data connected by preserving Supabase
Auth user IDs as Better Auth user IDs. It does not move `posts`, `places`, or
`profiles`; those rows already live in `public` tables and continue to point at
the same user UUID values.

Run the dry-run first:

```bash
pnpm --filter api migrate:supabase-auth
```

The dry-run reports:

- Supabase Auth users scanned
- Better Auth users that would be inserted
- Google accounts that would be linked
- existing `posts`, `places`, and `profiles` that stay connected by user id
- user/email or Google account conflicts that must be resolved first

Apply only after the dry-run is clean:

```bash
pnpm --filter api migrate:supabase-auth -- --apply
```

Useful options:

```bash
pnpm --filter api migrate:supabase-auth -- --limit=10
pnpm --filter api migrate:supabase-auth -- --skip-google
pnpm --filter api migrate:supabase-auth -- --merge-conflicting-better-auth-users
pnpm --filter api migrate:supabase-auth -- --json
pnpm --filter api migrate:supabase-auth -- --env-file=apps/pin-plate/api/.dev.vars
```

If the dry-run shows a `same_email_different_id` conflict from a Better Auth
test login, review the conflict output first. Then apply with the merge flag:

```bash
pnpm --filter api migrate:supabase-auth -- --apply --merge-conflicting-better-auth-users
```

Safety notes:

- `--apply` runs inside a transaction and takes a Postgres advisory lock.
- Existing Better Auth users with the same id are left untouched.
- Same-email/different-id conflicts block `--apply`.
- `--merge-conflicting-better-auth-users` allows only reviewed
  same-email/different-id conflicts. It creates the Better Auth user with the
  Supabase Auth id, moves Better Auth foreign-key references such as `account`
  and `session`, then deletes the generated Better Auth test user. If Better
  Auth already has the same email, the old row's email is moved to a temporary
  local address inside the same transaction before deletion.
- Google identities are inserted into Better Auth `account` rows only when the
  Google account is not already linked to a different user.
- Supabase email/password hashes are not migrated. Password users should use the
  Better Auth password reset flow after the migration.
- Existing Supabase Auth sessions are not migrated. Users should sign in again.

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
pnpm --filter api secret:production BETTER_AUTH_SECRET
pnpm --filter api secret:production GOOGLE_CLIENT_ID
pnpm --filter api secret:production GOOGLE_CLIENT_SECRET
pnpm --filter api secret:production RESEND_API_KEY
pnpm --filter api secret:production DATABASE_URL
```

4. Prefer Hyperdrive for production Supabase Postgres access, then bind it as `HYPERDRIVE`.

5. Generate and apply Better Auth database tables after the production database
   connection strategy is finalized. The current Worker config is request-env
   based, so keep schema generation as a follow-up migration task rather than a
   default scaffold script.

6. Deploy with the production Wrangler config:

```bash
pnpm --filter api deploy:production
```

Or run the `Deploy Auth API` GitHub Actions workflow manually. The workflow
runs API lint, typecheck, a Wrangler dry run, deploys the Worker, then verifies
the deployed health/auth/Google OAuth start endpoints without creating a smoke
user.

## Notes

The existing Next.js app still uses Supabase Auth until the migration is intentionally wired through this Worker. Do not remove Supabase Auth from the frontend until email, Google OAuth, session lookup, password reset, and user migration are verified.
