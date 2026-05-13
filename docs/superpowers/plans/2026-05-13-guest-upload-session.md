# Guest Upload Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore guest photo upload while preventing unlimited public S3 presign generation.

**Architecture:** `/api/image` resolves every request to either a logged-in user actor or a signed guest upload session actor. Web uses an HttpOnly cookie, while mobile native can later send the same signed token in `X-Pin-Plate-Guest-Session`.

**Tech Stack:** Next.js route handlers, Supabase SSR auth, AWS S3 presigned POST, Vitest.

---

### Task 1: Guest Upload Route Behavior

**Files:**
- Modify: `apps/pin-plate/web/src/app/api/image/route.test.ts`
- Modify: `apps/pin-plate/web/src/app/api/image/route.ts`

- [ ] **Step 1: Write failing tests**

Add tests proving logged-out requests can upload, first guest responses set `pin_plate_guest_upload_session`, invalid SVG is rejected, repeated actor requests hit `429`, and logged-in uploads use `uploads/users/<id>/`.

- [ ] **Step 2: Verify RED**

Run: `pnpm --filter web test --run src/app/api/image/route.test.ts`

- [ ] **Step 3: Implement guest upload sessions**

Remove login-only blocking. Resolve upload actor from Supabase user, signed guest header, or signed guest cookie. Set a new HttpOnly guest cookie when no valid guest session exists.

- [ ] **Step 4: Verify GREEN**

Run: `pnpm --filter web test --run src/app/api/image/route.test.ts`

### Task 2: Required Verification

**Files:** no direct edits expected

- [ ] **Step 1: Lint**

Run: `pnpm lint:fix`

- [ ] **Step 2: Typecheck**

Run: `pnpm tsc`; if the root command has no project config, run `pnpm --filter web exec tsc --noEmit` and report the root limitation.

- [ ] **Step 3: Targeted tests**

Run: `pnpm --filter web test --run src/app/api/image/route.test.ts`
