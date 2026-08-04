# Worker Auth Backend Scaffold Plan

## Goal

Add the first Cloudflare Worker backend package for Pin Plate authentication. This pass creates a deployable scaffold and keeps the existing Supabase Auth web flow untouched until the new backend is verified.

## Scope

Create `apps/pin-plate/api` as an independent pnpm workspace package.

This first implementation provides:

- Cloudflare Worker entrypoint
- Health endpoint
- Better Auth configuration skeleton
- Email sender abstraction for verification and password reset links
- Environment validation
- CORS handling for `https://pinonplate.com`
- Local type-check and lint scripts
- README with setup steps and required secrets

This first implementation does not:

- Replace the existing Next.js Supabase Auth flow
- Migrate existing users
- Create production database tables automatically
- Deploy the Worker
- Add Hono

## Files

- Create `apps/pin-plate/api/package.json`
- Create `apps/pin-plate/api/tsconfig.json`
- Create `apps/pin-plate/api/eslint.config.mjs`
- Create `apps/pin-plate/api/.prettierrc.js`
- Create `apps/pin-plate/api/wrangler.jsonc`
- Create `apps/pin-plate/api/worker-configuration.d.ts`
- Create `apps/pin-plate/api/src/index.ts`
- Create `apps/pin-plate/api/src/env.ts`
- Create `apps/pin-plate/api/src/auth.ts`
- Create `apps/pin-plate/api/src/email/resend.ts`
- Create `apps/pin-plate/api/README.md`
- Modify root `package.json` scripts to include API dev/lint/typecheck helpers.

## Architecture

`src/index.ts` exports the Worker `fetch` handler. It handles:

- `GET /health`
- `OPTIONS` preflight
- `/auth/*` delegation to Better Auth
- JSON `404` responses for unknown paths
- JSON `500` responses for unhandled errors

`src/auth.ts` exports a `createAuth(env, ctx)` factory so request-scoped Worker bindings can be passed into Better Auth email callbacks.

`src/env.ts` validates Worker bindings with Zod and rejects invalid runtime configuration before auth handling.

`src/email/resend.ts` sends transactional emails through Resend. Email failures are logged as errors. Actual auth responses should avoid leaking user-existence details.

## Security Notes

- Allow CORS only for configured frontend origins.
- Use credentialed CORS because session cookies are required.
- Keep auth secrets in Worker secrets, not source files.
- Start cookie policy with `SameSite=Lax`, `Secure`, `HttpOnly`.
- Do not trust client-supplied user IDs in future app APIs.
- Add rate limiting before production auth traffic.

## Verification

Run:

```bash
pnpm --filter api lint --fix
pnpm --filter api typecheck
```

If dependencies are missing, install workspace dependencies first.
