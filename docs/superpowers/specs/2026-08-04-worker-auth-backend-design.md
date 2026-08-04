# Worker Auth Backend Design

## Goal

Move Pin Plate authentication ownership away from Supabase Auth so the Google login screen and auth callbacks use a Pin Plate domain instead of a Supabase project domain.

The target public boundary is:

```txt
pinonplate.com
  Frontend application

api.pinonplate.com
  Cloudflare Worker backend
  Auth API first, other backend APIs later if needed
```

## Motivation

Supabase Auth custom domains require a paid Supabase setup. Pin Plate wants to avoid paying only to hide the Supabase project domain on OAuth screens. Owning the auth backend also gives the product more control over sessions, email login behavior, API authorization, and future backend boundaries.

This is not a small settings change. It is an authentication-system migration.

## Final Direction

Add a separate Cloudflare Worker app inside the existing monorepo and use it as the auth backend.

Recommended monorepo shape:

```txt
apps/pin-plate/
  web/
    Next.js frontend

  mobile/
    Expo app

  api/
    Cloudflare Worker backend
    Auth routes
    Email delivery integration
    Session verification
```

Recommended runtime stack:

- Cloudflare Workers
- TypeScript
- Better Auth
- Supabase Postgres as the database
- Cloudflare Hyperdrive for Postgres connectivity when needed
- Resend, Postmark, or AWS SES for email delivery
- Zod for request and environment validation
- Wrangler or SST for deployment

Do not introduce a long-running Node.js server for this migration. Cloudflare Workers should be the backend runtime. A Node.js-compatible flag such as `nodejs_compat` may still be needed depending on the database driver and auth-library requirements.

## Routing

Use a dedicated backend subdomain:

```txt
https://api.pinonplate.com
```

Auth paths should live directly under `/auth` because the domain already communicates that this is the API backend:

```txt
https://api.pinonplate.com/auth/sign-up
https://api.pinonplate.com/auth/sign-in
https://api.pinonplate.com/auth/sign-out
https://api.pinonplate.com/auth/session
https://api.pinonplate.com/auth/forgot-password
https://api.pinonplate.com/auth/reset-password
https://api.pinonplate.com/auth/callback/google
https://api.pinonplate.com/auth/verify-email
```

The exact generated subpaths can follow Better Auth conventions, but Pin Plate should expose them through the `api.pinonplate.com/auth/*` boundary.

Google OAuth redirect URI should use the Worker domain:

```txt
https://api.pinonplate.com/auth/callback/google
```

## Auth Scope

In this design, auth means:

- Email/password sign up
- Email/password sign in
- Google OAuth sign in
- OAuth callback handling
- Sign out
- Current session lookup
- Session cookie creation and validation
- Password reset request
- Password reset confirmation
- Email verification
- Later: password change, account deletion, social account linking, and stronger abuse protection

The frontend owns forms and user experience. The Worker owns credential checks, OAuth callbacks, session cookies, and auth database writes.

## Hono Decision

Hono is not required for the initial auth-only Worker.

Initial recommendation:

- Start with plain Cloudflare Worker handlers plus Better Auth.
- Add Hono later if the Worker grows beyond auth into posts, images, maps, shared links, or broader middleware-heavy API handling.

This keeps the first backend step easier to understand while leaving a clean migration path if route count grows.

## Cookie And CORS Policy

Frontend and backend use different origins:

```txt
Frontend origin: https://pinonplate.com
Backend origin:  https://api.pinonplate.com
```

The Worker must allow credentialed requests from the frontend:

```txt
Access-Control-Allow-Origin: https://pinonplate.com
Access-Control-Allow-Credentials: true
```

Frontend requests that need login state must include credentials:

```ts
fetch('https://api.pinonplate.com/auth/session', {
  credentials: 'include',
});
```

Start with these cookie defaults unless Better Auth requires different names or defaults:

- `HttpOnly`
- `Secure`
- `SameSite=Lax`
- `Path=/`
- Consider `Domain=.pinonplate.com` if the cookie needs to be shared across subdomains

Use `SameSite=None` only if OAuth, mobile WebView, or cross-origin cookie tests show that `Lax` does not work. If `None` is used, keep `Secure` and add explicit CSRF protection.

## Database Direction

Keep Supabase Postgres as the database at first, but stop using Supabase Auth as the identity provider.

Expected auth-owned tables:

- `user`
- `session`
- `account`
- `verification`

The exact table names and columns should follow Better Auth's adapter/schema expectations unless there is a strong project reason to customize them.

Existing app data currently tied to Supabase Auth user IDs must be migrated carefully. The migration must preserve ownership of posts, photos, shared maps, profile records, and any future user-scoped records.

## Email Delivery

Cloudflare Workers do not send product email by themselves. Use a dedicated email provider.

The Worker should send:

- Email verification links
- Password reset links
- Optional security notification emails later

Recommended providers:

- Resend for the simplest developer experience
- Postmark for strong transactional-email reliability
- AWS SES if keeping infrastructure inside AWS is preferred

## Migration Plan

1. Add `apps/pin-plate/api` as a Cloudflare Worker app.
2. Add environment validation for auth, database, frontend origin, and email provider configuration.
3. Add Better Auth server configuration.
4. Connect the Worker to Supabase Postgres.
5. Configure Google OAuth for `api.pinonplate.com`.
6. Add email delivery for verification and password reset flows.
7. Update the web app auth client to call `https://api.pinonplate.com/auth/*`.
8. Replace Supabase Auth middleware/session checks with Worker-backed session checks.
9. Migrate or map existing Supabase Auth users to the new auth tables.
10. Update protected API and page guards to trust only Worker-issued sessions.
11. Remove direct Supabase Auth usage from the web app after parity is verified.

## Security Requirements

- Keep auth cookies `HttpOnly` so client JavaScript cannot read session tokens.
- Do not trust `user_id` values sent by the client.
- Derive the acting user from the verified Worker session.
- Rate-limit sign in, sign up, password reset, and verification email requests.
- Avoid leaking whether an email exists during password reset.
- Use short-lived verification/reset tokens.
- Store passwords only through the auth library's secure hashing path.
- Keep OAuth client secrets and email provider API keys only in Worker secrets.
- Test OAuth and email flows in desktop browser, mobile browser, and the Expo WebView path.

## Non-Goals

- Do not proxy Supabase Auth through Cloudflare just to hide the domain.
- Do not keep Supabase Auth as the session authority after the migration.
- Do not build a custom password hashing/session system by hand unless Better Auth cannot satisfy a required flow.
- Do not move post, image, or map APIs into the Worker during the first auth migration unless needed for session verification.

## Open Decisions

- Whether to use Better Auth's default route conventions exactly or map them behind Pin Plate-specific `/auth/*` paths.
- Whether auth tables live in the existing Supabase database schema or a dedicated auth schema.
- Whether initial migration will support all existing users automatically or require a staged account-linking flow.
- Whether the first release enables email verification immediately or only email/password sign in plus password reset.
