# Trusted Image Key Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move image trust from client-supplied URLs to server-issued S3 image keys while preserving logged-in upload, guest upload, and shared map previews.

**Architecture:** Add a shared image reference utility that validates upload keys and derives public URLs from `IMAGE_PUBLIC_BASE_URL`. Return `imageKey` from `/api/image`, track uploaded photos as key+URL pairs in post forms, keep legacy `image_urls` compatibility, route server-backed post writes through a trusted server boundary, and gate shared OG image fetching behind the same trusted-image policy.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Supabase, S3 presigned uploads, React hooks, localStorage guest posts.

---

## File Structure

- Create: `apps/pin-plate/web/src/features/image/utils/imageReference.ts`
  - Owns trusted key validation, public URL generation, and trusted public URL parsing.
- Create: `apps/pin-plate/web/src/features/image/utils/__tests__/imageReference.test.ts`
  - Covers allowed keys, rejected URL-shaped keys, traversal, user/guest prefixes, and public URL checks.
- Modify: `apps/pin-plate/web/src/app/api/image/route.ts`
  - Return `imageKey` and `publicUrl` while keeping existing `fileName` and `objectUrl` compatibility.
- Modify: `apps/pin-plate/web/src/app/api/image/route.test.ts`
  - Assert upload responses include trusted key fields.
- Modify: `apps/pin-plate/web/src/features/post/types/post.ts`
  - Add optional `image_keys?: string[]` compatibility field.
- Create: `apps/pin-plate/web/src/app/api/posts/route.ts`
  - Validates the logged-in user and image keys, derives `image_urls`, strips client-only `image_keys`, and creates posts.
- Create: `apps/pin-plate/web/src/app/api/posts/route.test.ts`
  - Covers trusted user keys, trusted guest keys during sync, rejected external URL-shaped keys, and DB inserts that never trust submitted URLs.
- Modify: `apps/pin-plate/web/src/features/guest/types/guestPost.ts`
  - Add optional `image_keys?: string[]`.
- Modify: `apps/pin-plate/web/src/features/guest/storage/guestPostStorage.ts`
  - Parse legacy guest posts without keys and validate optional key arrays.
- Modify: `apps/pin-plate/web/src/features/post/hooks/usePostForm.ts`
  - Track uploaded photo references and submit both `image_urls` and `image_keys`.
- Modify: `apps/pin-plate/web/src/features/post/hooks/useEditPostForm.ts`
  - Preserve existing URL-only photos and add keys for newly uploaded photos.
- Modify: `apps/pin-plate/web/src/features/post/components/PostForm.tsx`
  - Continue rendering URL strings from the updated form state.
- Modify: `apps/pin-plate/web/src/features/post/components/EditPostContent.tsx`
  - Continue rendering URL strings from the updated edit state.
- Modify: `apps/pin-plate/web/src/features/guest/hooks/useSyncGuestPosts.ts`
  - Send `image_keys` when syncing guest posts.
- Modify: `apps/pin-plate/web/src/features/shared-map/utils/sharePreview.ts`
  - Reject non-trusted cover URLs before issuing `HEAD`.
- Modify tests under post, guest, shared-map metadata, and sharePreview to cover the new behavior.

---

## Task 1: Image Reference Utility

**Files:**
- Create: `apps/pin-plate/web/src/features/image/utils/imageReference.ts`
- Create: `apps/pin-plate/web/src/features/image/utils/__tests__/imageReference.test.ts`

- [ ] **Step 1: Write the failing utility tests**

```ts
import { describe, expect, it } from 'vitest';
import {
  buildPublicImageUrl,
  getTrustedImageUrl,
  isTrustedGuestImageKey,
  isTrustedUserImageKey,
} from '../imageReference';

describe('imageReference', () => {
  it('builds a public URL from a trusted key', () => {
    process.env.IMAGE_PUBLIC_BASE_URL = 'https://image.example.test/';

    expect(
      buildPublicImageUrl('uploads/users/user-1/photo.webp'),
    ).toBe('https://image.example.test/uploads/users/user-1/photo.webp');
  });

  it('accepts only keys for the current user prefix', () => {
    expect(isTrustedUserImageKey('uploads/users/user-1/photo.webp', 'user-1')).toBe(true);
    expect(isTrustedUserImageKey('uploads/users/user-2/photo.webp', 'user-1')).toBe(false);
    expect(isTrustedUserImageKey('https://evil.test/photo.webp', 'user-1')).toBe(false);
  });

  it('accepts only keys for the current guest prefix', () => {
    expect(isTrustedGuestImageKey('uploads/guests/guest-1/photo.webp', 'guest-1')).toBe(true);
    expect(isTrustedGuestImageKey('uploads/guests/guest-2/photo.webp', 'guest-1')).toBe(false);
    expect(isTrustedGuestImageKey('uploads/guests/guest-1/../photo.webp', 'guest-1')).toBe(false);
  });

  it('trusts public URLs only when they map to an allowed upload key', () => {
    process.env.IMAGE_PUBLIC_BASE_URL = 'https://image.example.test';

    expect(
      getTrustedImageUrl('https://image.example.test/uploads/users/user-1/photo.webp'),
    ).toBe('https://image.example.test/uploads/users/user-1/photo.webp');
    expect(getTrustedImageUrl('https://evil.test/uploads/users/user-1/photo.webp')).toBeNull();
    expect(getTrustedImageUrl('https://image.example.test/private/photo.webp')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the failing utility tests**

Run:

```bash
pnpm --filter web test src/features/image/utils/__tests__/imageReference.test.ts
```

Expected: fail because `imageReference.ts` does not exist.

- [ ] **Step 3: Implement the utility**

```ts
const DEFAULT_IMAGE_PUBLIC_BASE_URL = 'https://pinonplate.com';
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.png', '.webp', '.gif'];

const getImagePublicBaseUrl = (): string =>
  (process.env.IMAGE_PUBLIC_BASE_URL ?? DEFAULT_IMAGE_PUBLIC_BASE_URL).replace(
    /\/+$/g,
    '',
  );

const hasAllowedImageExtension = (imageKey: string): boolean =>
  ALLOWED_IMAGE_EXTENSIONS.some((extension) =>
    imageKey.toLowerCase().endsWith(extension),
  );

export const isTrustedImageKey = (imageKey: string): boolean =>
  !imageKey.includes('://') &&
  !imageKey.startsWith('/') &&
  !imageKey.includes('..') &&
  imageKey.startsWith('uploads/') &&
  hasAllowedImageExtension(imageKey);

export const isTrustedUserImageKey = (
  imageKey: string,
  userId: string,
): boolean =>
  isTrustedImageKey(imageKey) && imageKey.startsWith(`uploads/users/${userId}/`);

export const isTrustedGuestImageKey = (
  imageKey: string,
  guestId: string,
): boolean =>
  isTrustedImageKey(imageKey) &&
  imageKey.startsWith(`uploads/guests/${guestId}/`);

export const buildPublicImageUrl = (imageKey: string): string =>
  new URL(imageKey, `${getImagePublicBaseUrl()}/`).toString();

export const getTrustedImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) return null;

  try {
    const parsedImageUrl = new URL(imageUrl);
    const publicBaseUrl = new URL(getImagePublicBaseUrl());

    if (
      parsedImageUrl.protocol !== 'https:' ||
      parsedImageUrl.origin !== publicBaseUrl.origin
    ) {
      return null;
    }

    const imageKey = parsedImageUrl.pathname.replace(/^\/+/, '');

    return isTrustedImageKey(imageKey) ? parsedImageUrl.toString() : null;
  } catch {
    return null;
  }
};
```

- [ ] **Step 4: Run the utility tests**

Run:

```bash
pnpm --filter web test src/features/image/utils/__tests__/imageReference.test.ts
```

Expected: pass.

---

## Task 2: Upload API Returns Trusted Keys

**Files:**
- Modify: `apps/pin-plate/web/src/app/api/image/route.ts`
- Modify: `apps/pin-plate/web/src/app/api/image/route.test.ts`

- [ ] **Step 1: Write the failing route test**

Add an assertion to the existing successful presigned upload test:

```ts
expect(json.urls[0]).toEqual(
  expect.objectContaining({
    imageKey: expect.stringMatching(/^uploads\/(users|guests)\//),
    publicUrl: expect.stringMatching(/^https:\/\//),
    objectUrl: expect.stringMatching(/^https:\/\//),
  }),
);
```

- [ ] **Step 2: Run the route test**

Run:

```bash
pnpm --filter web test src/app/api/image/route.test.ts
```

Expected: fail because `imageKey` and `publicUrl` are missing.

- [ ] **Step 3: Return key and public URL**

In `apps/pin-plate/web/src/app/api/image/route.ts`, import `buildPublicImageUrl` and change the presigned item mapping:

```ts
const imageKey = getUploadKey(actor, file);
const publicUrl = buildPublicImageUrl(imageKey);
return {
  originalName: file.filename,
  fileName: imageKey,
  imageKey,
  url,
  fields,
  objectUrl: publicUrl,
  publicUrl,
};
```

Keep `fileName` and `objectUrl` so existing callers do not break.

- [ ] **Step 4: Run the route test**

Run:

```bash
pnpm --filter web test src/app/api/image/route.test.ts
```

Expected: pass.

---

## Task 3: Post and Guest Types Carry Image Keys

**Files:**
- Modify: `apps/pin-plate/web/src/features/post/types/post.ts`
- Modify: `apps/pin-plate/web/src/features/guest/types/guestPost.ts`
- Modify: `apps/pin-plate/web/src/features/guest/storage/guestPostStorage.ts`
- Modify: `apps/pin-plate/web/src/features/guest/hooks/__tests__/useGuestPosts.test.tsx`

- [ ] **Step 1: Write guest storage compatibility test**

Add tests that legacy guest posts without `image_keys` still parse and invalid `image_keys` are dropped by treating the post as invalid.

```ts
expect(
  parseGuestPosts([{ ...guestPostFixture, image_urls: ['https://old.test/a.jpg'] }]),
).toHaveLength(1);

expect(
  parseGuestPosts([{ ...guestPostFixture, image_keys: ['https://evil.test/a.jpg'] }]),
).toHaveLength(0);
```

- [ ] **Step 2: Add optional type fields**

```ts
export interface CreatePostPayload {
  place_id?: string;
  content: string;
  rating: number;
  image_urls: string[];
  image_keys?: string[];
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  kakao_place_id: string;
  user_id: string;
  tags: string[];
}
```

```ts
export interface GuestPost {
  id: string;
  created_at: string;
  place_name: string;
  address: string;
  lat: number;
  lng: number;
  kakao_place_id: string;
  content: string;
  rating: number;
  image_urls: string[];
  image_keys?: string[];
  tags: string[];
  status?: PlaceStatus;
  has_visit_record?: boolean;
}
```

- [ ] **Step 3: Validate optional guest keys**

In `guestPostStorage.ts`, import `isTrustedImageKey` and add:

```ts
const isValidGuestPostImageKeys = (value: unknown): boolean =>
  typeof value === 'undefined' ||
  (Array.isArray(value) &&
    value.every((imageKey) => typeof imageKey === 'string' && isTrustedImageKey(imageKey)));
```

Then include it in `isValidGuestPost`.

- [ ] **Step 4: Run guest tests**

Run:

```bash
pnpm --filter web test src/features/guest/hooks/__tests__/useGuestPosts.test.tsx
```

Expected: pass.

---

## Task 4: Trusted Post Create API

**Files:**
- Create: `apps/pin-plate/web/src/app/api/posts/route.ts`
- Create: `apps/pin-plate/web/src/app/api/posts/route.test.ts`
- Modify: `apps/pin-plate/web/src/features/post/api/createPost.ts`

- [ ] **Step 1: Write route tests for accepted and rejected keys**

```ts
it('creates a post from trusted user image keys', async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  mockSupabaseInsert.mockResolvedValue({ data: [{ id: 1 }], error: null });

  const response = await POST(
    makeRequest({
      content: '맛있어요',
      rating: 5,
      image_keys: ['uploads/users/user-1/photo.webp'],
      tags: [],
      place_name: '성수 카페',
      address: '서울 성동구',
      lat: 37.5,
      lng: 127,
      kakao_place_id: 'kakao-1',
      user_id: 'user-1',
      place_id: 'place-1',
    }) as never,
  );

  expect(response.status).toBe(200);
  expect(mockSupabaseInsert).toHaveBeenCalledWith(
    expect.objectContaining({
      image_urls: ['https://image.example.test/uploads/users/user-1/photo.webp'],
      user_id: 'user-1',
    }),
  );
});

it('rejects URL-shaped image keys before inserting', async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });

  const response = await POST(
    makeRequest({
      content: '맛있어요',
      rating: 5,
      image_keys: ['https://evil.test/photo.webp'],
      tags: [],
      place_name: '성수 카페',
      address: '서울 성동구',
      lat: 37.5,
      lng: 127,
      kakao_place_id: 'kakao-1',
      user_id: 'user-1',
    }) as never,
  );

  expect(response.status).toBe(400);
  expect(mockSupabaseInsert).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Implement the route**

The route should:

- read the logged-in user from `createClient().auth.getUser()`
- reject when there is no logged-in user
- reject when `payload.user_id !== user.id`
- accept `uploads/users/{user.id}/...` keys
- accept `uploads/guests/{guestId}/...` keys only when the HttpOnly guest upload cookie verifies to that guest id
- derive `image_urls` with `buildPublicImageUrl`
- omit `image_keys` from the Supabase insert until a real DB column and migration exist
- insert the sanitized payload into `posts`

Core insertion shape:

```ts
const imageKeys = parseImageKeys(payload.image_keys);
const trustedImageKeys = imageKeys.filter((imageKey) =>
  isTrustedUserImageKey(imageKey, user.id) ||
  (verifiedGuestId ? isTrustedGuestImageKey(imageKey, verifiedGuestId) : false),
);

if (trustedImageKeys.length !== imageKeys.length) {
  return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
}

const postPayload = {
  content: payload.content,
  rating: payload.rating,
  tags: payload.tags,
  place_name: payload.place_name,
  address: payload.address,
  lat: payload.lat,
  lng: payload.lng,
  kakao_place_id: payload.kakao_place_id,
  user_id: user.id,
  place_id: payload.place_id,
  image_urls: trustedImageKeys.map(buildPublicImageUrl),
};
```

- [ ] **Step 3: Update `createPost` to call the trusted route**

```ts
export const createPost = async (payload: CreatePostPayload) => {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('post_create_failed');
  }

  return response.json();
};
```

- [ ] **Step 4: Run route tests**

Run:

```bash
pnpm --filter web test src/app/api/posts/route.test.ts
```

Expected: pass.

---

## Task 5: Post Forms Track Key and URL Together

**Files:**
- Modify: `apps/pin-plate/web/src/features/post/hooks/usePostForm.ts`
- Modify: `apps/pin-plate/web/src/features/post/hooks/useEditPostForm.ts`
- Modify: `apps/pin-plate/web/src/features/post/hooks/__tests__/usePostForm.test.ts`

- [ ] **Step 1: Update upload response fixtures**

Change upload test fixtures to include both key and URL:

```ts
{
  originalName: 'a.jpg',
  fileName: 'uploads/users/user-123/a.webp',
  imageKey: 'uploads/users/user-123/a.webp',
  url: 'https://s3.example.com/form',
  fields: {},
  objectUrl: 'https://image.example.test/uploads/users/user-123/a.webp',
  publicUrl: 'https://image.example.test/uploads/users/user-123/a.webp',
}
```

- [ ] **Step 2: Write submit expectation for keys**

In the successful submit test, assert:

```ts
expect(mockCreatePost).toHaveBeenCalledWith(
  expect.objectContaining({
    image_urls: expect.any(Array),
    image_keys: expect.any(Array),
  }),
);
```

- [ ] **Step 3: Add an internal photo reference type**

In both post form hooks:

```ts
interface UploadedPhoto {
  key: string | null;
  url: string;
}
```

Use `UploadedPhoto[]` internally. Expose `photos` to components as URLs:

```ts
const photoUrls = photos.map((photo) => photo.url);
const photoKeys = photos
  .map((photo) => photo.key)
  .filter((photoKey): photoKey is string => Boolean(photoKey));
```

- [ ] **Step 4: Store upload result as key+URL**

When S3 upload succeeds:

```ts
return {
  key: item.imageKey ?? item.fileName ?? null,
  url: item.publicUrl ?? item.objectUrl,
};
```

- [ ] **Step 5: Submit both URLs and keys**

For logged-in posts:

```ts
image_urls: photoUrls,
image_keys: photoKeys,
```

For guest posts:

```ts
image_urls: photoUrls,
image_keys: photoKeys,
```

- [ ] **Step 6: Run post form tests**

Run:

```bash
pnpm --filter web test src/features/post/hooks/__tests__/usePostForm.test.ts
```

Expected: pass.

---

## Task 6: Guest Sync Sends Keys When Available

**Files:**
- Modify: `apps/pin-plate/web/src/features/guest/hooks/useSyncGuestPosts.ts`
- Modify: `apps/pin-plate/web/src/features/guest/hooks/__tests__/useSyncGuestPosts.test.ts`

- [ ] **Step 1: Write sync assertion**

Add `image_keys` to the guest post fixture and assert `createPost` receives it:

```ts
expect(mockCreatePost).toHaveBeenCalledWith(
  expect.objectContaining({
    image_urls: ['https://image.example.test/uploads/guests/guest-1/a.webp'],
    image_keys: ['uploads/guests/guest-1/a.webp'],
  }),
);
```

- [ ] **Step 2: Pass keys through sync**

Update the sync payload:

```ts
await createPost({
  content: guestPost.content,
  rating: guestPost.rating,
  image_urls: guestPost.image_urls,
  image_keys: guestPost.image_keys ?? [],
  tags: guestPost.tags,
  place_name: guestPost.place_name,
  address: guestPost.address,
  lat: guestPost.lat,
  lng: guestPost.lng,
  kakao_place_id: guestPost.kakao_place_id,
  user_id: userId,
  place_id: place.id,
});
```

- [ ] **Step 3: Run sync tests**

Run:

```bash
pnpm --filter web test src/features/guest/hooks/__tests__/useSyncGuestPosts.test.ts
```

Expected: pass.

---

## Task 7: Shared OG Metadata Uses Trusted URL Gate

**Files:**
- Modify: `apps/pin-plate/web/src/features/shared-map/utils/sharePreview.ts`
- Modify: `apps/pin-plate/web/src/app/share/[slug]/__tests__/metadata.test.ts`
- Modify: `apps/pin-plate/web/src/features/shared-map/utils/__tests__/sharePreview.test.ts`

- [ ] **Step 1: Add metadata test for non-trusted URL**

```ts
mockedGetSharedMapBySlug.mockResolvedValueOnce({
  ...sharedMapFixture,
  cover_image_url: 'https://evil.test/cover.jpg',
});
const fetchSharedMapCoverImage = vi.fn();
vi.stubGlobal('fetch', fetchSharedMapCoverImage);

const metadata = await generateMetadata({
  params: Promise.resolve({ slug: 'seongsu-cafe' }),
});

expect(fetchSharedMapCoverImage).not.toHaveBeenCalled();
expect(metadata.openGraph?.images).toEqual([
  { url: 'https://pinonplate.com/og-default.png' },
]);
```

- [ ] **Step 2: Gate before fetch**

In `resolveSharePreviewImageUrl`:

```ts
const trustedImageUrl = getTrustedImageUrl(toAbsoluteUrl(coverImageUrl));

if (!trustedImageUrl) {
  return getDefaultOgImageUrl();
}
```

Then fetch `trustedImageUrl`, not the raw image URL.

- [ ] **Step 3: Run shared metadata tests**

Run:

```bash
pnpm --filter web test 'src/app/share/[slug]/__tests__/metadata.test.ts' 'src/features/shared-map/utils/__tests__/sharePreview.test.ts'
```

Expected: pass after test expectations are aligned to the current production fallback origin.

---

## Task 8: Final Verification

- [ ] **Step 1: Run focused tests**

```bash
pnpm --filter web test \
  src/features/image/utils/__tests__/imageReference.test.ts \
  src/app/api/image/route.test.ts \
  src/app/api/posts/route.test.ts \
  src/features/post/hooks/__tests__/usePostForm.test.ts \
  src/features/guest/hooks/__tests__/useGuestPosts.test.tsx \
  src/features/guest/hooks/__tests__/useSyncGuestPosts.test.ts \
  'src/app/share/[slug]/__tests__/metadata.test.ts' \
  src/features/shared-map/utils/__tests__/sharePreview.test.ts
```

Expected: all pass.

- [ ] **Step 2: Run lint fix**

```bash
pnpm lint:fix
```

Expected: completes without unresolved warnings introduced by this change.

- [ ] **Step 3: Run typecheck**

```bash
pnpm --filter web exec tsc --noEmit
```

Expected: no type errors.

---

## Follow-Up Not Included Here

- Add a database migration/RPC path if the product later needs to store `image_keys` server-side.
- Harden Supabase RLS so direct table inserts cannot bypass the trusted `/api/posts` route with arbitrary `image_urls`.
- Move shared map RPC to derive snapshot images from verified source places instead of client-supplied image fields.
- Add S3 object existence verification after upload completion.
- Add malware scanning or moderation pipeline for uploaded images.
