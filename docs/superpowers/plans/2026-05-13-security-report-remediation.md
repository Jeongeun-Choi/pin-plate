# Security Report Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate the three high-confidence `/cso` findings from `.gstack/security-reports/2026-05-13-134500.json`.

**Architecture:** Keep the guest browsing experience public, but stop public users from minting S3 upload permissions and throttle billable Google Places proxy calls. Use small route-local tests and one shared server utility for rate limiting so behavior is explicit and easy to regression-test.

**Tech Stack:** Next.js App Router route handlers, Supabase SSR auth, Vitest, pnpm.

---

### Task 1: Require Auth for Image Presign

**Files:**
- Create: `apps/pin-plate/web/src/app/api/image/route.test.ts`
- Modify: `apps/pin-plate/web/src/app/api/image/route.ts`

- [ ] **Step 1: Write failing tests**

Add tests that mock `@/utils/supabase/server`, call `POST`, and assert logged-out requests return `401` before S3 presign generation.

- [ ] **Step 2: Run image route tests and verify RED**

Run: `pnpm --filter web test --run src/app/api/image/route.test.ts`

- [ ] **Step 3: Implement minimal auth check**

Use the server Supabase client in the route handler and return `401` when `auth.getUser()` has no user or an auth error.

- [ ] **Step 4: Run image route tests and verify GREEN**

Run: `pnpm --filter web test --run src/app/api/image/route.test.ts`

### Task 2: Add Shared Rate Limit for Search APIs

**Files:**
- Create: `apps/pin-plate/web/src/app/api/_utils/rateLimit.ts`
- Modify: `apps/pin-plate/web/src/app/api/search/route.ts`
- Modify: `apps/pin-plate/web/src/app/api/search/nearby/route.ts`
- Modify: `apps/pin-plate/web/src/app/api/search/nearby/route.test.ts`
- Create: `apps/pin-plate/web/src/app/api/search/route.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests that send repeated requests from the same `x-forwarded-for` value and expect `429` after the configured limit for both text search and nearby search.

- [ ] **Step 2: Run search route tests and verify RED**

Run: `pnpm --filter web test --run src/app/api/search/route.test.ts src/app/api/search/nearby/route.test.ts`

- [ ] **Step 3: Implement shared limiter**

Add a tiny in-memory limiter keyed by a trusted request header fallback and use it in both Google Places route handlers before calling `fetch`.

- [ ] **Step 4: Run search route tests and verify GREEN**

Run: `pnpm --filter web test --run src/app/api/search/route.test.ts src/app/api/search/nearby/route.test.ts`

### Task 3: Upgrade Next.js

**Files:**
- Modify: `apps/pin-plate/web/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Update dependency**

Run: `pnpm --filter web add next@^16.2.6 eslint-config-next@^16.2.6`

- [ ] **Step 2: Verify dependency remediation**

Run: `pnpm audit --prod --json`

### Task 4: Required Project Verification

**Files:** no direct edits expected

- [ ] **Step 1: Lint/fix**

Run: `pnpm lint:fix`

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc`

- [ ] **Step 3: Targeted tests**

Run: `pnpm --filter web test --run src/app/api/image/route.test.ts src/app/api/search/route.test.ts src/app/api/search/nearby/route.test.ts`
